<template>
  <router-link :to="to" class="block min-w-0 rounded-xl focus-visible:ring-2 focus-visible:ring-ring outline-none"
    ><Card
      class="server-card server-card-ring h-full gap-3 p-4 transition-shadow hover:shadow-md"
      :data-region="regionCode"
    >
      <div class="server-card-ring-header">
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
      </div>

      <div class="server-card-ring-divider"></div>

      <div class="server-card-ring-metrics">
        <div class="metric-ring-item">
          <div class="metric-ring-chart" :style="getRingStyle(cpuPercent, getUsageColor(cpuPercent))">
            <span class="metric-ring-track"></span>
            <span class="metric-ring-progress"></span>
            <span class="metric-ring-center">{{ roundedPercent(cpuPercent) }}%</span>
          </div>
          <div class="metric-ring-label">CPU</div>
          <div class="metric-ring-subtext">{{ cpuCores }} Cores</div>
        </div>

        <div class="metric-ring-item">
          <div
            class="metric-ring-chart metric-ring-chart-memory"
            :class="{ 'has-swap-ring': hasSwapData }"
            :style="getMemoryRingStyle(ramPercent, getUsageColor(ramPercent), swapPercent, getUsageColor(swapPercent))"
          >
            <span class="metric-ring-track"></span>
            <span class="metric-ring-progress"></span>
            <template v-if="hasSwapData">
              <span class="metric-ring-swap-track"></span>
              <span class="metric-ring-swap-progress"></span>
            </template>
            <span class="metric-ring-center" :class="{ 'metric-ring-center-memory': hasSwapData }">
              <span>{{ roundedPercent(ramPercent) }}%</span>
              <span v-if="hasSwapData" class="metric-ring-center-swap">{{ roundedPercent(swapPercent) }}%</span>
            </span>
          </div>
          <div class="metric-ring-label">RAM</div>
          <div class="metric-ring-subtext">{{ ramUsageText }}</div>
        </div>

        <div class="metric-ring-item">
          <div class="metric-ring-chart" :style="getRingStyle(diskPercent, getUsageColor(diskPercent))">
            <span class="metric-ring-track"></span>
            <span class="metric-ring-progress"></span>
            <span class="metric-ring-center">{{ roundedPercent(diskPercent) }}%</span>
          </div>
          <div class="metric-ring-label">Disk</div>
          <div class="metric-ring-subtext">{{ diskUsageText }}</div>
        </div>
      </div>

      <div class="server-card-network-panel">
        <div class="server-card-network-row">
          <span class="server-card-network-label">{{ trans.networkTraffic }}</span>
          <span class="server-card-network-values">
            <span class="server-card-speed-up">↑ {{ netOutSpeed }}/s</span>
            <span class="server-card-speed-down">↓ {{ netInSpeed }}/s</span>
          </span>
        </div>
        <div class="server-card-network-row">
          <span class="server-card-network-label">{{ trans.loadAvg }}</span>
          <span class="server-card-network-values">
            <span>{{ loadAvg[0].toFixed(2) }}</span>
            <span>{{ loadAvg[1].toFixed(2) }}</span>
            <span>{{ loadAvg[2].toFixed(2) }}</span>
          </span>
        </div>
        <div class="server-card-network-row">
          <span class="server-card-network-label">{{ trans.totalTraffic }}</span>
          <span class="server-card-network-values server-card-total-values">
            <span>↑ {{ totalTx }}</span>
            <span>↓ {{ totalRx }}</span>
          </span>
        </div>
        <div v-if="sysConfig.show_tf" class="server-card-limit-section">
          <div class="server-card-limit-header">
            <span>{{ trans.monthlyTraffic }}</span>
            <span
              >{{ trafficLimitText
              }}<template v-if="trafficLimitSummary"> | {{ trafficLimitPercentText }}%</template></span
            >
          </div>
          <Progress
            v-if="trafficLimitSummary"
            :model-value="Math.min(100, trafficUsagePercent)"
            class="usage-meter h-1.5"
            :style="{ '--meter-color': getUsageColor(trafficUsagePercent) }"
          />
          <Separator v-else />
        </div>
        <ServerLatencyPanel
          variant="ring"
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
        />
      </div> </Card
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
  cpuCores,
  ramPercent,
  swapPercent,
  hasSwapData,
  diskPercent,
  trafficLimitSummary,
  trafficUsagePercent,
  trafficLimitPercentText,
  trafficLimitText,
  netInSpeed,
  netOutSpeed,
  totalRx,
  totalTx,
  priceText,
  expireDateTitle,
  loadAvg,
  ramUsageText,
  diskUsageText,
  getUsageColor,
  getRingStyle,
  getMemoryRingStyle,
  roundedPercent,
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
  tagList,
  hasPublicIPv4,
  hasPublicIPv6,
  isExpired,
  expireText
} = useServerCardData(props)
</script>
