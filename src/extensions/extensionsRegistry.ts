import type { App } from "@/core/types/App";
import { dummyExtension } from "./dummy/dummyExtension";
import { digicamcontrolExtension } from "./digicamcontrol/digicamcontrolExtension";

export function installAllExtensions(app: App) {
    for (const extension of extensionsRegistry) {
        extension.registerNodes(app);
    }
}

export const extensionsRegistry = [
    dummyExtension,
    digicamcontrolExtension
]