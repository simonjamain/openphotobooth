import type { ProcessingNode } from "./types/ProcessingNode";

export async function runPipeline(processingNodes: ProcessingNode[], images: ImageBitmap[]): Promise<void> {
    const nextProcessingNode = processingNodes.pop();

    if(nextProcessingNode === undefined) {
        console.debug("end of the processing pipeline reached");
        return;
    }

    const processedImages = await nextProcessingNode.process(images)
    
    return await runPipeline(processingNodes, processedImages);
}