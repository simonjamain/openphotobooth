<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, type Ref } from 'vue';
import type { Flow, FlowProcessingNode } from '@/core/types/Flow';
import { instanciateFlowFromConfiguration, runPipelineUntilInteractiveNode } from '@/core/Flow';
import { useBoothApp } from '@/core/composables/useBoothApp';
import { InputManager, inputsEqual } from '@/core/services/inputManager';

const { boothApp } = useBoothApp();

const currentFlow:Ref<Flow|null> = ref(null);
const selectionInputManager = ref<InputManager | null>(null);
const pendingImages = ref<ImageBitmap[] | null>(null);
const pendingProcessingNodes = ref<FlowProcessingNode[] | null>(null);
const pendingRuntimeNode = ref<FlowProcessingNode | null>(null);
const decisionInProgress = ref(false);

function clearProcessingRuntimeState() {
    pendingImages.value = null;
    pendingProcessingNodes.value = null;
    pendingRuntimeNode.value = null;
    decisionInProgress.value = false;
}

function finishFlow() {
    clearProcessingRuntimeState();
    currentFlow.value = null;
    startSelectionListener();
}

function openRuntimeProcessingScreen(node: FlowProcessingNode, images: Readonly<ImageBitmap[]>, remainingNodes: Readonly<FlowProcessingNode[]>) {
    pendingRuntimeNode.value = node;
    pendingImages.value = [...images];
    pendingProcessingNodes.value = [...remainingNodes];
}

function cancelSequence() {
    if (decisionInProgress.value) {
        return;
    }

    decisionInProgress.value = true;
    finishFlow();
}

async function continueSequence() {
    if (decisionInProgress.value) {
        return;
    }

    const images = pendingImages.value;
    const processingNodes = pendingProcessingNodes.value;
    const runtimeNode = pendingRuntimeNode.value;

    if (images === null || processingNodes === null) {
        return;
    }

    decisionInProgress.value = true;

    try {
        if (runtimeNode !== null) {
            const processedImages = await runtimeNode.process(images);
            const nextPipelineResult = await runPipelineUntilInteractiveNode(processingNodes, processedImages);

            if (nextPipelineResult.status === 'completed') {
                finishFlow();
                return;
            }

            openRuntimeProcessingScreen(
                nextPipelineResult.runtimeNode,
                nextPipelineResult.images,
                nextPipelineResult.remainingNodes,
            );
            decisionInProgress.value = false;
            return;
        }

        const nextPipelineResult = await runPipelineUntilInteractiveNode(processingNodes, images);

        if (nextPipelineResult.status === 'completed') {
            finishFlow();
            return;
        }

        openRuntimeProcessingScreen(
            nextPipelineResult.runtimeNode,
            nextPipelineResult.images,
            nextPipelineResult.remainingNodes,
        );
        decisionInProgress.value = false;
    }
    catch (error) {
        console.error('Unable to continue pipeline after cancel screen decision', error);
        decisionInProgress.value = false;
    }
}

async function onPhotosTaken(images: ImageBitmap[]) {
    if (currentFlow.value === null) {
        return;
    }

    stopSelectionListener();

    const pipelineResult = await runPipelineUntilInteractiveNode(currentFlow.value.processingNodesPipeline, images);

    if (pipelineResult.status === 'completed') {
        finishFlow();
        return;
    }

    openRuntimeProcessingScreen(
        pipelineResult.runtimeNode,
        pipelineResult.images,
        pipelineResult.remainingNodes,
    );
}

function stopSelectionListener() {
    selectionInputManager.value?.destroy();
    selectionInputManager.value = null;
}

async function listenForFlowSelection() {
    if (currentFlow.value !== null) {
        return;
    }

    const manager = selectionInputManager.value;
    if (manager === null) {
        return;
    }

    const input = await manager.waitForInput();
    const matchedFlowIndex = boothApp.value.flowConfigurations.findIndex((flowConfiguration) => {
        if (flowConfiguration.input === undefined || flowConfiguration.input === null) {
            return false;
        }

        return inputsEqual(flowConfiguration.input, input);
    });

    if (matchedFlowIndex >= 0) {
        const matchedFlow = boothApp.value.flowConfigurations[matchedFlowIndex];

        if (matchedFlow === undefined) {
            void listenForFlowSelection();
            return;
        }

        currentFlow.value = instanciateFlowFromConfiguration(
            matchedFlow,
            boothApp.value,
        );
        stopSelectionListener();
        return;
    }

    void listenForFlowSelection();
}

function startSelectionListener() {
    if (currentFlow.value !== null || selectionInputManager.value !== null) {
        return;
    }

    selectionInputManager.value = new InputManager();
    void listenForFlowSelection();
}

onMounted(() => {
    startSelectionListener();
});

onBeforeUnmount(() => {
    stopSelectionListener();
    clearProcessingRuntimeState();
});
</script>

<template>
    <div v-if="boothApp.flowConfigurations.length === 0">
        <p>
            {{ $t('booth.noRunnableFlow') }}
            <RouterLink to="/configure">{{ $t('booth.flowConfigurationLink') }}</RouterLink>.
        </p>
    </div>
    <section v-if="currentFlow === null" class="flow-picker">
        <div
            v-for="(flowConfiguration, flowIndex) in boothApp.flowConfigurations"
            :key="flowIndex"
            class="flow-picker__card"
            @click="() => {
                stopSelectionListener();
                currentFlow = instanciateFlowFromConfiguration(flowConfiguration, boothApp);
            }"
        >
            <h2>{{ flowConfiguration.name }}</h2>
        </div>
    </section>
    <component
        v-else-if="pendingImages !== null && pendingRuntimeNode !== null && pendingRuntimeNode.runtimeComponent !== undefined"
        :is="pendingRuntimeNode.runtimeComponent"
        :images="pendingImages"
        :configuration="pendingRuntimeNode.configuration"
        :busy="decisionInProgress"
        @cancel="cancelSequence"
        @continue="continueSequence"
    />
    <component
        v-else
        :is="currentFlow.entryNode.component"
        :cameraNode="currentFlow.cameraNode"
        :configuration="currentFlow.entryNode.configuration"
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