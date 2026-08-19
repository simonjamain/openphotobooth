<script setup lang="ts">
import { onMounted } from 'vue';
import type { CameraNode } from '@/core/types/CameraNode';

const props = defineProps<{
  images: Readonly<ImageBitmap[]>,
  configuration: Record<string, unknown>,
  cameraNode: CameraNode,
  busy?: boolean,
}>()

const emit = defineEmits<{
  cancel: []
  continue: [images: ImageBitmap[]]
}>()

async function takePhoto() {
    emit('continue', await props.cameraNode.capture());
}

onMounted(() => {
  void takePhoto();
});

</script>
<template>
    <div>{{ $t('dummyEntryNode.smile') }}</div>
</template>