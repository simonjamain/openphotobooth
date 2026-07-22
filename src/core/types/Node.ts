import z from "zod"

export const NodeConfigurationSchema = z.object({
    id: z.string(),
    configuration: z.object()
})

export type NodeConfiguration = z.infer<typeof NodeConfigurationSchema>

export interface Node {
    id: string
    name: string
    configurationSchema: z.ZodType
}
