<script setup lang="ts">
import { computed } from 'vue';
import type { Flow } from '@/core/types/Flow';
import { runPipeline } from '@/core/Flow';
import { useApp } from '@/core/composables/useApp';
import { installAllExtensions } from '@/extensions/extensionsRegistry';
import type { EntryNode } from '@/core/types/EntryNode';
import type { CameraNode } from '@/core/types/CameraNode';

const { app } = useApp();
installAllExtensions(app.value);

const entryNode = app.value.registeredNodes.entryNodes[0] as EntryNode;
const cameraNode = app.value.registeredNodes.cameraNodes[0] as CameraNode;

app.value.flows.push({
    entryNode,
    cameraNode,
    processingNodesPipeline: [...app.value.registeredNodes.processingNodes],
});

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
        <p v-if="flow === undefined">No runnable flow available.</p>
        <component v-else :is="flow.entryNode.component" :cameraNode="flow.cameraNode" @photosTaken="onPhotosTaken" />
    </div>
</template>