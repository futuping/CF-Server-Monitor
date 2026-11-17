<template>
  <router-link :to="to" class="block min-w-0 rounded-xl focus-visible:ring-2 focus-visible:ring-ring outline-none"
    ><Card class="server-card h-full gap-3 p-4 transition-shadow hover:shadow-md" :data-region="regionCode">
      <div class="server-card-header">
        <div class="server-identity">
          <span v-if="regionCode && regionCode !== 'xx'" class="country-os-icons">
            <img class="flag-img" :src="getPublicAssetUrl('flags/' + regionCode + '.svg')" :alt="regionCode" />
            <OsIcon :os="server.os" />
          </span>
          <span v-else class="country-os-icons">
            <span class="flag-fallback">🏳️</span>
            <OsIcon :os="server.os" />
          </span>
          <CardTitle class="server-name">{{ server.name }}</CardTitle>
        </div>
        <Badge class="status-label" :style="{ color: statusColor, borderColor: statusColor }" variant="outline">{{
          statusText
        }}</Badge>
      </div>
      <div class="server-meta">
        <div class="card-meta">
          <div v-if="sysConfig.show_price && priceText" class="card-meta-item">{{ priceText }}</div>
          <div
            v-if="sysConfig.show_expire && server.expire_date"
            class="card-meta-item card-meta-expire"
            :title="expireDateTitle"
          >
            <span :class="{ expired: isExpired }">{{ expireText }}</span>
          </div>
        </div>
        <div class="card-badges">
          <Badge v-for="tag in tagList" :key="tag" variant="secondary">{{ tag }}</Badge>
          <Badge v-if="hasPublicIPv4 && hasPublicIPv6" class="badge badge-v4-v6" variant="secondary">IPv4/6</Badge>
          <template v-else>
            <Badge v-if="hasPublicIPv4" class="badge badge-v4" variant="secondary">IPv4</Badge>
            <Badge v-if="hasPublicIPv6" class="badge badge-v6" variant="secondary">IPv6</Badge>
          </template>
        </div>
      </div>
      <div class="server-stats">
        <div class="stat-row">
          <span class="stat-key">CPU</span>
          <div class="stat-content stat-content-meter">
            <Progress
              :model-value="Number(cpuPercent)"
              :style="{ '--meter-color': getUsageColor(cpuPercent) }"
              class="usage-meter h-1.5"
            />
            <span class="stat-value">{{ cpuPercent.toFixed(2) }}%</span>
          </div>
        </div>
        <div class="stat-row">
          <span class="stat-key">RAM</span>
          <div class="stat-content stat-content-meter">
            <Progress
              :model-value="Number(ramPercent)"
              :style="{ '--meter-color': getUsageColor(ramPercent) }"
              class="usage-meter h-1.5"
            />
            <span class="stat-value">{{ ramPercent.toFixed(2) }}%</span>
          </div>
        </div>
        <div class="stat-row">
          <span class="stat-key">DISK</span>
          <div class="stat-content stat-content-meter">
            <Progress
              :model-value="Number(diskPercent)"
              :style="{ '--meter-color': getUsageColor(diskPercent) }"
              class="usage-meter h-1.5"
            />
            <span class="stat-value">{{ diskPercent.toFixed(2) }}%</span>
          </div>
        </div>
        <div class="stat-row" v-if="sysConfig.show_tf">
          <span class="stat-key">USE</span>
          <div class="stat-content stat-content-meter">
            <template v-if="server.traffic_limit">
              <Progress
                :model-value="Number(Math.min(100, trafficUsagePercent))"
                :style="{ '--meter-color': getUsageColor(trafficUsagePercent) }"
                class="usage-meter h-1.5"
              />
              <span class="stat-value">{{ trafficUsagePercentText }}%</span>
            </template>
            <template v-else>
              <Separator class="grow" />
              <span class="stat-value" style="font-size: 2em; line-height: 0">∞</span>
            </template>
          </div>
        </div>
        <div class="stat-row">
          <span class="stat-key">LOAD</span>
          <div class="stat-content">
            <span class="net-down">{{ loadAvg[0].toFixed(2) }}</span>
            <span>{{ loadAvg[1].toFixed(2) }}</span>
            <span class="net-up">{{ loadAvg[2].toFixed(2) }}</span>
          </div>
        </div>
        <div class="stat-row">
          <span class="stat-key">NET</span>
          <div class="stat-content">
            <span class="net-down">▼ {{ netInSpeed }}/s</span>
            <span class="net-up">▲ {{ netOutSpeed }}/s</span>
          </div>
        </div>
        <div class="stat-row">
          <span class="stat-key">TRF</span>
          <div class="stat-content">
            <span class="net-down">▼ {{ totalRxMonthly }}</span>
            <span class="net-up">▲ {{ totalTxMonthly }}</span>
            <span v-if="sysConfig.show_tf && server.traffic_limit" class="stat-limit"
              >/ {{ formatBytes(server.traffic_limit * 1024 * 1024 * 1024) }}</span
            >
          </div>
        </div>
      </div>
      <div class="server-space"></div>
      <ServerLatencyPanel
        :show-three-net-details="sysConfig.show_three_net_details"
        :has-three-net-details="hasThreeNetDetails"
        :three-net-details="threeNetDetails"
        :has-ping-data="hasPingData"
        :ping-list="pingList"
        :timeout-text="trans.timeout"
        :get-ping-color="getPingColor"
        :get-loss-color="getLossColor"
        :format-ping-value="formatPingValue"
        :format-loss-value="formatLossValue"
        :is-ping-valid="isPingValid"
      /> </Card
  ></router-link>
</template>

<script setup>
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Card, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import OsIcon from './OsIcon.vue'
import ServerLatencyPanel from './ServerLatencyPanel.vue'
import { DEFAULT_SERVER_CARD_CONFIG, useServerCardData } from '../composables/useServerCardData'

const props = defineProps({
  server: {
    type: Object,
    required: true
  },
  sysConfig: {
    type: Object,
    default: () => ({ ...DEFAULT_SERVER_CARD_CONFIG })
  },
  to: {
    type: String,
    default: ''
  }
})

const {
  trans,
  regionCode,
  statusColor,
  statusText,
  cpuPercent,
  ramPercent,
  diskPercent,
  trafficUsagePercent,
  trafficUsagePercentText,
  getUsageColor,
  tagList,
  hasPublicIPv4,
  hasPublicIPv6,
  netInSpeed,
  netOutSpeed,
  totalRxMonthly,
  totalTxMonthly,
  priceText,
  expireDateTitle,
  loadAvg,
  isExpired,
  expireText,
  isPingValid,
  getPingColor,
  getLossColor,
  formatPingValue,
  formatLossValue,
  pingList,
  hasPingData,
  threeNetDetails,
  hasThreeNetDetails,
  getPublicAssetUrl,
  formatBytes
} = useServerCardData(props)
</script>
