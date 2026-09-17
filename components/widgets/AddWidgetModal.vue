<template>
    <Teleport to="body">
        <div
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            @click.self="$emit('close')"
        >
            <div
                class="card max-w-lg w-full p-6 animate-slide-up max-h-[90vh] overflow-y-auto scrollbar-thin"
            >
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-bold text-white">Add Widget</h2>
                    <button class="btn-ghost p-1.5" @click="$emit('close')">
                        <X class="w-5 h-5" />
                    </button>
                </div>

                <!-- Search -->
                <div class="relative mb-4">
                    <Search
                        class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
                    />
                    <input
                        v-model="search"
                        type="text"
                        placeholder="Cari widget..."
                        class="input pl-10"
                    />
                </div>

                <!-- Widget grid -->
                <div class="grid grid-cols-2 gap-2 mb-4">
                    <button
                        v-for="wt in filteredWidgets"
                        :key="wt.type"
                        class="card p-3 text-left transition-all hover:border-primary-500 hover:bg-primary-500/5"
                        :class="
                            selected === wt.type
                                ? 'border-primary-500 bg-primary-500/5'
                                : ''
                        "
                        @click="selectWidget(wt.type)"
                    >
                        <div class="flex items-center gap-2 mb-1">
                            <component
                                :is="wt.icon"
                                class="w-4 h-4 text-primary-400"
                            />
                            <span class="text-sm font-medium text-white">{{
                                wt.label
                            }}</span>
                            <span
                                class="ml-auto text-xs px-1.5 py-0.5 rounded font-medium"
                                :class="
                                    wt.mode === 'read'
                                        ? 'bg-primary-500/15 text-primary-500'
                                        : 'bg-warning/15 text-warning'
                                "
                            >
                                {{ wt.mode === "read" ? "Read" : "Write" }}
                            </span>
                        </div>
                        <p class="text-xs text-slate-500">{{ wt.desc }}</p>
                    </button>
                </div>

                <!-- Configuration -->
                <div
                    v-if="selected"
                    class="space-y-4 border-t border-border pt-4"
                >
                    <!-- Title -->
                    <div>
                        <label class="label">Title</label>
                        <input
                            v-model="config.title"
                            type="text"
                            class="input"
                        />
                    </div>

                    <!-- Data Source — untuk widget Read -->
                    <div v-if="!isCommandOnly">
                        <label class="label"
                            >Data Source (Datastream Key)</label
                        >

                        <!-- Dropdown dari data device yang sudah ada -->
                        <select
                            v-if="availableKeys.length > 0"
                            v-model="config.data_key"
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

                        <!-- Input manual — selalu tampil -->
                        <input
                            v-model="config.data_key"
                            type="text"
                            :placeholder="dataKeyPlaceholder"
                            class="input"
                        />

                        <!-- Preset suggestions -->
                        <div class="mt-2 flex flex-wrap gap-1.5">
                            <span class="text-xs text-slate-500 w-full"
                                >💡 Klik untuk pilih contoh key:</span
                            >
                            <button
                                v-for="s in currentPresetKeys"
                                :key="s"
                                class="text-xs px-2 py-1 rounded-lg border border-border hover:border-primary-500 hover:text-primary-600 text-slate-500 transition-colors bg-background-elevated"
                                type="button"
                                @click="config.data_key = s"
                            >
                                {{ s }}
                            </button>
                        </div>

                        <p class="text-xs text-slate-500 mt-2">
                            Harus sama dengan key di ESP32:
                            <code class="text-primary-500"
                                >iot.sendData("<strong>{{
                                    config.data_key || "temperature"
                                }}</strong
                                >", nilai)</code
                            >
                        </p>
                    </div>

                    <!-- Unit -->
                    <div v-if="!isCommandOnly">
                        <label class="label">Unit (Satuan)</label>
                        <input
                            v-model="config.unit"
                            type="text"
                            :placeholder="unitPlaceholder"
                            class="input"
                        />
                    </div>

                    <!-- Min / Max -->
                    <div v-if="needsRange" class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="label">Minimum</label>
                            <input
                                v-model.number="config.config.min"
                                type="number"
                                class="input"
                            />
                        </div>
                        <div>
                            <label class="label">Maximum</label>
                            <input
                                v-model.number="config.config.max"
                                type="number"
                                class="input"
                            />
                        </div>
                    </div>

                    <!-- Command name -->
                    <div v-if="needsCommand">
                        <label class="label">Command Name</label>
                        <input
                            v-model="config.config.command"
                            type="text"
                            :placeholder="commandPlaceholder"
                            class="input"
                        />
                        <div class="mt-2 flex flex-wrap gap-1.5">
                            <span class="text-xs text-slate-500 w-full"
                                >💡 Klik untuk pilih contoh command:</span
                            >
                            <button
                                v-for="c in currentPresetCommands"
                                :key="c"
                                class="text-xs px-2 py-1 rounded-lg border border-border hover:border-primary-500 hover:text-primary-600 text-slate-500 transition-colors bg-background-elevated"
                                type="button"
                                @click="config.config.command = c"
                            >
                                {{ c }}
                            </button>
                        </div>
                        <p class="text-xs text-slate-500 mt-2">
                            Harus sama di ESP32:
                            <code class="text-primary-500"
                                >iot.onCommand("<strong>{{
                                    config.config.command || "led"
                                }}</strong
                                >", cb)</code
                            >
                        </p>
                    </div>

                    <!-- Widget Size -->
                    <div>
                        <label class="label">Ukuran Widget</label>
                        <div class="grid grid-cols-2 gap-3">
                            <select
                                v-model.number="config.size.w"
                                class="input"
                            >
                                <option :value="1">1 kolom</option>
                                <option :value="2">2 kolom</option>
                                <option :value="3">3 kolom</option>
                            </select>
                            <select
                                v-model.number="config.size.h"
                                class="input"
                            >
                                <option :value="1">1 baris</option>
                                <option :value="2">2 baris</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="flex justify-end gap-3 mt-6">
                    <button class="btn-secondary" @click="$emit('close')">
                        Cancel
                    </button>
                    <button
                        class="btn-primary"
                        :disabled="
                            !selected ||
                            !config.title.trim() ||
                            (!isCommandOnly && !config.data_key.trim())
                        "
                        @click="handleAdd"
                    >
                        <Plus class="w-4 h-4" />
                        Add Widget
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import {
    X,
    Search,
    Plus,
    Gauge,
    ToggleLeft,
    MousePointerClick,
    SlidersHorizontal,
    LineChart,
    Activity,
    Lightbulb,
    Type,
    BarChart3,
    Hash,
    Compass,
    Thermometer,
    Map,
    Table,
    Palette,
} from "lucide-vue-next";
import type { WidgetType, WidgetConfig, WidgetSize } from "~/types/database";

const props = defineProps<{
    availableKeys: string[];
}>();

const emit = defineEmits<{
    close: [];
    add: [
        data: {
            type: WidgetType;
            title: string;
            data_key: string;
            unit: string;
            config: WidgetConfig;
            size: WidgetSize;
        },
    ];
}>();

const search = ref("");
const selected = ref<WidgetType | "">("");

const widgetTypes = [
    // Read widgets
    {
        type: "value" as WidgetType,
        label: "Value",
        desc: "Tampilkan angka sensor",
        icon: Hash,
        mode: "read",
    },
    {
        type: "gauge" as WidgetType,
        label: "Gauge",
        desc: "Bar level dengan min/max",
        icon: Gauge,
        mode: "read",
    },
    {
        type: "chart" as WidgetType,
        label: "Chart",
        desc: "Grafik riwayat data",
        icon: LineChart,
        mode: "read",
    },
    {
        type: "thermometer" as WidgetType,
        label: "Thermometer",
        desc: "Visual suhu naik/turun",
        icon: Thermometer,
        mode: "read",
    },
    {
        type: "progress" as WidgetType,
        label: "Progress",
        desc: "Progress bar persentase",
        icon: BarChart3,
        mode: "read",
    },
    {
        type: "led" as WidgetType,
        label: "LED",
        desc: "Indikator boolean ON/OFF",
        icon: Lightbulb,
        mode: "read",
    },
    {
        type: "status" as WidgetType,
        label: "Status",
        desc: "Status aktif/normal",
        icon: Activity,
        mode: "read",
    },
    {
        type: "text" as WidgetType,
        label: "Text",
        desc: "Tampilkan teks string",
        icon: Type,
        mode: "read",
    },
    {
        type: "compass" as WidgetType,
        label: "Compass",
        desc: "Jarum kompas 0-360°",
        icon: Compass,
        mode: "read",
    },
    {
        type: "speedometer" as WidgetType,
        label: "Speedometer",
        desc: "Gauge kecepatan melingkar",
        icon: Gauge,
        mode: "read",
    },
    {
        type: "table" as WidgetType,
        label: "Data Table",
        desc: "Riwayat 10 data terakhir",
        icon: Table,
        mode: "read",
    },
    {
        type: "map" as WidgetType,
        label: "GPS Map",
        desc: "Koordinat lokasi GPS",
        icon: Map,
        mode: "read",
    },
    // Write widgets
    {
        type: "switch" as WidgetType,
        label: "Switch",
        desc: "Toggle ON/OFF ke device",
        icon: ToggleLeft,
        mode: "write",
    },
    {
        type: "button" as WidgetType,
        label: "Button",
        desc: "Kirim command sekali klik",
        icon: MousePointerClick,
        mode: "write",
    },
    {
        type: "slider" as WidgetType,
        label: "Slider",
        desc: "Kirim nilai 0-180 (servo dll)",
        icon: SlidersHorizontal,
        mode: "write",
    },
    {
        type: "colorpicker" as WidgetType,
        label: "Color Picker",
        desc: "Kirim warna RGB/hex ke device",
        icon: Palette,
        mode: "write",
    },
];

const filteredWidgets = computed(() => {
    if (!search.value) return widgetTypes;
    return widgetTypes.filter(
        (w) =>
            w.label.toLowerCase().includes(search.value.toLowerCase()) ||
            w.desc.toLowerCase().includes(search.value.toLowerCase()),
    );
});

// Computed berdasarkan tipe widget yang dipilih
const isCommandOnly = computed(() => selected.value === "button");
const needsRange = computed(() =>
    [
        "gauge",
        "slider",
        "progress",
        "chart",
        "compass",
        "thermometer",
        "speedometer",
    ].includes(selected.value as string),
);
const needsCommand = computed(() =>
    ["switch", "button", "slider", "colorpicker"].includes(
        selected.value as string,
    ),
);

const currentPresetKeys = computed(() => {
    const map: Record<string, string[]> = {
        value: [
            "temperature",
            "humidity",
            "pressure",
            "voltage",
            "current",
            "co2",
            "lux",
        ],
        gauge: ["humidity", "soil_moisture", "battery", "signal", "cpu_usage"],
        chart: ["temperature", "humidity", "pressure", "co2", "voltage"],
        progress: ["soil_moisture", "battery", "fuel", "tank_level"],
        led: ["motion", "alarm", "door", "relay", "fire"],
        status: ["alarm", "fire", "flood", "motion", "leak"],
        text: ["status_msg", "location", "log", "ssid", "ip_address"],
        thermometer: ["temperature", "cpu_temp", "water_temp", "room_temp"],
        compass: ["bearing", "heading", "direction", "azimuth"],
        speedometer: ["speed", "rpm", "flow_rate", "wind_speed"],
        table: ["temperature", "humidity", "pressure", "co2"],
        map: ["location", "gps", "coordinates"],
        switch: ["led_state", "relay_state", "pump_state"],
        slider: ["servo_angle", "brightness", "speed_set"],
    };
    return (
        map[selected.value as string] || ["temperature", "humidity", "value"]
    );
});

const currentPresetCommands = computed(() => {
    const map: Record<string, string[]> = {
        switch: ["led", "pump", "relay", "fan", "buzzer", "valve"],
        button: ["pump", "reset", "alarm", "trigger", "open", "close"],
        slider: ["servo", "brightness", "speed", "angle", "volume"],
        colorpicker: ["rgb", "led_color", "neopixel", "strip"],
    };
    return map[selected.value as string] || ["led", "pump"];
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
    return map[selected.value as string] || "nama key dari ESP32";
});

const unitPlaceholder = computed(() => {
    const map: Record<string, string> = {
        value: "°C, %, V, A, ppm, lux",
        gauge: "%, RH",
        chart: "°C, %",
        progress: "%",
        thermometer: "°C atau °F",
        compass: "°",
        speedometer: "km/h, rpm, m/s",
    };
    return map[selected.value as string] || "°C, %, dll.";
});

const commandPlaceholder = computed(() => {
    const map: Record<string, string> = {
        switch: "contoh: led, pump, relay",
        button: "contoh: pump, reset, alarm",
        slider: "contoh: servo, brightness",
        colorpicker: "contoh: rgb, neopixel",
    };
    return map[selected.value as string] || "nama command";
});

const config = reactive({
    title: "",
    data_key: "",
    unit: "",
    config: {
        min: 0,
        max: 100,
        command: "",
    } as WidgetConfig,
    size: { w: 1, h: 1 } as WidgetSize,
});

function selectWidget(type: WidgetType) {
    selected.value = type;
    const wt = widgetTypes.find((w) => w.type === type);
    if (wt) {
        config.title = wt.label;
    }
    // Reset fields
    config.data_key = "";
    config.unit = "";
    config.config.command = "";
    config.config.min = 0;
    config.config.max = 100;

    // Default size per type
    if (type === "chart" || type === "table" || type === "map") {
        config.size = { w: 2, h: 2 };
    } else if (type === "speedometer" || type === "thermometer") {
        config.size = { w: 1, h: 2 };
    } else {
        config.size = { w: 1, h: 1 };
    }

    // Default range per type
    if (type === "compass") {
        config.config.min = 0;
        config.config.max = 360;
    } else if (type === "slider") {
        config.config.min = 0;
        config.config.max = 180;
    } else if (type === "speedometer") {
        config.config.min = 0;
        config.config.max = 200;
    } else if (type === "thermometer") {
        config.config.min = -20;
        config.config.max = 80;
    }
}

function handleAdd() {
    if (!selected.value) return;
    emit("add", {
        type: selected.value as WidgetType,
        title: config.title.trim(),
        data_key: config.data_key.trim(),
        unit: config.unit.trim(),
        config: { ...config.config },
        size: { ...config.size },
    });
}
</script>
