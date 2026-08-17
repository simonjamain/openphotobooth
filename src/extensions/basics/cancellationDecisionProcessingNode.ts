import { markRaw } from 'vue'
import type { ProcessingNode } from '@/core/types/ProcessingNode'
import { i18n } from '@/i18n'
import { CancellationDecisionProcessingNodeConfigurationSchema, type CancellationDecisionProcessingNodeConfiguration } from './cancellationDecisionProcessingNodeConfiguration'
import cancellationDecisionProcessingNodeRuntimeComponent from './cancellationDecisionProcessingNodeRuntimeComponent.vue'
import cancellationDecisionProcessingNodeConfigurationComponent from './cancellationDecisionProcessingNodeConfigurationComponent.vue'

export const cancellationDecisionProcessingNode: ProcessingNode = {
    id: 'basics.processingNode.cancellationDecision',
    name: i18n.global.t('cancellationNode.nodeName'),
    configurationSchema: CancellationDecisionProcessingNodeConfigurationSchema,
    configurationComponent: markRaw(cancellationDecisionProcessingNodeConfigurationComponent),
    runtimeComponent: markRaw(cancellationDecisionProcessingNodeRuntimeComponent),
    async process(this: CancellationDecisionProcessingNodeConfiguration, images: Readonly<ImageBitmap[]>): Promise<ImageBitmap[]> {
        return [...images]
    },
}
