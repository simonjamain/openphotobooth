import type { Extension } from "@/core/types/Extension";
import { dummyCameraNode } from "./dummyCameraNode";
import { dummyProcessingNode } from "./dummyProcessingNode";
import { dummySinglePhotoProcessingNode } from "./dummySinglePhotoProcessingNode";




export const dummyExtension: Extension = {
    registerNodes(app) {
        app.registeredNodes.cameraNodes[dummyCameraNode.id] = dummyCameraNode;
        app.registeredNodes.processingNodes[dummyProcessingNode.id] = dummyProcessingNode;
        app.registeredNodes.processingNodes[dummySinglePhotoProcessingNode.id] = dummySinglePhotoProcessingNode;
    }
};