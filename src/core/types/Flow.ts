import type { CameraNode } from "./CameraNode"
import type { EntryNode } from "./EntryNode"
import { NodeConfigurationSchema, type NodeConfiguration } from "./Node"
import z from "zod"
import type { ProcessingNode } from "./ProcessingNode"

export const FlowConfigurationSchema = z.object({
    entryNode: NodeConfigurationSchema,
    cameraNode: NodeConfigurationSchema,
    processingNodesPipeline: z.array(NodeConfigurationSchema)
})

export interface FlowConfiguration {
      entryNode: NodeConfiguration
      cameraNode: NodeConfiguration
      processingNodesPipeline: NodeConfiguration[]
}

export interface Flow {
      entryNode: EntryNode
      cameraNode: CameraNode
      processingNodesPipeline: ProcessingNode[]
}