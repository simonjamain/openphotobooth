<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, type Ref } from 'vue';
import type { Flow, FlowProcessingNode } from '@/core/types/Flow';
import { instanciateFlowFromConfiguration, runPipeline } from '@/core/Flow';
import { useBoothApp } from '@/core/composables/useBoothApp';
import { InputManager, inputsEqual } from '@/core/services/inputManager';
import sequenceDecisionScreen from '@/components/sequenceDecisionScreen.vue';

const { boothApp } = useBoothApp();

const currentFlow:Ref<Flow|null> = ref(null);
const selectionInputManager = ref<InputManager | null>(null);
const pendingImages = ref<ImageBitmap[] | null>(null);
const pendingProcessingNodes = ref<FlowProcessingNode[] | null>(null);
const decisionInProgress = ref(false);

function clearCancelScreenState() {
    pendingImages.value = null;
    pendingProcessingNodes.value = null;
    decisionInProgress.value = false;
}

function finishFlow() {
    clearCancelScreenState();
    currentFlow.value = null;
    startSelectionListener();
}

function normalizePauseIndex(pauseBeforeProcessingNodeIndex: number | null | undefined, processingNodesCount: number): number | null {
    if (pauseBeforeProcessingNodeIndex === null || pauseBeforeProcessingNodeIndex === undefined) {
        return null;
    }

    if (!Number.isInteger(pauseBeforeProcessingNodeIndex) || pauseBeforeProcessingNodeIndex < 0) {
        return null;
    }

    return Math.min(pauseBeforeProcessingNodeIndex, processingNodesCount);
}

function openCancelScreen(images: Readonly<ImageBitmap[]>, remainingNodes: Readonly<FlowProcessingNode[]>) {
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

    if (images === null || processingNodes === null) {
        return;
    }

    decisionInProgress.value = true;

    try {
        await runPipeline(processingNodes, images);
        finishFlow();
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

    const pauseBeforeProcessingNodeIndex = normalizePauseIndex(
        currentFlow.value.cancelScreen?.pauseBeforeProcessingNodeIndex,
        currentFlow.value.processingNodesPipeline.length,
    );

    if (pauseBeforeProcessingNodeIndex === null) {
        await runPipeline(currentFlow.value.processingNodesPipeline, images);
        finishFlow();
        return;
    }

    const processingNodesBeforePause = currentFlow.value.processingNodesPipeline.slice(0, pauseBeforeProcessingNodeIndex);
    const processingNodesAfterPause = currentFlow.value.processingNodesPipeline.slice(pauseBeforeProcessingNodeIndex);
    const processedImages = await runPipeline(processingNodesBeforePause, images);

    openCancelScreen(processedImages, processingNodesAfterPause);
    return;
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
    clearCancelScreenState();
});
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
            @click="() => {
                stopSelectionListener();
                currentFlow = instanciateFlowFromConfiguration(flowConfiguration, boothApp);
            }"
        >
            <h2>{{ flowConfiguration.name }}</h2>
        </div>
    </section>
    <sequenceDecisionScreen
        v-else-if="pendingImages !== null && currentFlow !== null"
        :images="pendingImages"
        :cancelInput="currentFlow.cancelScreen?.cancelInput"
        :continueInput="currentFlow.cancelScreen?.continueInput"
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