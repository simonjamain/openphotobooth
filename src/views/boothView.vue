<script setup lang="ts">
import { computed } from 'vue';
import type { Flow } from '@/core/types/Flow';
import { runPipeline } from '@/core/Flow';
import { useBoothApp } from '@/core/composables/useBoothApp';

const { boothApp: app } = useBoothApp();

const flow = computed<Flow | undefined>(() => app.value.flows[0]);

async function onPhotosTaken(images: ImageBitmap[]) {
    if (flow.value === undefined) {
        return;
    }

    await runPipeline(flow.value.processingNodesPipeline, images);
}

</script>
<template>
    <div>
        <h1>Booth</h1>
        <p v-if="flow === undefined">
            No runnable flow available. Configure one in
            <RouterLink to="/configure">Flow Configuration</RouterLink>.
        </p>
        <component v-else :is="flow.entryNode.component" :cameraNode="flow.cameraNode" @photosTaken="onPhotosTaken" />
    </div>
</template>