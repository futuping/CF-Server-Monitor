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
    <DialogContent class="max-h-[85dvh] overflow-y-auto" :show-close-button="false">
      <DialogHeader class="pr-8">
        <DialogTitle>{{ trans.liveConnectionTimeoutTitle }}</DialogTitle>
      </DialogHeader>

      <DialogDescription>{{ trans.liveConnectionTimeoutMessage }}</DialogDescription>

      <DialogFooter class="flex-wrap">
        <Button type="button" @click="$emit('close')" variant="outline" size="sm">
          {{ trans.close }}
        </Button>
        <Button type="button" autofocus @click="$emit('continue')" variant="default" size="sm">
          {{ trans.continueConnection }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

defineProps({
  show: { type: Boolean, default: false },
  trans: { type: Object, required: true }
})

defineEmits(['close', 'continue'])
</script>
