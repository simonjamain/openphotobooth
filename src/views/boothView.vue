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
    <section v-if="currentFlow === null">
        <div v-for="(flowConfiguration, flowIndex) in boothApp.flowConfigurations" :key="flowIndex" @click="currentFlow = instanciateFlowFromConfiguration(flowConfiguration, boothApp)">

        </div>
    </section>
    <component v-else :is="currentFlow.entryNode.component" :cameraNode="currentFlow.cameraNode" @photosTaken="onPhotosTaken" />
</template>