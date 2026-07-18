import { z } from 'zod'

const delaySchema = z
  .number({
    error: 'Delay must be a number.',
  })
  .int('Delay must be an integer.')
  .min(0, 'Delay must be 0 or greater.')
  .max(15_000, 'Delay must be 15000ms or lower.')

export const boothConfigSchema = z.object({
  captureDelayMs: delaySchema,
  printDelayMs: delaySchema,
  mockCameraEndpoint: z.string().trim().min(1, 'Camera endpoint is required.'),
  mockHotFolderPath: z.string().trim().min(1, 'Hot folder path is required.'),
})

export type BoothConfigInput = z.input<typeof boothConfigSchema>
export type BoothConfigValidated = z.output<typeof boothConfigSchema>
