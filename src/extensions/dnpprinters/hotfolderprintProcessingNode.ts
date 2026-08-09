import type { ProcessingNode } from "@/core/types/ProcessingNode";
import z from "zod";
import hotfolderprintProcessingNodeConfigurationComponent from "./hotfolderprintProcessingNodeConfigurationComponent.vue";
import { markRaw } from "vue";
import type { HotfolderprintProcessingNodeConfiguration } from "./hotfolderprintProcessingNodeConfiguration.ts";
import { imageBitmapToBlob } from "./helpers.ts";

export const hotfolderprintProcessingNode: ProcessingNode = {
    id: "hotfolderprint.processingNode.print",
    name: "Hotfolder Print Processing Node",
    async process(this: HotfolderprintProcessingNodeConfiguration, images: ImageBitmap[]): Promise<ImageBitmap[]> {
        console.debug("hotfolderprintProcessingNode: process called");
        if(this.configuration.outputFolderDirectoryHandle === null) {
            console.error("hotfolderprintProcessingNode: outputFolderDirectoryHandle is null");
            throw new Error("outputFolderDirectoryHandle is null");
        }

        for(const image of images) {
            console.debug(`hotfolderprintProcessingNode: image width: ${image.width}, height: ${image.height}`);
            const filename = `image_${Date.now()}.jpg`;
            const handle =await (await this.configuration.outputFolderDirectoryHandle.getFileHandle(filename, { create: true })).createWritable()
            handle.write(await imageBitmapToBlob(image));
            handle.close();
        }
        return images;
    },
    configurationSchema: z.object({
        outputFolderDirectoryHandle: z.any().nullable()
    }),
    configurationComponent: markRaw(hotfolderprintProcessingNodeConfigurationComponent)
};