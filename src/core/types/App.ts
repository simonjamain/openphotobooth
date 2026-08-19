import type { CameraNode } from "./CameraNode"
import type { FlowConfiguration } from "./Flow"
import type { ProcessingNode } from "./ProcessingNode"

export interface App {
    flowConfigurations: FlowConfiguration[]
    registeredNodes: {
        cameraNodes: Record<string, CameraNode>
        processingNodes: Record<string, ProcessingNode>
    }
}