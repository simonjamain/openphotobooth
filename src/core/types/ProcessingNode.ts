import type { Component } from "vue"
import type { Node } from "./Node"
import type { CameraNode } from "./CameraNode"

export interface ProcessingNodeRuntimeComponentProps {
    images: Readonly<ImageBitmap[]>
    configuration: Record<string, unknown>
    cameraNode?: CameraNode
    busy?: boolean
}

export interface ProcessingNode extends Node {
    process(images: Readonly<ImageBitmap[]>): Promise<ImageBitmap[]>
    runtimeComponent?: Component<ProcessingNodeRuntimeComponentProps>
}