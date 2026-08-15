<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import type { CameraNode } from "@/core/types/CameraNode";
import type { PhotoSequenceEntryNodeConfiguration } from "./photoSequenceEntryNodeConfiguration";

const props = defineProps<{
  cameraNode: CameraNode,
  configuration: PhotoSequenceEntryNodeConfiguration["configuration"]
}>();

const emit = defineEmits<{
  (e: "photosTaken", images: ImageBitmap[]): void
}>();

const currentPhotoNumber = ref(1);
const totalPhotoCount = ref(1);
const countdownValue = ref<number | null>(null);
const captureState = ref<"countdown" | "capturing" | "done">("countdown");
let cancelled = false;

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function runCountdown(delayMs: number) {
  if (delayMs <= 0) {
    countdownValue.value = null;
    return;
  }

  const startedAt = performance.now();

  while (!cancelled) {
    const elapsedMs = performance.now() - startedAt;
    const remainingMs = Math.max(0, delayMs - elapsedMs);
    countdownValue.value = Math.max(1, Math.ceil(remainingMs / 1000));

    if (remainingMs <= 0) {
      countdownValue.value = null;
      return;
    }

    await wait(Math.min(100, remainingMs));
  }
}

async function takeSequence() {
  const capturedImages: ImageBitmap[] = [];
  const photoCount = props.configuration.photoCount;
  const delayMs = props.configuration.delayMs;
  totalPhotoCount.value = photoCount;

  for (let index = 0; index < photoCount; index += 1) {
    if (cancelled) {
      return;
    }

    currentPhotoNumber.value = index + 1;
    captureState.value = "countdown";
    await runCountdown(delayMs);

    if (cancelled) {
      return;
    }

    captureState.value = "capturing";
    const photo = await props.cameraNode.capture();
    capturedImages.push(...photo);
  }

  captureState.value = "done";

  if (cancelled) {
    return;
  }

  emit("photosTaken", capturedImages);
}

onMounted(() => {
  void takeSequence();
});

onBeforeUnmount(() => {
  cancelled = true;
});
</script>

<template>
  <div class="sequence-capture">
    <p class="sequence-capture__progress">Photo {{ currentPhotoNumber }} / {{ totalPhotoCount }}</p>
    <p v-if="captureState === 'countdown' && countdownValue !== null" class="sequence-capture__countdown">
      {{ countdownValue }}
    </p>
    <p v-else-if="captureState === 'capturing'" class="sequence-capture__hint">Smile!</p>
    <p v-else class="sequence-capture__hint">Processing...</p>
  </div>
</template>

<style scoped>
.sequence-capture {
  position: fixed;
  inset: 0;
  display: grid;
  place-content: center;
  gap: var(--space-3);
  text-align: center;
  background: var(--color-surface);
}

.sequence-capture__progress {
  margin: 0;
  color: var(--color-text-soft);
  font-size: clamp(1rem, 2.8vw, 5rem);
}

.sequence-capture__countdown {
  margin: 0;
  font-family: var(--font-family-heading);
  /* font-size: 20rem; */
  font-size: clamp(25vw, 10rem , 50vw);
  line-height: 1;
  color: var(--color-primary);
  font-weight: 700;
  animation: countdown-pulse 300ms ease-in-out infinite;
}

.sequence-capture__hint {
  margin: 0;
  font-family: var(--font-family-heading);
  font-size: clamp(2rem, 8vw, 4rem);
  color: var(--color-text);
}

@keyframes countdown-pulse {
  0% {
    transform: scale(1.01);
    opacity: 1;
  }

  50% {
    transform: scale(0.99);
    opacity: 0.5;
  }

  100% {
    transform: scale(1.01);
    opacity: 1;
  }
}
</style>