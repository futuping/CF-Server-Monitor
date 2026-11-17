<template>
  <Dialog
    v-if="show"
    :open="Boolean(show)"
    @update:open="
      (open) => {
        if (!open) $emit('close')
      }
    "
  >
    <DialogContent class="max-h-[85dvh] overflow-y-auto" :show-close-button="false" :aria-describedby="undefined">
      <DialogHeader class="pr-8">
        <DialogTitle>{{ currentServerName }}</DialogTitle>
        <Button
          @click="$emit('close')"
          class="absolute right-3 top-3"
          type="button"
          variant="ghost"
          size="icon-sm"
          :aria-label="trans.close"
          >✕</Button
        >
      </DialogHeader>

      <div class="form-row">
        <div class="form-group flex-1">
          <Label class="form-label">{{ trans.targetOs }}</Label>
          <NativeSelect
            :aria-label="trans.targetOs"
            :model-value="targetOs"
            class="form-select"
            @change="$emit('update:target-os', $event.target.value)"
          >
            <NativeSelectOption value="linux">Linux (systemd)</NativeSelectOption>
            <NativeSelectOption value="unix">OpenWrt/Alpine/Synology DSM/FreeBSD</NativeSelectOption>
            <NativeSelectOption value="mac">macOS</NativeSelectOption>
            <NativeSelectOption value="windows">Windows</NativeSelectOption>
          </NativeSelect>
        </div>

        <div v-if="targetOs === 'linux'" class="form-group flex-1">
          <Label class="form-label">
            {{ trans.installMode }}
            <HelpTooltip :text="trans.nonRootInstallTip" />
          </Label>
          <NativeSelect
            :aria-label="trans.installMode"
            :model-value="installMode"
            class="form-select"
            @change="$emit('update:install-mode', $event.target.value)"
          >
            <NativeSelectOption value="current-user">{{ trans.installModeCurrentUser }}</NativeSelectOption>
            <NativeSelectOption value="cfsm-user">{{ trans.installModeCfsmUser }}</NativeSelectOption>
          </NativeSelect>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group flex-1">
          <Label class="form-label">
            {{ trans.ghProxy }}
            <HelpTooltip :text="trans.ghProxyTip" />
          </Label>
          <NativeSelect :aria-label="trans.ghProxy" v-model="selectedGhProxy" class="form-select">
            <NativeSelectOption v-for="option in ghProxyOptions" :key="option.value" :value="option.value">{{
              option.label
            }}</NativeSelectOption>
            <NativeSelectOption :value="CUSTOM_GH_PROXY_VALUE">{{ trans.custom || 'Custom' }}</NativeSelectOption>
          </NativeSelect>
          <Input
            v-if="showCustomGhProxy"
            type="text"
            :model-value="installGhProxy"
            class="form-input mt-2"
            :placeholder="trans.ghProxyPlaceholder"
            @input="$emit('update:install-gh-proxy', $event.target.value)"
          />
        </div>

        <div class="form-group flex-1">
          <Label class="form-label">
            Agent {{ trans.version }}
            <HelpTooltip :text="trans.installVersionTip" />
          </Label>
          <Input
            :aria-label="trans.version"
            type="text"
            :model-value="installVersion"
            class="form-input"
            :placeholder="trans.installVersionPlaceholder"
            @input="$emit('update:install-version', $event.target.value)"
          />
        </div>
      </div>

      <div class="config-list">
        <div class="config-row">
          <span class="config-label">{{ trans.collectInterval }}</span>
          <span class="config-value">{{ formatWithUnit(collectInterval, 's') }}</span>
        </div>
        <div class="config-row">
          <span class="config-label">{{ trans.reportInterval }}</span>
          <span class="config-value">{{ formatWithUnit(reportInterval, 's') }}</span>
        </div>
        <div v-if="connectionMode === 'auto'" class="config-row">
          <span class="config-label">{{ trans.wssReportInterval }}</span>
          <span class="config-value">{{ formatWithUnit(wssReportInterval, 's') }}</span>
        </div>
        <div class="config-row">
          <span class="config-label">{{ trans.connectionMode }}</span>
          <span class="config-value">{{
            connectionMode === 'http' ? trans.connectionModeHttp : trans.connectionModeAuto
          }}</span>
        </div>
        <div class="config-row">
          <span class="config-label">{{ trans.pingMode }}</span>
          <span class="config-value">{{ effectivePingMode === 'icmp' ? 'ICMP (root)' : 'TCP' }}</span>
        </div>
        <div class="config-row">
          <span class="config-label">{{ trans.trafficResetDay }}</span>
          <span class="config-value">{{ isBlank(resetDay) ? '-' : resetDay }}</span>
        </div>
        <div class="config-row">
          <span class="config-label">{{ trans.autoUpdate }}</span>
          <span class="config-value">
            <span :class="['config-badge', autoUpdate ? 'is-enabled' : 'is-disabled']">
              {{ autoUpdate ? trans.enabled : trans.disabled }}
            </span>
          </span>
        </div>
        <div class="config-row">
          <span class="config-label">{{ trans.networkInterface }}</span>
          <span class="config-value">{{ isBlank(networkInterface) ? '-' : networkInterface }}</span>
        </div>
        <div class="config-row">
          <span class="config-label">{{ trans.rxCorrection }} (GB)</span>
          <span class="config-value">{{ formatWithUnit(rxCorrection, 'GB') }}</span>
        </div>
        <div class="config-row">
          <span class="config-label">{{ trans.txCorrection }} (GB)</span>
          <span class="config-value">{{ formatWithUnit(txCorrection, 'GB') }}</span>
        </div>
        <div class="config-row">
          <span class="config-label">{{ settings.custom_ct_name || trans.customCt }}</span>
          <span class="config-value">{{ isBlank(customCt) ? '-' : customCt }}</span>
        </div>
        <div class="config-row">
          <span class="config-label">{{ settings.custom_cu_name || trans.customCu }}</span>
          <span class="config-value">{{ isBlank(customCu) ? '-' : customCu }}</span>
        </div>
        <div class="config-row">
          <span class="config-label">{{ settings.custom_cm_name || trans.customCm }}</span>
          <span class="config-value">{{ isBlank(customCm) ? '-' : customCm }}</span>
        </div>
        <div class="config-row">
          <span class="config-label">{{ settings.custom_bd_name || trans.customBd }}</span>
          <span class="config-value">{{ isBlank(customBd) ? '-' : customBd }}</span>
        </div>
        <div v-for="(node, index) in [node1, node2, node3, node4]" :key="index" class="config-row">
          <span class="config-label">{{ settings[`node_${index + 1}_name`] || `Node ${index + 1}` }}</span
          ><span class="config-value">{{ isBlank(node) ? '-' : node }}</span>
        </div>
      </div>

      <div class="form-group">
        <Label class="form-label">{{ trans.installCommand }}</Label>
        <div class="cmd-output-wrapper" :class="{ copied: copiedCmd }">
          <span class="cmd-prompt">{{ targetOs === 'windows' ? 'PS' : '$' }}</span>
          <pre class="cmd-output">{{ installCommand }}</pre>
        </div>
      </div>

      <DialogFooter class="flex-wrap">
        <div class="flex items-center gap-2">
          <Button @click="$emit('copy-cmd')" type="button" variant="default" size="sm">{{
            copiedCmd ? '✅ ' + trans.copied : '📋 ' + trans.copy
          }}</Button>
          <Button @click="$emit('open-edit-from-copy')" type="button" variant="outline" size="sm"
            >✏️ {{ trans.edit }}</Button
          >
        </div>
        <Button @click="$emit('close')" type="button" variant="outline" size="sm">{{ trans.cancel }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Input } from '@/components/ui/input'
import { computed, ref, watch } from 'vue'
import HelpTooltip from '../../../components/HelpTooltip.vue'

const props = defineProps({
  trans: { type: Object, required: true },
  settings: { type: Object, default: () => ({}) },
  show: { type: Boolean, default: false },
  currentServerName: { type: String, default: '' },
  targetOs: { type: String, default: 'linux' },
  installMode: { type: String, default: 'current-user' },
  installGhProxy: { type: String, default: '' },
  installVersion: { type: String, default: '' },
  collectInterval: { type: [Number, String], default: 0 },
  reportInterval: { type: [Number, String], default: 60 },
  wssReportInterval: { type: [Number, String], default: 2 },
  connectionMode: { type: String, default: 'auto' },
  pingMode: { type: String, default: 'tcp' },
  customCt: { type: String, default: '' },
  customCu: { type: String, default: '' },
  customCm: { type: String, default: '' },
  customBd: { type: String, default: '' },
  node1: { type: String, default: '' }, node2: { type: String, default: '' }, node3: { type: String, default: '' }, node4: { type: String, default: '' },
  networkInterface: { type: String, default: '' },
  resetDay: { type: [Number, String], default: 1 },
  rxCorrection: { type: [Number, String], default: '' },
  txCorrection: { type: [Number, String], default: '' },
  autoUpdate: { type: Boolean, default: false },
  installCommand: { type: String, default: '' },
  copiedCmd: { type: Boolean, default: false }
})

const emit = defineEmits([
  'close',
  'copy-cmd',
  'open-edit-from-copy',
  'update:target-os',
  'update:install-mode',
  'update:install-gh-proxy',
  'update:install-version'
])

const CUSTOM_GH_PROXY_VALUE = '__custom__'
const ghProxyOptions = [
  { value: '', label: props.trans.ghProxyPlaceholder || 'Direct' },
  { value: 'https://ghfast.top/', label: 'https://ghfast.top/' },
  { value: 'https://ghproxy.net/', label: 'https://ghproxy.net/' },
  { value: 'https://gh.llkk.cc/', label: 'https://gh.llkk.cc/' },
  { value: 'https://gh-proxy.com/', label: 'https://gh-proxy.com/' }
]

const manualCustomGhProxy = ref(false)
const isKnownGhProxy = (value) => ghProxyOptions.some(option => option.value === String(value || '').trim())

const selectedGhProxy = computed({
  get: () => {
    const currentProxy = String(props.installGhProxy || '').trim()
    if (manualCustomGhProxy.value || (!isKnownGhProxy(currentProxy) && currentProxy)) {
      return CUSTOM_GH_PROXY_VALUE
    }
    return currentProxy
  },
  set: (value) => {
    if (value === CUSTOM_GH_PROXY_VALUE) {
      manualCustomGhProxy.value = true
      if (isKnownGhProxy(props.installGhProxy)) {
        emit('update:install-gh-proxy', '')
      }
      return
    }
    manualCustomGhProxy.value = false
    emit('update:install-gh-proxy', value)
  }
})

const showCustomGhProxy = computed(() => selectedGhProxy.value === CUSTOM_GH_PROXY_VALUE)
const effectivePingMode = computed(() => (
  props.targetOs === 'linux' && props.installMode === 'cfsm-user'
    ? 'tcp'
    : (props.pingMode === 'icmp' ? 'icmp' : 'tcp')
))

watch(
  () => props.show,
  (show) => {
    if (show && isKnownGhProxy(props.installGhProxy)) {
      manualCustomGhProxy.value = false
    }
  }
)

const isBlank = (value) => value === '' || value === null || value === undefined
const formatWithUnit = (value, unit) => (isBlank(value) ? '-' : `${value} ${unit}`)
</script>
