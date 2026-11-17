<template>
  <div id="login-overlay" class="login-overlay">
    <Card class="login-container min-w-0 w-full max-w-sm gap-5 p-6">
      <div class="login-header">
        <div class="login-icon"><UiIcon name="lock" /></div>
        <CardTitle class="login-title">{{ trans.adminLogin }}</CardTitle>
        <CardDescription class="login-subtitle">{{ trans.enterCredentials }}</CardDescription>
      </div>
      <form @submit.prevent="$emit('login')">
        <div v-if="isMultipleMode" class="login-form-group">
          <Label class="login-label">{{ trans.apiEndpoint }}</Label>
          <NativeSelect
            :aria-label="trans.apiEndpoint"
            :model-value="selectedApiIndex"
            class="login-input"
            @change="$emit('api-index-change', Number($event.target.value))"
          >
            <NativeSelectOption v-for="(base, index) in apiBases" :key="index" :value="index">
              [{{ index }}] {{ base }}
            </NativeSelectOption>
          </NativeSelect>
        </div>
        <div class="login-form-group">
          <Label for="login-username" class="login-label">{{ trans.username }}</Label>
          <Input
            id="login-username"
            type="text"
            name="username"
            autocomplete="username"
            v-model="loginForm.username"
            required
            class="login-input"
            placeholder="admin"
          />
        </div>
        <div class="login-form-group last">
          <Label for="login-password" class="login-label">{{ trans.password }}</Label>
          <div class="password-input-wrapper">
            <Input
              id="login-password"
              :type="passwordVisible.login ? 'text' : 'password'"
              name="password"
              autocomplete="current-password"
              v-model="loginForm.password"
              required
              class="login-input"
              placeholder="••••••••"
            />
            <Button
              type="button"
              :aria-label="passwordVisible.login ? trans.hidePassword : trans.showPassword"
              @click="$emit('toggle-password', 'login')"
              class="password-toggle"
              variant="ghost"
              size="icon-sm"
            >
              <UiIcon :name="passwordVisible.login ? 'eyeOff' : 'eye'" />
            </Button>
          </div>
        </div>
        <div
          v-if="turnstileSiteKey && (turnstileLoginEnabled || (turnstileEnabled && !turnstileVerified))"
          class="login-form-group"
        >
          <div id="admin-turnstile-container"></div>
        </div>
        <Alert v-if="loginError" id="login-error" role="alert" class="block" variant="destructive">{{
          loginError
        }}</Alert>
        <Button
          type="submit"
          :disabled="loginLoading"
          :aria-busy="loginLoading"
          class="w-full"
          variant="default"
          size="default"
          >{{ loginLoading ? trans.loading : trans.login }}</Button
        >
      </form>
      <template v-if="githubOAuthEnabled">
        <div class="login-divider">
          <span>{{ trans.or }}</span>
        </div>
        <Button
          type="button"
          :disabled="loginLoading"
          @click="$emit('github-login')"
          class="w-full"
          variant="outline"
          size="default"
        >
          {{ trans.loginWithGithub }}
        </Button>
      </template>
    </Card>
    <Footer />
  </div>
</template>

<script setup>
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import UiIcon from '../../../components/UiIcon.vue'
import Footer from '../../../components/Footer.vue'

defineProps({
  trans: { type: Object, required: true },
  isMultipleMode: { type: Boolean, default: false },
  apiBases: { type: Array, default: () => [] },
  selectedApiIndex: { type: Number, default: 0 },
  loginForm: { type: Object, required: true },
  passwordVisible: { type: Object, required: true },
  loginError: { type: String, default: '' },
  loginLoading: { type: Boolean, default: false },
  turnstileSiteKey: { type: String, default: '' },
  turnstileLoginEnabled: { type: Boolean, default: false },
  turnstileEnabled: { type: Boolean, default: false },
  turnstileVerified: { type: Boolean, default: false },
  githubOAuthEnabled: { type: Boolean, default: false }
})

defineEmits(['login', 'github-login', 'toggle-password', 'api-index-change'])
</script>
