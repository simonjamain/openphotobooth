<script setup lang="ts">
import type { HotfolderprintProcessingNodeConfiguration } from './hotfolderprintProcessingNodeConfiguration';

//https://developer.chrome.com/blog/persistent-permissions-for-the-file-system-access-api

const configuration = defineModel<HotfolderprintProcessingNodeConfiguration['configuration']>('configuration', {
  default: () => ({
    outputFolderDirectoryHandle: null
  })
});

async function selectOutputFolder(event: Event) {
  const outputFolderHandle = await window.showDirectoryPicker();
  configuration.value.outputFolderDirectoryHandle = outputFolderHandle;
}

</script>
<template>
  <p>
    Specify the output folder path for the hotfolder print processing node, see: <a href="https://dnpphoto.eu/product/software-solutions/hot-folder-print/" target="_blank">Hot Folder Print</a>.
  </p>
  <label>
    <button @click="selectOutputFolder">select output folder</button>
  </label>
</template>