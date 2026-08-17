import type { Extension } from '@/core/types/Extension'
import { cancellationDecisionProcessingNode } from './cancellationDecisionProcessingNode'

export const basicsExtension: Extension = {
    registerNodes(app) {
        app.registeredNodes.processingNodes[cancellationDecisionProcessingNode.id] = cancellationDecisionProcessingNode
    },
}
