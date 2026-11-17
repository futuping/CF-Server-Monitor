<template>
  <footer class="footer status-bar">
    <Tooltip v-if="hasWorkersUpdate"
      ><TooltipTrigger as-child
        ><Button variant="ghost" size="xs" class="gap-1.5" :aria-label="updateTitle"
          >V{{ VERSION }}<span class="size-1.5 rounded-full bg-destructive" /></Button></TooltipTrigger
      ><TooltipContent>{{ updateTitle }}</TooltipContent></Tooltip
    >
    <span v-else>V{{ VERSION }}</span>
    <span
      >Powered by <a href="https://github.com/huilang-me/CF-Server-Monitor" target="_blank">CF-Server-Monitor</a></span
    >
  </footer>
</template>

<script setup>
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { computed } from 'vue'
import { LAST_WORKERS_VERSION, VERSION } from '../utils/api'
import { useTranslation } from '../utils/i18n'

const trans = useTranslation()
const currentVersion = computed(() => String(VERSION.value || '').trim())
const latestWorkersVersion = computed(() => String(LAST_WORKERS_VERSION.value || '').trim())
const hasWorkersUpdate = computed(() => latestWorkersVersion.value && currentVersion.value && latestWorkersVersion.value !== currentVersion.value)
const updateTitle = computed(() => {
  if (!hasWorkersUpdate.value) return ''
  return `${trans.value.workersUpdateAvailable || 'New version'} V${latestWorkersVersion.value}`
})
</script>
