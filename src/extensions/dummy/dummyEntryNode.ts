import type { EntryNode } from "@/core/types/EntryNode";
import dummyEntryNodeComponent from './dummyEntryNodeComponent.vue';
import { markRaw } from "vue";

export const dummyEntryNode: EntryNode = {
    name: "dummyEntryNode",
    component: markRaw(dummyEntryNodeComponent)
}