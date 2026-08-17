<script setup lang="ts">
import { computed } from 'vue'
import cancellationDecisionScreen from './cancellationDecisionScreen.vue'
import { CancellationDecisionProcessingNodeConfigurationSchema } from './cancellationDecisionProcessingNodeConfiguration'

const props = defineProps<{
    images: Readonly<ImageBitmap[]>
    configuration: Record<string, unknown>
    busy?: boolean
}>()

const emit = defineEmits<{
    cancel: []
    continue: []
}>()

const normalizedConfiguration = computed(() => {
    const parsed = CancellationDecisionProcessingNodeConfigurationSchema.safeParse(props.configuration)

    if (parsed.success) {
        return parsed.data
    }

    return {
        cancelInput: null,
        continueInput: null,
    }
})
</script>

<template>
    <cancellationDecisionScreen
        :images="images"
        :cancelInput="normalizedConfiguration.cancelInput"
        :continueInput="normalizedConfiguration.continueInput"
        :busy="busy"
        @cancel="emit('cancel')"
        @continue="emit('continue')"
    />
</template>
