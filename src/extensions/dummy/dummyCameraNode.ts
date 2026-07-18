export const dummyCameraNode = {
    name: "dummyCameraNode",
    async capture(): Promise<ImageBitmap[]> {
        console.debug("dummyCameraNode: capture called");
        // Use the dummy jpg image as a placeholder for the captured image
        const response = await fetch("/dummy.jpg");
        const blob = await response.blob();
        const imageBitmap = await createImageBitmap(blob);
        return [imageBitmap];
    }
};