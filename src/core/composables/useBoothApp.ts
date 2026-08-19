import { ref, watch, type Ref, toRaw } from "vue"

import { boothAppDatabase, type AppConfigRecord } from "../persistence/boothAppDatabase"
import type { App } from "../types/App"
import { FlowConfigurationSchema, type FlowConfiguration } from "../types/Flow"

const FLOW_CONFIGURATIONS_STORAGE_KEY = "flowConfigurations"

const boothApp: Ref<App> = ref({
    flowConfigurations: [],
    registeredNodes: {
        cameraNodes: {},
        processingNodes: {},
    },
})

/**
 * Persist the boothApp flow configurations to IndexedDB whenever they change.
 */
watch(
    () => boothApp.value.flowConfigurations,
    async (flowConfigurations) => {
        try {
            await boothAppDatabase.appConfig.put({
                key: FLOW_CONFIGURATIONS_STORAGE_KEY,
                value: toRaw(flowConfigurations),
            })
        }
        catch (error) {
            console.error("Unable to persist flow configurations in IndexedDB", error)
        }
    },
    {
        deep: true,
    },
)

async function hydrateFlowConfigurations(): Promise<void> {
    let persistedAppConfigRecord: AppConfigRecord | undefined

    try {
        persistedAppConfigRecord = await boothAppDatabase.appConfig.get(FLOW_CONFIGURATIONS_STORAGE_KEY)
    }
    catch (error) {
        console.error("Unable to read flow configurations from IndexedDB", error)
        return
    }

    const parsedPersistedFlowConfigurations = FlowConfigurationSchema.array().safeParse(persistedAppConfigRecord?.value)

    if (parsedPersistedFlowConfigurations.success) {
        boothApp.value.flowConfigurations = parsedPersistedFlowConfigurations.data
    }
}

void hydrateFlowConfigurations()


export function useBoothApp() {
    return {
        boothApp
    }
}