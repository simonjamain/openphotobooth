import type { CameraNode } from "@/core/types/CameraNode";
import z from "zod";

const dummyCameraPictureUrl = new URL("./dummyCameraPicture.jpg", import.meta.url).href;

export const dummyCameraNode: CameraNode = {
    id: "dummy.cameraNode.lena",
    name: "dummyCameraNode Lena",
    async capture(): Promise<ImageBitmap[]> {
        console.debug("dummyCameraNode: capture called");
        const response = await fetch(dummyCameraPictureUrl);
        const blob = await response.blob();
        const imageBitmap = await createImageBitmap(blob);
        return [imageBitmap];
    },
    configurationSchema: z.object({})
};