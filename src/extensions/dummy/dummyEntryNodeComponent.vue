<script setup lang="ts">
import type { CameraNode } from '@/core/types/CameraNode';

const props = defineProps<{
  cameraNode: CameraNode,
  configuration: Record<string, unknown>
}>()

const emit = defineEmits<{
  (e: 'photosTaken', images: ImageBitmap[]): void
}>()

async function takePhoto() {
    emit('photosTaken', await props.cameraNode.capture());
}

</script>
<template>
    <button @click="takePhoto()">Take photo</button>
</template>