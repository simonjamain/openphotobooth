<script setup lang="ts">
import type { CameraNode } from "@/core/types/CameraNode";
import type { OverlayEntryNodeConfiguration } from "./overlayEntryNodeConfiguration";

const props = defineProps<{
  cameraNode: CameraNode,
  configuration: OverlayEntryNodeConfiguration["configuration"]
}>();

const emit = defineEmits<{
  (e: "photosTaken", images: ImageBitmap[]): void
}>();

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function takeSequence() {
  const capturedImages: ImageBitmap[] = [];
  const photoCount = Math.max(1, Math.floor(props.configuration.photoCount ?? 1));
  const delayMs = Math.max(0, Math.floor(props.configuration.delayMs ?? 1000));

  for (let index = 0; index < photoCount; index += 1) {
    const photo = await props.cameraNode.capture();
    capturedImages.push(...photo);

    if (index < photoCount - 1) {
      await wait(delayMs);
    }
  }

  emit("photosTaken", capturedImages);
}
</script>

<template>
  <div class="overlay-entry-node">
    <button @click="takeSequence">Take sequence</button>
  </div>
</template>

<style scoped>
.overlay-entry-node {
  display: flex;
  align-items: flex-start;
}
</style>
