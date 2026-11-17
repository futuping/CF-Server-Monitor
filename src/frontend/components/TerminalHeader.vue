<template>
  <header class="mb-6 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
    <a href="/#/" class="inline-flex min-w-0 items-center gap-2 font-semibold tracking-tight"
      ><Server class="size-5 shrink-0" /><span>{{ title }}</span></a
    >
    <div class="flex items-center gap-2">
      <div class="inline-flex items-center gap-0.5 rounded-lg bg-muted p-0.5" role="group" aria-label="Language">
        <Button
          v-for="lang in languages"
          :key="lang.id"
          size="xs"
          :variant="lang.id === currentLang ? 'outline' : 'ghost'"
          :aria-label="lang.label"
          :aria-pressed="lang.id === currentLang"
          @click="setLang(lang.id)"
          >{{ lang.short }}</Button
        >
      </div>
      <div class="inline-flex items-center gap-0.5 rounded-lg bg-muted p-0.5" role="group" :aria-label="t('theme')">
        <Button
          v-for="theme in themes"
          :key="theme.id"
          size="icon-xs"
          :variant="theme.id === currentTheme ? 'outline' : 'ghost'"
          :aria-label="t(theme.label)"
          :aria-pressed="theme.id === currentTheme"
          @click="setTheme(theme.id)"
          ><component :is="theme.icon"
        /></Button>
      </div>
      <Button
        as="a"
        size="icon-sm"
        variant="ghost"
        :href="isAdminPage ? '/#/' : adminHref"
        :aria-label="t(isAdminPage ? 'overview' : 'admin')"
        ><component :is="isAdminPage ? House : Settings"
      /></Button>
    </div>
  </header>
</template>

<script setup>
import { House, Monitor, Moon, Server, Settings, Sun } from '@lucide/vue'
import { Button } from '@/components/ui/button'
const languages = [{ id: 'en', short: 'EN', label: 'English' }, { id: 'zh', short: '中', label: '中文' }]
const themes = [{ id: 'auto', icon: Monitor, label: 'themeAuto' }, { id: 'dark', icon: Moon, label: 'themeDark' }, { id: 'light', icon: Sun, label: 'themeLight' }]
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { t, setLanguage, getLanguage } from '../utils/i18n'
import { useTheme } from '../composables/useTheme'
import { DEFAULT_SITE_TITLE } from '../utils/constants'
import { hasConfiguredApiBase } from '../utils/config'

defineProps({
  title: {
    type: String,
    default: DEFAULT_SITE_TITLE
  }
})

const { currentTheme, setTheme } = useTheme()
const currentLang = ref('en')
const route = useRoute()
const isAdminPage = computed(() => route.path === '/admin')
const adminHref = computed(() => hasConfiguredApiBase() ? '/#/admin' : '/admin#/admin')

const setLang = (lang) => {
  setLanguage(lang)
  currentLang.value = lang
}

const handleLanguageChange = (e) => {
  currentLang.value = e.detail.lang
}

onMounted(() => {
  currentLang.value = getLanguage()
  window.addEventListener('languageChanged', handleLanguageChange)
})

onUnmounted(() => {
  window.removeEventListener('languageChanged', handleLanguageChange)
})
</script>
