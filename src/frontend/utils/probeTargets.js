import { normalizeTimestamp } from './time.js'

// A deployment fact, scoped to this exact host and complete target profile.
// The switch time records the verified cutover, never a server's
// creation time or an unrelated node that happens to use the same providers.
export const PROBE_TARGET_PROFILES = Object.freeze([
  Object.freeze({
    name: 'ATTM-US-1',
    changedAt: '2026-10-22T04:00:59.000Z',
    targets: Object.freeze({
      ct: Object.freeze({ address: '1.1.1.1:443', label: 'Cloudflare' }),
      cu: Object.freeze({ address: '8.8.8.8:443', label: 'Google' }),
      cm: Object.freeze({ address: '9.9.9.9:443', label: 'Quad9' })
    })
  })
])

export const getProbeTargetProfile = (server, profiles = PROBE_TARGET_PROFILES) => (
  profiles.find(profile => server?.name === profile.name &&
    Object.entries(profile.targets).every(([key, target]) =>
      String(server?.[`custom_${key}`] ?? '').trim() === target.address)) || null
)

export const probeTargetLabel = (server, key, fallback, profiles = PROBE_TARGET_PROFILES) => (
  getProbeTargetProfile(server, profiles)?.targets[key]?.label || fallback
)

export const isCurrentProbeTargetSample = (server, timestamp, {
  guardMs = 120000,
  profiles = PROBE_TARGET_PROFILES
} = {}) => {
  const profile = getProbeTargetProfile(server, profiles)
  if (!profile) return true
  const changedAt = normalizeTimestamp(profile.changedAt)
  const sampleAt = normalizeTimestamp(timestamp)
  return changedAt !== null && sampleAt !== null && sampleAt >= changedAt + guardMs
}

// Preserve rows, timestamps and every non-probe metric. Historical source data
// remains intact; only values from the previous target profile are not relabelled.
export const maskPreviousProbeTargets = (server, row, options = {}) => {
  if (!row || isCurrentProbeTargetSample(server, row.timestamp ?? row.last_updated, options)) return row
  const result = { ...row }
  for (const key of ['ct', 'cu', 'cm']) {
    for (const metric of ['ping', 'loss']) {
      if (Object.hasOwn(result, `${metric}_${key}`)) result[`${metric}_${key}`] = null
    }
  }
  return result
}
