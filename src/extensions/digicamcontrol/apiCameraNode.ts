import type { CameraNode } from "@/core/types/CameraNode";
import { markRaw } from "vue";
import z from "zod";
import type { ApiCameraNodeConfiguration } from "./apiCameraNodeConfiguration";
import apiCameraNodeConfigurationComponent from "./apiCameraNodeConfigurationComponent.vue";

async function waitAndGetLastImageName(apiUrl: string): Promise<string> {
    //wait for 1 second, then try to get the last image name from the camera 10 times, with a 1 second delay between each try
    for (let i = 0; i < 10; i++) {
        try {
            const getLastImageNameUrl = new URL(apiUrl)
            getLastImageNameUrl.searchParams.set("slc", "get")
            getLastImageNameUrl.searchParams.set("param1", "lastcaptured")
            const imageName = await (await fetch(getLastImageNameUrl)).text()
            // api send "-" if image is still processing
            if(imageName === "-") {
                throw new Error("Image is still processing, please try again later.")
            }
            return imageName;
        }catch (error) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    throw new Error("Failed to get last image name after 10 attempts.");
}

export const apiCameraNode: CameraNode = {
    id: "digicamcontrol.cameraNode.api",
    name: "DigiCamControl API request",
    async capture(this: ApiCameraNodeConfiguration): Promise<ImageBitmap[]> {
        // check https://www.digicamcontrol.com/doc/userguide/web
        const captureApiUrl = new URL(this.configuration.apiUrl);
        captureApiUrl.searchParams.set("CMD", "Capture");
        await fetch(captureApiUrl);

        const capturedImageName = await waitAndGetLastImageName(this.configuration.apiUrl);

        const capturedImageUrl = new URL(`image/${capturedImageName}`, this.configuration.apiUrl);

        const response = await fetch(capturedImageUrl);
        const blob = await response.blob();
        const imageBitmap = await createImageBitmap(blob);
        return [imageBitmap];
    },
    configurationSchema: z.object({
        apiUrl: z.string().url()
    }),
    configurationComponent: markRaw(apiCameraNodeConfigurationComponent)
};