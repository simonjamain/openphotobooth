import type { EntryNode } from "@/core/types/EntryNode";
import dummyEntryNodeComponent from './dummyEntryNodeComponent.vue';
import { markRaw } from "vue";
import z from "zod";

export const dummyEntryNode: EntryNode = {
    id: "dummy.entryNode.singlePhoto",
    name: "single photo capture",
    component: markRaw(dummyEntryNodeComponent),
    configurationSchema: z.object({})
}