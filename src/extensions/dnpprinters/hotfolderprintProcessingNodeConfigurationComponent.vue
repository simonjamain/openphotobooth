<script setup lang="ts">
import { ref, watch } from 'vue';
import type { HotfolderprintProcessingNodeConfiguration } from './hotfolderprintProcessingNodeConfiguration';

//https://developer.chrome.com/blog/persistent-permissions-for-the-file-system-access-api

const configuration = defineModel<HotfolderprintProcessingNodeConfiguration['configuration']>('configuration', {
  default: () => ({
    outputFolderDirectoryHandle: null
  })
});

const permissionsNeeded = ref(false);

async function updatePermissionState() {
  const outputFolderHandle = configuration.value.outputFolderDirectoryHandle;

  if (outputFolderHandle === null || undefined) {
    permissionsNeeded.value = false;
    return;
  }

  const permissionState = await outputFolderHandle.queryPermission({ mode: 'readwrite' });
  permissionsNeeded.value = permissionState !== 'granted';
}

async function requestPermission() {
  const outputFolderHandle = configuration.value.outputFolderDirectoryHandle;

  if (outputFolderHandle === null) {
    return;
  }

  const requestedPermissionState = await outputFolderHandle.requestPermission({ mode: 'readwrite' });
  permissionsNeeded.value = requestedPermissionState !== 'granted';
}

async function selectOutputFolder() {
  const outputFolderHandle = await window.showDirectoryPicker({
    mode: 'readwrite',
  });

  configuration.value.outputFolderDirectoryHandle = outputFolderHandle;
  await updatePermissionState();
}

watch(
  () => configuration.value.outputFolderDirectoryHandle,
  async () => {
    await updatePermissionState();
  },
  { immediate: true }
);

</script>
<template>
  <p>
    Specify the output folder path for the hotfolder print processing node, see: <a href="https://dnpphoto.eu/product/software-solutions/hot-folder-print/" target="_blank">Hot Folder Print</a>.
  </p>
  <label>
    <button @click="selectOutputFolder">📁 select output folder</button>
    <button v-if="permissionsNeeded" @click="requestPermission">🔐 request permission</button>
  </label>
</template>