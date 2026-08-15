import type { NodeConfiguration } from "@/core/types/Node";

export interface PhotoSequenceEntryNodeConfiguration extends NodeConfiguration {
    configuration: {
        photoCount: number;
        delayMs: number;
    }
}