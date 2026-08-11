import type { EntryNode } from "@/core/types/EntryNode";
import { markRaw } from "vue";
import z from "zod";
import overlayEntryNodeComponent from "./overlayEntryNodeComponent.vue";
import overlayEntryNodeConfigurationComponent from "./overlayEntryNodeConfigurationComponent.vue";

export const overlayEntryNode: EntryNode = {
    id: "overlay.entryNode.sequence",
    name: "Overlay photo sequence",
    component: markRaw(overlayEntryNodeComponent),
    configurationSchema: z.object({
        photoCount: z.number().int().min(1),
        delayMs: z.number().int().min(0)
    }),
    configurationComponent: markRaw(overlayEntryNodeConfigurationComponent)
};
