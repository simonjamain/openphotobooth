import { ref, type Ref } from "vue"

import type { App } from "../types/App"

const boothApp: Ref<App> = ref({
    flows: [],
    registeredNodes: {
        entryNodes: [],
        cameraNodes: [],
        processingNodes: [],
    },
})


export function useBoothApp() {

    return {
        boothApp
    }
}