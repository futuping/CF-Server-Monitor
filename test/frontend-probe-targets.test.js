import assert from 'node:assert/strict'
import test from 'node:test'
import { createServer } from 'vite'
import {
  PROBE_TARGET_PROFILES,
  getProbeTargetProfile,
  isCurrentProbeTargetSample,
  maskPreviousProbeTargets,
  probeTargetLabel
} from '../src/frontend/utils/probeTargets.js'

const profile = {
  ...PROBE_TARGET_PROFILES[0],
  changedAt: '2026-10-22T08:00:00Z'
}
const profiles = [profile]
const switchedAt = Date.parse(profile.changedAt)
const server = {
  name: 'ATTM-US-1',
  custom_ct: '1.1.1.1:443',
  custom_cu: '8.8.8.8:443',
  custom_cm: '9.9.9.9:443'
}

test('overseas labels require the exact host and all three configured endpoints', () => {
  assert.equal(getProbeTargetProfile(server, profiles), profile)
  for (const replacement of [
    { name: 'Other-US-1' },
    { name: 'attm-us-1' },
    { custom_ct: '' },
    { custom_cu: '8.8.4.4:443' },
    { custom_cm: '9.9.9.9:853' }
  ]) {
    const other = { ...server, ...replacement }
    assert.equal(getProbeTargetProfile(other, profiles), null)
    assert.equal(probeTargetLabel(other, 'ct', '电信', profiles), '电信')
  }
  assert.deepEqual(['ct', 'cu', 'cm'].map(key => probeTargetLabel(server, key, '原标签', profiles)),
    ['Cloudflare', 'Google', 'Quad9'])
  assert.equal(probeTargetLabel(server, 'bd', 'BGP', profiles), 'BGP')
})

test('the current probe guard accepts actual post-switch samples, including seconds and ISO timestamps', () => {
  const options = { profiles }
  assert.equal(isCurrentProbeTargetSample(server, switchedAt + 119999, options), false)
  assert.equal(isCurrentProbeTargetSample(server, switchedAt + 120000, options), true)
  assert.equal(isCurrentProbeTargetSample(server, (switchedAt + 120000) / 1000, options), true)
  assert.equal(isCurrentProbeTargetSample(server, new Date(switchedAt + 120000).toISOString(), options), true)
  for (const timestamp of [null, undefined, '', 'invalid']) {
    assert.equal(isCurrentProbeTargetSample(server, timestamp, options), false)
  }
})

test('unknown switch times cannot relabel historical samples', () => {
  const unknown = [{ ...profile, changedAt: null }]
  assert.equal(isCurrentProbeTargetSample(server, switchedAt + 900000, { profiles: unknown }), false)
})

test('history masking preserves resource data, timestamps, other probes and the original source row', () => {
  const row = {
    timestamp: switchedAt - 1,
    cpu: 42,
    net_in_speed: 12345,
    disk: { read_bps: 120 },
    ping_ct: 220, loss_ct: 100,
    ping_cu: 230, loss_cu: 100,
    ping_cm: 240, loss_cm: 100,
    ping_bd: 12, loss_bd: 0,
    ping_node_1: 18
  }
  const masked = maskPreviousProbeTargets(server, row, { profiles })
  assert.notEqual(masked, row)
  assert.equal(row.ping_ct, 220)
  assert.equal(masked.timestamp, row.timestamp)
  assert.equal(masked.cpu, row.cpu)
  assert.equal(masked.net_in_speed, row.net_in_speed)
  assert.equal(masked.disk, row.disk)
  assert.equal(masked.ping_bd, 12)
  assert.equal(masked.loss_bd, 0)
  assert.equal(masked.ping_node_1, 18)
  for (const key of ['ct', 'cu', 'cm']) {
    assert.equal(masked[`ping_${key}`], null)
    assert.equal(masked[`loss_${key}`], null)
  }
})

test('other nodes and post-guard samples retain their original histories', () => {
  const row = { timestamp: switchedAt - 1, cpu: 42, ping_ct: 250, loss_ct: 100 }
  assert.equal(maskPreviousProbeTargets({ ...server, name: 'Other-US-1' }, row, { profiles }), row)
  const fresh = { ...row, timestamp: switchedAt + 120000, ping_ct: 10, loss_ct: 0 }
  assert.equal(maskPreviousProbeTargets(server, fresh, { profiles }), fresh)
})

test('long history uses a conservative transition gap without fabricating a recovery or deleting rows', () => {
  const row = { timestamp: switchedAt + 899999, cpu: 42, ping_ct: 10, loss_ct: 0 }
  const masked = maskPreviousProbeTargets(server, row, { profiles, guardMs: 900000 })
  assert.equal(masked.ping_ct, null)
  assert.equal(masked.loss_ct, null)
  assert.equal(masked.cpu, 42)
  const fresh = { ...row, timestamp: switchedAt + 900000 }
  assert.equal(maskPreviousProbeTargets(server, fresh, { profiles, guardMs: 900000 }), fresh)
})

test('deployed target profile includes the verified switch timestamp', () => {
  assert.ok(Number.isFinite(Date.parse(PROBE_TARGET_PROFILES[0].changedAt)))
})

test('real Vue card data uses overseas labels and excludes previous target samples from averages', async () => {
  const vite = await createServer({ appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } })
  const originalStorage = globalThis.localStorage
  globalThis.localStorage = { getItem: () => 'zh' }
  try {
    const { useServerCardData } = await vite.ssrLoadModule('/src/frontend/composables/useServerCardData.js')
    const changedAt = Date.parse(PROBE_TARGET_PROFILES[0].changedAt)
    const latest = changedAt + 180000
    const base = {
      ...server, last_updated: new Date(latest).toISOString(),
      ping_ct: 8, ping_cu: 9, ping_cm: 10,
      loss_ct: 0, loss_cu: 0, loss_cm: 0,
      ping: [
        { ts: changedAt - 60000, ct: 250, cu: 260, cm: 270 },
        { ts: latest, ct: 8, cu: 9, cm: 10 }
      ],
      loss: [
        { ts: changedAt - 60000, ct: 100, cu: 100, cm: 100 },
        { ts: latest, ct: 0, cu: 0, cm: 0 }
      ]
    }
    const config = { custom_ct_name: '电信', custom_cu_name: '联通', custom_cm_name: '移动' }
    const card = useServerCardData({ server: base, sysConfig: config })
    assert.deepEqual(card.threeNetDetails.value.map(row => row.label), ['Cloudflare', 'Google', 'Quad9'])
    assert.deepEqual(card.pingList.value.slice(0, 3).map(row => row.label), ['Cloudflare', 'Google', 'Quad9'])
    assert.deepEqual(card.threeNetDetails.value.map(row => row.averageLoss), [0, 0, 0])
    assert.deepEqual(card.threeNetDetails.value.map(row => row.latestPing), [8, 9, 10])
    assert.equal(card.threeNetDetails.value[0].points[0].ping, null)
    assert.equal(card.threeNetDetails.value[0].points[0].loss, null)
    assert.match(card.threeNetDetails.value[0].points[0].pingTooltip, /无样本/)
    assert.doesNotMatch(card.threeNetDetails.value[0].points[0].pingTooltip, /离线/)
    const other = useServerCardData({ server: { ...base, name: 'Other-US-1' }, sysConfig: config })
    assert.deepEqual(other.threeNetDetails.value.map(row => row.label), ['电信', '联通', '移动'])
    assert.equal(other.threeNetDetails.value[0].points[0].ping, 250)
    assert.equal(other.threeNetDetails.value[0].averageLoss, 50)
    assert.deepEqual(other.pingList.value.slice(0, 3).map(row => row.label), ['CT', 'CU', 'CM'])
  } finally {
    globalThis.localStorage = originalStorage
    await vite.close()
  }
})
