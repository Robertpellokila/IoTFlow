<template>
    <div>
        <NuxtRouteAnnouncer />
        <ToastContainer />
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import ToastContainer from "~/components/ui/ToastContainer.vue";

const { init } = useAuth();

onMounted(() => {
    init();
});
</script>
