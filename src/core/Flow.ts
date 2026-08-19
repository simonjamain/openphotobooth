import type { App } from "./types/App";
import type { Flow, FlowConfiguration, FlowProcessingNode } from "./types/Flow";

export type PipelineRunResult =
    | {
        status: "completed"
        images: ImageBitmap[]
    }
    | {
        status: "paused"
        runtimeNode: FlowProcessingNode
        images: ImageBitmap[]
        remainingNodes: FlowProcessingNode[]
    }

export async function runPipelineUntilInteractiveNode(
    processingNodes: Readonly<FlowProcessingNode[]>,
    images: Readonly<ImageBitmap[]>,
): Promise<PipelineRunResult> {
    let currentImages = [...images]

    for (let nodeIndex = 0; nodeIndex < processingNodes.length; nodeIndex += 1) {
        const node = processingNodes[nodeIndex] as FlowProcessingNode

        if (node.runtimeComponent !== undefined) {
            return {
                status: "paused",
                runtimeNode: node,
                images: currentImages,
                remainingNodes: processingNodes.slice(nodeIndex + 1),
            }
        }

        currentImages = await node.process(currentImages)
    }

    return {
        status: "completed",
        images: currentImages,
    }
}

/**
 * Bound the flow configuration to the registered nodes in the app and return a Flow instance
 */
export function instanciateFlowFromConfiguration(flowConfiguration: FlowConfiguration, boothApp: App): Flow {

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
        cameraNode: { ...cameraNode, ...flowConfiguration.cameraNode },
        processingNodesPipeline,
    }
}