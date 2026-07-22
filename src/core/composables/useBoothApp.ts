import { ref, watch, watchEffect, type Ref } from "vue"

import type { App } from "../types/App"
import { FlowConfigurationSchema, type FlowConfiguration } from "../types/Flow";

const rawPersistedFlowConfigurations = JSON.parse(localStorage.getItem('boothApp.flowConfigurations') ?? 'null');

const persistedFlowConfigurations: FlowConfiguration[] = FlowConfigurationSchema.array().safeParse(rawPersistedFlowConfigurations).data ?? [];

const boothApp: Ref<App> = ref({
    flowConfigurations: persistedFlowConfigurations,
    registeredNodes: {
        entryNodes: {},
        cameraNodes: {},
        processingNodes: {},
    },
})

/**
 * Persist the boothApp configuration to local storage whenever it changes
 */
watch(boothApp.value.flowConfigurations, () => {
    localStorage.setItem('boothApp.flowConfigurations', JSON.stringify(boothApp.value.flowConfigurations))
})


export function useBoothApp() {

    return {
        boothApp
    }
}