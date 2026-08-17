import type { Extension } from '@/core/types/Extension'
import { cancellationDecisionProcessingNode } from './cancellationDecisionProcessingNode'
import { copiesSelectorProcessingNode } from './copiesSelectorProcessingNode'

export const basicsExtension: Extension = {
    registerNodes(app) {
        app.registeredNodes.processingNodes[cancellationDecisionProcessingNode.id] = cancellationDecisionProcessingNode
        app.registeredNodes.processingNodes[copiesSelectorProcessingNode.id] = copiesSelectorProcessingNode
    },
}
