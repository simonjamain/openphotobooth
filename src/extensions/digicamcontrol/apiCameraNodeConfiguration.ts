import type { CameraNode } from "@/core/types/CameraNode";
import type { NodeConfiguration } from "@/core/types/Node";
import z from "zod";

export interface ApiCameraNodeConfiguration extends NodeConfiguration {
    configuration: {
        apiUrl: string;
    }
}