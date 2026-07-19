import type { Extension } from "@/core/types/Extension";
import { dummyCameraNode } from "./dummyCameraNode";
import { dummyEntryNode } from "./dummyEntryNode";
import { dummyProcessingNode } from "./dummyProcessingNode";




export const dummyExtension: Extension = {
    registerNodes(app) {
        app.registeredNodes.entryNodes.push(dummyEntryNode);
        app.registeredNodes.cameraNodes.push(dummyCameraNode);
        app.registeredNodes.processingNodes.push(dummyProcessingNode);
    }
};