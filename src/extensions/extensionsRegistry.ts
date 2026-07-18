import type { App } from "@/core/types/App";
import { dummyExtension } from "./dummy/dummyExtension";

export function installAllExtensions(app: App) {
    for (const extension of extensionsRegistry) {
        extension.registerNodes(app);
    }
}

export const extensionsRegistry = [
    dummyExtension
]