import type { ProcessingNode } from "@/core/types/ProcessingNode";

export const dummyProcessingNode: ProcessingNode = {
    name: "dummyProcessingNode",
    async process(images: ImageBitmap[]): Promise<ImageBitmap[]> {
        console.debug("dummyProcessingNode: process called");
        // This is a dummy processing node that does nothing and returns the input images as is.
        return images;
    }
};