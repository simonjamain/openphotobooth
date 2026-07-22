import { toRaw } from "vue";
import type { App } from "./types/App";
import type { Flow, FlowConfiguration } from "./types/Flow";
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

/**
 * Bound the flow configuration to the registered nodes in the app and return a Flow instance
 */
export function instanciateFlowFromConfiguration(flowConfiguration: FlowConfiguration, boothApp: App): Flow {

    const entryNode = boothApp.registeredNodes.entryNodes[flowConfiguration.entryNode.id]
    if (entryNode === undefined) {
        throw new Error(`Entry node not found for id: ${flowConfiguration.entryNode.id}`)
    }

    const cameraNode = boothApp.registeredNodes.cameraNodes[flowConfiguration.cameraNode.id]
    if (cameraNode === undefined) {
        throw new Error(`Camera node not found for id: ${flowConfiguration.cameraNode.id}`)
    }

    const processingNodesPipeline: ProcessingNode[] = []
    for (const nodeConfiguration of flowConfiguration.processingNodesPipeline) {
        const processingNode = boothApp.registeredNodes.processingNodes[nodeConfiguration.id]
        if (processingNode === undefined) {
            throw new Error(`Processing node not found for id: ${nodeConfiguration.id}`)
        }

        processingNodesPipeline.push({ ...processingNode, ...nodeConfiguration });
    }

    return {
        entryNode: { ...entryNode, ...flowConfiguration.entryNode },
        cameraNode: { ...cameraNode, ...flowConfiguration.cameraNode },
        processingNodesPipeline,
    }
}