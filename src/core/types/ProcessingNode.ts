import type { Component } from "vue"
import type { Node } from "./Node"

export interface ProcessingNodeRuntimeComponentProps {
    images: Readonly<ImageBitmap[]>
    configuration: Record<string, unknown>
    busy?: boolean
}

export interface ProcessingNode extends Node {
    process(images: Readonly<ImageBitmap[]>): Promise<ImageBitmap[]>
    runtimeComponent?: Component<ProcessingNodeRuntimeComponentProps>
}