<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useBoothApp } from '@/core/composables/useBoothApp';

const props = defineProps<{
    flowIndex?: string;
}>();

const { boothApp } = useBoothApp();
const router = useRouter();


const entryNodeName = ref('');
const cameraNodeName = ref('');
const processingNodeNames = ref<string[]>([]);

const flowIndexToEdit = computed<number | undefined>(() => {
    if (props.flowIndex === undefined) {
        return undefined;
    }

    const parsedFlowIndex = Number.parseInt(props.flowIndex, 10);

    if (Number.isNaN(parsedFlowIndex) || parsedFlowIndex < 0) {
        return undefined;
    }

    return parsedFlowIndex;
});

const isEditing = computed(() => {
    return flowIndexToEdit.value !== undefined && boothApp.value.flows[flowIndexToEdit.value] !== undefined;
});

function setFormFromCurrentContext() {
    const flowToEdit = flowIndexToEdit.value !== undefined ? boothApp.value.flows[flowIndexToEdit.value] : undefined;

    entryNodeName.value = flowToEdit?.entryNode.name ?? boothApp.value.registeredNodes.entryNodes[0]?.name ?? '';
    cameraNodeName.value = flowToEdit?.cameraNode.name ?? boothApp.value.registeredNodes.cameraNodes[0]?.name ?? '';
    processingNodeNames.value = flowToEdit?.processingNodesPipeline.map((node) => node.name)
        ?? boothApp.value.registeredNodes.processingNodes.map((node) => node.name);
}

watch(
    [() => props.flowIndex, () => boothApp.value.flows.length],
    () => {
        setFormFromCurrentContext();
    },
    { immediate: true },
);

function onProcessingNodeToggle(nodeName: string, isChecked: boolean) {
    if (isChecked) {
        if (!processingNodeNames.value.includes(nodeName)) {
            processingNodeNames.value.push(nodeName);
        }
        return;
    }

    processingNodeNames.value = processingNodeNames.value.filter((name) => name !== nodeName);
}

function saveFlow() {
    const entryNode = boothApp.value.registeredNodes.entryNodes.find((node) => node.name === entryNodeName.value);
    const cameraNode = boothApp.value.registeredNodes.cameraNodes.find((node) => node.name === cameraNodeName.value);

    if (entryNode === undefined || cameraNode === undefined) {
        return;
    }

    const selectedProcessingNodes = boothApp.value.registeredNodes.processingNodes.filter((node) => {
        return processingNodeNames.value.includes(node.name);
    });

    const configuredFlow = {
        entryNode,
        cameraNode,
        processingNodesPipeline: selectedProcessingNodes,
    };

    if (flowIndexToEdit.value !== undefined && boothApp.value.flows[flowIndexToEdit.value] !== undefined) {
        boothApp.value.flows[flowIndexToEdit.value] = configuredFlow;
    } else {
        boothApp.value.flows.push(configuredFlow);
    }

    void router.push('/flows');
}
</script>

<template>
    <div>
        <h1>{{ isEditing ? 'Edit Flow' : 'New Flow' }}</h1>
        <div>
            <label for="entry-node-select">Entry node</label>
            <select id="entry-node-select" v-model="entryNodeName">
                <option
                    v-for="node in boothApp.registeredNodes.entryNodes"
                    :key="node.name"
                    :value="node.name"
                >
                    {{ node.name }}
                </option>
            </select>

            <label for="camera-node-select">Camera node</label>
            <select id="camera-node-select" v-model="cameraNodeName">
                <option
                    v-for="node in boothApp.registeredNodes.cameraNodes"
                    :key="node.name"
                    :value="node.name"
                >
                    {{ node.name }}
                </option>
            </select>

            <p>Processing nodes</p>
            <div v-for="node in boothApp.registeredNodes.processingNodes" :key="node.name">
                <label>
                    <input
                        type="checkbox"
                        :value="node.name"
                        :checked="processingNodeNames.includes(node.name)"
                        @change="onProcessingNodeToggle(node.name, ($event.target as HTMLInputElement).checked)"
                    >
                    {{ node.name }}
                </label>
            </div>

            <button type="button" @click="saveFlow">Save flow</button>
            <p>
                <RouterLink to="/flows">Back to flows</RouterLink>
            </p>
        </div>
    </div>
</template>
