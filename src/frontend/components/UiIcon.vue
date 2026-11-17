<script setup>
import { ArrowRight, ChartColumn, ChartPie, Eye, EyeOff, LockKeyhole, LogOut, Map, RefreshCw, Server, Table2 } from '@lucide/vue'
defineProps({ name: { type: String, required: true } })
const icons = { arrow: ArrowRight, bar: ChartColumn, ring: ChartPie, eye: Eye, eyeOff: EyeOff, lock: LockKeyhole, logout: LogOut, map: Map, refresh: RefreshCw, server: Server, table: Table2 }
</script>

<template>
  <component :is="icons[name] || Server" class="size-4 shrink-0" aria-hidden="true" />
</template>
