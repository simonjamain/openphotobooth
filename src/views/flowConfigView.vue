<script setup lang="ts">
import { computed, onBeforeUnmount, ref, toRaw, watch, type Component, type Ref } from 'vue';
import { useRouter } from 'vue-router';
import { useBoothApp } from '@/core/composables/useBoothApp';
import type { FlowConfiguration } from '@/core/types/Flow';
import type { NodeConfiguration } from '@/core/types/Node';
import nodeLinkage from '@/components/nodeLinkage.vue';
import { describeInput, InputManager } from '@/core/services/inputManager';

console.log('flowConfigView.vue loaded');
window.addEventListener("gamepadconnected", (e) => {
  console.log(
    "Gamepad connected at index %d: %s. %d buttons, %d axes.",
    e.gamepad.index,
    e.gamepad.id,
    e.gamepad.buttons.length,
    e.gamepad.axes.length,
  );
});
window.addEventListener("gamepaddisconnected", (e) => {
  console.log(
    "Gamepad disconnected from index %d: %s",
    e.gamepad.index,
    e.gamepad.id,
  );
});

const { boothApp } = useBoothApp();
const router = useRouter();
const props = defineProps<{
    flowIndex?: string;
}>();

const defaultFlowConfiguration = (): Partial<FlowConfiguration> => ({
    name: 'Untitled flow',
    processingNodesPipeline: [],
    cancelScreen: {
        pauseBeforeProcessingNodeIndex: null,
        cancelInput: null,
        continueInput: null,
    },
});

const editedFlowConfiguration: Ref<Partial<FlowConfiguration>> = ref(defaultFlowConfiguration());
const activeCancelScreenInputBindingTarget = ref<'cancelInput' | 'continueInput' | null>(null);
let activeCancelScreenInputBindingManager: InputManager | null = null;

function ensureCancelScreenConfiguration() {
    editedFlowConfiguration.value.cancelScreen = editedFlowConfiguration.value.cancelScreen ?? {
        pauseBeforeProcessingNodeIndex: null,
        cancelInput: null,
        continueInput: null,
    };

    return editedFlowConfiguration.value.cancelScreen;
}

const parsedFlowIndex = computed<number | undefined>(() => {
    if (props.flowIndex === undefined) {
        return undefined;
    }

    const parsedValue = Number.parseInt(props.flowIndex, 10);
    return Number.isFinite(parsedValue) ? parsedValue : undefined;
});

watch(
    [parsedFlowIndex, () => boothApp.value.flowConfigurations],
    () => {
        if (parsedFlowIndex.value === undefined) {
            editedFlowConfiguration.value = defaultFlowConfiguration();
            return;
        }

        const selectedFlow = boothApp.value.flowConfigurations[parsedFlowIndex.value];
        if (selectedFlow === undefined) {
            editedFlowConfiguration.value = defaultFlowConfiguration();
            return;
        }

        editedFlowConfiguration.value = structuredClone(toRaw(selectedFlow));
    },
    { immediate: true, deep: true },
);


const flowIsInvalid = computed(() => {
    return editedFlowConfiguration.value.name?.trim() === ''
        || editedFlowConfiguration.value.entryNode === undefined
        || editedFlowConfiguration.value.cameraNode === undefined
        || editedFlowConfiguration.value.processingNodesPipeline === undefined;
});

const selectedCameraNode = computed(() => {
    const selectedCameraNodeId = editedFlowConfiguration.value.cameraNode?.id;
    if (selectedCameraNodeId === undefined) {
        return undefined;
    }

    return boothApp.value.registeredNodes.cameraNodes[selectedCameraNodeId];
});

const selectedCameraNodeConfigurationComponent = computed<Component | undefined>(() => {
    return selectedCameraNode.value?.configurationComponent as Component | undefined;
});

const selectedEntryNode = computed(() => {
    const selectedEntryNodeId = editedFlowConfiguration.value.entryNode?.id;
    if (selectedEntryNodeId === undefined) {
        return undefined;
    }

    return boothApp.value.registeredNodes.entryNodes[selectedEntryNodeId];
});

const selectedEntryNodeConfigurationComponent = computed<Component | undefined>(() => {
    return selectedEntryNode.value?.configurationComponent as Component | undefined;
});

const selectedEntryNodeId = computed<string>({
    get() {
        return editedFlowConfiguration.value.entryNode?.id ?? '';
    },
    set(nodeId: string) {
        if (nodeId === '') {
            editedFlowConfiguration.value.entryNode = undefined;
            return;
        }

        if (editedFlowConfiguration.value.entryNode?.id === nodeId) {
            return;
        }

        editedFlowConfiguration.value.entryNode = {
            id: nodeId,
            configuration: {},
        } as NodeConfiguration;
    },
});

const selectedCameraNodeId = computed<string>({
    get() {
        return editedFlowConfiguration.value.cameraNode?.id ?? '';
    },
    set(nodeId: string) {
        if (nodeId === '') {
            editedFlowConfiguration.value.cameraNode = undefined;
            return;
        }

        if (editedFlowConfiguration.value.cameraNode?.id === nodeId) {
            return;
        }

        editedFlowConfiguration.value.cameraNode = {
            id: nodeId,
            configuration: {},
        } as NodeConfiguration;
    },
});

const processingNodesForDisplay = computed(() => {
    return (editedFlowConfiguration.value.processingNodesPipeline ?? []).map((node, nodeIndex) => {
        const registeredNode = boothApp.value.registeredNodes.processingNodes[node.id];

        return {
            node,
            nodeIndex,
            name: registeredNode?.name ?? node.id,
            configurationComponent: registeredNode?.configurationComponent as Component | undefined,
        };
    });
});

const cancelScreenPauseOptions = computed(() => {
    const nodes = processingNodesForDisplay.value;
    const options: { value: number; label: string }[] = [];

    for (let nodeIndex = 0; nodeIndex <= nodes.length; nodeIndex += 1) {
        if (nodes.length === 0) {
            options.push({
                value: nodeIndex,
                label: 'Before processing starts',
            });
            break;
        }

        if (nodeIndex < nodes.length) {
            const nodeLabel = nodes[nodeIndex]?.name ?? `Step ${nodeIndex + 1}`;
            options.push({
                value: nodeIndex,
                label: `Before step ${nodeIndex + 1}: ${nodeLabel}`,
            });
            continue;
        }

        options.push({
            value: nodeIndex,
            label: 'After the last processing step',
        });
    }

    return options;
});

const selectedPauseBeforeProcessingNodeIndex = computed<number | ''>({
    get() {
        return editedFlowConfiguration.value.cancelScreen?.pauseBeforeProcessingNodeIndex ?? '';
    },
    set(value: number | '') {
        const cancelScreenConfiguration = ensureCancelScreenConfiguration();

        if (value === '') {
            cancelScreenConfiguration.pauseBeforeProcessingNodeIndex = null;
            return;
        }

        cancelScreenConfiguration.pauseBeforeProcessingNodeIndex = value;
    },
});

function addProcessingNode(nodeId: string) {
    editedFlowConfiguration.value.processingNodesPipeline = editedFlowConfiguration.value.processingNodesPipeline ?? [];
    editedFlowConfiguration.value.processingNodesPipeline.push({
        id: nodeId,
        configuration: {},
    });
}

function removeProcessingNode(nodeIndex: number) {
    editedFlowConfiguration.value.processingNodesPipeline?.splice(nodeIndex, 1);
}

function cancelScreenInputLabel(inputTarget: 'cancelInput' | 'continueInput') {
    const configuredInput = editedFlowConfiguration.value.cancelScreen?.[inputTarget];
    return describeInput(configuredInput);
}

function bindCancelScreenInputButtonLabel(inputTarget: 'cancelInput' | 'continueInput') {
    if (activeCancelScreenInputBindingTarget.value === inputTarget) {
        return 'Press a key or button...';
    }

    const configuredInput = editedFlowConfiguration.value.cancelScreen?.[inputTarget];
    return configuredInput === null || configuredInput === undefined ? 'Bind input' : 'Rebind input';
}

function clearCancelScreenInput(inputTarget: 'cancelInput' | 'continueInput') {
    const cancelScreenConfiguration = ensureCancelScreenConfiguration();
    cancelScreenConfiguration[inputTarget] = null;
}

async function bindCancelScreenInput(inputTarget: 'cancelInput' | 'continueInput') {
    if (activeCancelScreenInputBindingManager !== null) {
        activeCancelScreenInputBindingManager.destroy();
        activeCancelScreenInputBindingManager = null;
    }

    const inputManager = new InputManager();
    activeCancelScreenInputBindingManager = inputManager;
    activeCancelScreenInputBindingTarget.value = inputTarget;

    try {
        const capturedInput = await inputManager.waitForInput();
        const cancelScreenConfiguration = ensureCancelScreenConfiguration();
        cancelScreenConfiguration[inputTarget] = capturedInput;
    }
    finally {
        inputManager.destroy();
        activeCancelScreenInputBindingManager = null;
        activeCancelScreenInputBindingTarget.value = null;
    }
}

onBeforeUnmount(() => {
    activeCancelScreenInputBindingManager?.destroy();
    activeCancelScreenInputBindingManager = null;
    activeCancelScreenInputBindingTarget.value = null;
});

function saveFlowConfiguration() {
    if (flowIsInvalid.value) {
        alert('FlowConfiguration is not valid. Please make sure all required fields are filled.');
        return;
    }

    if(props.flowIndex === undefined) {
        const createdFlowConfigurationIndex = boothApp.value.flowConfigurations.push(editedFlowConfiguration.value as FlowConfiguration) - 1;
        router.push({ name: 'flow-config', params: { flowIndex: createdFlowConfigurationIndex } });
        return
    }

    boothApp.value.flowConfigurations[parseInt(props.flowIndex)] = editedFlowConfiguration.value as FlowConfiguration;
}
</script>

<template>
    <section class="flow-config">
        <header class="flow-config__header">
            <h1>{{ $props.flowIndex === undefined ? 'New Flow' : (editedFlowConfiguration.name ?? `Editing Flow ${$props.flowIndex}`) }}</h1>
            <p>
                A flow is a chain: one <strong>entry node</strong> starts the photo capture, then
                <strong>processing nodes</strong> run one after another.
            </p>
        </header>

        <div class="flow-chain">
            <article>
                <p class="chain-node__eyebrow">Flow details</p>
                <h2>Name</h2>
                <label for="flow-name-input">Give the flow a descriptive name</label>
                <input id="flow-name-input" v-model="editedFlowConfiguration.name" type="text" placeholder="Untitled flow" />
            </article>
                        

            <article>
                <p class="chain-node__eyebrow">Step 1</p>
                <h2>Entry node</h2>
                <div class="processing-list__item">
                    <label for="entry-node-select">Choose how the flow starts</label>
                    <select id="entry-node-select" v-model="selectedEntryNodeId">
                        <option disabled value="">Select an entry node</option>
                        <option
                            v-for="node in boothApp.registeredNodes.entryNodes"
                            :key="node.id"
                            :value="node.id"
                        >
                            {{ node.name }}
                        </option>
                    </select>

                    <component
                        v-if="selectedEntryNodeConfigurationComponent !== undefined && editedFlowConfiguration.entryNode !== undefined"
                        :is="selectedEntryNodeConfigurationComponent"
                        v-model:configuration="editedFlowConfiguration.entryNode.configuration"
                    />
                </div>
                <node-linkage />
                <div class="processing-list__item">
                    <label for="camera-node-select">How to take photos</label>
                    <select id="camera-node-select" v-model="selectedCameraNodeId">
                        <option disabled value="">Select a camera node</option>
                        <option
                            v-for="node in boothApp.registeredNodes.cameraNodes"
                            :key="node.id"
                            :value="node.id"
                        >
                            {{ node.name }}
                        </option>
                    </select>

                    <component
                        v-if="selectedCameraNodeConfigurationComponent !== undefined && editedFlowConfiguration.cameraNode !== undefined"
                        :is="selectedCameraNodeConfigurationComponent"
                        v-model:configuration="editedFlowConfiguration.cameraNode.configuration"
                    />
                </div>
            </article>
            <article>
                <p class="chain-node__eyebrow">Step 2</p>
                <h2>Processing chain</h2>

                <ol class="processing-list" v-if="processingNodesForDisplay.length > 0">
                    <template 
                        v-for="{ node, nodeIndex, name, configurationComponent } in processingNodesForDisplay"
                        :key="`${node.id}-${nodeIndex}`">

                        <node-linkage v-if="nodeIndex > 0" :displayArrow="true" />

                        <li
                            class="processing-list__item"
                        >
                            <div class="processing-list__title-row">
                                <strong>{{ name }}</strong>
                                <button class="processing-list__remove" type="button" @click="removeProcessingNode(nodeIndex)">
                                    🗑
                                </button>
                            </div>
                            <component
                                v-if="configurationComponent !== undefined"
                                :is="configurationComponent"
                                v-model:configuration="node.configuration"
                            />
                        </li>
                    </template>
                </ol>

                <p v-else class="processing-list__empty">No processing node yet. Add one below.</p>

                <div class="processing-node-palette">
                    <button
                        v-for="node in boothApp.registeredNodes.processingNodes"
                        :key="node.id"
                        type="button"
                        @click="addProcessingNode(node.id)"
                    >
                        Add {{ node.name }}
                    </button>
                </div>
            </article>

            <article>
                <p class="chain-node__eyebrow">Step 3</p>
                <h2>Cancel/print decision screen</h2>
                <p class="flow-config__note">
                    Pause the flow at a chosen point to let the user cancel or continue to print.
                </p>

                <div class="processing-list__item">
                    <label for="cancel-screen-position-select">Pause location in processing chain</label>
                    <select id="cancel-screen-position-select" v-model="selectedPauseBeforeProcessingNodeIndex">
                        <option value="">Disabled</option>
                        <option
                            v-for="pauseOption in cancelScreenPauseOptions"
                            :key="pauseOption.value"
                            :value="pauseOption.value"
                        >
                            {{ pauseOption.label }}
                        </option>
                    </select>
                </div>

                <div class="processing-list__item">
                    <p class="flow-input-group__title">Cancel input</p>
                    <p class="flow-input-group__value">{{ cancelScreenInputLabel('cancelInput') }}</p>
                    <div class="flow-actions">
                        <button type="button" @click="bindCancelScreenInput('cancelInput')">
                            {{ bindCancelScreenInputButtonLabel('cancelInput') }}
                        </button>
                        <button
                            v-if="editedFlowConfiguration.cancelScreen?.cancelInput !== null && editedFlowConfiguration.cancelScreen?.cancelInput !== undefined"
                            type="button"
                            class="clear-input-button"
                            @click="clearCancelScreenInput('cancelInput')"
                        >
                            Clear input
                        </button>
                    </div>
                </div>

                <div class="processing-list__item">
                    <p class="flow-input-group__title">Print input</p>
                    <p class="flow-input-group__value">{{ cancelScreenInputLabel('continueInput') }}</p>
                    <div class="flow-actions">
                        <button type="button" @click="bindCancelScreenInput('continueInput')">
                            {{ bindCancelScreenInputButtonLabel('continueInput') }}
                        </button>
                        <button
                            v-if="editedFlowConfiguration.cancelScreen?.continueInput !== null && editedFlowConfiguration.cancelScreen?.continueInput !== undefined"
                            type="button"
                            class="clear-input-button"
                            @click="clearCancelScreenInput('continueInput')"
                        >
                            Clear input
                        </button>
                    </div>
                </div>
            </article>
        </div>

        <footer class="flow-config__actions">
            <button type="button" :disabled="flowIsInvalid" @click="saveFlowConfiguration">Save flow</button>
            <RouterLink to="/flows">Back to flows</RouterLink>
        </footer>
    </section>
</template>

<style scoped>
.flow-config {
    display: grid;
    gap: var(--space-5);
}

.flow-config__header p {
    color: var(--color-text-soft);
    max-width: 62ch;
}

.flow-chain {
    display: grid;
    gap: var(--space-4);
}

.flow-config__note {
    margin-top: 0;
    color: var(--color-text-soft);
}

.chain-node {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface-muted);
    padding: var(--space-4);
    position: relative;
}

.chain-node__eyebrow {
    margin: 0;
    color: var(--color-primary);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-size: 0.8rem;
}

.chain-node h2 {
    margin-top: var(--space-2);
    margin-bottom: var(--space-3);
}

.processing-list {
    margin: var(--space-3) 0;
    padding-left: 0;
    list-style: none;
}

.processing-list__item {
    position: relative;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: var(--space-3);
    margin-top: -1px;
    margin-bottom: -1px;
}

.processing-list__title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    margin-bottom: var(--space-2);
}

.processing-list__empty {
    color: var(--color-text-soft);
}

.processing-list__remove {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    background: var(--color-danger);
    color: var(--color-danger-foreground);
}

.processing-list__remove:hover {
    background: var(--color-danger-hover);
}

.processing-list__remove:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--color-danger) 70%, white);
}

.processing-node-palette {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
}

.flow-input-group__title {
    margin: 0;
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-text-soft);
    font-weight: 700;
}

.flow-input-group__value {
    margin: var(--space-2) 0 var(--space-3);
    display: inline-block;
    padding: 0.35rem 0.7rem;
    border-radius: 999px;
    border: 1px solid var(--color-border-strong);
    background: var(--color-surface);
    color: var(--color-text-soft);
}

.flow-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    align-items: center;
}

.clear-input-button {
    background: var(--color-surface-muted);
    color: var(--color-text);
    border-color: var(--color-border-strong);
}

.flow-config__actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
}

@media (max-width: 640px) {
    .processing-list__title-row {
        flex-direction: column;
        align-items: flex-start;
    }

    .flow-config__actions {
        flex-direction: column;
        align-items: stretch;
    }
}
</style>
