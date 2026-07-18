<script setup lang="ts">
import { useApp } from '@/core/composables/useApp';
import { installAllExtensions } from '@/extensions/extensionsRegistry';

const {app} = useApp();
installAllExtensions(app.value);

//add an hardcoded flow that uses the nodes from the dummy extension

</script>
<template>
    <div>
        <h1>Booth</h1>
        <RouterView />
    </div>
</template>