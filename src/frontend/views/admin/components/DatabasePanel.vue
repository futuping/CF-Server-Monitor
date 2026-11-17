<template>
  <TabsContent value="database" force-mount v-show="activeTab === 'database'">
    <Card class="settings-section min-w-0 gap-4 p-5">
      <CardTitle class="section-title">{{ trans.dbManagement }}</CardTitle>

      <div class="settings-grid">
        <div class="form-group">
          <Label class="form-label">{{ trans.upgradeDatabase }}</Label>
          <p class="text-muted-foreground mb-2">{{ trans.upgradeDesc }}</p>
          <Button
            @click="$emit('open-db-modal', 'upgrade')"
            :disabled="dbLoading"
            type="button"
            variant="default"
            size="default"
            >⬆️ {{ trans.upgradeDatabase }}</Button
          >
        </div>

        <div class="form-group">
          <Label class="form-label danger-label">⚠️ {{ trans.clearHistory }}</Label>
          <p class="text-muted-foreground mb-2">{{ trans.clearHistoryDesc }}</p>
          <Button
            @click="$emit('open-db-modal', 'clearHistory')"
            :disabled="dbLoading"
            type="button"
            variant="destructive"
            size="default"
            >🗑️ {{ trans.clearHistory }}</Button
          >
        </div>
      </div>
    </Card>

    <Card class="settings-section min-w-0 gap-4 p-5">
      <CardTitle class="section-title">{{ trans.exportServers }} / {{ trans.importServers }}</CardTitle>

      <div class="settings-grid">
        <div class="form-group">
          <Label class="form-label">{{ trans.exportServers }}</Label>
          <p class="text-muted-foreground mb-2">{{ trans.exportServersDesc }}</p>
          <Button
            @click="handleExport"
            :disabled="dbLoading || exporting"
            type="button"
            variant="default"
            size="default"
          >
            {{ exporting ? trans.exporting : '📤 ' + trans.exportServers }}
          </Button>
        </div>

        <div class="form-group">
          <Label class="form-label">{{ trans.importServers }}</Label>
          <p class="text-muted-foreground mb-2">{{ trans.importServersDesc }}</p>
          <input ref="fileInput" type="file" accept=".json" style="display: none" @change="handleFileSelect" />
          <Button
            @click="$refs.fileInput.click()"
            :disabled="dbLoading || importing"
            type="button"
            variant="outline"
            size="default"
          >
            {{ importing ? trans.importing : '📥 ' + trans.importServers }}
          </Button>
        </div>
      </div>

      <div v-if="importResult" class="mt-3">
        <div :class="importResult.success ? 'warning-box' : 'danger-box'" class="mb-2">
          <div class="flex-center-gap-sm">
            <span
              :style="{ color: importResult.success ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: '600' }"
            >
              {{ importResult.success ? '✅' : '❌' }} {{ trans.importResult }}
            </span>
          </div>
          <div class="mt-2 text-sm">
            <span style="color: var(--accent-green)">{{ trans.importedCount }}: {{ importResult.imported }}</span>
            <span class="ml-3" style="color: var(--accent-yellow)"
              >{{ trans.skippedCount }}: {{ importResult.skipped }}</span
            >
          </div>
          <div
            v-if="importResult.skippedIds && importResult.skippedIds.length > 0"
            class="mt-2 text-sm text-muted-foreground"
          >
            {{ trans.skippedIds }}: {{ importResult.skippedIds.join(', ') }}
          </div>
        </div>
      </div>
    </Card>
  </TabsContent>
</template>

<script setup>
import { TabsContent } from '@/components/ui/tabs'
import { Card, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ref } from 'vue'
import { adminApi } from '../../../utils/api'

const props = defineProps({
  trans: { type: Object, required: true },
  activeTab: { type: String, default: 'database' },
  dbLoading: { type: Boolean, default: false },
  selectedApiIndex: { type: Number, default: 0 }
})

defineEmits(['open-db-modal'])

const fileInput = ref(null)
const exporting = ref(false)
const importing = ref(false)
const importResult = ref(null)

const handleExport = async () => {
  exporting.value = true
  importResult.value = null
  try {
    const result = await adminApi({ action: 'export_servers' }, props.selectedApiIndex)
    if (!result.error && result.data && result.data.servers) {
      const blob = new Blob([JSON.stringify(result.data.servers, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `servers-backup-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  } catch (e) {
    console.error('Export failed:', e)
  } finally {
    exporting.value = false
  }
}

const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  importing.value = true
  importResult.value = null

  try {
    const text = await file.text()
    const servers = JSON.parse(text)

    if (!Array.isArray(servers)) {
      importResult.value = { success: false, imported: 0, skipped: 0, skippedIds: [] }
      return
    }

    const result = await adminApi({ action: 'import_servers', servers }, props.selectedApiIndex)
    if (!result.error && result.data) {
      importResult.value = {
        success: result.data.success,
        imported: result.data.imported || 0,
        skipped: result.data.skipped || 0,
        skippedIds: result.data.skippedIds || []
      }
      if (result.data.imported > 0) {
        window.location.reload()
      }
    } else {
      importResult.value = { success: false, imported: 0, skipped: 0, skippedIds: [] }
    }
  } catch (e) {
    console.error('Import failed:', e)
    importResult.value = { success: false, imported: 0, skipped: 0, skippedIds: [] }
  } finally {
    importing.value = false
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}
</script>
