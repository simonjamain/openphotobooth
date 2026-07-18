import type { Extension } from "@/core/types/Extension";
import { dummyCameraNode } from "./dummyCameraNode";
import { dummyProcessingNode } from "./dummyProcessingNode";




export const dummyExtension: Extension = {
    registerNodes(app) {
        app.registeredNodes.cameraNodes.push(dummyCameraNode);
        app.registeredNodes.processingNodes.push(dummyProcessingNode);
    }
};