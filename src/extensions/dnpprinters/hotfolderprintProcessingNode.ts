import type { ProcessingNode } from "@/core/types/ProcessingNode";
import z from "zod";
import hotfolderprintProcessingNodeConfigurationComponent from "./hotfolderprintProcessingNodeConfigurationComponent.vue";

export const hotfolderprintProcessingNode: ProcessingNode = {
    id: "hotfolderprint.processingNode.print",
    name: "Hotfolder Print Processing Node",
    async process(images: ImageBitmap[]): Promise<ImageBitmap[]> {
        console.debug("hotfolderprintProcessingNode: process called");
        // This is a dummy processing node that does nothing and returns the input images as is.
        return images;
    },
    configurationSchema: z.object({
        outputFolderPath: z.string()
    }),
    configurationComponent: hotfolderprintProcessingNodeConfigurationComponent
};