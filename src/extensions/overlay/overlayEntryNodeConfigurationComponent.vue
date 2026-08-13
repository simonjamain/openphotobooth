<script setup lang="ts">
import { watchEffect } from "vue";
import type { OverlayEntryNodeConfiguration } from "./overlayEntryNodeConfiguration";

const configuration = defineModel<OverlayEntryNodeConfiguration["configuration"]>("configuration", {
    default: () => ({
        photoCount: 1,
        delayMs: 1000
    })
});

watchEffect(() => {
    if (configuration.value.photoCount === undefined) {
        configuration.value.photoCount = 1;
    }

    if (configuration.value.delayMs === undefined) {
        configuration.value.delayMs = 1000;
    }
});
</script>

<template>
    <p>This node allows you to take multiple photos with a delay between each photo. It is especially useful for creating photo sheets.</p>
    <label>
        Number of photos
        <input v-model.number="configuration.photoCount" type="number" min="1" step="1" />
    </label>

    <label>
        Delay between photos (ms)
        <input v-model.number="configuration.delayMs" type="number" min="0" step="100" />
    </label>
</template>
