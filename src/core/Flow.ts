import type { App } from "./types/App";
import type { Flow, FlowConfiguration, FlowProcessingNode } from "./types/Flow";
import type { ProcessingNode } from "./types/ProcessingNode";

export async function runPipeline(processingNodes: Readonly<ProcessingNode[]>, images: Readonly<ImageBitmap[]>): Promise<ImageBitmap[]> {
    const nextProcessingNode = processingNodes.slice(0,1)[0];

    if(nextProcessingNode === undefined) {
        console.debug("end of the processing pipeline reached");
        return [...images];
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

    const processingNodesPipeline: FlowProcessingNode[] = []
    for (const nodeConfiguration of flowConfiguration.processingNodesPipeline) {
        const processingNode = boothApp.registeredNodes.processingNodes[nodeConfiguration.id]
        if (processingNode === undefined) {
            throw new Error(`Processing node not found for id: ${nodeConfiguration.id}`)
        }

        processingNodesPipeline.push({ ...processingNode, ...nodeConfiguration } as FlowProcessingNode);
    }


    // we bind the node configurations to the registered nodes the their methods can access the configuration through `this.configuration`
    return {
        name: flowConfiguration.name,
        entryNode: { ...entryNode, ...flowConfiguration.entryNode },
        cameraNode: { ...cameraNode, ...flowConfiguration.cameraNode },
        processingNodesPipeline,
        cancelScreen: flowConfiguration.cancelScreen,
    }
}