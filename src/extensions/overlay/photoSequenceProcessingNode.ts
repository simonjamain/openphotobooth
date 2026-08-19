import type { ProcessingNode } from "@/core/types/ProcessingNode";
import { markRaw } from "vue";
import z from "zod";
import photoSequenceEntryNodeComponent from "./photoSequenceEntryNodeComponent.vue";
import photoSequenceEntryNodeConfigurationComponent from "./photoSequenceEntryNodeConfigurationComponent.vue";

export const photoSequenceProcessingNode: ProcessingNode = {
    id: "overlay.processingNode.sequence",
    name: "Overlay photo sequence",
    async process(images: Readonly<ImageBitmap[]>): Promise<ImageBitmap[]> {
        return [...images];
    },
    runtimeComponent: markRaw(photoSequenceEntryNodeComponent),
    configurationSchema: z.object({
        photoCount: z.number().int().min(1),
        delayMs: z.number().int().min(0)
    }),
    configurationComponent: markRaw(photoSequenceEntryNodeConfigurationComponent)
};
