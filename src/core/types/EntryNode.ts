import type { Component, ComponentPublicInstance, DefineComponent } from "vue";
import type { Node } from "./Node";
import type { CameraNode } from "./CameraNode";

export interface EntryNode extends Node {
  component: Component<{cameraNode: CameraNode}>;
}