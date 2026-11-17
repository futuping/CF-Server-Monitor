<template>
  <TooltipProvider :delay-duration="200">
    <router-view />
  </TooltipProvider>
</template>

<script setup>
import { TooltipProvider } from '@/components/ui/tooltip'
import { useTheme } from './composables/useTheme'

const { initTheme } = useTheme()

initTheme()
</script>