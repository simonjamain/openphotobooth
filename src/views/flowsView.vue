<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useBoothApp } from '@/core/composables/useBoothApp';
import { describeInput, InputManager } from '@/core/services/inputManager';

const { boothApp } = useBoothApp();
const router = useRouter();
const bindingFlowIndex = ref<number | null>(null)
let activeInputBinding: InputManager | null = null

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

function clearFlowInput(flowIndex: number) {
    const flowConfiguration = boothApp.value.flowConfigurations[flowIndex]

    if (flowConfiguration === undefined) {
        return
    }

    flowConfiguration.input = null
}

async function bindFlowInput(flowIndex: number) {
    if (activeInputBinding !== null) {
        activeInputBinding.destroy();
        activeInputBinding = null;
    }

    const nextInputManager = new InputManager();
    activeInputBinding = nextInputManager;
    bindingFlowIndex.value = flowIndex;

    try {
        const flowConfiguration = boothApp.value.flowConfigurations[flowIndex]

        if (flowConfiguration === undefined) {
            return
        }

        const nextInput = await nextInputManager.waitForInput();
        flowConfiguration.input = nextInput;
    }
    finally {
        bindingFlowIndex.value = null;
        nextInputManager.destroy();
        activeInputBinding = null;
    }
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
            <p>Shortcut: {{ flow.input ? describeInput(flow.input) : 'Not bound' }}</p>
            <div class="flow-actions">
                <button type="button" @click="bindFlowInput(flowIndex)">
                    {{ bindingFlowIndex === flowIndex ? 'Press a key or button…' : (flow.input ? 'Rebind input' : 'Bind input') }}
                </button>
                <button
                    v-if="flow.input !== undefined && flow.input !== null"
                    type="button"
                    class="clear-input-button"
                    @click="clearFlowInput(flowIndex)"
                >
                    Clear
                </button>
                <button type="button" @click="editFlow(flowIndex)">Edit flow</button>
                <button type="button" class="remove-flow-button" @click="removeFlow(flowIndex)">🗑</button>
            </div>
        </div>

        <p>
            <RouterLink to="/booth">Open booth</RouterLink>
        </p>
    </div>
</template>

<style scoped>
.flow-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    align-items: center;
}

.clear-input-button {
    background: var(--color-surface-muted);
}

.remove-flow-button {
    background: var(--color-danger);
    color: var(--color-danger-foreground);
    border-color: var(--color-danger);
}
</style>
