import type { CameraNode } from "./CameraNode"
import type { EntryNode } from "./EntryNode"
import { NodeConfigurationSchema, type NodeConfiguration } from "./Node"
import z from "zod"
import type { ProcessingNode } from "./ProcessingNode"

export const FlowConfigurationSchema = z.object({
    name: z.string().trim().min(1).default("Untitled flow"),
    entryNode: NodeConfigurationSchema,
    cameraNode: NodeConfigurationSchema,
    processingNodesPipeline: z.array(NodeConfigurationSchema)
})

export interface FlowConfiguration {
      name: string
      entryNode: NodeConfiguration
      cameraNode: NodeConfiguration
      processingNodesPipeline: NodeConfiguration[]
}

export interface Flow {
      name: string
      entryNode: EntryNode
      cameraNode: CameraNode
      processingNodesPipeline: ProcessingNode[]
}