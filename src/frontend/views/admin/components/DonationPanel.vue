<template>
  <TabsContent value="donation" force-mount v-show="activeTab === 'donation'">
    <Card class="settings-section donation-section min-w-0 gap-4 p-5">
      <CardTitle class="section-title">{{ trans.donationTitle }}</CardTitle>

      <div class="donation-content">
        <div class="donation-qr-card">
          <img class="donation-qr" src="/donate/wechat-reward.jpg" :alt="trans.donationQrAlt" />
          <div class="donation-qr-caption">{{ trans.donationWechat }}</div>
        </div>

        <div class="donation-copy">
          <p>{{ trans.donationDesc }}</p>
          <p class="donation-token">🪙 {{ trans.donationToken }}</p>
          <p class="text-muted-foreground text-sm">{{ trans.donationThanks }}</p>
        </div>
      </div>
    </Card>
  </TabsContent>
</template>

<script setup>
import { TabsContent } from '@/components/ui/tabs'
import { Card, CardTitle } from '@/components/ui/card'
defineProps({
  trans: {
    type: Object,
    required: true
  },
  activeTab: {
    type: String,
    default: ''
  }
})
</script>
