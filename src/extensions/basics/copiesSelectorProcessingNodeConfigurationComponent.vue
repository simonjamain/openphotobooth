<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { describeInput, InputManager } from '@/core/services/inputManager'
import type { CopiesSelectorProcessingNodeConfiguration } from './copiesSelectorProcessingNodeConfiguration'

const { t } = useI18n()

const configuration = defineModel<CopiesSelectorProcessingNodeConfiguration['configuration']>('configuration', {
    default: () => ({
        increaseInput: null,
        decreaseInput: null,
        validateInput: null,
        maxCopies: 10,
        selectedCopies: 1,
    }),
})

const activeBindingTarget = ref<'increaseInput' | 'decreaseInput' | 'validateInput' | null>(null)
let activeInputManager: InputManager | null = null

function labelForInput(target: 'increaseInput' | 'decreaseInput' | 'validateInput'): string {
    return describeInput(configuration.value[target])
}

function clearInput(target: 'increaseInput' | 'decreaseInput' | 'validateInput') {
    configuration.value[target] = null
}

function bindButtonLabel(target: 'increaseInput' | 'decreaseInput' | 'validateInput'): string {
    if (activeBindingTarget.value === target) {
        return t('common.pressKeyOrButton')
    }

    return configuration.value[target] ? t('common.rebindInput') : t('common.bindInput')
}

async function bindInput(target: 'increaseInput' | 'decreaseInput' | 'validateInput') {
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
    <section class="copies-config">
        <h3>{{ $t('copiesSelector.maxCopiesTitle') }}</h3>
        <input v-model.number="configuration.maxCopies" type="number" min="1" max="50">

        <h3>{{ $t('copiesSelector.increaseInputTitle') }}</h3>
        <p>{{ labelForInput('increaseInput') }}</p>
        <div class="copies-config__actions">
            <button type="button" @click="bindInput('increaseInput')">{{ bindButtonLabel('increaseInput') }}</button>
            <button
                v-if="configuration.increaseInput !== null && configuration.increaseInput !== undefined"
                type="button"
                class="copies-config__clear"
                @click="clearInput('increaseInput')"
            >
                {{ $t('common.clear') }}
            </button>
        </div>

        <h3>{{ $t('copiesSelector.decreaseInputTitle') }}</h3>
        <p>{{ labelForInput('decreaseInput') }}</p>
        <div class="copies-config__actions">
            <button type="button" @click="bindInput('decreaseInput')">{{ bindButtonLabel('decreaseInput') }}</button>
            <button
                v-if="configuration.decreaseInput !== null && configuration.decreaseInput !== undefined"
                type="button"
                class="copies-config__clear"
                @click="clearInput('decreaseInput')"
            >
                {{ $t('common.clear') }}
            </button>
        </div>

        <h3>{{ $t('copiesSelector.validateInputTitle') }}</h3>
        <p>{{ labelForInput('validateInput') }}</p>
        <div class="copies-config__actions">
            <button type="button" @click="bindInput('validateInput')">{{ bindButtonLabel('validateInput') }}</button>
            <button
                v-if="configuration.validateInput !== null && configuration.validateInput !== undefined"
                type="button"
                class="copies-config__clear"
                @click="clearInput('validateInput')"
            >
                {{ $t('common.clear') }}
            </button>
        </div>
    </section>
</template>

<style scoped>
.copies-config {
    display: grid;
    gap: var(--space-2);
}

.copies-config h3 {
    margin: var(--space-2) 0 0;
    font-size: 0.9rem;
}

.copies-config p {
    margin: 0;
    color: var(--color-text-soft);
}

.copies-config__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
}

.copies-config__clear {
    background: var(--color-surface-muted);
    color: var(--color-text);
    border-color: var(--color-border-strong);
}
</style>
