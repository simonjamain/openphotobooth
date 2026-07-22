import type { ProcessingNode } from "@/core/types/ProcessingNode";
import z from "zod";

export const dummyProcessingNode: ProcessingNode = {
    id: "dummy.processingNode.void",
    name: "no-op processing node",
    async process(images: ImageBitmap[]): Promise<ImageBitmap[]> {
        console.debug("dummyProcessingNode: process called");
        // This is a dummy processing node that does nothing and returns the input images as is.
        return images;
    },
    configurationSchema: z.object({})
};