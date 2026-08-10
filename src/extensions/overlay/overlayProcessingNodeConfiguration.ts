import type { NodeConfiguration } from "@/core/types/Node";

export interface OverlayProcessingNodeConfiguration extends NodeConfiguration {
    configuration: {
        overlayImageDataUrl: string | null;
        zones: Array<{
            x: number;
            y: number;
            width: number;
            height: number;
        }>;
    }
}
