import type { CameraNode } from "./CameraNode"
import type { EntryNode } from "./EntryNode"
import type { Flow } from "./Flow"
import type { ProcessingNode } from "./ProcessingNode"

export interface App {
    flows: Flow[]
    registeredNodes: {
        entryNodes: EntryNode[]
        cameraNodes: CameraNode[]
        processingNodes: ProcessingNode[]
    }
}