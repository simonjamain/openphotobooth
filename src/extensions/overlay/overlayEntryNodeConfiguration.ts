import type { NodeConfiguration } from "@/core/types/Node";

export interface OverlayEntryNodeConfiguration extends NodeConfiguration {
    configuration: {
        photoCount: number;
        delayMs: number;
    }
}
