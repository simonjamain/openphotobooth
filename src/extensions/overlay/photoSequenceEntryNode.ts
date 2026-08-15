import type { EntryNode } from "@/core/types/EntryNode";
import { markRaw } from "vue";
import z from "zod";
import photoSequenceEntryNodeComponent from "./photoSequenceEntryNodeComponent.vue";
import photoSequenceEntryNodeConfigurationComponent from "./photoSequenceEntryNodeConfigurationComponent.vue";

export const photoSequenceEntryNode: EntryNode = {
    id: "overlay.entryNode.sequence",
    name: "Overlay photo sequence",
    component: markRaw(photoSequenceEntryNodeComponent),
    configurationSchema: z.object({
        photoCount: z.number().int().min(1),
        delayMs: z.number().int().min(0)
    }),
    configurationComponent: markRaw(photoSequenceEntryNodeConfigurationComponent)
};