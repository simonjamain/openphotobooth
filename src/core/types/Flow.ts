import type { CameraNode } from "./CameraNode"
import type { EntryNode } from "./EntryNode"
import type { ProcessingNode } from "./ProcessingNode"

export interface Flow {
      entryNode: EntryNode
      cameraNode: CameraNode
      processingNodesPipeline: ProcessingNode[]
}