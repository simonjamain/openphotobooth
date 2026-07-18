import type { App } from "./App";

export interface Extension {
    registerNodes(app: App): void
}