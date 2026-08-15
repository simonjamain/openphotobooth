import type { CameraNode } from "./CameraNode"
import type { EntryNode } from "./EntryNode"
import { NodeConfigurationSchema, type NodeConfiguration } from "./Node"
import z from "zod"
import type { ProcessingNode } from "./ProcessingNode"
import { InputSchema, type Input } from "../services/inputManager"

export const FlowConfigurationSchema = z.object({
    name: z.string().trim().min(1).default("Untitled flow"),
    entryNode: NodeConfigurationSchema,
    cameraNode: NodeConfigurationSchema,
    processingNodesPipeline: z.array(NodeConfigurationSchema),
    input: InputSchema.nullish().default(null),
})

export interface FlowConfiguration {
      name: string
      entryNode: NodeConfiguration
      cameraNode: NodeConfiguration
      processingNodesPipeline: NodeConfiguration[]
      input?: Input | null
}

export type FlowEntryNode = EntryNode & NodeConfiguration
export type FlowCameraNode = CameraNode & NodeConfiguration
export type FlowProcessingNode = ProcessingNode & NodeConfiguration

export interface Flow {
      name: string
      entryNode: FlowEntryNode
      cameraNode: FlowCameraNode
      processingNodesPipeline: FlowProcessingNode[]
}