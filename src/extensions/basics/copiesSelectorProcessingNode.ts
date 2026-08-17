import { markRaw } from 'vue'
import type { ProcessingNode } from '@/core/types/ProcessingNode'
import { i18n } from '@/i18n'
import {
    CopiesSelectorProcessingNodeConfigurationSchema,
    type CopiesSelectorProcessingNodeConfiguration,
} from './copiesSelectorProcessingNodeConfiguration'
import copiesSelectorProcessingNodeRuntimeComponent from './copiesSelectorProcessingNodeRuntimeComponent.vue'
import copiesSelectorProcessingNodeConfigurationComponent from './copiesSelectorProcessingNodeConfigurationComponent.vue'

export const copiesSelectorProcessingNode: ProcessingNode = {
    id: 'basics.processingNode.copiesSelector',
    name: i18n.global.t('copiesSelector.nodeName'),
    configurationSchema: CopiesSelectorProcessingNodeConfigurationSchema,
    configurationComponent: markRaw(copiesSelectorProcessingNodeConfigurationComponent),
    runtimeComponent: markRaw(copiesSelectorProcessingNodeRuntimeComponent),
    async process(this: CopiesSelectorProcessingNodeConfiguration, images: Readonly<ImageBitmap[]>): Promise<ImageBitmap[]> {
        const maxCopies = Math.min(Math.max(this.configuration.maxCopies ?? 10, 1), 50)
        const selectedCopies = Math.min(Math.max(this.configuration.selectedCopies ?? 1, 1), maxCopies)

        const duplicatedImages: ImageBitmap[] = []
        for (let copyIndex = 0; copyIndex < selectedCopies; copyIndex += 1) {
            duplicatedImages.push(...images)
        }

        return duplicatedImages
    },
}
