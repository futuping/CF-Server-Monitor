<template>
  <TabsContent value="settings" force-mount v-show="activeTab === 'settings'">
    <div class="settings-grid">
      <Card v-if="currentOrigin === selectedApiBase" class="settings-section min-w-0 gap-4 p-5">
        <CardTitle class="section-title">{{ trans.appearance }} 1</CardTitle>

        <div class="form-row">
          <div class="form-group flex-1">
            <Label for="settingspanel-site_title" class="form-label">{{ trans.siteTitle }}</Label>
            <Input
              id="settingspanel-site_title"
              type="text"
              v-model="settings.site_title"
              class="form-input"
              :placeholder="'Cloudflare Server Monitor'"
            />
          </div>

          <div class="form-group flex-1">
            <Label for="settingspanel-display_mode" class="form-label">{{ trans.displayMode }}</Label>
            <NativeSelect id="settingspanel-display_mode" v-model="settings.display_mode" class="form-select">
              <NativeSelectOption value="bar">{{ trans.displayModeBar }}</NativeSelectOption>
              <NativeSelectOption value="ring">{{ trans.displayModeRing }}</NativeSelectOption>
              <NativeSelectOption value="table">{{ trans.displayModeTable }}</NativeSelectOption>
            </NativeSelect>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group flex-1">
            <Label for="settingspanel-preferred_theme" class="form-label">{{ trans.defaultTheme }}</Label>
            <NativeSelect id="settingspanel-preferred_theme" v-model="settings.preferred_theme" class="form-select">
              <NativeSelectOption value="auto">{{ trans.themeAuto }}</NativeSelectOption>
              <NativeSelectOption value="dark">{{ trans.themeDark }}</NativeSelectOption>
              <NativeSelectOption value="light">{{ trans.themeLight }}</NativeSelectOption>
            </NativeSelect>
          </div>

          <div class="form-group flex-1">
            <Label for="settingspanel-default_language" class="form-label">{{ trans.defaultLanguage }}</Label>
            <NativeSelect id="settingspanel-default_language" v-model="settings.default_language" class="form-select">
              <NativeSelectOption value="auto">{{ trans.languageAuto }}</NativeSelectOption>
              <NativeSelectOption value="zh">{{ trans.languageChinese }}</NativeSelectOption>
              <NativeSelectOption value="en">{{ trans.languageEnglish }}</NativeSelectOption>
            </NativeSelect>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <Label for="settingspanel-custom_bg" class="form-label">
              {{ trans.bgImage }}
              <HelpTooltip :text="trans.remoteImageTip" />
            </Label>
            <div class="flex" style="gap: 8px">
              <Input
                id="settingspanel-custom_bg"
                type="text"
                v-model="settings.custom_bg"
                class="form-input flex-1"
                placeholder="https://..."
              />
              <div>
                <input
                  id="upload-bg"
                  class="peer sr-only"
                  type="file"
                  accept="image/*"
                  :aria-label="trans.upload"
                  @change="$emit('upload-bg', $event)"
                /><Button
                  as="label"
                  for="upload-bg"
                  variant="outline"
                  size="sm"
                  class="cursor-pointer peer-focus-visible:ring-2"
                  >{{ trans.upload }}</Button
                >
              </div>
            </div>
            <img v-if="settings.custom_bg" :src="settings.custom_bg" class="bg-preview" />
          </div>

          <div class="form-group">
            <Label for="settingspanel-custom_bg_mobile" class="form-label">
              {{ trans.mobileBgImage }}
              <HelpTooltip :text="trans.remoteImageTip" />
            </Label>
            <div class="flex" style="gap: 8px">
              <Input
                id="settingspanel-custom_bg_mobile"
                type="text"
                v-model="settings.custom_bg_mobile"
                class="form-input flex-1"
                placeholder="https://..."
              />
              <div>
                <input
                  id="upload-bg-mobile"
                  class="peer sr-only"
                  type="file"
                  accept="image/*"
                  :aria-label="trans.upload"
                  @change="$emit('upload-bg-mobile', $event)"
                /><Button
                  as="label"
                  for="upload-bg-mobile"
                  variant="outline"
                  size="sm"
                  class="cursor-pointer peer-focus-visible:ring-2"
                  >{{ trans.upload }}</Button
                >
              </div>
            </div>
            <img v-if="settings.custom_bg_mobile" :src="settings.custom_bg_mobile" class="bg-preview" />
          </div>

          <div class="form-group">
            <Label for="settingspanel-favicon" class="form-label">
              {{ trans.favicon }}
              <HelpTooltip :text="trans.remoteImageTip" />
            </Label>
            <div class="flex" style="gap: 8px">
              <Input
                id="settingspanel-favicon"
                type="text"
                v-model="settings.favicon"
                class="form-input flex-1"
                placeholder="https://..."
              />
              <div>
                <input
                  id="upload-favicon"
                  class="peer sr-only"
                  type="file"
                  accept="image/*,.ico"
                  :aria-label="trans.upload"
                  @change="$emit('upload-favicon', $event)"
                /><Button
                  as="label"
                  for="upload-favicon"
                  variant="outline"
                  size="sm"
                  class="cursor-pointer peer-focus-visible:ring-2"
                  >{{ trans.upload }}</Button
                >
              </div>
            </div>
            <img v-if="settings.favicon" :src="settings.favicon" class="bg-preview" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group flex-1">
            <Label for="settingspanel-csp_static" class="form-label">
              {{ trans.cspStatic }}
              <HelpTooltip :text="trans.cspStaticTip" />
            </Label>
            <Input
              id="settingspanel-csp_static"
              type="text"
              v-model="settings.csp_static"
              class="form-input"
              placeholder="https://unpkg.com,https://cdn.jsdelivr.net"
              @blur="validateCspField('csp_static')"
            />
            <p v-if="cspErrors.csp_static" class="text-danger text-sm">{{ cspErrors.csp_static }}</p>
          </div>

          <div class="form-group flex-1">
            <Label for="settingspanel-csp_api" class="form-label">
              {{ trans.cspApi }}
              <HelpTooltip :text="trans.cspApiTip" />
            </Label>
            <Input
              id="settingspanel-csp_api"
              type="text"
              v-model="settings.csp_api"
              class="form-input"
              placeholder="https://api.example.com"
              @blur="validateCspField('csp_api')"
            />
            <p v-if="cspErrors.csp_api" class="text-danger text-sm">{{ cspErrors.csp_api }}</p>
          </div>
        </div>
      </Card>

      <Card v-if="currentOrigin === selectedApiBase" class="settings-section min-w-0 gap-4 p-5">
        <CardTitle class="section-title">{{ trans.appearance }} 2</CardTitle>

        <div class="form-row">
          <div class="form-group flex-1">
            <Label for="settingspanel-custom_head" class="form-label">
              {{ trans.customHead }}
              <HelpTooltip :text="trans.cspWarning" />
            </Label>
            <Textarea
              id="settingspanel-custom_head"
              v-model="settings.custom_head"
              class="form-textarea"
              rows="3"
              placeholder="<link rel='stylesheet' href='...'"
            >
            </Textarea>
          </div>

          <div class="form-group flex-1">
            <Label for="settingspanel-custom_script" class="form-label">{{ trans.customScript }}</Label>
            <Textarea
              id="settingspanel-custom_script"
              v-model="settings.custom_script"
              class="form-textarea"
              rows="3"
              placeholder="console.log('Hello');"
            >
            </Textarea>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group flex-1">
            <Label for="settingspanel-theme_options" class="form-label">
              {{ trans.themeOptions }}
              <HelpTooltip :text="trans.themeOptionsTip" />
            </Label>
            <Textarea
              id="settingspanel-theme_options"
              v-model="settings.theme_options"
              class="form-textarea"
              rows="5"
              placeholder='{"mikus":1}'
            ></Textarea>
          </div>
        </div>
      </Card>

      <Card class="settings-section min-w-0 gap-4 p-5">
        <CardTitle class="section-title">{{ trans.displayOptions }}</CardTitle>

        <div class="form-row">
          <div class="form-group flex-1 checkbox-item">
            <Switch id="cfg_is_public" v-model="settings.is_public" />
            <Label for="cfg_is_public"
              ><b>{{ trans.publicAccess }}</b></Label
            >
          </div>

          <div class="form-group flex-1 checkbox-item">
            <Switch id="cfg_show_price" v-model="settings.show_price" />
            <Label for="cfg_show_price">{{ trans.showPrice }}</Label>
          </div>

          <div class="form-group flex-1 checkbox-item">
            <Switch id="cfg_show_expire" v-model="settings.show_expire" />
            <Label for="cfg_show_expire">{{ trans.showExpire }}</Label>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group flex-1 checkbox-item">
            <Switch id="cfg_wss_report_enabled" v-model="settings.wss_report_enabled" />
            <Label for="cfg_wss_report_enabled"
              ><b>{{ trans.wssReportEnabled }}</b></Label
            >
            <HelpTooltip :text="trans.wssReportTip" />
          </div>
          <div class="form-group flex-1 checkbox-item">
            <Switch id="cfg_show_tf" v-model="settings.show_tf" />
            <Label for="cfg_show_tf">{{ trans.showTf }}</Label>
          </div>
          <div class="form-group flex-1 checkbox-item">
            <Switch id="cfg_show_three_net_details" v-model="settings.show_three_net_details" />
            <Label for="cfg_show_three_net_details">{{ trans.showThreeNetDetails }}</Label>
          </div>
        </div>

        <div v-if="settings.wss_report_enabled" class="wss-schedule">
          <div class="wss-schedule-header">
            <div>
              <div class="form-label wss-schedule-title">
                {{ trans.wssReportHours }}
                <HelpTooltip :text="trans.wssReportHoursTip" />
              </div>
              <div class="wss-schedule-meta">
                {{ localTimezoneLabel }} · {{ wssReportHours.length }}/24 {{ trans.hoursSelected }} ·
                {{ trans.agentWssMinVersion }}
              </div>
            </div>
            <div class="wss-schedule-actions">
              <Button type="button" @click="selectAllWssReportHours" variant="outline" size="sm">{{
                trans.selectAll
              }}</Button>
              <Button type="button" @click="clearWssReportHours" variant="outline" size="sm">{{ trans.clear }}</Button>
            </div>
          </div>
          <div class="wss-hour-grid" role="group" :aria-label="trans.wssReportHours">
            <Label v-for="hour in 24" :key="hour - 1" class="wss-hour-option" :title="formatWssHourRange(hour - 1)">
              <Checkbox
                :model-value="isLocalWssReportHourSelected(hour - 1)"
                @update:model-value="toggleLocalWssReportHour(hour - 1, $event)"
              />
              <span>{{ String(hour - 1).padStart(2, '0') }}</span>
            </Label>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group flex-1">
            <Label for="settingspanel-frontend_ws_timeout_minutes" class="form-label">
              {{ trans.frontendWsTimeoutMinutes }}
              <HelpTooltip :text="trans.frontendWsTimeoutMinutesTip" />
            </Label>
            <Input
              id="settingspanel-frontend_ws_timeout_minutes"
              v-model.number="settings.frontend_ws_timeout_minutes"
              type="number"
              min="0"
              :max="FRONTEND_WS_TIMEOUT_MINUTES_MAX"
              step="1"
              class="form-input"
            />
          </div>

          <div class="form-group flex-1">
            <Label for="settingspanel-long_history_points" class="form-label">
              {{ trans.longHistoryPoints }}
              <HelpTooltip :text="trans.longHistoryPointsTip" />
            </Label>
            <NativeSelect
              id="settingspanel-long_history_points"
              v-model="settings.long_history_points"
              class="form-select"
            >
              <NativeSelectOption v-for="option in longHistoryPointOptions" :key="option.value" :value="option.value">{{
                option.label
              }}</NativeSelectOption>
            </NativeSelect>
          </div>
        </div>
      </Card>

      <Card class="settings-section min-w-0 gap-4 p-5">
        <CardTitle class="section-title">{{ trans.notifications }}</CardTitle>
        <div class="form-row">
          <div class="form-group flex-1">
            <Label for="settingspanel-tg_notify" class="form-label">{{ trans.offlineAlert }}</Label>
            <NativeSelect id="settingspanel-tg_notify" v-model="settings.tg_notify" class="form-select">
              <NativeSelectOption v-for="option in offlineNotifyOptions" :key="option.value" :value="option.value">{{
                option.label
              }}</NativeSelectOption>
            </NativeSelect>
          </div>

          <div class="form-group flex-1">
            <Label class="form-label">{{ trans.expireReminder }}</Label>
            <NativeSelect :aria-label="trans.expireReminder" v-model="selectedExpireReminder" class="form-select">
              <NativeSelectOption v-for="option in expireReminderOptions" :key="option.value" :value="option.value">{{
                option.label
              }}</NativeSelectOption>
              <NativeSelectOption :value="CUSTOM_EXPIRE_REMINDER_VALUE">{{
                trans.custom || 'Custom'
              }}</NativeSelectOption>
            </NativeSelect>
            <Input
              v-if="showCustomExpireReminder"
              type="number"
              v-model.number="settings.expire_reminder"
              @focus="markCustomExpireReminder"
              class="form-input mt-2"
              min="1"
              :max="EXPIRE_REMINDER_DAYS_MAX"
              step="1"
              :placeholder="trans.expireReminderCustomPlaceholder || 'Days before expiration'"
            />
          </div>

          <div class="form-group flex-1">
            <Label class="form-label">{{ trans.notificationChannel || 'Notification Channel' }}</Label>
            <NativeSelect
              :aria-label="trans.notificationChannel || 'Notification Channel'"
              v-model="notificationChannel"
              class="form-select"
            >
              <NativeSelectOption value="builtin">{{ trans.builtinNotification || 'Built-in' }}</NativeSelectOption>
              <NativeSelectOption value="smtp">{{ trans.smtpNotification || 'SMTP Email' }}</NativeSelectOption>
              <NativeSelectOption value="webhook">{{ trans.customWebhook || 'Custom Webhook' }}</NativeSelectOption>
            </NativeSelect>
          </div>
        </div>

        <div v-if="notificationChannel === 'builtin'" class="form-row">
          <div class="form-group flex-1">
            <Label for="settingspanel-tg_bot_token" class="form-label">{{ trans.telegramToken }}</Label>
            <div class="password-input-wrapper">
              <Input
                id="settingspanel-tg_bot_token"
                type="text"
                name="tg_bot_token"
                autocomplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
                data-bwignore="true"
                data-form-type="other"
                v-model="settings.tg_bot_token"
                :class="['form-input', { 'secret-input-masked': !passwordVisible.tgBotToken }]"
                placeholder="Bot Token or Webhook URL"
              />
              <Button
                type="button"
                @click="$emit('toggle-password', 'tgBotToken')"
                class="password-toggle"
                :aria-label="passwordVisible.tgBotToken ? trans.hidePassword : trans.showPassword"
                variant="ghost"
                size="icon-sm"
                ><component :is="passwordVisible.tgBotToken ? EyeOff : Eye" />
              </Button>
            </div>
          </div>

          <div class="form-group flex-1">
            <Label for="settingspanel-tg_chat_id" class="form-label">{{ trans.chatId }}</Label>
            <div class="password-input-wrapper">
              <Input
                id="settingspanel-tg_chat_id"
                type="text"
                name="tg_chat_id"
                autocomplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
                data-bwignore="true"
                data-form-type="other"
                v-model="settings.tg_chat_id"
                :class="['form-input', { 'secret-input-masked': !passwordVisible.tgChatId }]"
                placeholder="Optional Chat ID"
              />
              <Button
                type="button"
                @click="$emit('toggle-password', 'tgChatId')"
                class="password-toggle"
                :aria-label="passwordVisible.tgChatId ? trans.hidePassword : trans.showPassword"
                variant="ghost"
                size="icon-sm"
                ><component :is="passwordVisible.tgChatId ? EyeOff : Eye" />
              </Button>
            </div>
          </div>
        </div>

        <div v-else-if="notificationChannel === 'smtp'" class="resource-alert-rule">
          <div class="resource-alert-rule-title">
            <span>{{ trans.smtpNotification || 'SMTP Email' }}</span>
            <HelpTooltip
              :text="
                trans.smtpTip ||
                'Sends plain-text email via cloudflare:sockets (25 port is blocked by Cloudflare Workers). QQ / 163 require an SMTP authorization code, not the login password.'
              "
            />
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <Label for="settingspanel-host" class="form-label">{{ trans.smtpHost || 'SMTP Host' }}</Label>
              <Input
                id="settingspanel-host"
                type="text"
                name="smtp_host"
                autocomplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
                data-bwignore="true"
                data-form-type="other"
                v-model.trim="smtpConfig.host"
                @blur="validateSmtpField('host')"
                class="form-input"
                placeholder="smtp.example.com"
              />
              <p v-if="smtpErrors.host" class="text-danger text-sm">{{ smtpErrors.host }}</p>
            </div>

            <div class="form-group flex-1">
              <Label for="settingspanel-port" class="form-label">
                {{ trans.smtpPort || 'Port' }}
                <HelpTooltip
                  :text="
                    trans.smtpPortTip || 'Cloudflare Workers blocks port 25. Use 465 (implicit TLS) or 587 (STARTTLS).'
                  "
                />
              </Label>
              <Input
                id="settingspanel-port"
                type="number"
                name="smtp_port"
                autocomplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
                data-bwignore="true"
                data-form-type="other"
                v-model.trim="smtpConfig.port"
                @blur="validateSmtpField('port')"
                class="form-input"
                list="smtp-port-presets"
                placeholder="465"
              />
              <datalist id="smtp-port-presets">
                <NativeSelectOption v-for="port in smtpPortPresets" :key="port" :value="port"></NativeSelectOption>
              </datalist>
              <p v-if="smtpErrors.port" class="text-danger text-sm">{{ smtpErrors.port }}</p>
            </div>

            <div class="form-group flex-1">
              <Label for="settingspanel-secure" class="form-label">{{ trans.smtpSecure || 'Encryption' }}</Label>
              <NativeSelect
                id="settingspanel-secure"
                v-model="smtpConfig.secure"
                @update:model-value="validateSmtpField('port')"
                class="form-select"
              >
                <NativeSelectOption value="auto">{{ trans.smtpSecureAuto || 'Auto (by port)' }}</NativeSelectOption>
                <NativeSelectOption value="tls">{{ trans.smtpSecureTls || 'Implicit TLS (465)' }}</NativeSelectOption>
                <NativeSelectOption value="starttls">{{
                  trans.smtpSecureStarttls || 'STARTTLS (587)'
                }}</NativeSelectOption>
              </NativeSelect>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <Label for="settingspanel-smtp-username" class="form-label">{{ trans.smtpUser || 'Username' }}</Label>
              <Input
                id="settingspanel-smtp-username"
                type="text"
                name="smtp_user"
                autocomplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
                data-bwignore="true"
                data-form-type="other"
                v-model.trim="smtpConfig.username"
                @blur="validateSmtpField('username')"
                class="form-input"
                placeholder="you@example.com"
              />
              <p v-if="smtpErrors.username" class="text-danger text-sm">{{ smtpErrors.username }}</p>
            </div>

            <div class="form-group flex-1">
              <Label for="settingspanel-smtp-password" class="form-label">{{ trans.smtpPassword || 'Password' }}</Label>
              <div class="password-input-wrapper">
                <Input
                  id="settingspanel-smtp-password"
                  type="text"
                  name="smtp_password"
                  autocomplete="new-password"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-bwignore="true"
                  data-form-type="other"
                  v-model="smtpConfig.password"
                  @blur="validateSmtpField('password')"
                  :class="['form-input', { 'secret-input-masked': !passwordVisible.smtpPassword }]"
                  placeholder="SMTP password / app password"
                />
                <Button
                  type="button"
                  @click="$emit('toggle-password', 'smtpPassword')"
                  class="password-toggle"
                  :aria-label="passwordVisible.smtpPassword ? trans.hidePassword : trans.showPassword"
                  variant="ghost"
                  size="icon-sm"
                  ><component :is="passwordVisible.smtpPassword ? EyeOff : Eye" />
                </Button>
              </div>
              <p v-if="smtpErrors.password" class="text-danger text-sm">{{ smtpErrors.password }}</p>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <Label for="settingspanel-from" class="form-label">{{ trans.smtpFrom || 'From' }}</Label>
              <Input
                id="settingspanel-from"
                type="text"
                name="smtp_from"
                autocomplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
                data-bwignore="true"
                data-form-type="other"
                v-model.trim="smtpConfig.from"
                @blur="validateSmtpField('from')"
                class="form-input"
                placeholder="optional, defaults to username"
              />
              <p v-if="smtpErrors.from" class="text-danger text-sm">{{ smtpErrors.from }}</p>
            </div>

            <div class="form-group flex-1">
              <Label for="settingspanel-to" class="form-label">{{ trans.smtpTo || 'Recipients' }}</Label>
              <Input
                id="settingspanel-to"
                type="text"
                name="smtp_to"
                autocomplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
                data-bwignore="true"
                data-form-type="other"
                v-model.trim="smtpConfig.to"
                @blur="validateSmtpField('to')"
                class="form-input"
                placeholder="a@example.com,b@example.com"
              />
              <p v-if="smtpErrors.to" class="text-danger text-sm">{{ smtpErrors.to }}</p>
            </div>
          </div>
        </div>

        <div v-else class="resource-alert-rule">
          <div class="resource-alert-rule-title">
            <span>{{ trans.customWebhook || 'Custom Webhook' }}</span>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <Label for="settingspanel-notification_webhook_url" class="form-label">{{
                trans.webhookUrl || 'Webhook URL'
              }}</Label>
              <div class="password-input-wrapper">
                <Input
                  id="settingspanel-notification_webhook_url"
                  type="text"
                  name="notification_webhook_url"
                  autocomplete="off"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-bwignore="true"
                  data-form-type="other"
                  v-model="settings.notification_webhook_url"
                  :class="['form-input', { 'secret-input-masked': !passwordVisible.notificationWebhookUrl }]"
                  placeholder="https://example.com/webhook"
                />
                <Button
                  type="button"
                  @click="$emit('toggle-password', 'notificationWebhookUrl')"
                  class="password-toggle"
                  :aria-label="passwordVisible.notificationWebhookUrl ? trans.hidePassword : trans.showPassword"
                  variant="ghost"
                  size="icon-sm"
                  ><component :is="passwordVisible.notificationWebhookUrl ? EyeOff : Eye" />
                </Button>
              </div>
            </div>

            <div class="form-group flex-1">
              <Label for="settingspanel-notification_webhook_method" class="form-label">{{
                trans.webhookMethod || 'Method'
              }}</Label>
              <NativeSelect
                id="settingspanel-notification_webhook_method"
                v-model="settings.notification_webhook_method"
                class="form-select"
              >
                <NativeSelectOption value="POST">POST</NativeSelectOption>
                <NativeSelectOption value="GET">GET</NativeSelectOption>
              </NativeSelect>
            </div>

            <div v-if="settings.notification_webhook_method !== 'GET'" class="form-group flex-1">
              <Label for="settingspanel-notification_webhook_format" class="form-label">{{
                trans.webhookFormat || 'Body Format'
              }}</Label>
              <NativeSelect
                id="settingspanel-notification_webhook_format"
                v-model="settings.notification_webhook_format"
                class="form-select"
              >
                <NativeSelectOption value="json">JSON</NativeSelectOption>
                <NativeSelectOption value="form">x-www-form-urlencoded</NativeSelectOption>
                <NativeSelectOption value="text">Text</NativeSelectOption>
              </NativeSelect>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <Label for="settingspanel-notification_webhook_headers" class="form-label">{{
                trans.webhookHeaders || 'Headers'
              }}</Label>
              <Textarea
                id="settingspanel-notification_webhook_headers"
                v-model="settings.notification_webhook_headers"
                class="form-textarea"
                rows="4"
                placeholder='{"Authorization":"Bearer your-token"}'
              ></Textarea>
            </div>

            <div class="form-group flex-1">
              <Label for="settingspanel-notification_webhook_body" class="form-label">
                {{
                  settings.notification_webhook_method === 'GET'
                    ? trans.webhookParams || 'Query Params'
                    : trans.webhookBody || 'Body'
                }}
              </Label>
              <Textarea
                id="settingspanel-notification_webhook_body"
                v-model="settings.notification_webhook_body"
                class="form-textarea"
                rows="6"
                placeholder='{"title":"{{emoji}} {{event}}","content":"{{notification}}"}'
              ></Textarea>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group flex-1">
            <Label class="form-label">
              {{ trans.notificationTimezone || 'Notification Timezone' }}
              <HelpTooltip
                :text="
                  trans.notificationTimezoneTip ||
                  'Used only for notification output times and expiration reminder schedule.'
                "
              />
            </Label>
            <NativeSelect
              :aria-label="trans.notificationTimezone || 'Notification Timezone'"
              v-model="selectedNotificationTimezone"
              class="form-select"
            >
              <NativeSelectOption v-for="timezone in commonNotificationTimezones" :key="timezone" :value="timezone">{{
                timezone
              }}</NativeSelectOption>
              <NativeSelectOption :value="CUSTOM_NOTIFICATION_TIMEZONE_VALUE">{{
                trans.custom || 'Custom'
              }}</NativeSelectOption>
            </NativeSelect>
            <Input
              v-if="showCustomNotificationTimezone"
              type="text"
              v-model.trim="settings.notification_timezone"
              class="form-input mt-2"
              placeholder="Asia/Shanghai"
            />
          </div>

          <div class="form-group flex-1">
            <Label for="settingspanel-expire_notification_time" class="form-label">
              {{ trans.expireNotificationTime || 'Expiration Notification Time' }}
              <HelpTooltip
                :text="
                  trans.expireNotificationTimeTip ||
                  'Check expiration and send reminders daily at this hour in the notification timezone. Use 0-23.'
                "
              />
            </Label>
            <NativeSelect
              id="settingspanel-expire_notification_time"
              v-model="settings.expire_notification_time"
              class="form-select"
            >
              <NativeSelectOption v-for="hour in expireNotificationHourOptions" :key="hour" :value="hour">{{
                hour
              }}</NativeSelectOption>
            </NativeSelect>
          </div>

          <div class="form-group flex-1">
            <Label for="settingspanel-traffic_alert_threshold" class="form-label">
              {{ trans.trafficAlertThreshold }} (%)
              <HelpTooltip :text="trans.trafficAlertThresholdTip" />
            </Label>
            <Input
              id="settingspanel-traffic_alert_threshold"
              type="number"
              v-model.number="settings.traffic_alert_threshold"
              class="form-input"
              min="0"
              max="100"
              step="1"
              placeholder="0"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group flex-1">
            <Label for="settingspanel-notification_template" class="form-label">{{
              trans.notificationTemplate || 'Notification Template'
            }}</Label>
            <Textarea
              id="settingspanel-notification_template"
              v-model="settings.notification_template"
              class="form-textarea"
              rows="5"
              placeholder="{{emoji}}【CF Server Monitor】{{event}}\n\n{{message}}\n\n{{time}}"
            ></Textarea>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group flex-1">
            <Button
              type="button"
              @click="$emit('send-test-notification')"
              :disabled="testNotificationLoading"
              variant="default"
              size="sm"
              >{{ testNotificationLoading ? '⏳' : '📨' }} {{ trans.sendTestNotification }}</Button
            >
          </div>
        </div>

        <div class="resource-alert-header">
          <Button
            type="button"
            :aria-expanded="resourceAlertExpanded"
            @click="toggleResourceAlertExpanded"
            class="resource-alert-toggle"
            variant="outline"
            size="sm"
          >
            <span class="resource-alert-caret" :class="{ expanded: resourceAlertExpanded }">▸</span>
            <span class="section-subtitle">{{ trans.resourceAlert }}</span>
            <span class="resource-alert-count">[{{ resourceAlertRules.length }}]</span>
            <span class="resource-alert-toggle-text">{{ resourceAlertToggleText }}</span>
          </Button>
          <HelpTooltip :text="trans.resourceAlertTip" />
          <Button type="button" @click="addResourceAlertRule" variant="default" size="sm"
            >+ {{ trans.resourceAlertAddRule }}</Button
          >
        </div>

        <div v-if="resourceAlertExpanded" class="resource-alert-body">
          <div v-if="resourceAlertRules.length === 0" class="resource-alert-empty text-muted-foreground text-sm">
            {{ trans.resourceAlertEmpty }}
          </div>

          <div v-for="(rule, index) in resourceAlertRules" :key="rule.id || index" class="resource-alert-rule">
            <div class="resource-alert-rule-title">
              <span>{{ trans.resourceAlertRule }} #{{ index + 1 }}</span>
              <Button type="button" @click="removeResourceAlertRule(index)" variant="destructive" size="sm">{{
                trans.delete
              }}</Button>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <Label class="form-label">{{ trans.resourceAlertRuleName }}</Label>
                <Input
                  :aria-label="trans.resourceAlertRuleName"
                  :ref="(el) => setResourceAlertRuleNameInput(rule.id, el)"
                  type="text"
                  v-model="rule.name"
                  class="form-input"
                  :placeholder="trans.resourceAlertRuleNamePlaceholder"
                />
              </div>

              <div class="form-group flex-1">
                <Label class="form-label">{{ trans.resourceAlertMetric }}</Label>
                <NativeSelect
                  :aria-label="trans.resourceAlertMetric"
                  v-model="rule.metric"
                  class="form-select"
                  @update:model-value="normalizeRuleThreshold(rule)"
                >
                  <NativeSelectOption
                    v-for="option in resourceAlertMetricOptions"
                    :key="option.value"
                    :value="option.value"
                    >{{ option.label }}</NativeSelectOption
                  >
                </NativeSelect>
              </div>

              <div class="form-group flex-1">
                <Label class="form-label">{{ trans.resourceAlertThreshold }}</Label>
                <Input
                  :aria-label="trans.resourceAlertThreshold"
                  type="number"
                  min="0"
                  :max="resourceAlertThresholdMax(rule.metric)"
                  step="1"
                  v-model="rule.threshold"
                  class="form-input"
                  :placeholder="resourceAlertThresholdPlaceholder(rule.metric)"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <Label class="form-label">{{ trans.resourceAlertServers }}</Label>
                <Popover>
                  <PopoverTrigger as-child
                    ><Button
                      variant="outline"
                      class="w-full justify-start truncate"
                      :aria-label="trans.resourceAlertServers"
                    >
                      {{ resourceAlertServerSelectLabel(rule) }}
                    </Button></PopoverTrigger
                  >
                  <PopoverContent class="grid max-h-64 gap-2 overflow-y-auto p-3">
                    <Label
                      v-for="server in resourceAlertServerOptions"
                      :key="server.id"
                      class="resource-alert-server-option"
                    >
                      <Checkbox
                        :aria-label="trans.resourceAlertServers"
                        :model-value="resourceAlertRuleHasServer(rule, server.id)"
                        :disabled="isLastResourceAlertRuleServer(rule, server.id)"
                        @update:model-value="toggleResourceAlertRuleServer(rule, server.id, $event)"
                      />
                      <span>{{ server.name }}</span>
                    </Label>
                  </PopoverContent>
                </Popover>
              </div>

              <div class="form-group flex-1">
                <Label class="form-label">{{ trans.resourceAlertInterval }}</Label>
                <NativeSelect
                  :aria-label="trans.resourceAlertInterval"
                  v-model="rule.intervalMinutes"
                  class="form-select"
                >
                  <NativeSelectOption
                    v-for="option in resourceAlertIntervalOptions"
                    :key="option.value"
                    :value="option.value"
                    >{{ option.label }}</NativeSelectOption
                  >
                </NativeSelect>
              </div>

              <div class="form-group flex-1">
                <Label class="form-label">{{ trans.resourceAlertMode }}</Label>
                <NativeSelect :aria-label="trans.resourceAlertMode" v-model="rule.mode" class="form-select">
                  <NativeSelectOption value="average">{{ trans.resourceAlertModeAverage }}</NativeSelectOption>
                  <NativeSelectOption value="continuous">{{ trans.resourceAlertModeContinuous }}</NativeSelectOption>
                </NativeSelect>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card class="settings-section min-w-0 gap-4 p-5">
        <CardTitle class="section-title">{{ trans.securitySettings }}</CardTitle>

        <div class="form-row">
          <div class="form-group flex-1">
            <div class="checkbox-item">
              <Switch id="cfg_turnstile_enabled" v-model="settings.turnstile_enabled" />
              <Label for="cfg_turnstile_enabled"
                ><b>{{ trans.enableTurnstile }}</b></Label
              >
            </div>
          </div>
          <div class="form-group flex-1">
            <div class="checkbox-item">
              <Switch id="cfg_turnstile_login_enabled" v-model="settings.turnstile_login_enabled" />
              <Label for="cfg_turnstile_login_enabled">{{ trans.enableTurnstileLogin }}</Label>
              <HelpTooltip :text="trans.turnstileLoginTip" />
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group flex-1">
            <Label for="settingspanel-turnstile_site_key" class="form-label">
              {{ trans.turnstileSiteKey }}
              <HelpTooltip :text="trans.turnstileTip" />
            </Label>
            <Input
              id="settingspanel-turnstile_site_key"
              type="text"
              name="turnstile_site_key"
              autocomplete="off"
              v-model="settings.turnstile_site_key"
              class="form-input"
              :placeholder="trans.turnstileSiteKeyPlaceholder"
            />
          </div>

          <div class="form-group flex-1">
            <Label for="settingspanel-turnstile_secret_key" class="form-label">{{ trans.turnstileSecretKey }}</Label>
            <div class="password-input-wrapper">
              <Input
                id="settingspanel-turnstile_secret_key"
                type="text"
                name="turnstile_secret_key"
                autocomplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
                data-bwignore="true"
                data-form-type="other"
                v-model="settings.turnstile_secret_key"
                :class="['form-input', { 'secret-input-masked': !passwordVisible.turnstileSecret }]"
                :placeholder="trans.turnstileSecretKeyPlaceholder"
              />
              <Button
                type="button"
                @click="$emit('toggle-password', 'turnstileSecret')"
                class="password-toggle"
                :aria-label="passwordVisible.turnstileSecret ? trans.hidePassword : trans.showPassword"
                variant="ghost"
                size="icon-sm"
                ><component :is="passwordVisible.turnstileSecret ? EyeOff : Eye" />
              </Button>
            </div>
          </div>
        </div>

        <div class="form-group mt-4">
          <Label for="settingspanel-jwt_secret" class="form-label">
            {{ trans.jwtSecret }}
            <HelpTooltip :text="trans.jwtSecretTip" />
          </Label>
          <div class="password-input-wrapper">
            <Input
              id="settingspanel-jwt_secret"
              type="text"
              name="jwt_secret"
              autocomplete="off"
              data-lpignore="true"
              data-1p-ignore="true"
              data-bwignore="true"
              data-form-type="other"
              v-model="settings.jwt_secret"
              :class="['form-input', { 'secret-input-masked': !passwordVisible.jwtSecret }]"
              placeholder="••••••••••••••••••••••••••••••••"
            />
            <Button
              type="button"
              @click="$emit('toggle-password', 'jwtSecret')"
              class="password-toggle"
              :aria-label="passwordVisible.jwtSecret ? trans.hidePassword : trans.showPassword"
              variant="ghost"
              size="icon-sm"
              ><component :is="passwordVisible.jwtSecret ? EyeOff : Eye" />
            </Button>
          </div>
        </div>
      </Card>

      <Card class="settings-section min-w-0 gap-4 p-5">
        <CardTitle class="section-title">{{ trans.cloudflareSettings }}</CardTitle>

        <div class="form-row">
          <div class="form-group flex-1">
            <Label for="settingspanel-cloudflare_account_id" class="form-label">{{ trans.cloudflareAccountId }}</Label>
            <Input
              id="settingspanel-cloudflare_account_id"
              type="text"
              name="cloudflare_account_id"
              autocomplete="off"
              v-model="settings.cloudflare_account_id"
              class="form-input"
              :placeholder="trans.cloudflareAccountIdPlaceholder"
            />
          </div>

          <div class="form-group flex-1">
            <Label class="form-label">
              Cloudflare API Token
              <HelpTooltip :text="trans.cloudflareTokenTip" />
            </Label>
            <div class="password-input-wrapper">
              <Input
                type="text"
                name="cloudflare_token"
                autocomplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
                data-bwignore="true"
                data-form-type="other"
                v-model="settings.cloudflare_token"
                :class="['form-input', { 'secret-input-masked': !passwordVisible.cloudflareToken }]"
                :placeholder="trans.cloudflareTokenPlaceholder"
              />
              <Button
                type="button"
                @click="$emit('toggle-password', 'cloudflareToken')"
                class="password-toggle"
                :aria-label="passwordVisible.cloudflareToken ? trans.hidePassword : trans.showPassword"
                variant="ghost"
                size="icon-sm"
                ><component :is="passwordVisible.cloudflareToken ? EyeOff : Eye" />
              </Button>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group flex-1">
            <Button
              type="button"
              @click="$emit('query-d1-usage')"
              :disabled="d1UsageLoading"
              variant="default"
              size="default"
              >{{ d1UsageLoading ? '⏳' : '🔍' }} {{ trans.queryD1Quota }}</Button
            >
          </div>
        </div>
      </Card>

      <Card class="settings-section min-w-0 gap-4 p-5">
        <CardTitle class="section-title">{{ trans.adminLoginSettings }}</CardTitle>

        <div class="form-group">
          <Label for="settingspanel-username" class="form-label">{{ trans.username }}</Label>
          <Input
            id="settingspanel-username"
            type="text"
            name="settings_admin_user"
            autocomplete="off"
            data-lpignore="true"
            data-1p-ignore="true"
            data-bwignore="true"
            data-form-type="other"
            v-model="settings.username"
            class="form-input"
            :placeholder="trans.usernamePlaceholder"
          />
        </div>

        <div class="inline-help-action mb-3">
          <Button type="button" @click="$emit('toggle-admin-password-change')" variant="outline" size="sm">
            {{ changeAdminPassword ? trans.cancelPasswordChange : trans.changePassword }}
          </Button>
          <HelpTooltip :text="trans.apiSecretTip" />
        </div>

        <div v-if="changeAdminPassword" class="form-row">
          <div class="form-group flex-1">
            <Label for="settingspanel-password" class="form-label">{{ trans.password }}</Label>
            <div class="password-input-wrapper">
              <Input
                id="settingspanel-password"
                :type="passwordVisible.password ? 'text' : 'password'"
                name="settings_admin_passphrase"
                autocomplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
                data-bwignore="true"
                data-form-type="other"
                v-model="settings.password"
                class="form-input"
                :placeholder="settings.password_configured ? '••••••••' : ''"
              />
              <Button
                type="button"
                @click="$emit('toggle-password', 'password')"
                class="password-toggle"
                :aria-label="passwordVisible.password ? trans.hidePassword : trans.showPassword"
                variant="ghost"
                size="icon-sm"
                ><component :is="passwordVisible.password ? EyeOff : Eye" />
              </Button>
            </div>
          </div>

          <div class="form-group flex-1">
            <Label for="settingspanel-confirm_password" class="form-label">{{ trans.confirmPassword }}</Label>
            <div class="password-input-wrapper">
              <Input
                id="settingspanel-confirm_password"
                :type="passwordVisible.confirmPassword ? 'text' : 'password'"
                name="settings_admin_passphrase_confirm"
                autocomplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
                data-bwignore="true"
                data-form-type="other"
                v-model="settings.confirm_password"
                class="form-input"
                :placeholder="settings.password_configured ? '••••••••' : ''"
              />
              <Button
                type="button"
                @click="$emit('toggle-password', 'confirmPassword')"
                class="password-toggle"
                :aria-label="passwordVisible.confirmPassword ? trans.hidePassword : trans.showPassword"
                variant="ghost"
                size="icon-sm"
                ><component :is="passwordVisible.confirmPassword ? EyeOff : Eye" />
              </Button>
            </div>
          </div>
        </div>

        <div class="form-group">
          <div class="checkbox-item">
            <Switch id="cfg_github_oauth_enabled" v-model="settings.github_oauth_enabled" />
            <Label for="cfg_github_oauth_enabled"
              ><b>{{ trans.enableGithubOAuth }}</b></Label
            >
            <HelpTooltip :text="trans.githubOAuthTip" />
          </div>
        </div>

        <template v-if="settings.github_oauth_enabled">
          <div class="form-row">
            <div class="form-group flex-1">
              <Label for="settingspanel-github_client_id" class="form-label">{{ trans.githubClientId }}</Label>
              <Input
                id="settingspanel-github_client_id"
                type="text"
                name="github_client_id"
                autocomplete="off"
                v-model.trim="settings.github_client_id"
                class="form-input"
                :placeholder="trans.githubClientIdPlaceholder"
              />
            </div>

            <div class="form-group flex-1">
              <Label for="settingspanel-github_client_secret" class="form-label">{{ trans.githubClientSecret }}</Label>
              <div class="password-input-wrapper">
                <Input
                  id="settingspanel-github_client_secret"
                  type="text"
                  name="github_client_secret"
                  autocomplete="off"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-bwignore="true"
                  data-form-type="other"
                  v-model="settings.github_client_secret"
                  :class="['form-input', { 'secret-input-masked': !passwordVisible.githubClientSecret }]"
                  :placeholder="settings.github_client_secret_configured ? '••••••••' : ''"
                />
                <Button
                  type="button"
                  @click="$emit('toggle-password', 'githubClientSecret')"
                  class="password-toggle"
                  :aria-label="passwordVisible.githubClientSecret ? trans.hidePassword : trans.showPassword"
                  variant="ghost"
                  size="icon-sm"
                  ><component :is="passwordVisible.githubClientSecret ? EyeOff : Eye" />
                </Button>
              </div>
            </div>
          </div>

          <div class="form-group">
            <Label class="form-label">{{ trans.githubBoundAccount }}</Label>
            <div class="inline-help-action">
              <span class="text-sm">
                {{ settings.github_user_id ? `ID: ${settings.github_user_id}` : trans.githubNotBound }}
              </span>
              <Button
                type="button"
                :disabled="!canBindGithub || githubBindingLoading"
                @click="$emit('bind-github-account')"
                variant="outline"
                size="sm"
              >
                {{
                  githubBindingLoading
                    ? '⏳'
                    : settings.github_user_id
                      ? trans.rebindGithubAccount
                      : trans.bindGithubAccount
                }}
              </Button>
              <HelpTooltip :text="canBindGithub ? trans.githubBindingTip : trans.githubSaveBeforeBinding" />
            </div>
          </div>

          <div class="form-group">
            <Label class="form-label">
              {{ trans.githubCallbackUrl }}
              <HelpTooltip :text="trans.githubCallbackUrlTip" />
            </Label>
            <div class="flex-center-gap-sm">
              <Input
                :aria-label="trans.githubCallbackUrl"
                type="text"
                class="form-input flex-1 github-callback-input"
                :model-value="githubCallbackUrl"
                readonly
              />
              <Button
                type="button"
                :aria-label="githubCallbackCopied ? trans.copied : trans.copy"
                :title="githubCallbackCopied ? trans.copied : trans.copy"
                @click="copyGithubCallbackUrl"
                variant="outline"
                size="sm"
              >
                {{ githubCallbackCopied ? `✅ ${trans.copied}` : `📋 ${trans.copy}` }}
              </Button>
            </div>
          </div>
        </template>
      </Card>

      <Card class="settings-section min-w-0 gap-4 p-5">
        <CardTitle class="section-title">{{ trans.pingNodes }}</CardTitle>

        <div class="ping-node-grid">
          <div class="ping-node-item">
            <div class="ping-node-fields">
              <Input type="text" v-model.trim="settings.custom_ct_name" class="form-input ping-node-name" /><span
                class="ping-node-arrow"
                >→</span
              >
              <Input
                type="text"
                v-model.trim="settings.custom_ct"
                :class="['form-input', { 'input-invalid': pingNodeErrors.custom_ct }]"
                placeholder="gd-ct-dualstack.ip.zstaticcdn.com"
              />
            </div>
            <p v-if="pingNodeErrors.custom_ct" class="text-destructive text-sm mt-1">{{ pingNodeErrors.custom_ct }}</p>
          </div>

          <div class="ping-node-item">
            <div class="ping-node-fields">
              <Input type="text" v-model.trim="settings.custom_cu_name" class="form-input ping-node-name" /><span
                class="ping-node-arrow"
                >→</span
              >
              <Input
                type="text"
                v-model.trim="settings.custom_cu"
                :class="['form-input', { 'input-invalid': pingNodeErrors.custom_cu }]"
                placeholder="gd-cu-dualstack.ip.zstaticcdn.com"
              />
            </div>
            <p v-if="pingNodeErrors.custom_cu" class="text-destructive text-sm mt-1">{{ pingNodeErrors.custom_cu }}</p>
          </div>
        </div>
        <div class="ping-node-grid">
          <div class="ping-node-item">
            <div class="ping-node-fields">
              <Input type="text" v-model.trim="settings.custom_cm_name" class="form-input ping-node-name" /><span
                class="ping-node-arrow"
                >→</span
              >
              <Input
                type="text"
                v-model.trim="settings.custom_cm"
                :class="['form-input', { 'input-invalid': pingNodeErrors.custom_cm }]"
                placeholder="gd-cm-dualstack.ip.zstaticcdn.com"
              />
            </div>
            <p v-if="pingNodeErrors.custom_cm" class="text-destructive text-sm mt-1">{{ pingNodeErrors.custom_cm }}</p>
          </div>

          <div class="ping-node-item">
            <div class="ping-node-fields">
              <Input type="text" v-model.trim="settings.custom_bd_name" class="form-input ping-node-name" /><span
                class="ping-node-arrow"
                >→</span
              >
              <Input
                type="text"
                v-model.trim="settings.custom_bd"
                :class="['form-input', { 'input-invalid': pingNodeErrors.custom_bd }]"
                placeholder="ip.zstaticcdn.com"
              />
            </div>
            <p v-if="pingNodeErrors.custom_bd" class="text-destructive text-sm mt-1">{{ pingNodeErrors.custom_bd }}</p>
          </div>
        </div>
        <div class="ping-node-grid">
          <div v-for="field in ['node_1', 'node_2']" :key="field" class="ping-node-item">
            <div class="ping-node-fields">
              <Input type="text" v-model.trim="settings[`${field}_name`]" class="form-input ping-node-name" /><span
                class="ping-node-arrow"
                >→</span
              ><Input
                type="text"
                v-model.trim="settings[field]"
                :class="['form-input', { 'input-invalid': pingNodeErrors[field] }]"
                placeholder="host[:port] / [IPv6]:port"
              />
            </div>
            <p v-if="pingNodeErrors[field]" class="text-destructive text-sm mt-1">{{ pingNodeErrors[field] }}</p>
          </div>
        </div>
        <div class="ping-node-grid">
          <div v-for="field in ['node_3', 'node_4']" :key="field" class="ping-node-item">
            <div class="ping-node-fields">
              <Input type="text" v-model.trim="settings[`${field}_name`]" class="form-input ping-node-name" /><span
                class="ping-node-arrow"
                >→</span
              ><Input
                type="text"
                v-model.trim="settings[field]"
                :class="['form-input', { 'input-invalid': pingNodeErrors[field] }]"
                placeholder="host[:port] / [IPv6]:port"
              />
            </div>
            <p v-if="pingNodeErrors[field]" class="text-destructive text-sm mt-1">{{ pingNodeErrors[field] }}</p>
          </div>
        </div>
      </Card>
    </div>

    <div class="text-right mt-5">
      <Button
        @click="$emit('save-settings')"
        :disabled="saving || hasPingNodeErrors"
        type="button"
        variant="default"
        size="default"
        >{{ saving ? '⏳' : '💾' }} {{ saving ? trans.saving : trans.saveConfig }}</Button
      >
    </div>
  </TabsContent>
</template>

<script setup>
import { Eye, EyeOff } from '@lucide/vue'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { TabsContent } from '@/components/ui/tabs'
import { Card, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import HelpTooltip from '../../../components/HelpTooltip.vue'
import { FRONTEND_WS_TIMEOUT_MINUTES_MAX, HISTORY } from '../../../utils/constants.js'
import { copyTextToClipboard } from '../../../utils/clipboard.js'
import { currentLang } from '../../../utils/i18n.js'
import { PING_NODE_FIELDS, validatePingNode } from '../../../utils/pingNode.js'

const props = defineProps({
  trans: { type: Object, required: true },
  settings: { type: Object, required: true },
  servers: { type: Array, default: () => [] },
  passwordVisible: { type: Object, required: true },
  activeTab: { type: String, default: 'settings' },
  selectedApiBase: { type: String, default: '' },
  currentOrigin: { type: String, default: '' },
  saving: { type: Boolean, default: false },
  changeAdminPassword: { type: Boolean, default: false },
  testNotificationLoading: { type: Boolean, default: false },
  d1UsageLoading: { type: Boolean, default: false },
  githubBindingLoading: { type: Boolean, default: false }
})

const githubCallbackUrl = computed(() => {
  try {
    return new URL('/auth/github/callback', props.selectedApiBase || props.currentOrigin).toString()
  } catch (_) {
    return '/auth/github/callback'
  }
})

const githubCallbackCopied = ref(false)
let githubCallbackCopiedTimer

const copyGithubCallbackUrl = async () => {
  const copied = await copyTextToClipboard(githubCallbackUrl.value)
  if (!copied) {
    emit('alert-message', props.trans.httpsRequired)
    return
  }

  githubCallbackCopied.value = true
  clearTimeout(githubCallbackCopiedTimer)
  githubCallbackCopiedTimer = setTimeout(() => {
    githubCallbackCopied.value = false
  }, 1500)
}

const canBindGithub = computed(() => Boolean(
  String(props.settings.github_client_id || '').trim() &&
  props.settings.github_client_secret_configured
))

const emit = defineEmits([
  'toggle-password', 'toggle-admin-password-change',
  'save-settings', 'upload-bg', 'upload-bg-mobile', 'upload-favicon',
  'send-test-notification', 'query-d1-usage', 'bind-github-account',
  'alert-message'
])

const commonNotificationTimezones = [
  'UTC',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Europe/London',
  'Europe/Berlin',
  'America/New_York',
  'America/Los_Angeles'
]
const EXPIRE_REMINDER_DAYS_MAX = 365
const CUSTOM_EXPIRE_REMINDER_VALUE = '__custom__'
const CUSTOM_NOTIFICATION_TIMEZONE_VALUE = '__custom__'
const manualCustomExpireReminder = ref(false)
const manualCustomNotificationTimezone = ref(false)
const isCommonNotificationTimezone = (value) => commonNotificationTimezones.includes(String(value || '').trim())

const isPresetExpireReminder = (value) => {
  const reminder = String(value ?? '').trim()
  return reminder === '0' || (Number.isInteger(Number(reminder)) && Number(reminder) >= 1 && Number(reminder) <= 7)
}

const selectedExpireReminder = computed({
  get: () => {
    const currentReminder = String(props.settings.expire_reminder ?? '').trim()
    if (manualCustomExpireReminder.value || !isPresetExpireReminder(currentReminder)) {
      return CUSTOM_EXPIRE_REMINDER_VALUE
    }
    return currentReminder || '0'
  },
  set: (value) => {
    if (value === CUSTOM_EXPIRE_REMINDER_VALUE) {
      manualCustomExpireReminder.value = true
      const currentReminder = Number(props.settings.expire_reminder)
      if (!Number.isInteger(currentReminder) || currentReminder < 1 || currentReminder > EXPIRE_REMINDER_DAYS_MAX) {
        props.settings.expire_reminder = '8'
      }
      return
    }
    manualCustomExpireReminder.value = false
    props.settings.expire_reminder = value
  }
})

const showCustomExpireReminder = computed(() => selectedExpireReminder.value === CUSTOM_EXPIRE_REMINDER_VALUE)

const markCustomExpireReminder = () => {
  manualCustomExpireReminder.value = true
}

// Reset the local custom-mode flag only when switching to a different settings
// object. Changes made while typing must not collapse the input after the
// first digit (for example, typing "12" briefly produces "1").
watch(
  () => props.settings,
  () => {
    manualCustomExpireReminder.value = false
  }
)

const selectedNotificationTimezone = computed({
  get: () => {
    const currentTimezone = String(props.settings.notification_timezone || '').trim()
    if (manualCustomNotificationTimezone.value || (currentTimezone && !isCommonNotificationTimezone(currentTimezone))) {
      return CUSTOM_NOTIFICATION_TIMEZONE_VALUE
    }
    return currentTimezone || 'UTC'
  },
  set: (value) => {
    if (value === CUSTOM_NOTIFICATION_TIMEZONE_VALUE) {
      manualCustomNotificationTimezone.value = true
      return
    }
    manualCustomNotificationTimezone.value = false
    props.settings.notification_timezone = value
  }
})

const showCustomNotificationTimezone = computed(() => selectedNotificationTimezone.value === CUSTOM_NOTIFICATION_TIMEZONE_VALUE)

watch(
  () => props.settings.notification_timezone,
  (value) => {
    if (!String(value || '').trim() || isCommonNotificationTimezone(value)) {
      manualCustomNotificationTimezone.value = false
    }
  }
)

const expireNotificationHourOptions = Array.from({ length: 24 }, (_, hour) => String(hour))

const cspErrors = reactive({
  csp_static: '',
  csp_api: ''
})

const offlineNotifyOptions = computed(() => [
  { value: '0', label: `${props.trans.disabled}` },
  ...[5, 6, 7, 8, 9, 10, 15, 20, 30].map(minutes => {
    const label = props.trans.notifyOfflineMinutes
      ? props.trans.notifyOfflineMinutes.replace('{minutes}', minutes)
      : `${minutes} min`

    return {
      value: String(minutes),
      label: `${label}`
    }
  })
])

const expireReminderOptions = computed(() => [
  { value: '0', label: `${props.trans.disabled}` },
  ...Array.from({ length: 7 }, (_, index) => {
    const days = index + 1
    const label = props.trans.notifyExpireDays
      ? props.trans.notifyExpireDays.replace('{days}', days)
      : `Notify within ${days} days before expiration`

    return {
      value: String(days),
      label: `${label}`
    }
  })
])

const longHistoryPointOptions = computed(() => (
  HISTORY.LONG_RANGE_POINT_OPTIONS.map(points => ({
    value: String(points),
    label: props.trans.historyPointCount
      ? props.trans.historyPointCount.replace('{points}', points)
      : `${points} points`
  }))
))

const wssReportHours = computed(() => {
  const source = Array.isArray(props.settings.wss_report_hours)
    ? props.settings.wss_report_hours
    : Array.from({ length: 24 }, (_, hour) => hour)
  return source
    .map(hour => Number(hour))
    .filter(hour => Number.isInteger(hour) && hour >= 0 && hour <= 23)
    .filter((hour, index, hours) => hours.indexOf(hour) === index)
    .sort((a, b) => a - b)
})

const localHourToUtcHour = hour => new Date(2000, 0, 1, hour, 0, 0, 0).getUTCHours()

const localTimezoneLabel = computed(() => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const localTime = props.trans.localTime || 'Local time'
  return timezone ? `${localTime} · ${timezone}` : localTime
})

const isLocalWssReportHourSelected = hour => wssReportHours.value.includes(localHourToUtcHour(hour))

const toggleLocalWssReportHour = (hour, checked) => {
  const utcHour = localHourToUtcHour(hour)
  const selected = new Set(wssReportHours.value)
  if (checked) selected.add(utcHour)
  else selected.delete(utcHour)
  props.settings.wss_report_hours = Array.from(selected).sort((a, b) => a - b)
}

const selectAllWssReportHours = () => {
  props.settings.wss_report_hours = Array.from({ length: 24 }, (_, hour) => hour)
}

const clearWssReportHours = () => {
  props.settings.wss_report_hours = []
}

const formatWssHourRange = hour => {
  const utcHour = localHourToUtcHour(hour)
  const localHourText = String(hour).padStart(2, '0')
  const utcHourText = String(utcHour).padStart(2, '0')
  return `${localHourText}:00-${localHourText}:59 ${props.trans.localTime} (${utcHourText}:00-${utcHourText}:59 UTC)`
}

// SMTP 通知复用后端 tg_bot_token 字段，采用前缀协议存储（方案 A）：
// smtp://<user>:<pass>@<host>:<port>?from=<from>&to=<a,b>&secure=<auto|tls|starttls>
const SMTP_PORT_PRESETS = ['465', '587']
const smtpPortPresets = SMTP_PORT_PRESETS
const defaultSmtpConfig = () => ({
  host: '',
  port: '465',
  username: '',
  password: '',
  from: '',
  to: '',
  secure: 'auto'
})
const smtpConfig = reactive(defaultSmtpConfig())
const smtpChannelActive = ref(false)
// SMTP 序列化结果是否已覆写共享的 tg_bot_token 字段；
// 在 SMTP 配置成形（host/用户名/密码齐全）之前不覆写，避免清空 Telegram/飞书等已有渠道配置
const smtpTokenApplied = ref(false)
const smtpErrors = reactive({ host: '', username: '', password: '', port: '', from: '', to: '' })
const SMTP_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isSmtpToken = token => String(token || '').trim().toLowerCase().indexOf('smtp:') === 0

const safeDecode = value => {
  try {
    return decodeURIComponent(value)
  } catch (_) {
    return value
  }
}

const buildSmtpToken = cfg => {
  const host = String(cfg.host || '').trim()
  if (!host) return ''
  const userinfo = `${encodeURIComponent(cfg.username || '')}:${encodeURIComponent(cfg.password || '')}`
  const params = new URLSearchParams()
  if (String(cfg.from || '').trim()) params.set('from', String(cfg.from).trim())
  if (String(cfg.to || '').trim()) params.set('to', String(cfg.to).trim())
  if (cfg.secure && cfg.secure !== 'auto') params.set('secure', cfg.secure)
  const query = params.toString()
  const port = String(cfg.port || '').trim()
  return `smtp://${userinfo}@${host}${port ? `:${port}` : ''}${query ? `?${query}` : ''}`
}

const parseSmtpToken = token => {
  try {
    const url = new URL(String(token).trim())
    return {
      host: url.hostname || '',
      port: url.port || '',
      username: safeDecode(url.username || ''),
      password: safeDecode(url.password || ''),
      from: url.searchParams.get('from') || '',
      to: url.searchParams.get('to') || '',
      secure: url.searchParams.get('secure') || 'auto'
    }
  } catch (_) {
    return defaultSmtpConfig()
  }
}

const applySmtpToken = token => {
  Object.assign(smtpConfig, parseSmtpToken(token))
}

// 将 SMTP 表单序列化写入共享的 tg_bot_token；配置未成形时保留原有渠道值
const syncSmtpToken = () => {
  const token = buildSmtpToken(smtpConfig)
  if (!smtpTokenApplied.value) {
    if (!token || !smtpConfig.username || !smtpConfig.password) return
    smtpTokenApplied.value = true
  }
  props.settings.tg_bot_token = token
}

const smtpRequiredMessage = () => props.trans.smtpFieldRequired || 'This field is required'

const validateSmtpField = (field) => {
  if (field === 'host' || field === 'username' || field === 'password') {
    const valid = Boolean(String(smtpConfig[field] || '').trim())
    smtpErrors[field] = valid ? '' : smtpRequiredMessage()
    return valid
  }
  if (field === 'port') {
    const port = Number(String(smtpConfig.port || '').trim())
    if (!Number.isInteger(port) || port <= 0 || port > 65535 || port === 25) {
      smtpErrors.port = props.trans.smtpPortInvalid || 'Invalid port (1-65535, port 25 is blocked by Cloudflare Workers)'
      return false
    }
    // auto 模式下仅 465/587 可保证加密连接，其他端口必须显式选择加密方式，避免凭据明文传输
    if (smtpConfig.secure === 'auto' && port !== 465 && port !== 587) {
      smtpErrors.port = props.trans.smtpSecureRequired || 'Ports other than 465/587 require an explicit encryption method'
      return false
    }
    smtpErrors.port = ''
    return true
  }
  if (field === 'from') {
    const value = String(smtpConfig.from || '').trim()
    // 发件人可留空（默认使用用户名），填写时必须是合法邮箱地址
    if (!value) {
      smtpErrors.from = ''
      return true
    }
    if (!SMTP_EMAIL_PATTERN.test(value)) {
      smtpErrors.from = props.trans.smtpInvalidEmail || 'Enter a valid email address, e.g. user@example.com'
      return false
    }
    smtpErrors.from = ''
    return true
  }
  if (field === 'to') {
    const list = String(smtpConfig.to || '')
      .split(',')
      .map(address => address.trim())
      .filter(Boolean)
    if (list.length === 0) {
      smtpErrors.to = props.trans.smtpToRequired || 'At least one recipient email is required'
      return false
    }
    if (list.some(address => !SMTP_EMAIL_PATTERN.test(address))) {
      smtpErrors.to = props.trans.smtpInvalidEmail || 'Enter a valid email address, e.g. user@example.com'
      return false
    }
    smtpErrors.to = ''
    return true
  }
  return true
}

// 当前渠道为 SMTP 时校验全部必填项；供保存与测试通知前调用
const validateSmtpFields = () => {
  if (notificationChannel.value !== 'smtp') {
    Object.keys(smtpErrors).forEach(key => { smtpErrors[key] = '' })
    return true
  }
  return ['host', 'username', 'password', 'port', 'from', 'to']
    .map(field => validateSmtpField(field))
    .every(Boolean)
}

const notificationChannel = computed({
  get: () => {
    if (props.settings.notification_webhook_enabled) return 'webhook'
    if (smtpChannelActive.value || isSmtpToken(props.settings.tg_bot_token)) return 'smtp'
    return 'builtin'
  },
  set: (value) => {
    if (value === 'webhook') {
      smtpChannelActive.value = false
      props.settings.notification_webhook_enabled = true
      return
    }
    props.settings.notification_webhook_enabled = false
    if (value === 'smtp') {
      if (isSmtpToken(props.settings.tg_bot_token)) {
        applySmtpToken(props.settings.tg_bot_token)
        smtpTokenApplied.value = true
      } else {
        Object.assign(smtpConfig, defaultSmtpConfig())
        smtpTokenApplied.value = false
      }
      smtpChannelActive.value = true
      syncSmtpToken()
      return
    }
    // builtin：仅当共享字段确实被 SMTP 覆写时才清理，保留尚未被覆盖的原渠道配置
    if (isSmtpToken(props.settings.tg_bot_token)) {
      props.settings.tg_bot_token = ''
      props.settings.tg_chat_id = ''
    }
    smtpChannelActive.value = false
    smtpTokenApplied.value = false
  }
})

// smtpConfig 变化实时序列化到 tg_bot_token（仅 SMTP 渠道激活且配置成形后）
watch(smtpConfig, () => {
  if (smtpChannelActive.value) {
    syncSmtpToken()
  }
}, { deep: true })

// 外部（如设置加载）写入 smtp token 时反向解析到表单
watch(() => props.settings.tg_bot_token, (token) => {
  if (isSmtpToken(token)) {
    smtpChannelActive.value = true
    smtpTokenApplied.value = true
    if (buildSmtpToken(smtpConfig) !== String(token).trim()) {
      applySmtpToken(token)
    }
  }
}, { immediate: true })

const ensureResourceAlertRules = () => {
  if (!Array.isArray(props.settings.resource_alert_rules)) {
    props.settings.resource_alert_rules = []
  }
  const serverIds = props.servers.map(server => String(server.id || '').trim()).filter(Boolean)
  if (serverIds.length > 0) {
    for (const rule of props.settings.resource_alert_rules) {
      if (!Array.isArray(rule.servers) || rule.servers.length === 0) {
        rule.servers = [...serverIds]
      }
    }
  }
  return props.settings.resource_alert_rules
}

const resourceAlertRules = computed(() => ensureResourceAlertRules())
const resourceAlertExpanded = ref(false)
const resourceAlertRuleNameInputs = new Map()
const resourceAlertToggleText = computed(() => {
  const isZh = currentLang.value === 'zh'
  return resourceAlertExpanded.value
    ? (isZh ? '收起' : 'Collapse')
    : (isZh ? '展开' : 'Expand')
})

const toggleResourceAlertExpanded = () => {
  resourceAlertExpanded.value = !resourceAlertExpanded.value
}

const setResourceAlertRuleNameInput = (ruleId, input) => {
  if (!ruleId) return
  if (input) {
    resourceAlertRuleNameInputs.set(ruleId, input)
  } else {
    resourceAlertRuleNameInputs.delete(ruleId)
  }
}

const resourceAlertMetricOptions = computed(() => [
  { value: 'cpu', label: props.trans.resourceAlertMetricCpu || 'CPU (%)' },
  { value: 'ram', label: props.trans.resourceAlertMetricRam || 'RAM (%)' },
  { value: 'disk', label: props.trans.resourceAlertMetricDisk || 'DISK (%)' },
  { value: 'netIn', label: props.trans.resourceAlertMetricNetIn || 'NET In (Mbps)' },
  { value: 'netOut', label: props.trans.resourceAlertMetricNetOut || 'NET Out (Mbps)' }
])

const resourceAlertIntervalOptions = computed(() => (
  Array.from({ length: 6 }, (_, index) => {
    const minutes = index + 5
    const label = props.trans.resourceAlertIntervalMinutes
      ? props.trans.resourceAlertIntervalMinutes.replace('{minutes}', minutes)
      : `${minutes} min`

    return {
      value: String(minutes),
      label
    }
  })
))

const resourceAlertServerOptions = computed(() => (
  props.servers
    .map(server => ({
      id: String(server.id || '').trim(),
      name: server.name || server.id
    }))
    .filter(server => server.id)
))

const getResourceAlertRuleServerIds = (rule) => (
  Array.isArray(rule.servers)
    ? rule.servers.map(item => String(item || '').trim()).filter(Boolean)
    : []
)

const resourceAlertRuleHasServer = (rule, serverId) => (
  getResourceAlertRuleServerIds(rule).includes(String(serverId))
)

const isLastResourceAlertRuleServer = (rule, serverId) => {
  const selected = getResourceAlertRuleServerIds(rule)
  return selected.length === 1 && selected[0] === String(serverId)
}

const toggleResourceAlertRuleServer = (rule, serverId, checked) => {
  const id = String(serverId || '').trim()
  if (!id) return

  const selected = getResourceAlertRuleServerIds(rule)
  const selectedSet = new Set(selected)
  if (checked) {
    selectedSet.add(id)
  } else if (selectedSet.size > 1) {
    selectedSet.delete(id)
  }
  rule.servers = Array.from(selectedSet)
}


const resourceAlertServerSelectLabel = (rule) => {
  const options = resourceAlertServerOptions.value
  const total = options.length
  if (total === 0) return props.trans.noServers || 'No servers'

  const optionMap = new Map(options.map(server => [server.id, server.name]))
  const selected = getResourceAlertRuleServerIds(rule).filter(id => optionMap.has(id))
  if (selected.length === total) return `${props.trans.all || 'All'} (${total})`
  if (selected.length === 1) return optionMap.get(selected[0])
  return `${selected.length}/${total} ${props.trans.servers || 'Servers'}`
}

const createRuleId = () => `rule_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
const isNetworkAlertMetric = metric => metric === 'netIn' || metric === 'netOut'
const resourceAlertThresholdPlaceholder = metric => isNetworkAlertMetric(metric) ? '100' : '80'
const resourceAlertThresholdMax = metric => isNetworkAlertMetric(metric) ? 100000 : 100

const normalizeRuleThreshold = (rule) => {
  const threshold = Number(rule.threshold)
  const max = resourceAlertThresholdMax(rule.metric)
  if (!Number.isFinite(threshold) || threshold <= 0 || threshold > max) {
    rule.threshold = resourceAlertThresholdPlaceholder(rule.metric)
  }
}

const addResourceAlertRule = () => {
  resourceAlertExpanded.value = true
  const rules = ensureResourceAlertRules()
  const metric = 'cpu'
  const rule = {
    id: createRuleId(),
    name: `${props.trans.resourceAlertRule || 'Resource Alert'} ${rules.length + 1}`,
    metric,
    threshold: resourceAlertThresholdPlaceholder(metric),
    servers: resourceAlertServerOptions.value.map(server => server.id),
    intervalMinutes: '5',
    mode: 'average'
  }
  rules.push(rule)
  nextTick(() => {
    const input = resourceAlertRuleNameInputs.get(rule.id)?.$el
    input?.focus()
    input?.select()
  })
}

const removeResourceAlertRule = (index) => {
  ensureResourceAlertRules().splice(index, 1)
}

const pingNodeErrorMessage = computed(() => (
  props.trans.invalidPingNodeFormat || 'Use domain, IPv4, or host:port. Port must be 1-65535.'
))

const pingNodeErrors = computed(() => Object.fromEntries(
  PING_NODE_FIELDS.map(field => [
    field,
    validatePingNode(props.settings[field]).valid ? '' : pingNodeErrorMessage.value
  ])
))

const hasPingNodeErrors = computed(() => Object.values(pingNodeErrors.value).some(Boolean))

const validatePingNodes = () => !hasPingNodeErrors.value

const isValidCspOrigin = (value) => {
  const raw = String(value || '').trim()
  if (!raw || /[\s;"']/.test(raw)) return false
  try {
    const url = new URL(raw)
    if (url.protocol !== 'https:') return false
    if (url.username || url.password || url.search || url.hash) return false
    if (url.pathname && url.pathname !== '/') return false
    return true
  } catch (_) {
    return false
  }
}

const validateCspField = (field) => {
  const value = props.settings[field] || ''
  if (!value) {
    cspErrors[field] = ''
    return true
  }
  const domains = value.split(',').map(s => s.trim()).filter(Boolean)
  for (const domain of domains) {
    if (!isValidCspOrigin(domain)) {
      cspErrors[field] = props.trans.cspInvalidDomain || 'Each domain must start with https://'
      return false
    }
  }
  cspErrors[field] = ''
  return true
}

onBeforeUnmount(() => {

  clearTimeout(githubCallbackCopiedTimer)
})

defineExpose({ validateCspField, cspErrors, validatePingNodes, pingNodeErrors, validateSmtpFields, smtpErrors })
</script>
