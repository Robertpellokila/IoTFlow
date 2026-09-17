<template>
    <div class="card h-full p-4 group relative overflow-hidden flex flex-col">
        <!-- Widget header -->
        <div class="flex items-center justify-between mb-2 flex-shrink-0">
            <div class="text-xs font-medium text-slate-500 truncate">
                {{ widget.title }}
            </div>
            <!-- Action buttons — only shown in edit mode on hover -->
            <div
                v-if="editMode"
                class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
            >
                <button
                    class="p-1 rounded hover:bg-background-elevated text-slate-400 hover:text-slate-700"
                    title="Configure"
                    @click.stop="$emit('configure')"
                >
                    <Settings class="w-3.5 h-3.5" />
                </button>
                <button
                    class="p-1 rounded hover:bg-background-elevated text-slate-400 hover:text-slate-700"
                    title="Duplicate"
                    @click.stop="$emit('duplicate')"
                >
                    <Copy class="w-3.5 h-3.5" />
                </button>
                <button
                    class="p-1 rounded hover:bg-background-elevated text-error"
                    title="Delete"
                    @click.stop="$emit('delete')"
                >
                    <Trash2 class="w-3.5 h-3.5" />
                </button>
            </div>
        </div>

        <!-- Widget body -->
        <div class="flex-1 flex flex-col justify-center min-h-0">
            <component
                :is="widgetComponent"
                :widget="widget"
                :value="currentValue"
                :history="chartData"
                @send-command="handleCommand"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { Settings, Copy, Trash2 } from "lucide-vue-next";
import type { Widget, SensorData } from "~/types/database";
import ValueWidget from "./ValueWidget.vue";
import GaugeWidget from "./GaugeWidget.vue";
import SwitchWidget from "./SwitchWidget.vue";
import ButtonWidget from "./ButtonWidget.vue";
import SliderWidget from "./SliderWidget.vue";
import ChartWidget from "./ChartWidget.vue";
import StatusWidget from "./StatusWidget.vue";
import LedWidget from "./LedWidget.vue";
import TextWidget from "./TextWidget.vue";
import ProgressWidget from "./ProgressWidget.vue";
import CompassWidget from "./CompassWidget.vue";
import ThermometerWidget from "./ThermometerWidget.vue";
import MapWidget from "./MapWidget.vue";
import SpeedometerWidget from "./SpeedometerWidget.vue";
import TableWidget from "./TableWidget.vue";
import ColorPickerWidget from "./ColorPickerWidget.vue";

const props = defineProps<{
    widget: Widget;
    latestData: Record<string, unknown>;
    historyData: SensorData[];
    editMode?: boolean;
}>();

const emit = defineEmits<{
    configure: [];
    delete: [];
    duplicate: [];
    sendCommand: [command: string, value: string | number | boolean];
}>();

const widgetComponents: Record<string, unknown> = {
    value: ValueWidget,
    gauge: GaugeWidget,
    switch: SwitchWidget,
    button: ButtonWidget,
    slider: SliderWidget,
    chart: ChartWidget,
    status: StatusWidget,
    led: LedWidget,
    text: TextWidget,
    progress: ProgressWidget,
    compass: CompassWidget,
    thermometer: ThermometerWidget,
    map: MapWidget,
    speedometer: SpeedometerWidget,
    table: TableWidget,
    colorpicker: ColorPickerWidget,
};

const widgetComponent = computed(
    () => widgetComponents[props.widget.type] || ValueWidget,
);

const currentValue = computed(() => {
    if (!props.widget.data_key) return null;
    return props.latestData[props.widget.data_key] ?? null;
});

const chartData = computed(() => {
    if (!props.widget.data_key) return [];
    return props.historyData
        .filter((d) => d.data && props.widget.data_key! in d.data)
        .map((d) => ({
            time: new Date(d.created_at).getTime(),
            value: d.data[props.widget.data_key!],
        }))
        .reverse()
        .slice(-(props.widget.config?.historyPoints || 20));
});

function handleCommand(command: string, value: string | number | boolean) {
    emit("sendCommand", command, value);
}
</script>
