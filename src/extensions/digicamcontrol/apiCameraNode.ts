import type { CameraNode } from "@/core/types/CameraNode";
import { markRaw } from "vue";
import z from "zod";
import type { ApiCameraNodeConfiguration } from "./apiCameraNodeConfiguration";
import apiCameraNodeConfigurationComponent from "./apiCameraNodeConfigurationComponent.vue";

async function waitAndGetLastImageName(apiUrl: string): Promise<string> {
    // wait for 1 second, then try to get the last image name from the camera 10 times, with a 1 second delay between each try
    for (let i = 0; i < 10; i++) {
        try {
            const getLastImageNameUrl = new URL(apiUrl)
            getLastImageNameUrl.searchParams.set("slc", "get")
            getLastImageNameUrl.searchParams.set("param1", "lastcaptured")
            const response = await fetch(getLastImageNameUrl)

            if (!response.ok) {
                throw new Error(`Failed to get last image name: HTTP ${response.status}`)
            }

            const imageName = await response.text()

            // api send "-" if image is still processing
            if (imageName === "-") {
                console.log("Image is still processing, please try again later.")
                throw new Error("Image is still processing, please try again later.")
            }

            return imageName;
        } catch (error) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    throw new Error("Failed to get last image name after 10 attempts.");
}

async function waitAndFetchImageBitmap(imageUrl: URL): Promise<ImageBitmap> {
    for (let i = 0; i < 10; i++) {
        try {
            const response = await fetch(imageUrl)

            if (!response.ok) {
                throw new Error(`Image fetch failed with status ${response.status}`)
            }

            const blob = await response.blob()
            return await createImageBitmap(blob)
        } catch (error) {
            console.log("Image not ready yet, retrying...", error)
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    throw new Error("Failed to get image after 10 attempts.")
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

        await new Promise(resolve => setTimeout(resolve, 200));
        const imageBitmap = await waitAndFetchImageBitmap(capturedImageUrl);
        return [imageBitmap];
    },
    configurationSchema: z.object({
        apiUrl: z.string()
    }),
    configurationComponent: markRaw(apiCameraNodeConfigurationComponent)
};