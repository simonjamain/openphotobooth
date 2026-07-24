import type { Component } from "vue"
import z from "zod"

export const NodeConfigurationSchema = z.object({
    id: z.string(),
    configuration: z.record(z.string(),z.any())
})

export type NodeConfiguration = z.infer<typeof NodeConfigurationSchema>

export interface Node {
    id: string
    name: string
    configurationSchema: z.ZodType
    configurationComponent?: Component
}
