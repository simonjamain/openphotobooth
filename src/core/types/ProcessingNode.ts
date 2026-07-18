import type { Node } from "./Node"

export interface ProcessingNode extends Node {
    process(images: ImageBitmap[]): Promise<ImageBitmap[]>
}