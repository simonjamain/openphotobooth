<script setup lang="ts">
import { computed, ref, toRaw, watch, type Component, type Ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useBoothApp } from '@/core/composables/useBoothApp';
import type { FlowConfiguration } from '@/core/types/Flow';
import type { NodeConfiguration } from '@/core/types/Node';
import nodeLinkage from '@/components/nodeLinkage.vue';

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
const { t } = useI18n();
const props = defineProps<{
    flowIndex?: string;
}>();

const defaultFlowConfiguration = (): Partial<FlowConfiguration> => ({
    name: t('flowConfig.namePlaceholder'),
    processingNodesPipeline: [],
});

const editedFlowConfiguration: Ref<Partial<FlowConfiguration>> = ref(defaultFlowConfiguration());

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

function moveProcessingNode(nodeIndex: number, offset: -1 | 1) {
    const processingNodesPipeline = editedFlowConfiguration.value.processingNodesPipeline;

    if (processingNodesPipeline === undefined) {
        return;
    }

    const targetIndex = nodeIndex + offset;
    if (targetIndex < 0 || targetIndex >= processingNodesPipeline.length) {
        return;
    }

    const movedNode = processingNodesPipeline[nodeIndex];
    if (movedNode === undefined) {
        return;
    }

    processingNodesPipeline.splice(nodeIndex, 1);
    processingNodesPipeline.splice(targetIndex, 0, movedNode);
}

function onCoverImageChange(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
        const img = new Image()
        img.onload = () => {
            const MAX_SIZE = 1200
            const scale = Math.min(1, MAX_SIZE / Math.max(img.width, img.height))
            const canvas = document.createElement('canvas')
            canvas.width = Math.round(img.width * scale)
            canvas.height = Math.round(img.height * scale)
            const ctx = canvas.getContext('2d')
            if (!ctx) return
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            editedFlowConfiguration.value.coverImage = canvas.toDataURL('image/jpeg', 0.82)
        }
        img.src = reader.result as string
    }
    reader.readAsDataURL(file)
    input.value = ''
}

function saveFlowConfiguration() {
    if (flowIsInvalid.value) {
        alert(t('flowConfig.invalidAlert'));
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
            <h1>{{ $props.flowIndex === undefined ? $t('flowConfig.newFlow') : (editedFlowConfiguration.name ?? $t('flowConfig.editingFlow', { index: $props.flowIndex })) }}</h1>
            <p>
                {{ $t('flowConfig.description') }}
            </p>
        </header>

        <div class="flow-chain">
            <article>
                <p class="chain-node__eyebrow">{{ $t('flowConfig.detailsEyebrow') }}</p>
                <h2>{{ $t('flowConfig.nameTitle') }}</h2>
                <label for="flow-name-input">{{ $t('flowConfig.nameLabel') }}</label>
                <input id="flow-name-input" v-model="editedFlowConfiguration.name" type="text" :placeholder="$t('flowConfig.namePlaceholder')" />

                <label class="cover-image-label">{{ $t('flowConfig.coverImageLabel') }}</label>
                <p class="cover-image-description">{{ $t('flowConfig.coverImageDescription') }}</p>
                <div class="cover-image-preview" v-if="editedFlowConfiguration.coverImage">
                    <img :src="editedFlowConfiguration.coverImage" alt="" class="cover-image-preview__img" />
                </div>
                <div class="cover-image-actions">
                    <label class="cover-image-upload-btn">
                        {{ $t('flowConfig.coverImageUpload') }}
                        <input type="file" accept="image/*" class="cover-image-file-input" @change="onCoverImageChange" />
                    </label>
                    <button
                        v-if="editedFlowConfiguration.coverImage"
                        type="button"
                        class="cover-image-clear-btn"
                        @click="editedFlowConfiguration.coverImage = null"
                    >
                        {{ $t('flowConfig.coverImageClear') }}
                    </button>
                </div>
            </article>
                        

            <article>
                <p class="chain-node__eyebrow">{{ $t('flowConfig.step1') }}</p>
                <h2>{{ $t('flowConfig.entryNodeTitle') }}</h2>
                <div class="processing-list__item">
                    <label for="entry-node-select">{{ $t('flowConfig.entryNodeLabel') }}</label>
                    <select id="entry-node-select" v-model="selectedEntryNodeId">
                        <option disabled value="">{{ $t('flowConfig.entryNodePlaceholder') }}</option>
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
                    <label for="camera-node-select">{{ $t('flowConfig.cameraNodeLabel') }}</label>
                    <select id="camera-node-select" v-model="selectedCameraNodeId">
                        <option disabled value="">{{ $t('flowConfig.cameraNodePlaceholder') }}</option>
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
                <p class="chain-node__eyebrow">{{ $t('flowConfig.step2') }}</p>
                <h2>{{ $t('flowConfig.processingTitle') }}</h2>

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
                                <div class="processing-list__actions">
                                    <button
                                        type="button"
                                        class="processing-list__move"
                                        :disabled="nodeIndex === 0"
                                        @click="moveProcessingNode(nodeIndex, -1)"
                                    >
                                        {{ $t('common.moveUp') }}
                                    </button>
                                    <button
                                        type="button"
                                        class="processing-list__move"
                                        :disabled="nodeIndex === processingNodesForDisplay.length - 1"
                                        @click="moveProcessingNode(nodeIndex, 1)"
                                    >
                                        {{ $t('common.moveDown') }}
                                    </button>
                                    <button class="processing-list__remove" type="button" @click="removeProcessingNode(nodeIndex)">
                                        {{ $t('common.remove') }}
                                    </button>
                                </div>
                            </div>
                            <component
                                v-if="configurationComponent !== undefined"
                                :is="configurationComponent"
                                v-model:configuration="node.configuration"
                            />
                        </li>
                    </template>
                </ol>

                <p v-else class="processing-list__empty">{{ $t('flowConfig.processingEmpty') }}</p>

                <div class="processing-node-palette">
                    <button
                        v-for="node in boothApp.registeredNodes.processingNodes"
                        :key="node.id"
                        type="button"
                        @click="addProcessingNode(node.id)"
                    >
                        {{ $t('flowConfig.addNode', { name: node.name }) }}
                    </button>
                </div>
            </article>

        </div>

        <footer class="flow-config__actions">
            <button type="button" :disabled="flowIsInvalid" @click="saveFlowConfiguration">{{ $t('flowConfig.saveFlow') }}</button>
            <RouterLink to="/flows">{{ $t('flowConfig.backToFlows') }}</RouterLink>
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

.processing-list__actions {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
}

.processing-list__move {
    background: var(--color-surface-muted);
    color: var(--color-text);
    border-color: var(--color-border-strong);
}

.processing-list__move:hover {
    background: color-mix(in srgb, var(--color-surface-muted) 70%, var(--color-page-background));
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

.flow-config__actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
}

.cover-image-label {
    display: block;
    margin-top: var(--space-3);
    font-weight: 600;
}

.cover-image-description {
    margin: var(--space-1) 0 var(--space-2);
    color: var(--color-text-soft);
    font-size: 0.875rem;
}

.cover-image-preview {
    width: 100%;
    max-height: 10rem;
    overflow: hidden;
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border);
    margin-bottom: var(--space-2);
}

.cover-image-preview__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.cover-image-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
}

.cover-image-upload-btn {
    display: inline-block;
    cursor: pointer;
    padding: 0.4rem 0.8rem;
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border-strong);
    background: var(--color-surface-muted);
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.5;
}

.cover-image-upload-btn:hover {
    background: color-mix(in srgb, var(--color-surface-muted) 70%, var(--color-page-background));
}

.cover-image-file-input {
    display: none;
}

.cover-image-clear-btn {
    background: var(--color-danger);
    color: var(--color-danger-foreground);
    border-color: var(--color-danger);
}

@media (max-width: 640px) {
    .processing-list__title-row {
        flex-direction: column;
        align-items: flex-start;
    }

    .processing-list__actions {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr;
    }

    .flow-config__actions {
        flex-direction: column;
        align-items: stretch;
    }
}
</style>
