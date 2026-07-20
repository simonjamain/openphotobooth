<script setup lang="ts">
import { computed, ref, watchEffect, type Ref } from 'vue';
import { useRouter } from 'vue-router';
import { useBoothApp } from '@/core/composables/useBoothApp';
import type { Flow } from '@/core/types/Flow';

const { boothApp } = useBoothApp();
const router = useRouter();
const props = defineProps<{
    flowIndex?: number;
}>();

const editedFlow: Ref<Partial<Flow>> = ref({
});

watchEffect(() => {
    //@ts-expect-error we expect flowIndex to be undefined, it is ok in js
    editedFlow.value = boothApp.value.flows[props.flowIndex] ?? {processingNodesPipeline: []};
});

const flowIsInvalid = computed(() => {
    return editedFlow.value.entryNode === undefined || editedFlow.value.cameraNode === undefined || editedFlow.value.processingNodesPipeline === undefined;
});
function saveFlow() {
    if (flowIsInvalid.value) {
        alert('Flow is not valid. Please make sure all required fields are filled.');
        return;
    }

    if(props.flowIndex === undefined) {
        const createdFlowIndex = boothApp.value.flows.push(editedFlow.value as Flow) - 1;
        router.push({ name: 'flow-config', params: { flowIndex: createdFlowIndex } });
        return
    }

    boothApp.value.flows[props.flowIndex] = editedFlow.value as Flow;
}
</script>

<template>
    <div>
        <h1>{{ $props.flowIndex === undefined ? 'New Flow' : `Editing Flow ${$props.flowIndex}` }}</h1>
        <div>
            <label for="entry-node-select">Entry node</label>
            <select id="entry-node-select" v-model="editedFlow.entryNode">
                <option
                    v-for="(node, nodeIndex) in boothApp.registeredNodes.entryNodes"
                    :key="nodeIndex"
                    :value="node"
                >
                    {{ node.name }}
                </option>
            </select>

            <label for="camera-node-select">Camera node</label>
            <select id="camera-node-select" v-model="editedFlow.cameraNode">
                <option
                    v-for="(node, nodeIndex) in boothApp.registeredNodes.cameraNodes"
                    :key="nodeIndex"
                    :value="node"
                >
                    {{ node.name }}
                </option>
            </select>

            <p>Processing nodes</p>
            <ol>
                <li v-for="(node, nodeIndex) in editedFlow.processingNodesPipeline ?? []" :key="nodeIndex">
                    {{ node.name }}
                    <button type="button" @click="editedFlow.processingNodesPipeline?.splice(nodeIndex, 1)">
                        Remove
                    </button>
                </li>
            </ol>
            <button v-for="(node, nodeIndex) in boothApp.registeredNodes.processingNodes" :key="nodeIndex"
            @click="editedFlow.processingNodesPipeline = editedFlow.processingNodesPipeline ?? []; editedFlow.processingNodesPipeline.push(node)">
                Add : {{ node.name }}
            </button>

            <button type="button" :disabled="flowIsInvalid" @click="saveFlow">Save flow</button>
            <p>
                <RouterLink to="/flows">Back to flows</RouterLink>
            </p>
        </div>
    </div>
</template>
