import type { CameraNode } from "@/core/types/CameraNode";
import type { NodeConfiguration } from "@/core/types/Node";
import z from "zod";

export interface HotfolderprintProcessingNodeConfiguration extends NodeConfiguration {
    configuration: {
        outputFolderDirectoryHandle: string | null;
    }
}