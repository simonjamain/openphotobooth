import type { Extension } from "@/core/types/Extension";
import { overlayEntryNode } from "./overlayEntryNode";
import { overlayProcessingNode } from "./overlayProcessingNode";

export const overlayExtension: Extension = {
    registerNodes(app) {
        app.registeredNodes.entryNodes[overlayEntryNode.id] = overlayEntryNode;
        app.registeredNodes.processingNodes[overlayProcessingNode.id] = overlayProcessingNode;
    }
};
