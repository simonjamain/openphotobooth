import type { Extension } from "@/core/types/Extension";
import { apiCameraNode } from "./apiCameraNode";
export const digicamcontrolExtension: Extension = {
    registerNodes(app) {
        app.registeredNodes.cameraNodes[apiCameraNode.id] = apiCameraNode;
    }
};