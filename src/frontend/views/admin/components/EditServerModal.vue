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
      <Input type="hidden" v-model="editForm.id" />

      <div class="form-row">
        <div class="form-group flex-1">
          <Label for="editservermodal-name" class="form-label"
            >{{ trans.hostnameLabel }} <span class="required">*</span></Label
          >
          <Input
            id="editservermodal-name"
            type="text"
            name="edit_name"
            autocomplete="off"
            v-model="editForm.name"
            class="form-input"
            placeholder="e.g. My Server"
          />
        </div>

        <div class="form-group flex-1">
          <Label for="editservermodal-server_group" class="form-label">{{ trans.groupName }}</Label>
          <Input
            id="editservermodal-server_group"
            type="text"
            name="edit_server_group"
            autocomplete="off"
            v-model="editForm.server_group"
            class="form-input"
            placeholder="e.g. US VPS"
          />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group flex-1">
          <Label for="editservermodal-tags" class="form-label">{{ trans.tags }}</Label>
          <Input
            id="editservermodal-tags"
            type="text"
            name="edit_tags"
            autocomplete="off"
            v-model="editForm.tags"
            class="form-input"
            :placeholder="trans.tagsPlaceholder"
          />
        </div>

        <div class="form-group flex-1">
          <Label for="editservermodal-region" class="form-label">{{ trans.region }} CN/US/GB</Label>
          <Input
            id="editservermodal-region"
            type="text"
            name="edit_region"
            autocomplete="off"
            v-model.trim="editForm.region"
            class="form-input"
            :placeholder="trans.regionPlaceholder"
          />
        </div>
      </div>

      <div class="form-group">
        <Label for="editservermodal-note" class="form-label">{{ trans.note }}</Label>
        <Textarea
          id="editservermodal-note"
          name="edit_note"
          autocomplete="off"
          v-model="editForm.note"
          class="form-textarea"
          rows="2"
          :placeholder="trans.notePlaceholder"
        ></Textarea>
      </div>

      <div class="form-row mobile-two-row">
        <div class="form-group flex-1">
          <Label for="editservermodal-currency" class="form-label">{{ trans.currency }}</Label>
          <NativeSelect id="editservermodal-currency" v-model="editForm.currency" class="form-select">
            <NativeSelectOption v-for="item in currencySelectOptions" :key="item.symbol" :value="item.symbol">{{
              currencyLabel(item)
            }}</NativeSelectOption>
          </NativeSelect>
        </div>

        <div class="form-group flex-1">
          <Label for="editservermodal-price" class="form-label">{{ trans.price }}</Label>
          <Input
            id="editservermodal-price"
            type="text"
            name="edit_price"
            autocomplete="off"
            inputmode="decimal"
            v-model="editForm.price"
            class="form-input"
            placeholder="40.00"
            @blur="normalizePriceInput"
          />
        </div>

        <div class="form-group flex-1">
          <Label for="editservermodal-billing_cycle" class="form-label">{{ trans.billingCycle }}</Label>
          <NativeSelect id="editservermodal-billing_cycle" v-model="editForm.billing_cycle" class="form-select">
            <NativeSelectOption v-for="item in billingCycleOptions" :key="item.value" :value="item.value">{{
              cycleLabel(item)
            }}</NativeSelectOption>
          </NativeSelect>
        </div>

        <div class="form-group flex-1">
          <Label for="editservermodal-expire_date" class="form-label">{{ trans.expirationDate }}</Label>
          <Input
            id="editservermodal-expire_date"
            type="date"
            name="edit_expire_date"
            autocomplete="off"
            v-model="editForm.expire_date"
            class="form-input"
            @click="openDatePicker"
          />
        </div>
      </div>

      <div class="form-row mobile-two-row">
        <div class="form-group flex-1">
          <Label for="editservermodal-traffic_limit" class="form-label">{{ trans.trafficLimit }} (GB)</Label>
          <Input
            id="editservermodal-traffic_limit"
            type="number"
            name="edit_traffic_limit"
            autocomplete="off"
            v-model="editForm.traffic_limit"
            class="form-input"
            placeholder="e.g. 1000"
            min="0"
            step="1"
          />
        </div>
        <div class="form-group flex-1">
          <Label for="editservermodal-traffic_calc_type" class="form-label">{{ trans.trafficCalcType }}</Label>
          <NativeSelect id="editservermodal-traffic_calc_type" v-model="editForm.traffic_calc_type" class="form-select">
            <NativeSelectOption value="total">{{ trans.trafficCalcTotal }}</NativeSelectOption>
            <NativeSelectOption value="ul">{{ trans.trafficCalcUl }}</NativeSelectOption>
            <NativeSelectOption value="dl">{{ trans.trafficCalcDl }}</NativeSelectOption>
            <NativeSelectOption value="max">{{ trans.trafficCalcMax }}</NativeSelectOption>
          </NativeSelect>
        </div>
        <div class="form-group flex-1">
          <Label for="editservermodal-reset_day" class="form-label">
            {{ trans.trafficResetDay }}
            <HelpTooltip :text="trans.trafficResetDayTip" />
          </Label>
          <NativeSelect
            id="editservermodal-reset_day"
            ref="editResetDayRef"
            name="edit_reset_day"
            v-model="editForm.reset_day"
            class="form-select"
          >
            <NativeSelectOption :value="0">0</NativeSelectOption>
            <NativeSelectOption v-for="day in 31" :key="day" :value="day">{{ day }}</NativeSelectOption>
          </NativeSelect>
        </div>
        <div class="form-group flex-1">
          <Label for="editservermodal-traffic_alert_percent" class="form-label">
            {{ trans.trafficAlertPercent }} (%)
            <HelpTooltip :text="trans.trafficAlertPercentTip" />
          </Label>
          <Input
            id="editservermodal-traffic_alert_percent"
            type="number"
            name="edit_traffic_alert_percent"
            autocomplete="off"
            v-model="editForm.traffic_alert_percent"
            class="form-input"
            min="0"
            max="100"
            step="1"
          />
        </div>
      </div>

      <div class="form-row mobile-two-row">
        <div class="form-group flex-1">
          <Label for="editservermodal-collect_interval" class="form-label">
            {{ trans.collectInterval }}
            <HelpTooltip :text="trans.collectIntervalHint" />
          </Label>
          <NativeSelect id="editservermodal-collect_interval" v-model="editForm.collect_interval" class="form-select">
            <NativeSelectOption :value="0">0</NativeSelectOption>
            <NativeSelectOption :value="1">1</NativeSelectOption>
            <NativeSelectOption :value="2">2</NativeSelectOption>
            <NativeSelectOption :value="5">5</NativeSelectOption>
            <NativeSelectOption :value="10">10</NativeSelectOption>
          </NativeSelect>
        </div>
        <div class="form-group flex-1">
          <Label for="editservermodal-report_interval" class="form-label">{{ trans.reportInterval }}</Label>
          <NativeSelect id="editservermodal-report_interval" v-model="editForm.report_interval" class="form-select">
            <NativeSelectOption :value="30">30</NativeSelectOption>
            <NativeSelectOption :value="60">60</NativeSelectOption>
            <NativeSelectOption :value="120">120</NativeSelectOption>
            <NativeSelectOption :value="180">180</NativeSelectOption>
          </NativeSelect>
        </div>
        <div class="form-group flex-1">
          <Label for="editservermodal-connection_mode" class="form-label">
            {{ trans.connectionMode }}
            <HelpTooltip v-if="!isWssReportEnabled" :text="trans.wssReportDisabledConnectionHint" />
          </Label>
          <NativeSelect
            id="editservermodal-connection_mode"
            v-model="editForm.connection_mode"
            class="form-select"
            :disabled="!isWssReportEnabled"
          >
            <NativeSelectOption value="auto">{{ trans.connectionModeAuto }}</NativeSelectOption>
            <NativeSelectOption value="http">{{ trans.connectionModeHttp }}</NativeSelectOption>
          </NativeSelect>
        </div>
        <div v-if="isWssReportEnabled && editForm.connection_mode === 'auto'" class="form-group flex-1">
          <Label for="editservermodal-wss_report_interval" class="form-label">{{ trans.wssReportInterval }}</Label>
          <NativeSelect
            id="editservermodal-wss_report_interval"
            v-model="editForm.wss_report_interval"
            class="form-select"
          >
            <NativeSelectOption v-for="second in 5" :key="second" :value="second">{{ second }}</NativeSelectOption>
          </NativeSelect>
        </div>
      </div>

      <div class="form-row mobile-two-row">
        <div class="form-group flex-1">
          <Label for="editservermodal-ping_mode" class="form-label">
            {{ trans.pingMode }}
            <HelpTooltip :text="trans.pingModeIcmpRootHint" />
          </Label>
          <NativeSelect id="editservermodal-ping_mode" v-model="editForm.ping_mode" class="form-select">
            <NativeSelectOption value="tcp">TCP</NativeSelectOption>
            <NativeSelectOption value="icmp">ICMP (root)</NativeSelectOption>
          </NativeSelect>
        </div>
        <div class="form-group flex-1">
          <Label for="editservermodal-interface" class="form-label">{{ trans.networkInterface }}</Label>
          <Input
            id="editservermodal-interface"
            type="text"
            name="edit_interface"
            autocomplete="off"
            v-model.trim="editForm.interface"
            class="form-input"
            :placeholder="trans.networkInterfacePlaceholder"
          />
        </div>
        <div class="form-group flex-1">
          <Label for="editservermodal-rx_correction" class="form-label">
            {{ trans.rxCorrection }} (GB)
            <HelpTooltip :text="trans.correctionHint" />
          </Label>
          <Input
            id="editservermodal-rx_correction"
            type="number"
            name="edit_rx_correction"
            autocomplete="off"
            v-model="editForm.rx_correction"
            class="form-input"
            placeholder="0"
            min="0"
            step="0.1"
          />
        </div>
        <div class="form-group flex-1">
          <Label for="editservermodal-tx_correction" class="form-label">
            {{ trans.txCorrection }} (GB)
            <HelpTooltip :text="trans.correctionHint" />
          </Label>
          <Input
            id="editservermodal-tx_correction"
            type="number"
            name="edit_tx_correction"
            autocomplete="off"
            v-model="editForm.tx_correction"
            class="form-input"
            placeholder="0"
            min="0"
            step="0.1"
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group flex-1">
          <Label for="editservermodal-custom_ct" class="form-label">
            {{ settings.custom_ct_name || trans.customCt }}
            <HelpTooltip :text="trans.pingNodeTip" />
          </Label>
          <Input
            id="editservermodal-custom_ct"
            type="text"
            name="edit_custom_ct"
            autocomplete="off"
            v-model.trim="editForm.custom_ct"
            :class="['form-input', { 'input-invalid': pingNodeErrors.custom_ct }]"
            :placeholder="settings.custom_ct || 'gd-ct-dualstack.ip.zstaticcdn.com'"
          />
          <p v-if="pingNodeErrors.custom_ct" class="text-destructive text-sm mt-1">{{ pingNodeErrors.custom_ct }}</p>
        </div>
        <div class="form-group flex-1">
          <Label for="editservermodal-custom_cu" class="form-label">
            {{ settings.custom_cu_name || trans.customCu }}
            <HelpTooltip :text="trans.pingNodeTip" />
          </Label>
          <Input
            id="editservermodal-custom_cu"
            type="text"
            name="edit_custom_cu"
            autocomplete="off"
            v-model.trim="editForm.custom_cu"
            :class="['form-input', { 'input-invalid': pingNodeErrors.custom_cu }]"
            :placeholder="settings.custom_cu || 'gd-cu-dualstack.ip.zstaticcdn.com'"
          />
          <p v-if="pingNodeErrors.custom_cu" class="text-destructive text-sm mt-1">{{ pingNodeErrors.custom_cu }}</p>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group flex-1">
          <Label for="editservermodal-custom_cm" class="form-label">
            {{ settings.custom_cm_name || trans.customCm }}
            <HelpTooltip :text="trans.pingNodeTip" />
          </Label>
          <Input
            id="editservermodal-custom_cm"
            type="text"
            name="edit_custom_cm"
            autocomplete="off"
            v-model.trim="editForm.custom_cm"
            :class="['form-input', { 'input-invalid': pingNodeErrors.custom_cm }]"
            :placeholder="settings.custom_cm || 'gd-cm-dualstack.ip.zstaticcdn.com'"
          />
          <p v-if="pingNodeErrors.custom_cm" class="text-destructive text-sm mt-1">{{ pingNodeErrors.custom_cm }}</p>
        </div>
        <div class="form-group flex-1">
          <Label for="editservermodal-custom_bd" class="form-label">
            {{ settings.custom_bd_name || trans.customBd }}
            <HelpTooltip :text="trans.pingNodeTip" />
          </Label>
          <Input
            id="editservermodal-custom_bd"
            type="text"
            name="edit_custom_bd"
            autocomplete="off"
            v-model.trim="editForm.custom_bd"
            :class="['form-input', { 'input-invalid': pingNodeErrors.custom_bd }]"
            :placeholder="settings.custom_bd || 'ip.zstaticcdn.com'"
          />
          <p v-if="pingNodeErrors.custom_bd" class="text-destructive text-sm mt-1">{{ pingNodeErrors.custom_bd }}</p>
        </div>
      </div>
      <div class="form-row">
        <div v-for="(field, index) in ['node_1', 'node_2']" :key="field" class="form-group flex-1">
          <Label class="form-label">
            {{ settings[`${field}_name`] || `Node ${index + 1}` }}
            <HelpTooltip :text="trans.pingNodeTip" />
          </Label>
          <Input
            :aria-label="settings[`${field}_name`] || `Node ${index + 1}`"
            type="text"
            :name="`edit_${field}`"
            autocomplete="off"
            v-model.trim="editForm[field]"
            :class="['form-input', { 'input-invalid': pingNodeErrors[field] }]"
            :placeholder="settings[field] || 'host[:port] / [IPv6]:port'"
          />
          <p v-if="pingNodeErrors[field]" class="text-destructive text-sm mt-1">{{ pingNodeErrors[field] }}</p>
        </div>
      </div>
      <div class="form-row">
        <div v-for="(field, index) in ['node_3', 'node_4']" :key="field" class="form-group flex-1">
          <Label class="form-label">
            {{ settings[`${field}_name`] || `Node ${index + 3}` }}
            <HelpTooltip :text="trans.pingNodeTip" />
          </Label>
          <Input
            :aria-label="settings[`${field}_name`] || `Node ${index + 3}`"
            type="text"
            :name="`edit_${field}`"
            autocomplete="off"
            v-model.trim="editForm[field]"
            :class="['form-input', { 'input-invalid': pingNodeErrors[field] }]"
            :placeholder="settings[field] || 'host[:port] / [IPv6]:port'"
          />
          <p v-if="pingNodeErrors[field]" class="text-destructive text-sm mt-1">{{ pingNodeErrors[field] }}</p>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group flex-1">
          <div class="checkbox-item no-margin">
            <Switch id="editservermodal-auto_renewal" v-model="editForm.auto_renewal" />
            <Label for="editservermodal-auto_renewal">
              <b>{{ trans.autoRenewal }}</b>
            </Label>
          </div>
        </div>

        <div class="form-group">
          <div class="checkbox-item no-margin">
            <Switch
              :aria-label="trans.autoUpdate"
              :model-value="editForm.auto_update"
              @update:model-value="$emit('toggle-auto-update', $event)"
            />
            <Label>
              <b>{{ trans.autoUpdate }}</b>
            </Label>
          </div>
        </div>

        <div class="form-group">
          <div class="checkbox-item no-margin">
            <Switch id="editservermodal-is_hidden" v-model="editForm.is_hidden" />
            <Label for="editservermodal-is_hidden">
              <b>{{ trans.hideFromPublic }}</b>
            </Label>
          </div>
        </div>

        <div v-if="hasNodeNotificationOptions" class="form-group">
          <div class="checkbox-item no-margin">
            <Switch id="editservermodal-offline_notify_disabled" v-model="editForm.offline_notify_disabled" />
            <Label for="editservermodal-offline_notify_disabled">
              <b>{{ trans.disableOfflineNotify }}</b>
            </Label>
          </div>
        </div>
      </div>
      <DialogFooter class="flex-wrap">
        <Button @click="$emit('save')" :disabled="hasPingNodeErrors" type="button" variant="default" size="sm">{{
          trans.save
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Switch } from '@/components/ui/switch'
import { computed, watch } from 'vue'
import HelpTooltip from '../../../components/HelpTooltip.vue'
import { PING_NODE_FIELDS, validatePingNode } from '../../../utils/pingNode.js'
import { currentLang } from '../../../utils/i18n.js'
import { BILLING_CYCLES, CURRENCY_OPTIONS, normalizePrice, renewExpireDateIfNeeded } from '../../../utils/server.js'

const editForm = defineModel('editForm', { type: Object, required: true })

const props = defineProps({
  trans: { type: Object, required: true },
  show: { type: Boolean, default: false },
  currentServerName: { type: String, default: '' },
  settings: { type: Object, required: true }
})

const pingNodeErrorMessage = computed(() => (
  props.trans.invalidPingNodeFormat || 'Use domain, IPv4, or host:port. Port must be 1-65535.'
))

const pingNodeErrors = computed(() => Object.fromEntries(
  PING_NODE_FIELDS.map(field => [
    field,
    validatePingNode(editForm.value[field]).valid ? '' : pingNodeErrorMessage.value
  ])
))

const hasPingNodeErrors = computed(() => Object.values(pingNodeErrors.value).some(Boolean))

const billingCycleOptions = BILLING_CYCLES
const currencyOptions = CURRENCY_OPTIONS
const currencySelectOptions = computed(() => {
  const currentCurrency = String(editForm.value.currency || '').trim()
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

const normalizeTgNotifySetting = (value) => {
  if (value === true || value === 'true') return '5'
  if (value === false || value === 'false' || value === undefined || value === null || value === '') return '0'

  const minutes = Number(value)
  if (Number.isInteger(minutes) && (minutes === 0 || (minutes >= 2 && minutes <= 30))) {
    return String(minutes)
  }

  return '0'
}

const isOfflineNotifyEnabled = computed(() => normalizeTgNotifySetting(props.settings.tg_notify) !== '0')
const hasNodeNotificationOptions = computed(() => (
  !!props.settings.tg_bot_token &&
  isOfflineNotifyEnabled.value
))
const isWssReportEnabled = computed(() => props.settings.wss_report_enabled === true)

const normalizePriceInput = () => {
  editForm.value.price = normalizePrice(editForm.value.price)
}

const openDatePicker = (event) => {
  const input = event?.currentTarget
  if (typeof input?.showPicker !== 'function') return
  try {
    input.showPicker()
  } catch (_) {}
}

watch(
  () => [editForm.value.auto_renewal, editForm.value.billing_cycle, editForm.value.expire_date],
  () => {
    if (!editForm.value.auto_renewal) return
    const renewal = renewExpireDateIfNeeded(
      editForm.value.expire_date,
      editForm.value.billing_cycle,
      editForm.value.auto_renewal
    )
    if (renewal.renewed) {
      editForm.value.expire_date = renewal.expire_date
    }
  }
)

watch(
  isWssReportEnabled,
  (enabled) => {
    if (!enabled) {
      editForm.value.connection_mode = 'http'
    }
  },
  { immediate: true }
)

defineEmits(['save', 'close', 'toggle-auto-update'])
</script>
