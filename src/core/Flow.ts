import type { ProcessingNode } from "./types/ProcessingNode";

export async function runPipeline(processingNodes: Readonly<ProcessingNode[]>, images: Readonly<ImageBitmap[]>): Promise<void> {
    const nextProcessingNode = processingNodes.slice(0,1)[0];

    if(nextProcessingNode === undefined) {
        console.debug("end of the processing pipeline reached");
        return;
    }

    const processedImages = await nextProcessingNode.process(images)
    
    return await runPipeline(processingNodes.slice(1), processedImages);
}