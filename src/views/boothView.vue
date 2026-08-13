<script setup lang="ts">
import { ref, type Ref } from 'vue';
import type { Flow } from '@/core/types/Flow';
import { instanciateFlowFromConfiguration, runPipeline } from '@/core/Flow';
import { useBoothApp } from '@/core/composables/useBoothApp';

const { boothApp } = useBoothApp();

const currentFlow:Ref<Flow|null> = ref(null);

async function onPhotosTaken(images: ImageBitmap[]) {
    if (currentFlow.value === null) {
        return;
    }

    await runPipeline(currentFlow.value.processingNodesPipeline, images);
}

</script>
<template>
    <div v-if="boothApp.flowConfigurations.length === 0">
        <p>
            No runnable flow available. Add a new one
            <RouterLink to="/configure">Flow Configuration</RouterLink>.
        </p>
    </div>
    <section v-if="currentFlow === null" class="flow-picker">
        <div
            v-for="(flowConfiguration, flowIndex) in boothApp.flowConfigurations"
            :key="flowIndex"
            class="flow-picker__card"
            @click="currentFlow = instanciateFlowFromConfiguration(flowConfiguration, boothApp)"
        >
            <h2>{{ flowConfiguration.name }}</h2>
        </div>
    </section>
    <component
        v-else
        :is="currentFlow.entryNode.component"
        :cameraNode="currentFlow.cameraNode"
        @photosTaken="onPhotosTaken"
    />
</template>

<style scoped>
.flow-picker {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: stretch;
    justify-content: stretch;
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--color-surface);
}

.flow-picker__card {
    flex: 1 1 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface-muted);
    cursor: pointer;
    min-height: 0;
}

.flow-picker__card h2 {
    margin: 0;
    text-align: center;
}
</style>