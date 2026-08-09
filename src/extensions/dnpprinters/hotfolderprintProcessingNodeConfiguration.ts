import type { NodeConfiguration } from "@/core/types/Node";

export interface HotfolderprintProcessingNodeConfiguration extends NodeConfiguration {
    configuration: {
        outputFolderDirectoryHandle: FileSystemDirectoryHandle | null;
    }
}