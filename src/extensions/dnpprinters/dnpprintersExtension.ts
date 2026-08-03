import type { Extension } from "@/core/types/Extension";
import { hotfolderprintProcessingNode } from "./hotfolderprintProcessingNode";
export const dnpprintersExtension: Extension = {
    registerNodes(app) {
        app.registeredNodes.processingNodes[hotfolderprintProcessingNode.id] = hotfolderprintProcessingNode;
    }
};