<script setup>
import { ref } from 'vue'
import { CircleHelp } from '@lucide/vue'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

defineProps({ text: String, ariaLabel: { type: String, default: 'Help' }, passive: Boolean, placement: { type: String, default: 'top' } })
const open = ref(false)
</script>

<template>
  <Tooltip v-if="text" v-model:open="open">
    <TooltipTrigger
      :as="passive ? 'span' : 'button'"
      :type="passive ? undefined : 'button'"
      :tabindex="passive ? undefined : 0"
      :aria-label="ariaLabel"
      class="inline-flex shrink-0 items-center text-muted-foreground hover:text-foreground focus-visible:ring-2"
      @click="open = true"
    >
      <CircleHelp class="size-3.5" />
    </TooltipTrigger>
    <TooltipContent :side="placement" class="max-w-72 whitespace-pre-line">{{ text }}</TooltipContent>
  </Tooltip>
</template>
