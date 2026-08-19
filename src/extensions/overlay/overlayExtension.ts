import type { Extension } from "@/core/types/Extension";
import { photoSequenceProcessingNode } from "./photoSequenceProcessingNode";
import { overlayProcessingNode } from "./overlayProcessingNode";

export const overlayExtension: Extension = {
    registerNodes(app) {
        app.registeredNodes.processingNodes[photoSequenceProcessingNode.id] = photoSequenceProcessingNode;
        app.registeredNodes.processingNodes[overlayProcessingNode.id] = overlayProcessingNode;
    }
};
