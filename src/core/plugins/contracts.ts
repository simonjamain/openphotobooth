export type NodeKind = 'entry' | 'camera' | 'processing' | 'archive' | 'printing'

export interface BoothConfig {
  captureDelayMs: number
  printDelayMs: number
  mockCameraEndpoint: string
  mockHotFolderPath: string
}

export interface EntryPayload {
  sequenceCount: number
}

export interface CapturePayload {
  photoId: string
  capturedAtIso: string
  source: string
}

export interface ProcessedPayload {
  photoId: string
  processedAtIso: string
  note: string
}

export interface ArchivedPayload {
  photoId: string
  archivedAtIso: string
  destination: string
}

export interface PrintPayload {
  photoId: string
  printedAtIso: string
  destination: string
}

export type EntryNodeHandler = (input: { flowId: string; config: BoothConfig }) => Promise<EntryPayload>

export type CameraNodeHandler = (input: {
  flowId: string
  sequenceIndex: number
  config: BoothConfig
}) => Promise<CapturePayload>

export type ProcessingNodeHandler = (input: {
  flowId: string
  capture: CapturePayload
  config: BoothConfig
}) => Promise<ProcessedPayload>

export type ArchiveNodeHandler = (input: {
  flowId: string
  processed: ProcessedPayload
  config: BoothConfig
}) => Promise<ArchivedPayload>

export type PrintingNodeHandler = (input: {
  flowId: string
  archived: ArchivedPayload
  config: BoothConfig
}) => Promise<PrintPayload>

export interface FlowNodes {
  entryNodeId: string
  cameraNodeId: string
  processingNodeIds: string[]
  archiveNodeIds: string[]
  printingNodeIds: string[]
}

export interface FlowDefinition {
  id: string
  name: string
  nodes: FlowNodes
}

export interface PluginRegistry {
  flows: FlowDefinition[]
  entryNodes: Record<string, EntryNodeHandler>
  cameraNodes: Record<string, CameraNodeHandler>
  processingNodes: Record<string, ProcessingNodeHandler>
  archiveNodes: Record<string, ArchiveNodeHandler>
  printingNodes: Record<string, PrintingNodeHandler>
}
