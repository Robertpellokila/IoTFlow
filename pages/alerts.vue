<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">Alerts</h1>
        <p class="text-slate-400 text-sm mt-1">Monitor and manage device alerts</p>
      </div>
      <button class="btn-primary" @click="showCreate = true">
        <Plus class="w-4 h-4" />
        Create Alert Rule
      </button>
    </div>

    <!-- Active alerts -->
    <div class="card p-5">
      <h2 class="text-sm font-semibold text-white mb-4">Active Alerts</h2>
      <div v-if="alerts.length === 0" class="text-center py-8">
        <BellRing class="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p class="text-sm text-slate-400">No active alerts</p>
      </div>
      <div v-else class="space-y-2">
        <div
          v-for="alert in alerts"
          :key="alert.id"
          class="flex items-start gap-3 p-3 rounded-xl border"
          :class="alert.status === 'active' ? 'bg-error/5 border-error/20' : 'bg-background-elevated border-border'"
        >
          <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            :class="alert.status === 'active' ? 'bg-error/10' : 'bg-slate-700/40'"
          >
            <AlertTriangle class="w-4 h-4" :class="alert.status === 'active' ? 'text-error' : 'text-slate-400'" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-white">{{ alert.message }}</div>
            <div class="text-xs text-slate-500 mt-0.5">{{ new Date(alert.created_at).toLocaleString() }}</div>
          </div>
          <button v-if="alert.status === 'active'" class="btn-ghost text-xs" @click="resolveAlert(alert)">
            <Check class="w-3.5 h-3.5" />
            Resolve
          </button>
        </div>
      </div>
    </div>

    <!-- Alert rules -->
    <div class="card p-5">
      <h2 class="text-sm font-semibold text-white mb-4">Alert Rules</h2>
      <div v-if="rules.length === 0" class="text-center py-8">
        <Settings class="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p class="text-sm text-slate-400 mb-3">No alert rules configured</p>
        <p class="text-xs text-slate-500">Create rules like: IF temperature > 35 THEN alert</p>
      </div>
      <div v-else class="space-y-2">
        <div v-for="rule in rules" :key="rule.id" class="flex items-center justify-between p-3 rounded-xl bg-background-elevated">
          <div>
            <div class="text-sm text-white">
              IF <span class="font-mono text-primary-400">{{ rule.rule_config?.field }}</span>
              <span class="font-mono text-accent-400">{{ rule.rule_config?.operator }}</span>
              <span class="font-mono text-warning">{{ rule.rule_config?.threshold }}</span>
            </div>
            <div class="text-xs text-slate-500 mt-0.5">{{ getDeviceName(rule.device_id) }}</div>
          </div>
          <button class="btn-ghost p-2" @click="deleteRule(rule)">
            <Trash2 class="w-4 h-4 text-error" />
          </button>
        </div>
      </div>
    </div>

    <!-- Create alert modal -->
    <Teleport to="body">
      <div v-if="showCreate" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="showCreate = false">
        <div class="card max-w-md w-full p-6 animate-slide-up">
          <h2 class="text-xl font-bold text-white mb-4">Create Alert Rule</h2>
          <div class="space-y-4">
            <div>
              <label class="label">Device</label>
              <select v-model="newRule.device_id" class="input">
                <option value="" disabled>Select device</option>
                <option v-for="d in devices" :key="d.id" :value="d.id">{{ d.name }}</option>
              </select>
            </div>
            <div>
              <label class="label">Sensor Field</label>
              <input v-model="newRule.field" type="text" placeholder="temperature" class="input" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="label">Condition</label>
                <select v-model="newRule.operator" class="input">
                  <option value=">">Greater than (&gt;)</option>
                  <option value="<">Less than (&lt;)</option>
                  <option value=">=">Greater or equal (&gt;=)</option>
                  <option value="<=">Less or equal (&lt;=)</option>
                  <option value="==">Equal (==)</option>
                </select>
              </div>
              <div>
                <label class="label">Threshold</label>
                <input v-model.number="newRule.threshold" type="number" class="input" />
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button class="btn-secondary" @click="showCreate = false">Cancel</button>
            <button class="btn-primary" :disabled="!newRule.device_id || !newRule.field" @click="createRule">
              Create Rule
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { Plus, BellRing, AlertTriangle, Check, Settings, Trash2 } from 'lucide-vue-next'
import type { Alert, Device } from '~/types/database'

definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const { devices, fetchDevices } = useDevices()
const supabase = useSupabase()
const toast = useToast()

const alerts = ref<Alert[]>([])
const rules = ref<Alert[]>([])
const showCreate = ref(false)

const newRule = reactive({
  device_id: '',
  field: '',
  operator: '>',
  threshold: 0,
})

function getDeviceName(deviceId: string): string {
  const d = devices.value.find((dev: Device) => dev.id === deviceId)
  return d?.name || 'Unknown'
}

async function loadAlerts() {
  const { data } = await supabase
    .from('alerts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  const all = (data || []) as Alert[]
  alerts.value = all.filter((a) => a.rule_config === null)
  rules.value = all.filter((a) => a.rule_config !== null && a.status === 'active')
}

async function createRule() {
  try {
    const { error } = await supabase.from('alerts').insert({
      device_id: newRule.device_id,
      type: 'threshold_rule',
      message: `Alert rule: ${newRule.field} ${newRule.operator} ${newRule.threshold}`,
      status: 'active',
      rule_config: {
        field: newRule.field,
        operator: newRule.operator,
        threshold: newRule.threshold,
      },
    })
    if (error) throw error
    toast.success('Alert rule created')
    showCreate.value = false
    newRule.device_id = ''
    newRule.field = ''
    newRule.operator = '>'
    newRule.threshold = 0
    await loadAlerts()
  } catch (e: unknown) {
    toast.error(e instanceof Error ? e.message : 'Failed to create rule')
  }
}

async function resolveAlert(alert: Alert) {
  try {
    const { error } = await supabase
      .from('alerts')
      .update({ status: 'resolved' })
      .eq('id', alert.id)
    if (error) throw error
    toast.success('Alert resolved')
    await loadAlerts()
  } catch (e: unknown) {
    toast.error(e instanceof Error ? e.message : 'Failed to resolve alert')
  }
}

async function deleteRule(rule: Alert) {
  try {
    const { error } = await supabase.from('alerts').delete().eq('id', rule.id)
    if (error) throw error
    toast.success('Rule deleted')
    await loadAlerts()
  } catch (e: unknown) {
    toast.error(e instanceof Error ? e.message : 'Failed to delete rule')
  }
}

onMounted(() => {
  fetchDevices()
  loadAlerts()
})
</script>
