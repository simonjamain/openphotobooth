import type { EntryNode } from "@/core/types/EntryNode";
import { markRaw } from "vue";
import z from "zod";
import overlayEntryNodeComponent from "./overlayEntryNodeComponent.vue";

export const overlayEntryNode: EntryNode = {
    id: "overlay.entryNode.sequence",
    name: "Overlay photo sequence",
    component: markRaw(overlayEntryNodeComponent),
    configurationSchema: z.object({})
};
