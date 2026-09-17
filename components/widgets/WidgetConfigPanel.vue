<template>
    <Teleport to="body">
        <div
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            @click.self="$emit('close')"
        >
            <div
                class="card max-w-md w-full p-6 animate-slide-up max-h-[90vh] overflow-y-auto scrollbar-thin"
            >
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-bold text-white">
                        Widget Configuration
                    </h2>
                    <button class="btn-ghost p-1.5" @click="$emit('close')">
                        <X class="w-5 h-5" />
                    </button>
                </div>

                <div class="space-y-4">
                    <!-- Title -->
                    <div>
                        <label class="label">Title</label>
                        <input
                            v-model="localWidget.title"
                            type="text"
                            class="input"
                        />
                    </div>

                    <!-- Data Source -->
                    <div v-if="!isCommandOnly">
                        <label class="label"
                            >Data Source (Datastream Key)</label
                        >

                        <!-- Jika ada data dari device, tampilkan dropdown -->
                        <select
                            v-if="availableKeys.length > 0"
                            v-model="localWidget.data_key"
                            class="input mb-2"
                        >
                            <option value="">
                                -- Pilih dari data device --
                            </option>
                            <option
                                v-for="key in availableKeys"
                                :key="key"
                                :value="key"
                            >
                                {{ key }}
                            </option>
                        </select>

                        <!-- Selalu tampilkan input manual -->
                        <input
                            v-model="localWidget.data_key"
                            type="text"
                            :placeholder="dataKeyPlaceholder"
                            class="input"
                        />

                        <!-- Preset suggestions -->
                        <div class="mt-2 flex flex-wrap gap-1.5">
                            <span class="text-xs text-slate-500 w-full"
                                >Contoh key:</span
                            >
                            <button
                                v-for="s in presetKeys"
                                :key="s"
                                class="text-xs px-2 py-1 rounded-lg border border-border hover:border-primary-500 hover:text-primary-600 text-slate-500 transition-colors"
                                type="button"
                                @click="localWidget.data_key = s"
                            >
                                {{ s }}
                            </button>
                        </div>

                        <p class="text-xs text-slate-500 mt-2">
                            Harus sama persis dengan key yang dikirim ESP32,
                            contoh:
                            <code class="text-primary-500"
                                >iot.sendData("<span class="font-bold">{{
                                    localWidget.data_key || "temperature"
                                }}</span
                                >", nilai)</code
                            >
                        </p>
                    </div>

                    <!-- Unit -->
                    <div v-if="!isCommandOnly">
                        <label class="label">Unit (Satuan)</label>
                        <input
                            v-model="localWidget.unit"
                            type="text"
                            :placeholder="unitPlaceholder"
                            class="input"
                        />
                    </div>

                    <!-- Range min/max -->
                    <div v-if="needsRange" class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="label">Minimum</label>
                            <input
                                v-model.number="localWidget.config.min"
                                type="number"
                                class="input"
                            />
                        </div>
                        <div>
                            <label class="label">Maximum</label>
                            <input
                                v-model.number="localWidget.config.max"
                                type="number"
                                class="input"
                            />
                        </div>
                    </div>

                    <!-- Command name -->
                    <div v-if="needsCommand">
                        <label class="label">Command Name</label>
                        <input
                            v-model="localWidget.config.command"
                            type="text"
                            :placeholder="commandPlaceholder"
                            class="input"
                        />
                        <div class="mt-2 flex flex-wrap gap-1.5">
                            <span class="text-xs text-slate-500 w-full"
                                >Contoh command:</span
                            >
                            <button
                                v-for="c in presetCommands"
                                :key="c"
                                class="text-xs px-2 py-1 rounded-lg border border-border hover:border-primary-500 hover:text-primary-600 text-slate-500 transition-colors"
                                type="button"
                                @click="localWidget.config.command = c"
                            >
                                {{ c }}
                            </button>
                        </div>
                        <p class="text-xs text-slate-500 mt-2">
                            Harus sama dengan nama command di ESP32:
                            <code class="text-primary-500"
                                >iot.onCommand("<span class="font-bold">{{
                                    localWidget.config.command || "led"
                                }}</span
                                >", cb)</code
                            >
                        </p>
                    </div>

                    <!-- Widget Size -->
                    <div>
                        <label class="label">Ukuran Widget</label>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <span class="text-xs text-slate-500 mb-1 block"
                                    >Lebar</span
                                >
                                <select
                                    v-model.number="localWidget.size.w"
                                    class="input"
                                >
                                    <option :value="1">1 kolom</option>
                                    <option :value="2">2 kolom</option>
                                    <option :value="3">3 kolom</option>
                                </select>
                            </div>
                            <div>
                                <span class="text-xs text-slate-500 mb-1 block"
                                    >Tinggi</span
                                >
                                <select
                                    v-model.number="localWidget.size.h"
                                    class="input"
                                >
                                    <option :value="1">1 baris</option>
                                    <option :value="2">2 baris</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex justify-end gap-3 mt-6">
                    <button class="btn-secondary" @click="$emit('close')">
                        Cancel
                    </button>
                    <button class="btn-primary" @click="handleSave">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { X } from "lucide-vue-next";
import type { Widget, WidgetConfig } from "~/types/database";

const props = defineProps<{
    widget: Widget;
    availableKeys: string[];
}>();

const emit = defineEmits<{
    close: [];
    save: [widget: Widget];
}>();

const localWidget = reactive({
    ...props.widget,
    config: { ...(props.widget.config || {}) } as WidgetConfig,
    size: { ...(props.widget.size || { w: 1, h: 1 }) },
}) as Widget;

// Widget types yang hanya kirim command (tidak butuh data_key)
const isCommandOnly = computed(() => props.widget.type === "button");

const needsRange = computed(() =>
    [
        "gauge",
        "slider",
        "progress",
        "chart",
        "compass",
        "thermometer",
        "speedometer",
    ].includes(props.widget.type),
);
const needsCommand = computed(() =>
    ["switch", "button", "slider", "colorpicker"].includes(props.widget.type),
);

// Preset key suggestions per widget type
const presetKeys = computed(() => {
    const map: Record<string, string[]> = {
        value: [
            "temperature",
            "humidity",
            "pressure",
            "voltage",
            "current",
            "co2",
        ],
        gauge: ["humidity", "soil_moisture", "battery", "signal", "cpu_usage"],
        chart: ["temperature", "humidity", "pressure", "co2", "voltage"],
        progress: ["soil_moisture", "battery", "fuel", "storage"],
        led: ["motion", "alarm", "door", "relay"],
        status: ["alarm", "fire", "flood", "motion"],
        text: ["status_msg", "location", "log", "message"],
        thermometer: ["temperature", "cpu_temp", "water_temp"],
        compass: ["bearing", "heading", "direction"],
        speedometer: ["speed", "rpm", "flow_rate"],
        table: ["temperature", "humidity", "pressure"],
        map: ["location", "gps", "coordinates"],
        switch: ["led_state", "relay_state", "pump_state"],
        slider: ["servo_angle", "brightness", "speed_set"],
        colorpicker: [],
    };
    return map[props.widget.type] || ["temperature", "humidity", "value"];
});

const presetCommands = computed(() => {
    const map: Record<string, string[]> = {
        switch: ["led", "pump", "relay", "fan", "buzzer"],
        button: ["pump", "reset", "alarm", "trigger", "valve"],
        slider: ["servo", "brightness", "speed", "angle"],
        colorpicker: ["rgb", "led_color", "neopixel"],
    };
    return map[props.widget.type] || ["led", "pump"];
});

const dataKeyPlaceholder = computed(() => {
    const map: Record<string, string> = {
        value: "contoh: temperature",
        gauge: "contoh: humidity",
        chart: "contoh: temperature",
        progress: "contoh: soil_moisture",
        led: "contoh: motion",
        status: "contoh: alarm",
        text: "contoh: status_msg",
        thermometer: "contoh: temperature",
        compass: "contoh: bearing",
        speedometer: "contoh: speed",
        table: "contoh: temperature",
        map: "contoh: location",
        switch: "contoh: led_state (opsional)",
        slider: "contoh: servo_angle (opsional)",
    };
    return map[props.widget.type] || "nama field dari ESP32";
});

const unitPlaceholder = computed(() => {
    const map: Record<string, string> = {
        value: "°C, %, V, A, ppm",
        gauge: "%, RH",
        chart: "°C, %",
        progress: "%",
        thermometer: "°C atau °F",
        compass: "°",
        speedometer: "km/h, rpm, m/s",
    };
    return map[props.widget.type] || "°C, %, dll.";
});

const commandPlaceholder = computed(() => {
    const map: Record<string, string> = {
        switch: "contoh: led, pump, relay",
        button: "contoh: pump, reset, alarm",
        slider: "contoh: servo, brightness",
        colorpicker: "contoh: rgb, neopixel",
    };
    return map[props.widget.type] || "nama command";
});

function handleSave() {
    emit("save", { ...localWidget });
}
</script>
