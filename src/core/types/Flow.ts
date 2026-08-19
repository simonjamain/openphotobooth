import type { CameraNode } from "./CameraNode"
import { NodeConfigurationSchema, type NodeConfiguration } from "./Node"
import z from "zod"
import type { ProcessingNode } from "./ProcessingNode"
import { InputSchema, type Input } from "../services/inputManager"

export const FlowConfigurationSchema = z.object({
    name: z.string().trim().min(1).default("Untitled flow"),
    coverImage: z.string().nullish().default(null),
    cameraNode: NodeConfigurationSchema,
    processingNodesPipeline: z.array(NodeConfigurationSchema),
      input: InputSchema.nullish().default(null),
})

export interface FlowConfiguration {
      name: string
      coverImage?: string | null
      cameraNode: NodeConfiguration
      processingNodesPipeline: NodeConfiguration[]
      input?: Input | null
}

export type FlowCameraNode = CameraNode & NodeConfiguration
export type FlowProcessingNode = ProcessingNode & NodeConfiguration

export interface Flow {
      name: string
      cameraNode: FlowCameraNode
      processingNodesPipeline: FlowProcessingNode[]
}