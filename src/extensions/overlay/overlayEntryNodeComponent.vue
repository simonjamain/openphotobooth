<script setup lang="ts">
import { onMounted } from "vue";
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
      await wait(delayMs);
    const photo = await props.cameraNode.capture();
    capturedImages.push(...photo);
  }

  emit("photosTaken", capturedImages);
}

onMounted(() => {
  void takeSequence();
});
</script>

<template>
  <div>
    smile !
  </div>
</template>