<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useBoothApp } from '@/core/composables/useBoothApp';

const { boothApp } = useBoothApp();
const router = useRouter();

function editFlow(flowIndex: number) {
    void router.push({
        name: 'flow-config',
        params: {
            flowIndex,
        },
    });
}

function addFlow() {
    void router.push({ name: 'flow-config' });
}

function removeFlow(flowIndex: number) {
    const flowName = boothApp.value.flowConfigurations[flowIndex]?.name

    const confirmedMessage = flowName !== undefined && flowName !== ''
        ? `Remove flow “${flowName}”?`
        : `Remove this flow?`

    if (!window.confirm(confirmedMessage)) {
        return
    }

    boothApp.value.flowConfigurations.splice(flowIndex, 1)
}
</script>

<template>
    <div>
        <h1>Flows</h1>

        <button type="button" @click="addFlow">Add new flow</button>

        <p v-if="boothApp.flowConfigurations.length === 0">No flow configured yet.</p>

        <div v-for="(flow, flowIndex) in boothApp.flowConfigurations" :key="flowIndex">
            <h2>{{ flow.name }}</h2>
            <button type="button" @click="editFlow(flowIndex)">Edit flow</button>
            <button type="button" class="remove-flow-button" @click="removeFlow(flowIndex)">🗑</button>
        </div>

        <p>
            <RouterLink to="/booth">Open booth</RouterLink>
        </p>
    </div>
</template>

<style scoped>
.remove-flow-button {
    background: var(--color-danger);
    color: var(--color-danger-foreground);
    border-color: var(--color-danger);
}
</style>
