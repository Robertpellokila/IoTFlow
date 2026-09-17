<template>
    <div class="h-full flex flex-col gap-4">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
                <NuxtLink to="/dashboards" class="btn-ghost p-2">
                    <ArrowLeft class="w-5 h-5" />
                </NuxtLink>
                <div>
                    <h1 class="text-xl font-bold text-white">
                        {{ dashboard?.name || "Dashboard" }}
                    </h1>
                    <p class="text-xs text-slate-500">
                        {{ widgets.length }} widgets
                    </p>
                </div>
            </div>

            <div class="flex items-center gap-2">
                <!-- Realtime status -->
                <div
                    class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background-elevated border border-border"
                >
                    <span
                        :class="
                            realtimeConnected
                                ? 'status-online'
                                : 'status-offline'
                        "
                    ></span>
                    <span class="text-xs text-slate-400">{{
                        realtimeConnected ? "Realtime" : "Connecting..."
                    }}</span>
                </div>

                <!-- Edit mode toggle -->
                <button
                    class="btn-secondary gap-2"
                    :class="
                        editMode
                            ? 'border-primary-500 text-primary-600 bg-primary-500/5'
                            : ''
                    "
                    @click="editMode = !editMode"
                >
                    <component :is="editMode ? Lock : Pencil" class="w-4 h-4" />
                    {{ editMode ? "Done" : "Edit Layout" }}
                </button>

                <!-- Add widget -->
                <button class="btn-primary" @click="showAddWidget = true">
                    <Plus class="w-4 h-4" />
                    Add Widget
                </button>
            </div>
        </div>

        <!-- Edit mode hint -->
        <div
            v-if="editMode"
            class="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500/10 border border-primary-500/30 text-sm text-primary-600"
        >
            <Move class="w-4 h-4 flex-shrink-0" />
            <span
                >Drag widget untuk pindahkan posisi • Tarik pojok kanan bawah
                untuk resize • Klik "<strong>Done</strong>" jika selesai</span
            >
        </div>

        <!-- Grid area -->
        <div class="flex-1 card p-4 overflow-auto scrollbar-thin">
            <div
                v-if="widgets.length === 0"
                class="flex flex-col items-center justify-center min-h-[400px]"
            >
                <LayoutGrid class="w-12 h-12 text-slate-400 mb-3" />
                <h3 class="text-white font-semibold mb-1">No widgets yet</h3>
                <p class="text-sm text-slate-400 mb-4">
                    Tambah widget pertamamu untuk mulai
                </p>
                <button class="btn-primary" @click="showAddWidget = true">
                    <Plus class="w-4 h-4" />
                    Add Widget
                </button>
            </div>

            <GridLayout
                v-else
                :layout="gridLayout"
                :cols="12"
                :row-height="100"
                :gap="10"
                :editable="editMode"
                @layout-changed="onLayoutChanged"
            >
                <template #default="{ item }">
                    <WidgetRenderer
                        :widget="widgetById(item.id)"
                        :latest-data="latestData"
                        :history-data="historyData"
                        :edit-mode="editMode"
                        @send-command="handleSendCommand"
                        @configure="openConfig(widgetById(item.id))"
                        @delete="deleteWidget(widgetById(item.id))"
                        @duplicate="duplicateWidget(widgetById(item.id))"
                    />
                </template>
            </GridLayout>
        </div>

        <!-- Add Widget Modal -->
        <AddWidgetModal
            v-if="showAddWidget"
            :available-keys="availableDataKeys"
            @close="showAddWidget = false"
            @add="handleAddWidget"
        />

        <!-- Config Panel -->
        <WidgetConfigPanel
            v-if="configWidget"
            :widget="configWidget"
            :available-keys="availableDataKeys"
            @close="configWidget = null"
            @save="handleSaveConfig"
        />
    </div>
</template>

<script setup lang="ts">
import {
    Plus,
    ArrowLeft,
    LayoutGrid,
    Pencil,
    Lock,
    Move,
} from "lucide-vue-next";
import type {
    Dashboard,
    Widget,
    SensorData,
    WidgetType,
    WidgetConfig,
    WidgetSize,
} from "~/types/database";
import WidgetRenderer from "~/components/widgets/WidgetRenderer.vue";
import AddWidgetModal from "~/components/widgets/AddWidgetModal.vue";
import WidgetConfigPanel from "~/components/widgets/WidgetConfigPanel.vue";
import GridLayout from "~/components/widgets/GridLayout.vue";
import type { GridItem } from "~/components/widgets/GridLayout.vue";

definePageMeta({ middleware: "auth", layout: "dashboard" });

const route = useRoute();
const supabase = useSupabase();
const toast = useToast();
const { subscribeToSensorData } = useRealtime();

const dashboard = ref<Dashboard | null>(null);
const widgets = ref<Widget[]>([]);
const latestData = ref<Record<string, unknown>>({});
const historyData = ref<SensorData[]>([]);
const showAddWidget = ref(false);
const configWidget = ref<Widget | null>(null);
const realtimeConnected = ref(false);
const editMode = ref(false);

// ── Grid layout derived from widgets ─────────────────────────────────
const gridLayout = computed<GridItem[]>(() =>
    widgets.value.map((w) => ({
        id: w.id,
        x: w.position?.x ?? 0,
        y: w.position?.y ?? 0,
        w: w.size?.w ?? 2,
        h: w.size?.h ?? 2,
        title: w.title,
    })),
);

function widgetById(id: string): Widget {
    return widgets.value.find((w) => w.id === id) as Widget;
}

const availableDataKeys = computed(() => {
    const keys = new Set<string>();
    historyData.value.forEach((entry) => {
        if (entry.data && typeof entry.data === "object") {
            Object.keys(entry.data).forEach((k) => keys.add(k));
        }
    });
    widgets.value.forEach((w) => {
        if (w.data_key) keys.add(w.data_key);
    });
    return Array.from(keys).sort();
});

// ── Layout changed (drag / resize) ───────────────────────────────────
async function onLayoutChanged(newLayout: GridItem[]) {
    widgets.value = widgets.value.map((w) => {
        const item = newLayout.find((l) => l.id === w.id);
        if (!item) return w;
        return {
            ...w,
            position: { x: item.x, y: item.y },
            size: { w: item.w, h: item.h },
        };
    });
    try {
        await Promise.all(
            newLayout.map((item) =>
                supabase
                    .from("widgets")
                    .update({
                        position: { x: item.x, y: item.y },
                        size: { w: item.w, h: item.h },
                    })
                    .eq("id", item.id),
            ),
        );
    } catch (e) {
        console.error("Failed to save layout", e);
    }
}

// ── Load ──────────────────────────────────────────────────────────────
async function loadDashboard() {
    const { data: dash, error: dashErr } = await supabase
        .from("dashboards")
        .select("*")
        .eq("id", route.params.id as string)
        .maybeSingle();
    if (dashErr || !dash) {
        toast.error("Dashboard not found");
        navigateTo("/dashboards");
        return;
    }
    dashboard.value = dash as Dashboard;

    const { data: wids } = await supabase
        .from("widgets")
        .select("*")
        .eq("dashboard_id", dashboard.value.id)
        .order("created_at", { ascending: true });
    widgets.value = (wids || []) as Widget[];

    await loadSensorData();
}

async function loadSensorData() {
    if (!dashboard.value) return;
    const { data: device } = await supabase
        .from("devices")
        .select("id")
        .eq("id", dashboard.value.device_id)
        .maybeSingle();
    if (!device) return;

    const { data: latest } = await supabase
        .from("sensor_data")
        .select("*")
        .eq("device_id", device.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
    if (latest) latestData.value = (latest as SensorData).data || {};

    const { data: hist } = await supabase
        .from("sensor_data")
        .select("*")
        .eq("device_id", device.id)
        .order("created_at", { ascending: false })
        .limit(100);
    historyData.value = (hist || []) as SensorData[];

    setupRealtime(device.id);
}

let unsubRealtime: (() => void) | null = null;

function setupRealtime(deviceId: string) {
    if (unsubRealtime) unsubRealtime();
    unsubRealtime = subscribeToSensorData(
        deviceId,
        (payload) => {
            latestData.value = payload.data || {};
            historyData.value = [payload, ...historyData.value].slice(0, 100);
            realtimeConnected.value = true;
        },
        () => {
            realtimeConnected.value = false;
        },
    );
    realtimeConnected.value = true;
}

// ── Widget CRUD ───────────────────────────────────────────────────────
async function handleAddWidget(data: {
    type: WidgetType;
    title: string;
    data_key: string;
    unit: string;
    config: WidgetConfig;
    size: WidgetSize;
}) {
    try {
        const maxY = widgets.value.reduce(
            (max, w) => Math.max(max, (w.position?.y ?? 0) + (w.size?.h ?? 2)),
            0,
        );
        const { data: widget, error } = await supabase
            .from("widgets")
            .insert({
                dashboard_id: dashboard.value?.id,
                type: data.type,
                title: data.title,
                data_key: data.data_key || null,
                unit: data.unit || null,
                config: data.config,
                size: data.size,
                position: { x: 0, y: maxY },
            })
            .select()
            .single();
        if (error) throw error;
        widgets.value = [...widgets.value, widget as Widget];
        toast.success("Widget added");
        showAddWidget.value = false;
    } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : "Failed to add widget");
    }
}

function openConfig(widget: Widget | undefined) {
    if (widget) configWidget.value = { ...widget };
}

async function handleSaveConfig(updated: Widget) {
    try {
        const { error } = await supabase
            .from("widgets")
            .update({
                title: updated.title,
                data_key: updated.data_key,
                unit: updated.unit,
                config: updated.config,
                size: updated.size,
            })
            .eq("id", updated.id);
        if (error) throw error;
        const idx = widgets.value.findIndex((w) => w.id === updated.id);
        if (idx >= 0) widgets.value[idx] = updated;
        toast.success("Widget updated");
        configWidget.value = null;
    } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : "Failed to update widget");
    }
}

async function deleteWidget(widget: Widget | undefined) {
    if (!widget) return;
    try {
        const { error } = await supabase
            .from("widgets")
            .delete()
            .eq("id", widget.id);
        if (error) throw error;
        widgets.value = widgets.value.filter((w) => w.id !== widget.id);
        toast.success("Widget deleted");
    } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : "Failed to delete widget");
    }
}

async function duplicateWidget(widget: Widget | undefined) {
    if (!widget) return;
    try {
        const { data, error } = await supabase
            .from("widgets")
            .insert({
                dashboard_id: widget.dashboard_id,
                type: widget.type,
                title: widget.title + " (copy)",
                data_key: widget.data_key,
                unit: widget.unit,
                config: widget.config,
                size: widget.size,
                position: {
                    x: 0,
                    y: (widget.position?.y ?? 0) + (widget.size?.h ?? 2),
                },
            })
            .select()
            .single();
        if (error) throw error;
        widgets.value = [...widgets.value, data as Widget];
        toast.success("Widget duplicated");
    } catch (e: unknown) {
        toast.error(
            e instanceof Error ? e.message : "Failed to duplicate widget",
        );
    }
}

async function handleSendCommand(
    command: string,
    value: string | number | boolean,
) {
    if (!dashboard.value) return;
    try {
        const { error } = await supabase.from("commands").insert({
            device_id: dashboard.value.device_id,
            command,
            value,
            status: "pending",
        });
        if (error) throw error;

        // Optimistic update latestData agar widget lain ikut update
        const matchingWidget = widgets.value.find(
            (w) => w.config?.command === command || w.data_key === command,
        );
        if (matchingWidget?.data_key) {
            latestData.value = {
                ...latestData.value,
                [matchingWidget.data_key]: value,
            };
        }
        latestData.value = { ...latestData.value, [command]: value };

        toast.success(`Command sent: ${command}`);
    } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : "Failed to send command");
    }
}

onMounted(() => loadDashboard());
onUnmounted(() => {
    if (unsubRealtime) unsubRealtime();
});
</script>
