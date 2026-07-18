import type {
  ArchivedPayload,
  BoothConfig,
  CapturePayload,
  EntryPayload,
  FlowDefinition,
  PluginRegistry,
  PrintPayload,
  ProcessedPayload,
} from '@/core/plugins/contracts'

const findFlow = (registry: PluginRegistry, flowId: string): FlowDefinition => {
  const flow = registry.flows.find((candidate) => candidate.id === flowId)

  if (!flow) {
    throw new Error(`Flow "${flowId}" does not exist.`)
  }

  return flow
}

const getFirstNodeId = (nodeIds: string[], kind: string): string => {
  const nodeId = nodeIds[0]

  if (!nodeId) {
    throw new Error(`${kind} node list is empty.`)
  }

  return nodeId
}

export interface BoothOrchestrator {
  runEntry(flowId: string, config: BoothConfig): Promise<EntryPayload>
  runCapture(flowId: string, config: BoothConfig): Promise<CapturePayload>
  runProcessing(
    flowId: string,
    capture: CapturePayload,
    config: BoothConfig,
  ): Promise<ProcessedPayload>
  runArchive(
    flowId: string,
    processed: ProcessedPayload,
    config: BoothConfig,
  ): Promise<ArchivedPayload>
  runPrinting(flowId: string, archived: ArchivedPayload, config: BoothConfig): Promise<PrintPayload>
}

export const createBoothOrchestrator = (registry: PluginRegistry): BoothOrchestrator => {
  return {
    async runEntry(flowId, config) {
      const flow = findFlow(registry, flowId)
      const handler = registry.entryNodes[flow.nodes.entryNodeId]

      if (!handler) {
        throw new Error('Entry node handler is missing.')
      }

      return handler({ flowId, config })
    },

    async runCapture(flowId, config) {
      const flow = findFlow(registry, flowId)
      const handler = registry.cameraNodes[flow.nodes.cameraNodeId]

      if (!handler) {
        throw new Error('Camera node handler is missing.')
      }

      return handler({
        flowId,
        sequenceIndex: 0,
        config,
      })
    },

    async runProcessing(flowId, capture, config) {
      const flow = findFlow(registry, flowId)
      const nodeId = getFirstNodeId(flow.nodes.processingNodeIds, 'Processing')
      const handler = registry.processingNodes[nodeId]

      if (!handler) {
        throw new Error('Processing node handler is missing.')
      }

      return handler({ flowId, capture, config })
    },

    async runArchive(flowId, processed, config) {
      const flow = findFlow(registry, flowId)
      const nodeId = getFirstNodeId(flow.nodes.archiveNodeIds, 'Archive')
      const handler = registry.archiveNodes[nodeId]

      if (!handler) {
        throw new Error('Archive node handler is missing.')
      }

      return handler({ flowId, processed, config })
    },

    async runPrinting(flowId, archived, config) {
      const flow = findFlow(registry, flowId)
      const nodeId = getFirstNodeId(flow.nodes.printingNodeIds, 'Printing')
      const handler = registry.printingNodes[nodeId]

      if (!handler) {
        throw new Error('Printing node handler is missing.')
      }

      return handler({ flowId, archived, config })
    },
  }
}
