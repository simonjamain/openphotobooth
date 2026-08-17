import z from 'zod'
import { InputSchema, type Input } from '@/core/services/inputManager'

export const CopiesSelectorProcessingNodeConfigurationSchema = z.object({
    increaseInput: InputSchema.nullish().default(null),
    decreaseInput: InputSchema.nullish().default(null),
    validateInput: InputSchema.nullish().default(null),
    maxCopies: z.number().int().min(1).max(50).default(10),
    selectedCopies: z.number().int().min(1).max(50).default(1),
})

export interface CopiesSelectorProcessingNodeConfiguration {
    id: string
    configuration: {
        increaseInput?: Input | null
        decreaseInput?: Input | null
        validateInput?: Input | null
        maxCopies?: number
        selectedCopies?: number
    }
}
