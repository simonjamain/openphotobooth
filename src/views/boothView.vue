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

async function continueSequence(newImages?: ImageBitmap[]) {
    if (decisionInProgress.value) {
        return;
    }

    const images = newImages ?? pendingImages.value;
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

async function startPipeline() {
    if (currentFlow.value === null) {
        return;
    }

    const pipelineResult = await runPipelineUntilInteractiveNode(currentFlow.value.processingNodesPipeline, []);

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
        void startPipeline();
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
                void startPipeline();
            }"
        >
            <div
                v-if="flowConfiguration.coverImage"
                class="flow-picker__photo"
                :class="`flow-picker__photo--${flowIndex % 4}`"
            >
                <img
                    :src="flowConfiguration.coverImage"
                    :alt="flowConfiguration.name"
                />
            </div>

            <h2>{{ flowConfiguration.name }}</h2>
        </div>
    </section>
    <component
        v-else-if="pendingImages !== null && pendingRuntimeNode !== null && pendingRuntimeNode.runtimeComponent !== undefined"
        :is="pendingRuntimeNode.runtimeComponent"
        :images="pendingImages"
        :configuration="pendingRuntimeNode.configuration"
        :cameraNode="currentFlow.cameraNode"
        :busy="decisionInProgress"
        @cancel="cancelSequence"
        @continue="continueSequence"
    />
</template>

<style scoped>
.flow-picker {
    position: fixed;
    inset: 0;

    display: flex;
    align-items: stretch;
    justify-content: stretch;

    gap: var(--space-4);
    padding: var(--space-4);

    background: var(--color-primary);
}

.flow-picker__card {
    position: relative;

    flex: 1 1 0;
    min-width: 0;
    min-height: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    overflow: hidden;

    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);

    cursor: pointer;

    /*
     * On garde la card assez neutre :
     * c'est la photo qui doit attirer l'attention.
     */
    background: var(--color-surface-muted);

    transition:
        transform 200ms ease,
        border-color 200ms ease;
}

.flow-picker__card:hover {
    border-color: color-mix(
        in srgb,
        var(--color-border),
        currentColor 20%
    );
}


/*
 * PHOTO
 */

.flow-picker__photo {
    width: min(70%, 360px);
    max-height: 82%;

    filter:
        drop-shadow(0 3px 5px rgba(0, 0, 0, 0.10))
        drop-shadow(0 12px 20px rgba(0, 0, 0, 0.14))
        drop-shadow(0 25px 40px rgba(0, 0, 0, 0.10));

    transform: rotate(-3deg);

    transition:
        transform 300ms cubic-bezier(0.2, 0.8, 0.2, 1),
        filter 300ms ease;
}

.flow-picker__photo img {
    display: block;
    width: auto;
    height: auto;

    max-width: 100%;
    max-height: 82vh;

    object-fit: contain;
}


/*
 * Variations de rotation.
 *
 * Le but est d'éviter l'effet "4 cartes identiques".
 */

.flow-picker__photo--0 {
    transform: rotate(-3deg);
}

.flow-picker__photo--1 {
    transform: rotate(2.5deg);
}

.flow-picker__photo--2 {
    transform: rotate(-1.5deg);
}

.flow-picker__photo--3 {
    transform: rotate(3deg);
}


/*
 * TITRE
 */

.flow-picker__card h2 {
    position: absolute;

    left: var(--space-3);
    right: var(--space-3);
    bottom: var(--space-3);

    margin: 0;

    text-align: center;

    text-shadow:
        0 1px 4px rgba(0, 0, 0, 0.4);
}
</style>