const dummyCameraPictureUrl = new URL("./dummyCameraPicture.jpg", import.meta.url).href;

export const dummyCameraNode = {
    name: "dummyCameraNode",
    async capture(): Promise<ImageBitmap[]> {
        console.debug("dummyCameraNode: capture called");
        const response = await fetch(dummyCameraPictureUrl);
        const blob = await response.blob();
        const imageBitmap = await createImageBitmap(blob);
        return [imageBitmap];
    }
};