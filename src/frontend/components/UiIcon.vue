<template>
  <svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path v-for="(path, index) in paths" :key="index" :d="path" />
  </svg>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ name: { type: String, required: true } })
const icons = {
  server: ['M4 3h16v7H4z M4 14h16v7H4z', 'M7 6.5h.01 M7 17.5h.01 M11 6.5h6 M11 17.5h6'],
  bar: ['M4 20V10 M10 20V4 M16 20v-8 M22 20H2'],
  ring: ['M12 3a9 9 0 1 0 9 9h-9z', 'M15 3.5a8 8 0 0 1 5.5 5.5H15z'],
  table: ['M3 4h18v16H3z M3 10h18 M9 4v16 M3 15h18'],
  map: ['m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2z M9 3v16 M15 5v16'],
  lock: ['M6 10h12v11H6z M8 10V6a4 4 0 0 1 8 0v4 M12 14v3'],
  eye: ['M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z', 'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0'],
  eyeOff: ['m3 3 18 18 M10.6 5.1 1.4-.1c6.5 0 10 7 10 7a19 19 0 0 1-3.1 3.9 M6.1 6.1A20 20 0 0 0 2 12s3.5 7 10 7c1.5 0 2.9-.4 4.1-.9 M10 10a3 3 0 0 0 4 4'],
  arrow: ['M5 12h14 m-5-5 5 5-5 5'],
  refresh: ['M20 7v5h-5 M4 17v-5h5', 'M6 6a8 8 0 0 1 13 3 M18 18A8 8 0 0 1 5 15'],
  logout: ['M9 4H4v16h5 M9 12h12 m-5-5 5 5-5 5']
}
const paths = computed(() => icons[props.name] || icons.server)
</script>
