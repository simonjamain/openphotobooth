import type { Node } from "./Node"

export interface CameraNode extends Node {
    capture(): Promise<ImageBitmap[]>
}