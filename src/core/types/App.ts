import type { CameraNode } from "./CameraNode"
import type { EntryNode } from "./EntryNode"
import type { Flow, FlowConfiguration } from "./Flow"
import type { ProcessingNode } from "./ProcessingNode"

export interface App {
    flowConfigurations: FlowConfiguration[]
    registeredNodes: {
        entryNodes: Record<string, EntryNode>
        cameraNodes: Record<string, CameraNode>
        processingNodes: Record<string, ProcessingNode>
    }
}