<template>
  <div id="login-overlay" class="login-overlay">
    <div class="login-container">
      <div class="login-header">
        <div class="login-icon"><UiIcon name="lock" /></div>
        <h2 class="login-title">{{ trans.adminLogin }}</h2>
        <p class="login-subtitle">{{ trans.enterCredentials }}</p>
      </div>
      <form @submit.prevent="$emit('login')">
        <div v-if="isMultipleMode" class="login-form-group">
          <label class="login-label">{{ trans.apiEndpoint }}</label>
          <select :value="selectedApiIndex" class="login-input" @change="$emit('api-index-change', Number($event.target.value))">
            <option
              v-for="(base, index) in apiBases"
              :key="index"
              :value="index"
            >
              [{{ index }}] {{ base }}
            </option>
          </select>
        </div>
        <div class="login-form-group">
          <label for="login-username" class="login-label">{{ trans.username }}</label>
          <input id="login-username" type="text" name="username" autocomplete="username" v-model="loginForm.username" required class="login-input" placeholder="admin">
        </div>
        <div class="login-form-group last">
          <label for="login-password" class="login-label">{{ trans.password }}</label>
          <div class="password-input-wrapper">
            <input id="login-password" :type="passwordVisible.login ? 'text' : 'password'" name="password" autocomplete="current-password" v-model="loginForm.password" required class="login-input" placeholder="••••••••">
            <button type="button" class="password-toggle" :aria-label="passwordVisible.login ? trans.hidePassword : trans.showPassword" @click="$emit('toggle-password', 'login')">
              <UiIcon :name="passwordVisible.login ? 'eyeOff' : 'eye'" />
            </button>
          </div>
        </div>
        <div v-if="turnstileSiteKey && (turnstileLoginEnabled || (turnstileEnabled && !turnstileVerified))" class="login-form-group">
          <div id="admin-turnstile-container"></div>
        </div>
        <div v-if="loginError" id="login-error" class="login-error" role="alert">{{ loginError }}</div>
        <button type="submit" class="login-btn" :disabled="loginLoading" :aria-busy="loginLoading">{{ loginLoading ? trans.loading : trans.login }}</button>
      </form>
      <template v-if="githubOAuthEnabled">
        <div class="login-divider"><span>{{ trans.or }}</span></div>
        <button type="button" class="login-btn github-login-btn" :disabled="loginLoading" @click="$emit('github-login')">
          {{ trans.loginWithGithub }}
        </button>
      </template>
    </div>
    <Footer />
  </div>
</template>

<script setup>
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
