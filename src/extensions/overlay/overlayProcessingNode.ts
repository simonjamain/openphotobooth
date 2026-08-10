import type { ProcessingNode } from "@/core/types/ProcessingNode";
import { markRaw } from "vue";
import z from "zod";
import overlayProcessingNodeConfigurationComponent from "./overlayProcessingNodeConfigurationComponent.vue";
import type { OverlayProcessingNodeConfiguration } from "./overlayProcessingNodeConfiguration";

async function dataUrlToImageBitmap(dataUrl: string): Promise<ImageBitmap> {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return createImageBitmap(blob);
}

async function imageBitmapToPngBlob(image: ImageBitmap): Promise<Blob> {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d");

    if (context === null) {
        throw new Error("Unable to create a drawing context for the overlay output");
    }

    context.drawImage(image, 0, 0);

    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob === null) {
                reject(new Error("Unable to export the overlay result as an image"));
                return;
            }
            resolve(blob);
        }, "image/png");
    });
}

export const overlayProcessingNode: ProcessingNode = {
    id: "overlay.processingNode.overlay",
    name: "Overlay processing node",
    async process(this: OverlayProcessingNodeConfiguration, images: Readonly<ImageBitmap[]>): Promise<ImageBitmap[]> {
        const overlayImageDataUrl = this.configuration.overlayImageDataUrl;
        const zones = this.configuration.zones;

        if (overlayImageDataUrl === null || overlayImageDataUrl.length === 0 || zones.length === 0) {
            return [...images];
        }

        const overlayImage = await dataUrlToImageBitmap(overlayImageDataUrl);
        const canvas = document.createElement("canvas");
        canvas.width = overlayImage.width;
        canvas.height = overlayImage.height;

        const context = canvas.getContext("2d");
        if (context === null) {
            throw new Error("Unable to create a drawing context for the overlay composition");
        }

        for (let index = 0; index < zones.length; index += 1) {
            const zone = zones[index];
            const sourceImage = images[index % images.length];

            if (zone === undefined || sourceImage === undefined) {
                continue;
            }

            const destinationX = Math.round(zone.x * overlayImage.width);
            const destinationY = Math.round(zone.y * overlayImage.height);
            const destinationWidth = Math.max(1, Math.round(zone.width * overlayImage.width));
            const destinationHeight = Math.max(1, Math.round(zone.height * overlayImage.height));

            const sourceAspectRatio = sourceImage.width / sourceImage.height;
            const targetAspectRatio = destinationWidth / destinationHeight;
            let drawWidth = destinationWidth;
            let drawHeight = destinationHeight;
            let drawX = destinationX;
            let drawY = destinationY;

            if (sourceAspectRatio > targetAspectRatio) {
                drawHeight = destinationHeight;
                drawWidth = destinationHeight * sourceAspectRatio;
                drawX = destinationX - (drawWidth - destinationWidth) / 2;
            } else {
                drawWidth = destinationWidth;
                drawHeight = destinationWidth / sourceAspectRatio;
                drawY = destinationY - (drawHeight - destinationHeight) / 2;
            }

            context.save();
            context.beginPath();
            context.rect(destinationX, destinationY, destinationWidth, destinationHeight);
            context.clip();
            context.drawImage(sourceImage, drawX, drawY, drawWidth, drawHeight);
            context.restore();
        }

        context.drawImage(overlayImage, 0, 0);

        const outputBlob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob === null) {
                    reject(new Error("Unable to export the overlay composition"));
                    return;
                }
                resolve(blob);
            }, "image/png");
        });

        const outputImage = await createImageBitmap(outputBlob);
        return [outputImage];
    },
    configurationSchema: z.object({
        overlayImageDataUrl: z.string().nullable(),
        zones: z.array(z.object({
            x: z.number(),
            y: z.number(),
            width: z.number(),
            height: z.number()
        }))
    }),
    configurationComponent: markRaw(overlayProcessingNodeConfigurationComponent)
};
