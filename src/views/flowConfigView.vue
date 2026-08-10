<script setup lang="ts">
import { computed, ref, watchEffect, toRaw, type Component, type Ref } from 'vue';
import { useRouter } from 'vue-router';
import { useBoothApp } from '@/core/composables/useBoothApp';
import type { FlowConfiguration } from '@/core/types/Flow';

const { boothApp } = useBoothApp();
const router = useRouter();
const props = defineProps<{
    flowIndex?: string;
}>();

const editedFlowConfiguration: Ref<Partial<FlowConfiguration>> = ref({
});

watchEffect(() => {
    //@ts-expect-error we expect flowIndex to be undefined, and it is ok in js to index with undefined
    editedFlowConfiguration.value = structuredClone(toRaw(boothApp.value.flowConfigurations[parseInt(props.flowIndex)])) ?? {processingNodesPipeline: []};
});

const flowIsInvalid = computed(() => {
    return editedFlowConfiguration.value.entryNode === undefined || editedFlowConfiguration.value.cameraNode === undefined || editedFlowConfiguration.value.processingNodesPipeline === undefined;
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

function getSelectedProcessingNodeConfigurationComponent(nodeId: string) {
    return boothApp.value.registeredNodes.processingNodes[nodeId]?.configurationComponent as Component | undefined;
}

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
            <h1>{{ $props.flowIndex === undefined ? 'New FlowConfiguration' : `Editing FlowConfiguration ${$props.flowIndex}` }}</h1>
            <p>
                A flow is a chain: one <strong>entry node</strong> starts the photo capture, then
                <strong>processing nodes</strong> run one after another.
            </p>
        </header>

        <div class="flow-chain">
            <article class="chain-node chain-node--entry">
                <p class="chain-node__eyebrow">Step 1</p>
                <h2>Entry node</h2>
                <label for="entry-node-select">Choose how the flow starts</label>
                <select id="entry-node-select" v-model="editedFlowConfiguration.entryNode">
                    <option
                        v-for="node in boothApp.registeredNodes.entryNodes"
                        :key="node.id"
                        :value="{id: node.id,configuration: {}}"
                    >
                        {{ node.name }}
                    </option>
                </select>

                <label for="camera-node-select">Camera node used by the entry</label>
                <select id="camera-node-select" v-model="editedFlowConfiguration.cameraNode">
                    <option
                        v-for="node in boothApp.registeredNodes.cameraNodes"
                        :key="node.id"
                        :value="{id: node.id,configuration: {}}"
                    >
                        {{ node.name }}
                    </option>
                </select>

                <component
                    v-if="selectedCameraNodeConfigurationComponent !== undefined && editedFlowConfiguration.cameraNode !== undefined"
                    :is="selectedCameraNodeConfigurationComponent"
                    v-model:configuration="editedFlowConfiguration.cameraNode.configuration"
                />
            </article>
            <article class="chain-node chain-node--processing">
                <p class="chain-node__eyebrow">Step 2</p>
                <h2>Processing chain</h2>

                <ol class="processing-list" v-if="(editedFlowConfiguration.processingNodesPipeline ?? []).length > 0">
                    <template 
                        v-for="(node, nodeIndex) in editedFlowConfiguration.processingNodesPipeline ?? []"
                        :key="nodeIndex">
                        <p style="text-align:center" v-if="nodeIndex > 0">
                            <svg style="width: 3em;fill: var(--color-primary);" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M297.4 598.6C309.9 611.1 330.2 611.1 342.7 598.6L470.7 470.6C479.9 461.4 482.6 447.7 477.6 435.7C472.6 423.7 460.9 416 448 416L384 416L384 80C384 53.5 362.5 32 336 32L304 32C277.5 32 256 53.5 256 80L256 416L192 416C179.1 416 167.4 423.8 162.4 435.8C157.4 447.8 160.2 461.5 169.4 470.6L297.4 598.6z"/></svg>
                        </p>
                        <li
                            class="processing-list__item"
                        >
                            <div class="processing-list__title-row">
                                <strong>{{ boothApp.registeredNodes.processingNodes[node.id]?.name }}</strong>
                                <button type="button" @click="editedFlowConfiguration.processingNodesPipeline?.splice(nodeIndex, 1)">
                                    Remove
                                </button>
                            </div>
                            <component
                                v-if="getSelectedProcessingNodeConfigurationComponent(node.id) !== undefined"
                                :is="getSelectedProcessingNodeConfigurationComponent(node.id)"
                                v-model:configuration="node.configuration"
                            />
                        </li>
                    </template>
                </ol>

                <p v-else class="processing-list__empty">No processing node yet. Add one below.</p>

                <div class="processing-node-palette">
                    <button
                        v-for="(node, nodeIndex) in boothApp.registeredNodes.processingNodes"
                        :key="nodeIndex"
                        type="button"
                        @click="editedFlowConfiguration.processingNodesPipeline = editedFlowConfiguration.processingNodesPipeline ?? []; editedFlowConfiguration.processingNodesPipeline.push({id: node.id,configuration: {}})"
                    >
                        Add {{ node.name }}
                    </button>
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
    margin-bottom: var(--space-3);
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

.processing-node-palette {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
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
