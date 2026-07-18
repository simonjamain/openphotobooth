import type {
  ArchiveNodeHandler,
  CameraNodeHandler,
  EntryNodeHandler,
  FlowDefinition,
  PluginRegistry,
  PrintingNodeHandler,
  ProcessingNodeHandler,
} from './contracts'

const entryNodeId = 'entry.single-photo'
const cameraNodeId = 'camera.mocked'
const processingNodeId = 'processing.passthrough'
const archiveNodeId = 'archive.passthrough'
const printingNodeId = 'printing.mocked'

const wait = async (durationMs: number): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, durationMs)
  })
}

const singlePhotoEntryNode: EntryNodeHandler = async () => {
  return {
    sequenceCount: 1,
  }
}

const mockedCameraNode: CameraNodeHandler = async ({ config, sequenceIndex }) => {
  await wait(config.captureDelayMs)

  return {
    photoId: `photo-${Date.now()}-${sequenceIndex}`,
    capturedAtIso: new Date().toISOString(),
    source: config.mockCameraEndpoint,
  }
}

const passthroughProcessingNode: ProcessingNodeHandler = async ({ capture }) => {
  return {
    photoId: capture.photoId,
    processedAtIso: new Date().toISOString(),
    note: 'MVP placeholder: no processing applied',
  }
}

const passthroughArchiveNode: ArchiveNodeHandler = async ({ processed, config }) => {
  return {
    photoId: processed.photoId,
    archivedAtIso: new Date().toISOString(),
    destination: config.mockHotFolderPath,
  }
}

const mockedPrintingNode: PrintingNodeHandler = async ({ archived, config }) => {
  await wait(config.printDelayMs)

  return {
    photoId: archived.photoId,
    printedAtIso: new Date().toISOString(),
    destination: config.mockHotFolderPath,
  }
}

const mvpFlow: FlowDefinition = {
  id: 'mvp-single-photo',
  name: 'Single Photo',
  nodes: {
    entryNodeId,
    cameraNodeId,
    processingNodeIds: [processingNodeId],
    archiveNodeIds: [archiveNodeId],
    printingNodeIds: [printingNodeId],
  },
}

export const mvpRegistry: PluginRegistry = {
  flows: [mvpFlow],
  entryNodes: {
    [entryNodeId]: singlePhotoEntryNode,
  },
  cameraNodes: {
    [cameraNodeId]: mockedCameraNode,
  },
  processingNodes: {
    [processingNodeId]: passthroughProcessingNode,
  },
  archiveNodes: {
    [archiveNodeId]: passthroughArchiveNode,
  },
  printingNodes: {
    [printingNodeId]: mockedPrintingNode,
  },
}
