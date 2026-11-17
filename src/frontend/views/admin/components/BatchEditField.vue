<template>
  <div class="batch-edit-field">
    <Label class="batch-edit-field-toggle">
      <Checkbox :model-value="enabled" @update:model-value="$emit('toggle', $event)" />
      <span>{{ label }}</span>
    </Label>
    <div class="batch-edit-field-control">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
defineProps({
  enabled: { type: Boolean, default: false },
  label: { type: String, required: true }
})

defineEmits(['toggle'])
</script>
