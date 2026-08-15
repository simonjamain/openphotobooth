import type { Extension } from "@/core/types/Extension";
import { photoSequenceEntryNode } from "./photoSequenceEntryNode";
import { overlayProcessingNode } from "./overlayProcessingNode";

export const overlayExtension: Extension = {
    registerNodes(app) {
        app.registeredNodes.entryNodes[photoSequenceEntryNode.id] = photoSequenceEntryNode;
        app.registeredNodes.processingNodes[overlayProcessingNode.id] = overlayProcessingNode;
    }
};
