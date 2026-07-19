import { ref, type Ref } from "vue"

import type { App } from "../types/App"



export function useApp() {
    const app:Ref<App>= ref({
        flows: [],
        registeredNodes: {
            entryNodes: [],
            cameraNodes: [],
            processingNodes: [],
        },
    })

    return {
        app
    }
}