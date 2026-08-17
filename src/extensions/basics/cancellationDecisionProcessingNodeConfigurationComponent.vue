<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { describeInput, InputManager } from '@/core/services/inputManager'
import type { CancellationDecisionProcessingNodeConfiguration } from './cancellationDecisionProcessingNodeConfiguration'

const { t } = useI18n()

const configuration = defineModel<CancellationDecisionProcessingNodeConfiguration['configuration']>('configuration', {
    default: () => ({
        cancelInput: null,
        continueInput: null,
    }),
})

const activeBindingTarget = ref<'cancelInput' | 'continueInput' | null>(null)
let activeInputManager: InputManager | null = null

function labelForInput(target: 'cancelInput' | 'continueInput'): string {
    return describeInput(configuration.value[target])
}

function clearInput(target: 'cancelInput' | 'continueInput') {
    configuration.value[target] = null
}

function bindButtonLabel(target: 'cancelInput' | 'continueInput'): string {
    if (activeBindingTarget.value === target) {
        return t('common.pressKeyOrButton')
    }

    return configuration.value[target] ? t('common.rebindInput') : t('common.bindInput')
}

async function bindInput(target: 'cancelInput' | 'continueInput') {
    activeInputManager?.destroy()

    const nextInputManager = new InputManager()
    activeInputManager = nextInputManager
    activeBindingTarget.value = target

    try {
        configuration.value[target] = await nextInputManager.waitForInput()
    }
    finally {
        nextInputManager.destroy()

        if (activeInputManager === nextInputManager) {
            activeInputManager = null
        }

        activeBindingTarget.value = null
    }
}
</script>

<template>
    <section class="decision-config">
        <h3>{{ $t('cancellationDecision.cancelInputTitle') }}</h3>
        <p>{{ labelForInput('cancelInput') }}</p>
        <div class="decision-config__actions">
            <button type="button" @click="bindInput('cancelInput')">{{ bindButtonLabel('cancelInput') }}</button>
            <button
                v-if="configuration.cancelInput !== null && configuration.cancelInput !== undefined"
                type="button"
                class="decision-config__clear"
                @click="clearInput('cancelInput')"
            >
                {{ $t('common.clear') }}
            </button>
        </div>

        <h3>{{ $t('cancellationDecision.printInputTitle') }}</h3>
        <p>{{ labelForInput('continueInput') }}</p>
        <div class="decision-config__actions">
            <button type="button" @click="bindInput('continueInput')">{{ bindButtonLabel('continueInput') }}</button>
            <button
                v-if="configuration.continueInput !== null && configuration.continueInput !== undefined"
                type="button"
                class="decision-config__clear"
                @click="clearInput('continueInput')"
            >
                {{ $t('common.clear') }}
            </button>
        </div>
    </section>
</template>

<style scoped>
.decision-config {
    display: grid;
    gap: var(--space-2);
}

.decision-config h3 {
    margin: var(--space-2) 0 0;
    font-size: 0.9rem;
}

.decision-config p {
    margin: 0;
    color: var(--color-text-soft);
}

.decision-config__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
}

.decision-config__clear {
    background: var(--color-surface-muted);
    color: var(--color-text);
    border-color: var(--color-border-strong);
}
</style>
