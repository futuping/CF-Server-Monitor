import { buildServersAPIResponse, omitNullLossProbeFields } from './dashboard.js';
import { getMetricsHistory } from '../database/schema.js';
import { getServerDetail } from '../utils/cache.js';
import { HISTORY_ALL_QUERY_COLUMNS } from '../utils/historyFields.js';
import { loadSiteSettings, normalizeLongHistoryPoints } from '../utils/settings.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TOKEN = /^[A-Za-z0-9_-]{32,256}$/;
const HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'private, no-store',
  'Vary': 'Authorization',
  'X-Content-Type-Options': 'nosniff'
};

function response(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...HEADERS, ...headers } });
}

function error(status, message) {
  return response({ error: message, code: status }, status);
}

function readCsv(value) {
  if (typeof value !== 'string' || !value.trim()) return [];
  return [...new Set(value.split(',').map(item => item.trim()))];
}

function validSourceIp(value) {
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(value)) {
    return value.split('.').every(part => Number(part) <= 255);
  }
  if (!/^[0-9a-f:]+$/i.test(value) || !value.includes(':')) return false;
  try {
    return new URL(`http://[${value}]/`).hostname.startsWith('[');
  } catch (_) { return false; }
}

function getReadConfig(env) {
  const token = env.MONITOR_READ_TOKEN;
  const serverIds = readCsv(env.MONITOR_READ_SERVER_IDS);
  const sourceIps = readCsv(env.MONITOR_READ_SOURCE_IPS);
  if (typeof token !== 'string' || !TOKEN.test(token) || serverIds.length === 0 || serverIds.length > 100 ||
      !serverIds.every(id => UUID.test(id)) || sourceIps.length === 0 ||
      sourceIps.length > 8 || !sourceIps.every(validSourceIp)) return null;
  return { token, serverIds, sourceIps };
}

function equalToken(actual, expected) {
  // Fixed loop over the configured credential; no early return on its contents.
  let mismatch = actual.length ^ expected.length;
  for (let index = 0; index < expected.length; index++) {
    mismatch |= (actual.charCodeAt(index) || 0) ^ expected.charCodeAt(index);
  }
  return mismatch === 0;
}

export async function handleMonitorRead(request, env) {
  const url = new URL(request.url);
  if (request.method !== 'GET') {
    return response({ error: 'Method Not Allowed', code: 405 }, 405, { Allow: 'GET' });
  }
  if (request.headers.has('Upgrade')) return error(400, 'Upgrade not supported');
  const config = getReadConfig(env);
  if (!config) return error(503, 'Monitor feed is not configured');

  const bearer = /^Bearer ([A-Za-z0-9_-]{32,256})$/.exec(request.headers.get('Authorization') || '');
  if (!bearer || !equalToken(bearer[1], config.token)) return error(401, 'Unauthorized');
  // Cloudflare overwrites this header at the edge. Never trust X-Forwarded-For
  // or a source address supplied as a query parameter by the caller.
  const sourceIp = request.headers.get('CF-Connecting-IP') || '';
  if (!config.sourceIps.includes(sourceIp)) return error(403, 'Forbidden');

  if (url.pathname === '/api/monitor/servers') {
    if ([...url.searchParams].length !== 0) return error(400, 'Invalid query');
    // Unlike the browser's metadata cache, the private integration must not
    // turn a failed source query into an apparently successful empty fleet.
    const snapshot = await env.DB.prepare(`SELECT * FROM servers WHERE id IN (
      ${config.serverIds.map(() => '?').join(',')}
    ) ORDER BY sort_order ASC`).bind(...config.serverIds).all();
    if (!Array.isArray(snapshot?.results)) throw new Error('Source unavailable');
    const sys = await loadSiteSettings(env.DB);
    const result = await buildServersAPIResponse(env, sys, {
      includeHidden: true,
      serverIds: config.serverIds,
      serverRows: snapshot.results
    });
    return new Response(result.body, { status: result.status, headers: HEADERS });
  }

  if (url.pathname === '/api/monitor/history') {
    const keys = [...url.searchParams.keys()];
    if (keys.length !== 2 || keys.filter(key => key === 'id').length !== 1 ||
        keys.filter(key => key === 'hours').length !== 1) return error(400, 'Invalid query');
    const id = url.searchParams.get('id');
    const hours = url.searchParams.get('hours');
    if (!UUID.test(id || '') || !['1', '24'].includes(hours)) return error(400, 'Invalid query');
    if (!config.serverIds.includes(id)) return error(404, 'Not Found');
    const server = await getServerDetail(env.DB, id, true);
    if (!server) return error(404, 'Not Found');
    const sys = await loadSiteSettings(env.DB);
    const points = await getMetricsHistory(
      env.DB, id, Number(hours), HISTORY_ALL_QUERY_COLUMNS.join(', '), server,
      Number(normalizeLongHistoryPoints(sys.long_history_points))
    );
    return response(points.map(omitNullLossProbeFields));
  }
  return error(404, 'Not Found');
}
