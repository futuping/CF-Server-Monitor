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
    <DialogContent
      class="max-h-[85dvh] overflow-y-auto sm:max-w-3xl"
      :show-close-button="false"
      :aria-describedby="undefined"
    >
      <DialogHeader class="pr-8">
        <DialogTitle>{{ trans.batchEdit }} [{{ selectedCount }}]</DialogTitle>
        <Button
          @click="$emit('close')"
          class="absolute right-3 top-3"
          type="button"
          variant="ghost"
          size="icon-sm"
          :aria-label="trans.close"
          >×</Button
        >
      </DialogHeader>

      <div class="batch-edit-grid">
        <div class="batch-edit-section">
          <div class="section-subtitle">{{ trans.basicInfo || 'Basic' }}</div>
          <BatchEditField
            :enabled="enabled.server_group"
            :label="trans.groupName"
            @toggle="toggleField('server_group', $event)"
          >
            <Input
              type="text"
              v-model="form.server_group"
              class="form-input"
              :disabled="!enabled.server_group"
              placeholder="Default"
            />
          </BatchEditField>
          <BatchEditField
            :enabled="enabled.region"
            :label="`${trans.region} CN/US/GB`"
            @toggle="toggleField('region', $event)"
          >
            <Input
              type="text"
              v-model.trim="form.region"
              class="form-input"
              :disabled="!enabled.region"
              :placeholder="trans.regionPlaceholder"
            />
          </BatchEditField>
          <BatchEditField :enabled="enabled.tags" :label="trans.tags" @toggle="toggleField('tags', $event)">
            <Input
              type="text"
              v-model="form.tags"
              class="form-input"
              :disabled="!enabled.tags"
              :placeholder="trans.tagsPlaceholder"
            />
          </BatchEditField>
        </div>

        <div class="batch-edit-section">
          <div class="section-subtitle">{{ trans.billing || 'Billing' }}</div>
          <BatchEditField :enabled="enabled.currency" :label="trans.currency" @toggle="toggleField('currency', $event)">
            <NativeSelect v-model="form.currency" class="form-select" :disabled="!enabled.currency">
              <NativeSelectOption v-for="item in currencySelectOptions" :key="item.symbol" :value="item.symbol">{{
                currencyLabel(item)
              }}</NativeSelectOption>
            </NativeSelect>
          </BatchEditField>
          <BatchEditField :enabled="enabled.price" :label="trans.price" @toggle="toggleField('price', $event)">
            <Input type="text" v-model="form.price" class="form-input" :disabled="!enabled.price" placeholder="40.00" />
          </BatchEditField>
          <BatchEditField
            :enabled="enabled.billing_cycle"
            :label="trans.billingCycle"
            @toggle="toggleField('billing_cycle', $event)"
          >
            <NativeSelect v-model="form.billing_cycle" class="form-select" :disabled="!enabled.billing_cycle">
              <NativeSelectOption v-for="item in billingCycleOptions" :key="item.value" :value="item.value">{{
                cycleLabel(item)
              }}</NativeSelectOption>
            </NativeSelect>
          </BatchEditField>
          <BatchEditField
            :enabled="enabled.expire_date"
            :label="trans.expirationDate"
            @toggle="toggleField('expire_date', $event)"
          >
            <Input
              type="date"
              v-model="form.expire_date"
              class="form-input"
              :disabled="!enabled.expire_date"
              @click="openDatePicker"
            />
          </BatchEditField>
          <BatchEditField
            :enabled="enabled.auto_renewal"
            :label="trans.autoRenewal"
            @toggle="toggleField('auto_renewal', $event)"
          >
            <NativeSelect v-model="form.auto_renewal" class="form-select" :disabled="!enabled.auto_renewal">
              <NativeSelectOption :value="true">{{ trans.enabled }}</NativeSelectOption>
              <NativeSelectOption :value="false">{{ trans.disabled }}</NativeSelectOption>
            </NativeSelect>
          </BatchEditField>
        </div>

        <div class="batch-edit-section">
          <div class="section-subtitle">{{ trans.monthlyTraffic }}</div>
          <BatchEditField
            :enabled="enabled.traffic_limit"
            :label="`${trans.trafficLimit} (GB)`"
            @toggle="toggleField('traffic_limit', $event)"
          >
            <Input
              type="number"
              v-model="form.traffic_limit"
              class="form-input"
              :disabled="!enabled.traffic_limit"
              min="0"
              step="1"
            />
          </BatchEditField>
          <BatchEditField
            :enabled="enabled.traffic_calc_type"
            :label="trans.trafficCalcType"
            @toggle="toggleField('traffic_calc_type', $event)"
          >
            <NativeSelect v-model="form.traffic_calc_type" class="form-select" :disabled="!enabled.traffic_calc_type">
              <NativeSelectOption value="total">{{ trans.trafficCalcTotal }}</NativeSelectOption>
              <NativeSelectOption value="ul">{{ trans.trafficCalcUl }}</NativeSelectOption>
              <NativeSelectOption value="dl">{{ trans.trafficCalcDl }}</NativeSelectOption>
              <NativeSelectOption value="max">{{ trans.trafficCalcMax }}</NativeSelectOption>
            </NativeSelect>
          </BatchEditField>
          <BatchEditField
            :enabled="enabled.reset_day"
            :label="trans.trafficResetDay"
            @toggle="toggleField('reset_day', $event)"
          >
            <NativeSelect v-model="form.reset_day" class="form-select" :disabled="!enabled.reset_day">
              <NativeSelectOption :value="0">0</NativeSelectOption>
              <NativeSelectOption v-for="day in 31" :key="day" :value="day">{{ day }}</NativeSelectOption>
            </NativeSelect>
          </BatchEditField>
          <BatchEditField
            :enabled="enabled.traffic_alert_percent"
            :label="`${trans.trafficAlertPercent} (%)`"
            @toggle="toggleField('traffic_alert_percent', $event)"
          >
            <Input
              type="number"
              v-model="form.traffic_alert_percent"
              class="form-input"
              :disabled="!enabled.traffic_alert_percent"
              min="0"
              max="100"
              step="1"
            />
          </BatchEditField>
          <BatchEditField
            :enabled="enabled.rx_correction"
            :label="`${trans.rxCorrection} (GB)`"
            @toggle="toggleField('rx_correction', $event)"
          >
            <Input
              type="number"
              v-model="form.rx_correction"
              class="form-input"
              :disabled="!enabled.rx_correction"
              min="0"
              step="0.1"
            />
          </BatchEditField>
          <BatchEditField
            :enabled="enabled.tx_correction"
            :label="`${trans.txCorrection} (GB)`"
            @toggle="toggleField('tx_correction', $event)"
          >
            <Input
              type="number"
              v-model="form.tx_correction"
              class="form-input"
              :disabled="!enabled.tx_correction"
              min="0"
              step="0.1"
            />
          </BatchEditField>
        </div>

        <div class="batch-edit-section">
          <div class="section-subtitle">{{ trans.editConf }}</div>
          <BatchEditField
            :enabled="enabled.collect_interval"
            :label="trans.collectInterval"
            @toggle="toggleField('collect_interval', $event)"
          >
            <NativeSelect v-model="form.collect_interval" class="form-select" :disabled="!enabled.collect_interval">
              <NativeSelectOption :value="0">0</NativeSelectOption>
              <NativeSelectOption :value="1">1</NativeSelectOption>
              <NativeSelectOption :value="2">2</NativeSelectOption>
              <NativeSelectOption :value="5">5</NativeSelectOption>
              <NativeSelectOption :value="10">10</NativeSelectOption>
            </NativeSelect>
          </BatchEditField>
          <BatchEditField
            :enabled="enabled.report_interval"
            :label="trans.reportInterval"
            @toggle="toggleField('report_interval', $event)"
          >
            <NativeSelect v-model="form.report_interval" class="form-select" :disabled="!enabled.report_interval">
              <NativeSelectOption :value="30">30</NativeSelectOption>
              <NativeSelectOption :value="60">60</NativeSelectOption>
              <NativeSelectOption :value="120">120</NativeSelectOption>
              <NativeSelectOption :value="180">180</NativeSelectOption>
            </NativeSelect>
          </BatchEditField>
          <BatchEditField
            :enabled="enabled.connection_mode"
            :label="trans.connectionMode"
            @toggle="toggleField('connection_mode', $event)"
          >
            <NativeSelect
              v-model="form.connection_mode"
              class="form-select"
              :disabled="!enabled.connection_mode || !isWssReportEnabled"
            >
              <NativeSelectOption value="auto">{{ trans.connectionModeAuto }}</NativeSelectOption>
              <NativeSelectOption value="http">{{ trans.connectionModeHttp }}</NativeSelectOption>
            </NativeSelect>
          </BatchEditField>
          <BatchEditField
            v-if="isWssReportEnabled && form.connection_mode === 'auto'"
            :enabled="enabled.wss_report_interval"
            :label="trans.wssReportInterval"
            @toggle="toggleField('wss_report_interval', $event)"
          >
            <NativeSelect
              v-model="form.wss_report_interval"
              class="form-select"
              :disabled="!enabled.wss_report_interval"
            >
              <NativeSelectOption v-for="second in 5" :key="second" :value="second">{{ second }}</NativeSelectOption>
            </NativeSelect>
          </BatchEditField>
          <BatchEditField
            :enabled="enabled.ping_mode"
            :label="trans.pingMode"
            @toggle="toggleField('ping_mode', $event)"
          >
            <NativeSelect v-model="form.ping_mode" class="form-select" :disabled="!enabled.ping_mode">
              <NativeSelectOption value="tcp">TCP</NativeSelectOption>
              <NativeSelectOption value="icmp">ICMP (root)</NativeSelectOption>
            </NativeSelect>
          </BatchEditField>
          <BatchEditField
            :enabled="enabled.interface"
            :label="trans.networkInterface"
            @toggle="toggleField('interface', $event)"
          >
            <Input
              type="text"
              v-model.trim="form.interface"
              class="form-input"
              :disabled="!enabled.interface"
              :placeholder="trans.networkInterfacePlaceholder"
            />
          </BatchEditField>
        </div>

        <div class="batch-edit-section">
          <div class="section-subtitle">{{ trans.pingNodes }}</div>
          <BatchEditField
            :enabled="enabled.custom_ct"
            :label="settings.custom_ct_name || trans.customCt"
            @toggle="toggleField('custom_ct', $event)"
          >
            <Input
              type="text"
              v-model.trim="form.custom_ct"
              class="form-input"
              :disabled="!enabled.custom_ct"
              :placeholder="settings.custom_ct || 'gd-ct-dualstack.ip.zstaticcdn.com'"
            />
          </BatchEditField>
          <BatchEditField
            :enabled="enabled.custom_cu"
            :label="settings.custom_cu_name || trans.customCu"
            @toggle="toggleField('custom_cu', $event)"
          >
            <Input
              type="text"
              v-model.trim="form.custom_cu"
              class="form-input"
              :disabled="!enabled.custom_cu"
              :placeholder="settings.custom_cu || 'gd-cu-dualstack.ip.zstaticcdn.com'"
            />
          </BatchEditField>
          <BatchEditField
            :enabled="enabled.custom_cm"
            :label="settings.custom_cm_name || trans.customCm"
            @toggle="toggleField('custom_cm', $event)"
          >
            <Input
              type="text"
              v-model.trim="form.custom_cm"
              class="form-input"
              :disabled="!enabled.custom_cm"
              :placeholder="settings.custom_cm || 'gd-cm-dualstack.ip.zstaticcdn.com'"
            />
          </BatchEditField>
          <BatchEditField
            :enabled="enabled.custom_bd"
            :label="settings.custom_bd_name || trans.customBd"
            @toggle="toggleField('custom_bd', $event)"
          >
            <Input
              type="text"
              v-model.trim="form.custom_bd"
              class="form-input"
              :disabled="!enabled.custom_bd"
              :placeholder="settings.custom_bd || 'ip.zstaticcdn.com'"
            />
          </BatchEditField>
          <BatchEditField
            v-for="(field, index) in ['node_1', 'node_2', 'node_3', 'node_4']"
            :key="field"
            :enabled="enabled[field]"
            :label="settings[`${field}_name`] || `Node ${index + 1}`"
            @toggle="toggleField(field, $event)"
          >
            <Input
              type="text"
              v-model.trim="form[field]"
              class="form-input"
              :disabled="!enabled[field]"
              :placeholder="settings[field] || 'host[:port] / [IPv6]:port'"
            />
          </BatchEditField>
        </div>

        <div class="batch-edit-section">
          <div class="section-subtitle">{{ trans.displayOptions }}</div>
          <BatchEditField
            :enabled="enabled.auto_update"
            :label="trans.autoUpdate"
            @toggle="toggleField('auto_update', $event)"
          >
            <NativeSelect v-model="form.auto_update" class="form-select" :disabled="!enabled.auto_update">
              <NativeSelectOption :value="true">{{ trans.enabled }}</NativeSelectOption>
              <NativeSelectOption :value="false">{{ trans.disabled }}</NativeSelectOption>
            </NativeSelect>
          </BatchEditField>
          <BatchEditField
            :enabled="enabled.is_hidden"
            :label="trans.hideFromPublic"
            @toggle="toggleField('is_hidden', $event)"
          >
            <NativeSelect v-model="form.is_hidden" class="form-select" :disabled="!enabled.is_hidden">
              <NativeSelectOption :value="true">{{ trans.enabled }}</NativeSelectOption>
              <NativeSelectOption :value="false">{{ trans.disabled }}</NativeSelectOption>
            </NativeSelect>
          </BatchEditField>
          <BatchEditField
            :enabled="enabled.offline_notify_disabled"
            :label="trans.disableOfflineNotify"
            @toggle="toggleField('offline_notify_disabled', $event)"
          >
            <NativeSelect
              v-model="form.offline_notify_disabled"
              class="form-select"
              :disabled="!enabled.offline_notify_disabled"
            >
              <NativeSelectOption :value="true">{{ trans.enabled }}</NativeSelectOption>
              <NativeSelectOption :value="false">{{ trans.disabled }}</NativeSelectOption>
            </NativeSelect>
          </BatchEditField>
        </div>
      </div>

      <DialogFooter class="flex-wrap">
        <Button @click="$emit('save')" :disabled="!hasEnabledFields" type="button" variant="default" size="sm">{{
          saving ? trans.saving : trans.save
        }}</Button>
        <Button @click="$emit('close')" type="button" variant="outline" size="sm">{{ trans.cancel }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { computed } from 'vue'
import BatchEditField from './BatchEditField.vue'
import { currentLang } from '../../../utils/i18n.js'
import { BILLING_CYCLES, CURRENCY_OPTIONS } from '../../../utils/server.js'

const form = defineModel('form', { type: Object, required: true })
const enabled = defineModel('enabled', { type: Object, required: true })

defineProps({
  trans: { type: Object, required: true },
  show: { type: Boolean, default: false },
  selectedCount: { type: Number, default: 0 },
  settings: { type: Object, required: true },
  isWssReportEnabled: { type: Boolean, default: false },
  saving: { type: Boolean, default: false }
})

defineEmits(['save', 'close'])

const billingCycleOptions = BILLING_CYCLES
const currencyOptions = CURRENCY_OPTIONS
const currencySelectOptions = computed(() => {
  const currentCurrency = String(form.value.currency || '').trim()
  if (!currentCurrency || currencyOptions.some(item => item.symbol === currentCurrency)) {
    return currencyOptions
  }
  return [
    { symbol: currentCurrency, nameZh: currentCurrency, nameEn: currentCurrency },
    ...currencyOptions
  ]
})

const cycleLabel = (item) => currentLang.value === 'zh' ? item.labelZh : item.labelEn
const currencyLabel = (item) => currentLang.value === 'zh'
  ? `${item.symbol} ${item.nameZh}`
  : `${item.symbol} ${item.nameEn}`

const hasEnabledFields = computed(() => Object.values(enabled.value).some(Boolean))

const toggleField = (field, checked) => {
  enabled.value[field] = checked
}

const openDatePicker = (event) => {
  const input = event?.currentTarget
  if (typeof input?.showPicker !== 'function') return
  try {
    input.showPicker()
  } catch (_) {}
}

</script>
