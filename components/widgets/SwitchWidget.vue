<template>
    <div class="flex items-center justify-between">
        <div
            class="text-sm font-medium"
            :class="localOn ? 'text-primary-500' : 'text-slate-400'"
        >
            {{ localOn ? "ON" : "OFF" }}
        </div>
        <button
            class="relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none"
            :class="localOn ? 'bg-primary-500' : 'bg-slate-300'"
            @click="toggle"
        >
            <span
                class="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300"
                :class="localOn ? 'translate-x-7' : 'translate-x-0'"
            ></span>
        </button>
    </div>
</template>

<script setup lang="ts">
import type { Widget } from "~/types/database";

const props = defineProps<{
    widget: Widget;
    value: unknown;
    history: { time: number; value: unknown }[];
}>();

const emit = defineEmits<{
    sendCommand: [command: string, value: boolean];
}>();

// Derive boolean from incoming value
function parseValue(v: unknown): boolean {
    if (typeof v === "boolean") return v;
    if (typeof v === "number") return v > 0;
    if (typeof v === "string") return v === "true" || v === "1" || v === "on";
    return false;
}

// Local state for optimistic UI update
const localOn = ref(parseValue(props.value));

// Sync with incoming value from device (realtime), but only if not toggling
const syncing = ref(false);
watch(
    () => props.value,
    (newVal) => {
        if (!syncing.value) {
            localOn.value = parseValue(newVal);
        }
    },
);

function toggle() {
    localOn.value = !localOn.value; // update UI immediately
    syncing.value = true;

    const cmd =
        props.widget.config?.command ||
        props.widget.data_key ||
        props.widget.title.toLowerCase().replace(/\s+/g, "_");

    emit("sendCommand", cmd, localOn.value);

    // after 3s allow device value to sync back
    setTimeout(() => {
        syncing.value = false;
    }, 3000);
}
</script>
