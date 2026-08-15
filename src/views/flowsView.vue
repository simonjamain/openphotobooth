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

function flowHasInput(flowIndex: number) {
    const flowConfiguration = boothApp.value.flowConfigurations[flowIndex]
    return flowConfiguration?.input !== undefined && flowConfiguration.input !== null
}

function shortcutLabel(flowIndex: number) {
    if (!flowHasInput(flowIndex)) {
        return 'Not bound'
    }

    const flowConfiguration = boothApp.value.flowConfigurations[flowIndex]

    if (flowConfiguration === undefined || flowConfiguration.input === undefined || flowConfiguration.input === null) {
        return 'Not bound'
    }

    return describeInput(flowConfiguration.input)
}

function bindButtonLabel(flowIndex: number) {
    if (bindingFlowIndex.value === flowIndex) {
        return 'Press a key or button…'
    }

    return flowHasInput(flowIndex) ? 'Rebind input' : 'Bind input'
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
    <div class="flows-admin-view">
        <header class="flows-admin-view__header">
            <div>
                <h1>Flows</h1>
                <p class="flows-admin-view__subtitle">
                    Configure shortcuts and preview how each flow appears in booth mode.
                </p>
            </div>
            <button type="button" @click="addFlow">Add new flow</button>
        </header>

        <p v-if="boothApp.flowConfigurations.length === 0" class="flows-admin-view__empty-state">
            No flow configured yet.
        </p>

        <section v-else class="flows-grid">
            <article v-for="(flow, flowIndex) in boothApp.flowConfigurations" :key="flowIndex" class="flow-card">
                <div class="flow-preview" :class="{ 'is-binding': bindingFlowIndex === flowIndex }">
                    <h2>{{ flow.name }}</h2>
                </div>
                <section class="flow-input-group">
                    <p class="flow-input-group__title">Input</p>
                    <p class="flow-input-group__value">{{ shortcutLabel(flowIndex) }}</p>
                    <div class="flow-actions">
                        <button type="button" @click="bindFlowInput(flowIndex)">
                            {{ bindButtonLabel(flowIndex) }}
                        </button>
                        <button
                            v-if="flowHasInput(flowIndex)"
                            type="button"
                            class="clear-input-button"
                            @click="clearFlowInput(flowIndex)"
                        >
                            Clear input
                        </button>
                    </div>
                </section>

                <div class="flow-actions">
                    <button type="button" @click="editFlow(flowIndex)">Edit flow</button>
                    <button type="button" class="remove-flow-button" @click="removeFlow(flowIndex)">Remove</button>
                </div>
            </article>
        </section>

        <p class="flows-admin-view__footer-link">
            <RouterLink to="/booth">Open booth</RouterLink>
        </p>
    </div>
</template>

<style scoped>
.flows-admin-view {
    display: grid;
    gap: var(--space-4);
}

.flows-admin-view__header {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: var(--space-4);
}

.flows-admin-view__subtitle {
    margin: 0;
    color: var(--color-text-soft);
}

.flows-admin-view__empty-state {
    margin: 0;
    padding: var(--space-4);
    border: 1px dashed var(--color-border-strong);
    border-radius: var(--radius-md);
    background: var(--color-surface-muted);
}

.flows-grid {
    display: grid;
    gap: var(--space-4);
}

.flow-card {
    margin-top: 0;
    display: grid;
    gap: var(--space-3);
    padding: var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: color-mix(in srgb, var(--color-surface) 92%, var(--color-page-background));
}

.flow-input-group {
    padding: var(--space-2) var(--space-3) var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
}

.flow-preview {
    display: grid;
    place-items: center;
    text-align: center;
    min-height: 8rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: linear-gradient(
        160deg,
        color-mix(in srgb, var(--color-surface-muted) 70%, white) 0%,
        color-mix(in srgb, var(--color-surface-muted) 85%, var(--color-page-background)) 100%
    );
}

.flow-preview.is-binding {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary) 22%, white);
}

.flow-input-group__title {
    margin: 0;
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-text-soft);
    font-weight: 700;
}

.flow-preview h2 {
    margin: 0;
    font-size: clamp(1.2rem, 3.6vw, 1.8rem);
    max-width: 18ch;
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

.remove-flow-button {
    background: var(--color-danger);
    color: var(--color-danger-foreground);
    border-color: var(--color-danger);
}

.flows-admin-view__footer-link {
    margin: 0;
}

@media (max-width: 640px) {
    .flows-admin-view__header {
        flex-direction: column;
    }

    .flow-preview {
        min-height: 7rem;
    }
}
</style>
