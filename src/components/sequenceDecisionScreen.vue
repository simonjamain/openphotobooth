<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { InputManager, inputsEqual, type Input } from '@/core/services/inputManager';

const props = defineProps<{
    images: Readonly<ImageBitmap[]>;
    cancelInput?: Input | null;
    continueInput?: Input | null;
    busy?: boolean;
}>();

const emit = defineEmits<{
    cancel: [];
    continue: [];
}>();

let inputManager: InputManager | null = null;
let keepListening = true;
const activePreviewIndex = ref(0);

function imageBitmapToDataUrl(imageBitmap: ImageBitmap): string {
    const canvas = document.createElement('canvas');
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;

    const context = canvas.getContext('2d');
    if (context === null) {
        return '';
    }

    context.drawImage(imageBitmap, 0, 0);
    return canvas.toDataURL('image/jpeg');
}

const imagePreviews = computed(() => props.images
    .map((imageBitmap) => imageBitmapToDataUrl(imageBitmap))
    .filter((preview) => preview !== ''));
const activePreview = computed(() => imagePreviews.value[activePreviewIndex.value] ?? null);
const hasMultiplePreviews = computed(() => imagePreviews.value.length > 1);

function stopInputListening() {
    keepListening = false;
    inputManager?.destroy();
    inputManager = null;
}

function matchesConfiguredInput(input: Input, expectedInput: Input | null | undefined): boolean {
    if (expectedInput === null || expectedInput === undefined) {
        return false;
    }

    return inputsEqual(input, expectedInput);
}

async function listenForDecisionInput() {
    if (inputManager === null) {
        return;
    }

    while (keepListening && inputManager !== null) {
        const input = await inputManager.waitForInput();

        if (props.busy) {
            continue;
        }

        if (matchesConfiguredInput(input, props.cancelInput)) {
            emit('cancel');
            return;
        }

        if (matchesConfiguredInput(input, props.continueInput)) {
            emit('continue');
            return;
        }
    }
}

function selectPreview(previewIndex: number) {
    activePreviewIndex.value = previewIndex;
}

watch(
    () => imagePreviews.value.length,
    (length) => {
        if (length === 0) {
            activePreviewIndex.value = 0;
            return;
        }

        if (activePreviewIndex.value >= length) {
            activePreviewIndex.value = 0;
        }
    },
    { immediate: true },
);

onMounted(() => {
    keepListening = true;
    inputManager = new InputManager();
    void listenForDecisionInput();
});

onBeforeUnmount(() => {
    stopInputListening();
});
</script>

<template>
    <section class="decision-screen">
        <section class="decision-screen__stage">
            <header class="decision-screen__header">
                <h2>Confirm this sequence</h2>
                <p>Review the photo(s), then cancel or continue to print.</p>
            </header>

            <div class="decision-screen__hero">
                <img
                    v-if="activePreview !== null"
                    :src="activePreview"
                    :alt="`Selected captured photo ${activePreviewIndex + 1}`"
                >
                <p v-else class="decision-screen__empty-preview">
                    Preview unavailable, but the captured image(s) are ready.
                </p>
            </div>

            <nav v-if="hasMultiplePreviews" class="decision-screen__filmstrip" aria-label="Captured photos">
                <button
                    v-for="(imagePreview, imageIndex) in imagePreviews"
                    :key="imageIndex"
                    type="button"
                    class="decision-screen__thumbnail"
                    :class="{ 'is-active': imageIndex === activePreviewIndex }"
                    :aria-current="imageIndex === activePreviewIndex"
                    :disabled="busy"
                    @click="selectPreview(imageIndex)"
                >
                    <img :src="imagePreview" :alt="`Captured photo ${imageIndex + 1}`">
                </button>
            </nav>
        </section>

        <aside class="decision-screen__actions-panel">
            <p class="decision-screen__badge">{{ imagePreviews.length }} photo(s)</p>
            <p class="decision-screen__help">Continue to print this sequence, or cancel and return to flow selection.</p>

            <div class="decision-screen__actions">
                <button type="button" class="decision-screen__cancel" :disabled="busy" @click="$emit('cancel')">
                    Cancel
                </button>
                <button type="button" :disabled="busy" @click="$emit('continue')">
                    Print
                </button>
            </div>
        </aside>
    </section>
</template>

<style scoped>
.decision-screen {
    position: fixed;
    inset: 0;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(18rem, 24rem);
    gap: var(--space-4);
    padding: var(--space-4);
    background: var(--color-surface);
}

.decision-screen__stage {
    min-width: 0;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    gap: var(--space-3);
}

.decision-screen__header h2 {
    margin: 0;
}

.decision-screen__header p {
    margin: var(--space-2) 0 0;
    color: var(--color-text-soft);
}

.decision-screen__hero {
    min-height: 0;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background:
        radial-gradient(circle at 20% 18%, color-mix(in srgb, var(--color-primary) 14%, transparent) 0%, transparent 48%),
        var(--color-surface-muted);
    display: grid;
    place-items: center;
    padding: var(--space-3);
    overflow: hidden;
}

.decision-screen__hero img {
    width: min(100%, 1000px);
    height: min(100%, 72vh);
    object-fit: contain;
    border-radius: var(--radius-sm);
}

.decision-screen__empty-preview {
    margin: var(--space-2);
    color: var(--color-text-soft);
    text-align: center;
}

.decision-screen__filmstrip {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(4.8rem, 6.2rem));
    gap: var(--space-2);
    align-content: start;
    max-height: 22vh;
    overflow: auto;
    padding-bottom: var(--space-1);
}

.decision-screen__thumbnail {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-surface-muted);
    padding: 0;
    overflow: hidden;
    aspect-ratio: 3 / 2;
}

.decision-screen__thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.decision-screen__thumbnail.is-active {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary) 24%, white);
}

.decision-screen__actions-panel {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface-muted);
    padding: var(--space-4);
    display: grid;
    align-content: start;
    gap: var(--space-3);
}

.decision-screen__badge {
    margin: 0;
    display: inline-flex;
    width: fit-content;
    border-radius: 999px;
    padding: 0.25rem 0.65rem;
    border: 1px solid var(--color-border-strong);
    color: var(--color-text-soft);
    background: var(--color-surface);
    font-weight: 600;
}

.decision-screen__help {
    margin: 0;
    color: var(--color-text-soft);
}

.decision-screen__actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
}

.decision-screen__cancel {
    background: var(--color-danger);
    color: var(--color-danger-foreground);
}

.decision-screen__cancel:hover {
    background: var(--color-danger-hover);
}

@media (max-width: 900px) {
    .decision-screen {
        grid-template-columns: 1fr;
        grid-template-rows: minmax(0, 1fr) auto;
    }

    .decision-screen__hero img {
        height: min(52vh, 100%);
    }

    .decision-screen__actions-panel {
        gap: var(--space-2);
    }

    .decision-screen__actions {
        flex-direction: row;
        flex-wrap: wrap;
    }
}

@media (max-width: 640px) {
    .decision-screen {
        padding: var(--space-3);
    }

    .decision-screen__filmstrip {
        grid-template-columns: repeat(auto-fit, minmax(4rem, 5rem));
        max-height: 18vh;
    }

    .decision-screen__actions {
        flex-direction: column;
    }
}
</style>