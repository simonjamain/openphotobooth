<script setup lang="ts">
import type { ApiCameraNodeConfiguration } from './apiCameraNodeConfiguration';

const configuration = defineModel<ApiCameraNodeConfiguration['configuration']>({
  default: () => ({
    apiUrl: 'http://localhost:5513/'
  })
});

</script>
<template>
  <p>
    For more information on how to set up the API, please refer to the <a href="https://www.digicamcontrol.com/doc/userguide/web" target="_blank">digiCamControl web interface documentation</a>
  </p>
  <label>
    <input v-model="configuration.apiUrl" type="text" />
  </label>
</template>