import z from 'zod'
import { InputSchema, type Input } from '@/core/services/inputManager'

export const CancellationDecisionProcessingNodeConfigurationSchema = z.object({
    cancelInput: InputSchema.nullish().default(null),
    continueInput: InputSchema.nullish().default(null),
})

export interface CancellationDecisionProcessingNodeConfiguration {
    id: string
    configuration: {
        cancelInput?: Input | null
        continueInput?: Input | null
    }
}
