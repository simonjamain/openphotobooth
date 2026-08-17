import type { CameraNode } from "./CameraNode"
import type { EntryNode } from "./EntryNode"
import { NodeConfigurationSchema, type NodeConfiguration } from "./Node"
import z from "zod"
import type { ProcessingNode } from "./ProcessingNode"
import { InputSchema, type Input } from "../services/inputManager"

export const CancelScreenConfigurationSchema = z.object({
      pauseBeforeProcessingNodeIndex: z.number().int().nonnegative().nullish().default(null),
      cancelInput: InputSchema.nullish().default(null),
      continueInput: InputSchema.nullish().default(null),
})

export interface CancelScreenConfiguration {
        pauseBeforeProcessingNodeIndex?: number | null
        cancelInput?: Input | null
        continueInput?: Input | null
}

export const FlowConfigurationSchema = z.object({
    name: z.string().trim().min(1).default("Untitled flow"),
    entryNode: NodeConfigurationSchema,
    cameraNode: NodeConfigurationSchema,
    processingNodesPipeline: z.array(NodeConfigurationSchema),
    input: InputSchema.nullish().default(null),
      cancelScreen: CancelScreenConfigurationSchema.nullish().default({
            pauseBeforeProcessingNodeIndex: null,
            cancelInput: null,
            continueInput: null,
      }),
})

export interface FlowConfiguration {
      name: string
      entryNode: NodeConfiguration
      cameraNode: NodeConfiguration
      processingNodesPipeline: NodeConfiguration[]
      input?: Input | null
      cancelScreen?: CancelScreenConfiguration | null
}

export type FlowEntryNode = EntryNode & NodeConfiguration
export type FlowCameraNode = CameraNode & NodeConfiguration
export type FlowProcessingNode = ProcessingNode & NodeConfiguration

export interface Flow {
      name: string
      entryNode: FlowEntryNode
      cameraNode: FlowCameraNode
      processingNodesPipeline: FlowProcessingNode[]
      cancelScreen?: CancelScreenConfiguration | null
}