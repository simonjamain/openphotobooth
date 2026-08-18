<script setup lang="ts">
import { onMounted } from 'vue';
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

onMounted(() => {
  void takePhoto();
});

</script>
<template>
    <div>{{ $t('dummyEntryNode.smile') }}</div>
</template>