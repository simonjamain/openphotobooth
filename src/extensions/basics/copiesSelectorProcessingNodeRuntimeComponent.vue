<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { InputManager, inputsEqual, type Input } from '@/core/services/inputManager'
import { CopiesSelectorProcessingNodeConfigurationSchema } from './copiesSelectorProcessingNodeConfiguration'

const props = defineProps<{
    images: Readonly<ImageBitmap[]>
    configuration: Record<string, unknown>
    busy?: boolean
}>()

const emit = defineEmits<{
    continue: []
}>()

let inputManager: InputManager | null = null
let keepListening = true

const normalizedConfiguration = computed(() => {
    const parsed = CopiesSelectorProcessingNodeConfigurationSchema.safeParse(props.configuration)

    if (parsed.success) {
        return parsed.data
    }

    return {
        increaseInput: null,
        decreaseInput: null,
        validateInput: null,
        maxCopies: 10,
        selectedCopies: 1,
    }
})

const selectedCopies = ref(1)
const maxCopies = computed(() => Math.min(Math.max(normalizedConfiguration.value.maxCopies ?? 10, 1), 50))

function applySelectionToNodeConfiguration() {
    props.configuration.selectedCopies = selectedCopies.value
}

function increaseCopies() {
    if (props.busy) {
        return
    }

    selectedCopies.value = Math.min(selectedCopies.value + 1, maxCopies.value)
}

function decreaseCopies() {
    if (props.busy) {
        return
    }

    selectedCopies.value = Math.max(selectedCopies.value - 1, 1)
}

function validateCopies() {
    if (props.busy) {
        return
    }

    applySelectionToNodeConfiguration()
    emit('continue')
}

function matchesConfiguredInput(input: Input, expectedInput: Input | null | undefined): boolean {
    if (expectedInput === null || expectedInput === undefined) {
        return false
    }

    return inputsEqual(input, expectedInput)
}

async function listenForSelectorInput() {
    if (inputManager === null) {
        return
    }

    while (keepListening && inputManager !== null) {
        const input = await inputManager.waitForInput()

        if (props.busy) {
            continue
        }

        if (matchesConfiguredInput(input, normalizedConfiguration.value.increaseInput)) {
            increaseCopies()
            continue
        }

        if (matchesConfiguredInput(input, normalizedConfiguration.value.decreaseInput)) {
            decreaseCopies()
            continue
        }

        if (matchesConfiguredInput(input, normalizedConfiguration.value.validateInput)) {
            validateCopies()
            return
        }
    }
}

watch(
    () => [normalizedConfiguration.value.selectedCopies, maxCopies.value],
    () => {
        const nextSelectedCopies = normalizedConfiguration.value.selectedCopies ?? 1
        selectedCopies.value = Math.min(Math.max(nextSelectedCopies, 1), maxCopies.value)
        applySelectionToNodeConfiguration()
    },
    { immediate: true },
)

onMounted(() => {
    keepListening = true
    inputManager = new InputManager()
    void listenForSelectorInput()
})

onBeforeUnmount(() => {
    keepListening = false
    inputManager?.destroy()
    inputManager = null
})
</script>

<template>
    <section class="copies-selector-screen">
        <h2>How many copies?</h2>
        <p class="copies-selector-screen__note">Choose the number of copies, then validate to continue.</p>

        <div class="copies-selector-screen__counter">
            <button type="button" :disabled="busy || selectedCopies <= 1" @click="decreaseCopies">
                ◀
            </button>
            <div class="copies-selector-screen__count">{{ selectedCopies }}</div>
            <button type="button" :disabled="busy || selectedCopies >= maxCopies" @click="increaseCopies">
                ▶
            </button>
        </div>

        <button type="button" class="copies-selector-screen__validate" :disabled="busy" @click="validateCopies">
            Validate copies
        </button>
    </section>
</template>

<style scoped>
.copies-selector-screen {
    position: fixed;
    inset: 0;
    display: grid;
    align-content: center;
    justify-items: center;
    gap: var(--space-4);
    padding: var(--space-4);
    background: var(--color-surface);
}

.copies-selector-screen h2 {
    margin: 0;
}

.copies-selector-screen__note {
    margin: 0;
    color: var(--color-text-soft);
}

.copies-selector-screen__counter {
    display: grid;
    grid-template-columns: auto minmax(8rem, 12rem) auto;
    align-items: center;
    gap: var(--space-3);
}

.copies-selector-screen__counter button {
    min-width: 4rem;
    min-height: 4rem;
    font-size: 1.6rem;
}

.copies-selector-screen__count {
    text-align: center;
    font-family: var(--font-family-heading);
    font-size: clamp(2rem, 8vw, 4rem);
    font-weight: 700;
}

.copies-selector-screen__validate {
    min-width: min(24rem, 90vw);
}

@media (max-width: 640px) {
    .copies-selector-screen {
        align-content: stretch;
        justify-content: stretch;
    }

    .copies-selector-screen__counter {
        grid-template-columns: 1fr;
        justify-items: stretch;
    }

    .copies-selector-screen__count {
        order: -1;
    }
}
</style>
