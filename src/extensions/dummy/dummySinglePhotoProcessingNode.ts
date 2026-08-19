import type { ProcessingNode } from "@/core/types/ProcessingNode";
import dummyEntryNodeComponent from './dummyEntryNodeComponent.vue';
import { markRaw } from "vue";
import z from "zod";

export const dummySinglePhotoProcessingNode: ProcessingNode = {
    id: "dummy.processingNode.singlePhoto",
    name: "single photo capture",
    async process(images: Readonly<ImageBitmap[]>): Promise<ImageBitmap[]> {
        return [...images];
    },
    runtimeComponent: markRaw(dummyEntryNodeComponent),
    configurationSchema: z.object({})
}
