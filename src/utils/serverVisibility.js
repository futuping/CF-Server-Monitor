// Visibility is an authorization decision. Do not reuse the metadata cache here:
// another Worker isolate may have hidden a server since that cache was filled.
const MAX_QUERY_IDS = 90;
const PUBLIC_PREDICATE = "(is_hidden IS NULL OR is_hidden = 0 OR is_hidden = '0')";

export async function getPublicServerIds(db, serverIds = null) {
  if (serverIds !== null && (!Array.isArray(serverIds) || serverIds.length === 0)) {
    return new Set();
  }
  const ids = serverIds === null ? null : [...new Set(serverIds.map(String))];
  const visible = new Set();
  const chunks = ids === null ? [null] : Array.from(
    { length: Math.ceil(ids.length / MAX_QUERY_IDS) },
    (_, index) => ids.slice(index * MAX_QUERY_IDS, (index + 1) * MAX_QUERY_IDS)
  );
  for (const chunk of chunks) {
    const suffix = chunk ? ` AND id IN (${chunk.map(() => '?').join(',')})` : '';
    let statement = db.prepare(`SELECT id FROM servers WHERE ${PUBLIC_PREDICATE}${suffix}`);
    if (chunk) statement = statement.bind(...chunk);
    const result = await statement.all();
    if (!Array.isArray(result?.results)) throw new Error('Visibility lookup failed');
    for (const row of result.results) {
      if (typeof row?.id === 'string') visible.add(row.id);
    }
  }
  return visible;
}
