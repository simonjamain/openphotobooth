<script setup lang="ts">
import { ref } from "vue";
import type { CameraNode } from "@/core/types/CameraNode";

const props = defineProps<{
  cameraNode: CameraNode
}>();

const emit = defineEmits<{
  (e: "photosTaken", images: ImageBitmap[]): void
}>();

const count = ref(1);
const delayMs = ref(1000);

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function takeSequence() {
  const capturedImages: ImageBitmap[] = [];

  for (let index = 0; index < count.value; index += 1) {
    const photo = await props.cameraNode.capture();
    capturedImages.push(...photo);

    if (index < count.value - 1) {
      await wait(delayMs.value);
    }
  }

  emit("photosTaken", capturedImages);
}
</script>

<template>
  <div class="overlay-entry-node">
    <label class="overlay-entry-node__field">
      <span>Number of photos</span>
      <input v-model.number="count" type="number" min="1" step="1" />
    </label>

    <label class="overlay-entry-node__field">
      <span>Delay between photos (ms)</span>
      <input v-model.number="delayMs" type="number" min="0" step="100" />
    </label>

    <button @click="takeSequence">Take sequence</button>
  </div>
</template>

<style scoped>
.overlay-entry-node {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.overlay-entry-node__field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style>
