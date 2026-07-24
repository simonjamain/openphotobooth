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
    <div>
        <h1>{{ $props.flowIndex === undefined ? 'New FlowConfiguration' : `Editing FlowConfiguration ${$props.flowIndex}` }}</h1>
        <div>
            <label for="entry-node-select">Entry node</label>
            <select id="entry-node-select" v-model="editedFlowConfiguration.entryNode">
                <option
                    v-for="node in boothApp.registeredNodes.entryNodes"
                    :key="node.id"
                    :value="{id: node.id,configuration: {}}"
                >
                    {{ node.name }}
                </option>
            </select>

            <label for="camera-node-select">Camera node</label>
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

            <p>Processing nodes</p>
            <ol>
                <li v-for="(node, nodeIndex) in editedFlowConfiguration.processingNodesPipeline ?? []" :key="nodeIndex">
                    {{ boothApp.registeredNodes.processingNodes[node.id]?.name }}
                    <button type="button" @click="editedFlowConfiguration.processingNodesPipeline?.splice(nodeIndex, 1)">
                        Remove
                    </button>
                </li>
            </ol>
            <button v-for="(node, nodeIndex) in boothApp.registeredNodes.processingNodes" :key="nodeIndex"
            @click="editedFlowConfiguration.processingNodesPipeline = editedFlowConfiguration.processingNodesPipeline ?? []; editedFlowConfiguration.processingNodesPipeline.push({id: node.id,configuration: {}})">
                Add : {{ node.name }}
            </button>

            <button type="button" :disabled="flowIsInvalid" @click="saveFlowConfiguration">Save flow</button>
            <p>
                <RouterLink to="/flows">Back to flows</RouterLink>
            </p>
        </div>
    </div>
</template>
