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
      <Input type="hidden" :model-value="deleteServerId" />

      <div class="mb-4">
        <div class="flex-center-gap-sm mb-3">
          <span class="danger-icon text-xl">⚠️</span>
          <span class="danger-label">{{ trans.dangerWarning }}</span>
        </div>
        <p class="text-muted-foreground text-sm line-height-1-6">
          {{ trans.deleteConfirm }}
          <br /><br />
          <strong class="text-primary">{{ trans.recommendUninstall }}：</strong>
        </p>
      </div>

      <div class="form-row">
        <div class="form-group flex-1 mb-3">
          <Label class="form-label">{{ trans.targetOs }}</Label>
          <NativeSelect
            :aria-label="trans.targetOs"
            :model-value="deleteTargetOs"
            class="form-select"
            @change="$emit('update:delete-target-os', $event.target.value)"
          >
            <NativeSelectOption value="linux">Linux (systemd)</NativeSelectOption>
            <NativeSelectOption value="unix">OpenWrt/Alpine/Synology DSM/FreeBSD</NativeSelectOption>
            <NativeSelectOption value="mac">macOS</NativeSelectOption>
            <NativeSelectOption value="windows">Windows</NativeSelectOption>
          </NativeSelect>
        </div>

        <div class="form-group flex-1 mb-3">
          <Label class="form-label">{{ trans.agentVersionSelect }}</Label>
          <NativeSelect
            :aria-label="trans.agentVersionSelect"
            :model-value="deleteVersion"
            class="form-select"
            @change="$emit('update:delete-version', $event.target.value)"
          >
            <NativeSelectOption value="go">{{ trans.agentVersionGo }}</NativeSelectOption>
            <NativeSelectOption value="shell">{{ trans.agentVersionShell }}</NativeSelectOption>
          </NativeSelect>
        </div>
      </div>

      <div v-if="deleteVersion === 'go'" class="form-row">
        <div v-if="deleteTargetOs === 'linux' && deleteVersion === 'go'" class="form-group flex-1 mb-3">
          <Label class="form-label">
            {{ trans.uninstallMode }}
          </Label>
          <NativeSelect
            :aria-label="trans.uninstallMode"
            :model-value="deleteInstallMode"
            class="form-select"
            @change="$emit('update:delete-install-mode', $event.target.value)"
          >
            <NativeSelectOption value="current-user">{{ trans.uninstallModeCurrentUser }}</NativeSelectOption>
            <NativeSelectOption value="cfsm-user">{{ trans.uninstallModeCfsmUser }}</NativeSelectOption>
          </NativeSelect>
        </div>

        <div class="form-group flex-1 mb-3">
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
            :model-value="deleteGhProxy"
            class="form-input mt-2"
            :placeholder="trans.ghProxyPlaceholder"
            @input="$emit('update:delete-gh-proxy', $event.target.value)"
          />
        </div>
      </div>

      <div class="cmd-input-wrapper mb-3" :class="{ copied: uninstallCopied }">
        <span class="cmd-prompt">{{ deleteTargetOs === 'windows' ? 'PS' : '$' }}</span>
        <Textarea
          v-if="deleteTargetOs === 'linux' && deleteVersion === 'go' && deleteInstallMode === 'cfsm-user'"
          readonly
          :model-value="uninstallCommand"
          class="cmd-input flex-1"
          rows="8"
        />
        <Input v-else type="text" readonly :model-value="uninstallCommand" class="cmd-input flex-1" />
        <Button
          @click="$emit('copy-uninstall')"
          :aria-label="trans.copy"
          class="ml-2"
          type="button"
          variant="outline"
          size="sm"
          >{{ uninstallCopied ? '✅' : '📋' }}</Button
        >
      </div>

      <DialogFooter class="flex-wrap">
        <Button @click="$emit('confirm-delete')" type="button" variant="destructive" size="sm">{{
          trans.confirmDelete
        }}</Button>
        <Button @click="$emit('close')" type="button" variant="outline" size="sm">{{ trans.cancelAction }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { computed, ref, watch } from 'vue'
import HelpTooltip from '../../../components/HelpTooltip.vue'

const props = defineProps({
  trans: { type: Object, required: true },
  show: { type: Boolean, default: false },
  deleteServerId: { type: [String, Number], default: '' },
  currentServerName: { type: String, default: '' },
  deleteTargetOs: { type: String, default: 'linux' },
  deleteVersion: { type: String, default: 'go' },
  deleteInstallMode: { type: String, default: 'current-user' },
  deleteGhProxy: { type: String, default: '' },
  uninstallCommand: { type: String, default: '' },
  uninstallCopied: { type: Boolean, default: false }
})

const emit = defineEmits([
  'close',
  'confirm-delete',
  'copy-uninstall',
  'update:delete-target-os',
  'update:delete-version',
  'update:delete-install-mode',
  'update:delete-gh-proxy'
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
    const currentProxy = String(props.deleteGhProxy || '').trim()
    if (manualCustomGhProxy.value || (!isKnownGhProxy(currentProxy) && currentProxy)) {
      return CUSTOM_GH_PROXY_VALUE
    }
    return currentProxy
  },
  set: (value) => {
    if (value === CUSTOM_GH_PROXY_VALUE) {
      manualCustomGhProxy.value = true
      if (isKnownGhProxy(props.deleteGhProxy)) {
        emit('update:delete-gh-proxy', '')
      }
      return
    }
    manualCustomGhProxy.value = false
    emit('update:delete-gh-proxy', value)
  }
})

const showCustomGhProxy = computed(() => selectedGhProxy.value === CUSTOM_GH_PROXY_VALUE)

watch(
  () => props.show,
  (show) => {
    if (show && isKnownGhProxy(props.deleteGhProxy)) {
      manualCustomGhProxy.value = false
    }
  }
)
</script>
