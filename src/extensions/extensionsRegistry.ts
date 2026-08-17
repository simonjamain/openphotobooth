import type { App } from "@/core/types/App";
import { dummyExtension } from "./dummy/dummyExtension";
import { digicamcontrolExtension } from "./digicamcontrol/digicamcontrolExtension";
import { dnpprintersExtension } from "./dnpprinters/dnpprintersExtension";
import { overlayExtension } from "./overlay/overlayExtension";
import { basicsExtension } from "./basics/basicsExtension";

export function installAllExtensions(app: App) {
    for (const extension of extensionsRegistry) {
        extension.registerNodes(app);
    }
}

export const extensionsRegistry = [
    dummyExtension,
    digicamcontrolExtension,
    dnpprintersExtension,
    overlayExtension,
    basicsExtension,
]