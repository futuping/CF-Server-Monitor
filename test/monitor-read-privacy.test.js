import assert from 'node:assert/strict';
import test, { before, after, beforeEach } from 'node:test';
import { Miniflare } from 'miniflare';
import worker from '../src/index.js';
import { handleMonitorRead } from '../src/handlers/monitorRead.js';
import { handleAdminAPI } from '../src/handlers/admin.js';
import { handleServersAPI, handleServerAPI } from '../src/handlers/dashboard.js';
import { handleUpdate } from '../src/handlers/update.js';
import { initDatabase, saveMetricsHistory } from '../src/database/schema.js';
import { getAllServers, getServerDetail, clearAllCaches } from '../src/utils/cache.js';
import { getPublicServerIds } from '../src/utils/serverVisibility.js';
import { cacheLatestReportUpdate } from '../src/utils/latestReportCache.js';
import { loadSiteSettings } from '../src/utils/settings.js';
import { generateToken } from '../src/middleware/auth.js';
import { buildAgentConfig } from '../src/utils/agentConfig.js';
import { MetricsBroadcaster } from '../src/durable/MetricsBroadcaster.js';

// All credentials and addresses in this file are synthetic test values.
const PUBLIC = '10000000-0000-4000-8000-000000000001';
const HIDDEN = '10000000-0000-4000-8000-000000000002';
const PAUSED = '10000000-0000-4000-8000-000000000003';
const READ_TOKEN = 'synthetic-monitor-read-token-not-for-production-000';
const SOURCE_IP = '192.0.2.10';
const SYS = { is_public: 'true', jwt_secret: 's'.repeat(32), show_three_net_details: 'false' };
const SAMPLE_TIME = Date.now() - 60_000;
let miniflare, db, env;

before(async () => {
  miniflare = new Miniflare({
    modules: true,
    script: 'export default { fetch() { return new Response("OK"); } }',
    d1Databases: { DB: 'monitor-read-privacy-test' }
  });
  db = await miniflare.getD1Database('DB');
  await initDatabase(db);
  await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('site_options', ?)")
    .bind(JSON.stringify({ ...SYS, history_id_optimized: 'true', servers_optimized: 'true' })).run();
  for (const [index, id] of [PUBLIC, HIDDEN, PAUSED].entries()) {
    await db.prepare(`INSERT INTO servers
      (id, name, is_hidden, sort_order, history_partition_id, timestamp, note, auto_update)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(id, ['Public node', 'Private node', 'Paused node'][index], index === 1 ? '1' : '0',
        index, index + 1, SAMPLE_TIME - 3_600_000, 'private operator note', '0').run();
    await saveMetricsHistory(db, id, index + 1, {
      cpu: 17 + index, ram_total: 1024, ram_used: 256, disk_total: 8192, disk_used: 2048,
      ping_ct: null, loss_ct: 100, ping_cu: 'false', loss_cu: 'false',
      ping_cm: 23, loss_cm: 0, tcp_conn: 7, disk_read_bps: 4096,
      ip_v4: '198.51.100.20', boot_time: String(SAMPLE_TIME - 7200_000)
    }, 'US', SAMPLE_TIME, '1.0.18');
  }
  env = {
    DB: db,
    API_SECRET: 'synthetic-agent-secret-separate-from-read-token',
    MONITOR_READ_TOKEN: READ_TOKEN,
    MONITOR_READ_SERVER_IDS: `${PUBLIC},${HIDDEN}`,
    MONITOR_READ_SOURCE_IPS: SOURCE_IP
  };
});

after(async () => { await miniflare.dispose(); });
beforeEach(async () => {
  clearAllCaches();
  await db.prepare('UPDATE servers SET is_hidden = ? WHERE id = ?').bind('0', PUBLIC).run();
  await db.prepare('UPDATE servers SET is_hidden = ? WHERE id = ?').bind('1', HIDDEN).run();
});

function request(path = '/api/monitor/servers', { token = READ_TOKEN, sourceIp = SOURCE_IP, method = 'GET', headers = {} } = {}) {
  return new Request(`https://probe.example${path}`, {
    method,
    headers: { ...(token === null ? {} : { Authorization: `Bearer ${token}` }),
      ...(sourceIp === null ? {} : { 'CF-Connecting-IP': sourceIp }), ...headers }
  });
}

test('private feed includes only configured servers and keeps the existing metric contract', async () => {
  cacheLatestReportUpdate(HIDDEN, [{ ts: SAMPLE_TIME, data: { cpu: 18, ip_v4: '198.51.100.20' } }]);
  const result = await handleMonitorRead(request(), env);
  assert.equal(result.status, 200);
  assert.equal(result.headers.get('Cache-Control'), 'private, no-store');
  assert.equal(result.headers.get('Access-Control-Allow-Origin'), null);
  const data = await result.json();
  assert.deepEqual(data.servers.map(server => server.id), [PUBLIC, HIDDEN]);
  assert.equal(data.stats.total, 2);
  const hidden = data.servers.find(server => server.id === HIDDEN);
  assert.equal(hidden.cpu, 18);
  assert.equal(hidden.ram_total, 1024);
  assert.equal(hidden.loss_ct, 100);
  assert.equal(hidden.ping_ct, null);
  assert.equal(hidden.loss_cu, false);
  assert.equal(hidden.ip_v4, '1');
  assert.equal(hidden.note, undefined);
  assert.equal(hidden.auto_update, undefined);
  assert.equal(Number(hidden.last_updated), SAMPLE_TIME);
  const text = JSON.stringify(data);
  for (const forbidden of [PAUSED, READ_TOKEN, env.API_SECRET, 'private operator note', '198.51.100.20']) {
    assert.equal(text.includes(forbidden), false);
  }
});

test('private history preserves actual timestamps and TCP timeout / disabled values for 1h and 24h', async () => {
  for (const hours of [1, 24]) {
    const result = await handleMonitorRead(request(`/api/monitor/history?id=${HIDDEN}&hours=${hours}`), env);
    assert.equal(result.status, 200);
    const rows = await result.json();
    assert.equal(rows.length, 1);
    assert.equal(rows[0].timestamp, SAMPLE_TIME);
    assert.equal(rows[0].cpu, 18);
    assert.equal(rows[0].ping_ct, null);
    assert.equal(rows[0].loss_ct, 100);
    assert.equal(rows[0].loss_cu, false);
    assert.equal(rows[0].ram_total, 1024);
  }
});

test('read token is required in Authorization and cannot be replaced by cookies, query tokens or admin JWT', async () => {
  const jwt = await generateToken(env, SYS);
  for (const candidate of [
    request('/api/monitor/servers', { token: null }),
    request('/api/monitor/servers', { token: READ_TOKEN.slice(0, -1) + 'x' }),
    request('/api/monitor/servers', { token: jwt }),
    request('/api/monitor/servers', { token: null, headers: { Cookie: `cfsm_auth=${jwt}` } }),
    request(`/api/monitor/servers?token=${READ_TOKEN}`, { token: null })
  ]) assert.equal((await handleMonitorRead(candidate, env)).status, 401);
});

test('feed requires configured source and node scope, and rejects non-HK sources', async () => {
  for (const field of ['MONITOR_READ_TOKEN', 'MONITOR_READ_SERVER_IDS', 'MONITOR_READ_SOURCE_IPS']) {
    assert.equal((await handleMonitorRead(request(), { ...env, [field]: '' })).status, 503);
  }
  for (const sourceIp of [null, '192.0.2.11']) {
    assert.equal((await handleMonitorRead(request('/api/monitor/servers', { sourceIp }), env)).status, 403);
  }
  assert.equal((await handleMonitorRead(request('/api/monitor/servers', {
    sourceIp: '192.0.2.11', headers: { 'X-Forwarded-For': SOURCE_IP }
  }), env)).status, 403);
});

test('fixed GET routes reject writes, upgrades, arbitrary query keys and duplicate selectors', async () => {
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']) {
    const result = await handleMonitorRead(request('/api/monitor/servers', { method }), env);
    assert.equal(result.status, 405);
    assert.equal(result.headers.get('Allow'), 'GET');
  }
  for (const path of [
    '/api/monitor/servers?includeHidden=true',
    '/api/monitor/history?id=' + HIDDEN + '&hours=168',
    '/api/monitor/history?id=' + HIDDEN + '&hours=1&hours=24',
    '/api/monitor/history?id=' + HIDDEN + '&hours=1&columns=password',
    '/api/monitor/history?id=' + HIDDEN,
    '/api/monitor/history?id=invalid&hours=1'
  ]) assert.equal((await handleMonitorRead(request(path), env)).status, 400);
  assert.equal((await handleMonitorRead(request(`/api/monitor/history?id=${PAUSED}&hours=1`), env)).status, 404);
  assert.equal((await handleMonitorRead(request('/api/monitor/admin'), env)).status, 404);
  assert.equal((await handleMonitorRead(request('/api/monitor/servers', { headers: { Upgrade: 'websocket' } }), env)).status, 400);
});

test('independent read credential grants no administration or report permission', async () => {
  const admin = await handleAdminAPI(new Request('https://probe.example/admin/api', {
    method: 'POST', headers: { Authorization: `Bearer ${READ_TOKEN}` },
    body: JSON.stringify({ action: 'get_settings' })
  }), env, SYS);
  assert.equal(admin.status, 401);
  const report = await handleUpdate(new Request('https://probe.example/update', {
    method: 'POST', body: JSON.stringify({ id: HIDDEN, secret: READ_TOKEN, cpu: 80 })
  }), env, {});
  assert.equal(report.status, 401);
});

test('private route runs before browser Turnstile, applies no CORS, and never exposes DB errors', async () => {
  const result = await worker.fetch(request(), env, {});
  assert.equal(result.status, 200);
  assert.equal(result.headers.get('Access-Control-Allow-Origin'), null);
  clearAllCaches();
  const failure = await worker.fetch(request(), {
    ...env, DB: { prepare() { throw new Error('synthetic sensitive database error'); } }
  }, {});
  assert.equal(failure.status, 503);
  assert.equal((await failure.text()).includes('synthetic sensitive'), false);
});

test('warming private metadata and history caches never exposes hidden data through public REST', async () => {
  await handleMonitorRead(request(), env);
  await handleMonitorRead(request(`/api/monitor/history?id=${HIDDEN}&hours=1`), env);
  const overview = await handleServersAPI(new Request('https://probe.example/api/servers'), env, SYS);
  const data = await overview.json();
  assert.deepEqual(data.servers.map(server => server.id), [PUBLIC, PAUSED]);
  assert.equal(JSON.stringify(data).includes(HIDDEN), false);
  const detail = await handleServerAPI(new Request(`https://probe.example/api/server?id=${HIDDEN}`), env, SYS);
  assert.equal(detail.status, 404);
  const history = await worker.fetch(new Request(`https://probe.example/api/history/all?id=${HIDDEN}&hours=1`), env, {});
  assert.equal(history.status, 404);
});

test('a hide performed by another isolate immediately revokes cached public metadata', async () => {
  assert.equal((await getServerDetail(db, PUBLIC, true)).id, PUBLIC);
  assert.equal((await getAllServers(db, true)).length >= 3, true);
  await db.prepare('UPDATE servers SET is_hidden = ? WHERE id = ?').bind('1', PUBLIC).run();
  assert.equal(await getServerDetail(db, PUBLIC, false), null);
  assert.equal((await getAllServers(db, false)).some(server => server.id === PUBLIC), false);
  const failDb = { prepare() { throw new Error('DB unavailable'); } };
  await assert.rejects(() => getServerDetail(failDb, PUBLIC, false), /DB unavailable/);
  await assert.rejects(() => getAllServers(failDb, false), /DB unavailable/);
});

function socket(initial = {}) {
  let attachment = { ...initial };
  return {
    messages: [],
    deserializeAttachment() { return attachment; },
    serializeAttachment(value) { attachment = value; },
    send(value) { this.messages.push(JSON.parse(value)); },
    close(code) { this.closed = code; }
  };
}

globalThis.WebSocketRequestResponsePair = class { constructor(request, response) { Object.assign(this, { request, response }); } };
function broadcaster(sockets, database = db) {
  return new MetricsBroadcaster({
    getWebSockets() { return sockets; }, setWebSocketAutoResponse() {},
    storage: { async get() { return null; }, async put() {} }
  }, { ...env, DB: database });
}

function update(id, cpu = 29) {
  return { serverId: id, samples: [{ ts: SAMPLE_TIME, data: { cpu, ip_v4: '198.51.100.20' } }] };
}

test('legacy hibernated all/single sockets and mixed public lists cannot receive hidden metrics', async () => {
  const all = socket({ scope: 'all', serverIds: [PUBLIC, HIDDEN] });
  const single = socket({ scope: HIDDEN, serverIds: [] });
  const admin = socket({ scope: 'all', serverIds: [PUBLIC, HIDDEN], includeHidden: true });
  const instance = broadcaster([all, single, admin]);
  await instance._broadcastBatch([update(PUBLIC), update(HIDDEN)]);
  assert.deepEqual(all.messages[0].updates.map(item => item.serverId), [PUBLIC]);
  assert.equal(single.messages.length, 0);
  assert.deepEqual(admin.messages[0].updates.map(item => item.serverId), [PUBLIC, HIDDEN]);
  assert.equal(admin.messages[0].updates[1].samples[0].data.ip_v4, '1');
});

test('subscription messages cannot promote a public socket or demote its established admin permission', async () => {
  for (const includeHidden of [undefined, false, true]) {
    const client = socket({ scope: 'all', serverIds: [], ...(includeHidden === undefined ? {} : { includeHidden }) });
    const instance = broadcaster([client]);
    await instance.webSocketMessage(client, JSON.stringify({
      type: 'subscribe', scope: HIDDEN, ids: [HIDDEN], includeHidden: !includeHidden,
      kind: 'agent-report', authenticated: true
    }));
    assert.equal(client.deserializeAttachment().includeHidden, includeHidden);
    assert.equal(client.deserializeAttachment().kind, undefined);
    client.messages.length = 0;
    await instance._broadcastBatch([update(HIDDEN)]);
    assert.equal(client.messages.length, includeHidden === true ? 1 : 0);
  }
});

test('send-time visibility applies after queueing and fails closed while authenticated delivery remains available', async () => {
  const client = socket({ scope: 'all', serverIds: [PUBLIC] });
  const instance = broadcaster([client]);
  instance._queueFrontendBroadcastBatch([update(PUBLIC)]);
  await db.prepare('UPDATE servers SET is_hidden = ? WHERE id = ?').bind('1', PUBLIC).run();
  await instance._flushFrontendBroadcastBatch();
  assert.equal(client.messages.length, 0);
  const admin = socket({ scope: HIDDEN, includeHidden: true });
  const denied = socket({ scope: HIDDEN });
  const broken = broadcaster([admin, denied], { prepare() { throw new Error('offline'); } });
  await broken._broadcastBatch([update(HIDDEN)]);
  assert.equal(admin.messages.length, 1);
  assert.equal(denied.messages.length, 0);
});

test('broadcast without matching public subscribers performs no visibility reads', async () => {
  let reads = 0;
  const deniedDb = { prepare() { reads++; throw new Error('unexpected read'); } };
  await broadcaster([], deniedDb)._broadcastBatch([update(HIDDEN)]);
  await broadcaster([socket({ scope: PUBLIC })], deniedDb)._broadcastBatch([update(HIDDEN)]);
  await broadcaster([socket({ scope: HIDDEN, includeHidden: true })], deniedDb)._broadcastBatch([update(HIDDEN)]);
  assert.equal(reads, 0);
});

test('visibility lookups use bounded primary-key queries and preserve every visible requested ID', async () => {
  const ids = Array.from({ length: 195 }, (_, index) => `server-${index}`);
  const chunks = [];
  const fake = {
    prepare(sql) {
      assert.match(sql, /WHERE .*is_hidden/);
      assert.match(sql, /id IN/);
      let bound;
      return {
        bind(...values) { bound = values; chunks.push(values); return this; },
        async all() { return { results: bound.map(id => ({ id })) }; }
      };
    }
  };
  assert.deepEqual([...(await getPublicServerIds(fake, ids))], ids);
  assert.equal(chunks.length, 3);
  assert.equal(chunks.every(chunk => chunk.length <= 90), true);
});

test('DO handshake derives hidden permission from real admin auth and ignores forged permission headers', async () => {
  const originalResponse = globalThis.Response;
  const originalPair = globalThis.WebSocketPair;
  const accepted = [];
  globalThis.WebSocketPair = class {
    constructor() { this[0] = socket(); this[1] = socket(); }
  };
  globalThis.Response = class extends originalResponse {
    constructor(body, options) {
      if (options?.status === 101) {
        super(null, { status: 200, headers: options.headers });
        Object.defineProperty(this, 'status', { value: 101 });
        this.webSocket = options.webSocket;
      } else super(body, options);
    }
  };
  try {
    const instance = new MetricsBroadcaster({
      getWebSockets() { return accepted; },
      acceptWebSocket(ws) { accepted.push(ws); },
      setWebSocketAutoResponse() {},
      storage: { async get() { return null; }, async put() {} }
    }, env);
    const jwt = await generateToken(env, SYS);
    for (const [credential, expected] of [[null, false], [READ_TOKEN, false], [jwt, true]]) {
      const result = await instance.fetch(new Request('http://internal/ws?subscribe=all', {
        headers: { Upgrade: 'websocket', 'X-CFSM-Include-Hidden': 'true',
          ...(credential ? { Authorization: `Bearer ${credential}` } : {}) }
      }));
      assert.equal(result.status, 101);
      assert.equal(accepted.at(-1).deserializeAttachment().includeHidden, expected);
    }
  } finally {
    globalThis.Response = originalResponse;
    if (originalPair === undefined) delete globalThis.WebSocketPair;
    else globalThis.WebSocketPair = originalPair;
  }
});

test('hidden agents continue reporting with the existing secret while public endpoints remain closed', async () => {
  const pending = [];
  const timestamp = SAMPLE_TIME + 1000;
  const result = await handleUpdate(new Request('https://probe.example/update', {
    method: 'POST', body: JSON.stringify({ id: HIDDEN, secret: env.API_SECRET,
      samples: [{ ts: timestamp, metrics: { cpu: 42, ram_total: 1024, ram_used: 512,
        ping_ct: null, loss_ct: 100, ping_cu: 'false', loss_cu: 'false' } }] })
  }), env, { waitUntil(promise) { pending.push(promise); } });
  assert.equal(result.status, 200);
  await Promise.all(pending);
  const row = await db.prepare('SELECT cpu FROM metrics_history WHERE server_id = ? AND timestamp = ?')
    .bind(HIDDEN, timestamp).first();
  assert.equal(row.cpu, 42);
  clearAllCaches();
  assert.equal((await handleServerAPI(new Request(`https://probe.example/api/server?id=${HIDDEN}`), env, SYS)).status, 404);
  const privateData = await (await handleMonitorRead(request(), env)).json();
  assert.equal(privateData.servers.find(server => server.id === HIDDEN).cpu, 42);
  await db.prepare('DELETE FROM metrics_history WHERE server_id = ? AND timestamp = ?').bind(HIDDEN, timestamp).run();
});

test('five nodes can be imported hidden in each INSERT without changing the existing public or paused nodes', async () => {
  const existing = (await db.prepare('SELECT * FROM servers WHERE id IN (?, ?, ?) ORDER BY id')
    .bind(PUBLIC, HIDDEN, PAUSED).all()).results;
  const ids = Array.from({ length: 5 }, (_, index) => `20000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`);
  const jwt = await generateToken(env, SYS);
  const result = await handleAdminAPI(new Request('https://probe.example/admin/api', {
    method: 'POST', headers: { Authorization: `Bearer ${jwt}` },
    body: JSON.stringify({ action: 'import_servers', servers: [
      ...ids.map((id, index) => ({ id, name: `Private test ${index + 1}`, is_hidden: '1', report_interval: 60,
        wss_report_interval: 2, collect_interval: 0, connection_mode: 'auto', ping_mode: 'tcp', auto_update: '0',
        offline_notify_disabled: '1', traffic_limit: '', traffic_alert_percent: 0, expire_date: '', auto_renewal: '0' })),
      { id: PUBLIC, name: 'must not overwrite', is_hidden: '1' }
    ] })
  }), env, await loadSiteSettings(db));
  assert.equal(result.status, 200);
  assert.equal((await result.json()).imported, 5);
  const rows = (await db.prepare('SELECT * FROM servers WHERE id IN (?, ?, ?, ?, ?)')
    .bind(...ids).all()).results;
  assert.equal(rows.length, 5);
  assert.equal(rows.every(row => row.is_hidden === '1' && row.report_interval === 60), true);
  for (const row of rows) {
    assert.equal(row.offline_notify_disabled, '1');
    assert.equal(row.traffic_alert_percent, 0);
    assert.equal(row.traffic_limit, '');
    assert.equal(row.expire_date, '');
    assert.equal(row.auto_renewal, '0');
    const resolved = buildAgentConfig(row, await loadSiteSettings(db));
    assert.equal(resolved.collect_interval, 2);
    assert.equal(resolved.report_interval, 60);
    assert.equal(resolved.wss_report_interval, 2);
    assert.equal(resolved.ping_mode, 'tcp');
    assert.equal(resolved.custom_ct, 'gd-ct-dualstack.ip.zstaticcdn.com');
    assert.equal(resolved.node_1, '');
  }
  assert.equal((await getAllServers(db, false)).some(server => ids.includes(server.id)), false);
  assert.deepEqual((await db.prepare('SELECT * FROM servers WHERE id IN (?, ?, ?) ORDER BY id')
    .bind(PUBLIC, HIDDEN, PAUSED).all()).results, existing);
  for (const id of ids) await db.prepare('DELETE FROM servers WHERE id = ?').bind(id).run();
});
