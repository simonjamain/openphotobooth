# AI Agents guidelines

## Product goal

This project is a frontend-only photobooth app built with Vue 3 + TypeScript + Vite. It is designed to run on a kiosk-like device, use a camera and optional printer, and process user-captured photos through a modular pipeline.

The app is intentionally small and pragmatic:

- no backend
- browser-only runtime assumptions
- modular node-based architecture for camera and processing steps
- offline-friendly behavior by default
- simple configuration saved in app state

## Current architecture

The actual implementation already follows a small extension architecture. The important contracts are defined in the core types and are the source of truth for new work.

### Flow model

A flow is defined by:

- name
- cameraNode
- processingNodesPipeline
- optional input

The core flow schema is:

```ts
export const FlowConfigurationSchema = z.object({
  name: z.string().trim().min(1).default("Untitled flow"),
  cameraNode: NodeConfigurationSchema,
  processingNodesPipeline: z.array(NodeConfigurationSchema),
  input: InputSchema.nullish().default(null),
})
```

The corresponding runtime shape is:

```ts
export interface FlowConfiguration {
  name: string
  cameraNode: NodeConfiguration
  processingNodesPipeline: NodeConfiguration[]
  input?: Input | null
}
```

### Node model

Base nodes are plain objects, not classes:

```ts
export interface Node {
  id: string
  name: string
  configurationSchema: z.ZodType
  configurationComponent?: Component
}
```

The app uses a generic node configuration wrapper:

```ts
export const NodeConfigurationSchema = z.object({
  id: z.string(),
  configuration: z.record(z.string(), z.any())
})
```

This is the key point to preserve when authoring extensions: every node is selected by a string id and stores runtime config in a serializable record.

### Contract by node type

- camera node: `capture(): Promise<ImageBitmap[]>`
- processing node: `process(images: Readonly<ImageBitmap[]>): Promise<ImageBitmap[]>`

A processing node may also provide a `runtimeComponent` to pause the pipeline and show interactive UI. The component receives `images`, `configuration`, `cameraNode` (optional), and `busy` props, and emits `cancel` or `continue` (with an optional `ImageBitmap[]` payload to replace pending images).

The actual project uses the following shape:

```ts
export interface CameraNode extends Node {
  capture(): Promise<ImageBitmap[]>
}

export interface ProcessingNode extends Node {
  process(images: Readonly<ImageBitmap[]>): Promise<ImageBitmap[]>
  runtimeComponent?: Component<ProcessingNodeRuntimeComponentProps>
}
```

Photo capture is implemented as processing nodes with a `runtimeComponent`. The pipeline starts with an empty image array `[]`; a capture node captures photos via its `runtimeComponent` and emits `continue` with the captured images, which are then passed to `process()` and on through the rest of the pipeline.

### App registry

The app stores available nodes by category:

```ts
export interface App {
  flowConfigurations: FlowConfiguration[]
  registeredNodes: {
    cameraNodes: Record<string, CameraNode>
    processingNodes: Record<string, ProcessingNode>
  }
}
```

Extensions do not extend a framework class. They simply register into this registry via an `Extension` object:

```ts
export interface Extension {
  registerNodes(app: App): void
}
```

This is the exact pattern used today:

```ts
export const dummyExtension: Extension = {
  registerNodes(app) {
    app.registeredNodes.cameraNodes[dummyCameraNode.id] = dummyCameraNode
    app.registeredNodes.processingNodes[dummyProcessingNode.id] = dummyProcessingNode
    app.registeredNodes.processingNodes[dummySinglePhotoProcessingNode.id] = dummySinglePhotoProcessingNode
  }
}
```

## Current bundled extensions

The project currently ships with these extension groups in `src/extensions/extensionsRegistry.ts`:

- `dummy` — minimal camera and processing node examples, including a single-photo capture node
- `digicamcontrol` — camera node for API-based tethering
- `dnpprinters` — processing node for hot-folder printing
- `overlay` — photo sequence capture node and overlay processing node

The extension ids already follow namespaced conventions such as:

- `dummy.processingNode.singlePhoto`
- `dummy.cameraNode.lena`
- `dummy.processingNode.void`
- `overlay.processingNode.sequence`
- `overlay.processingNode.overlay`
- `digicamcontrol.cameraNode.api`
- `hotfolderprint.processingNode.print`

## UI and configuration conventions

The actual UI binds node configuration with Vue model state. A node may provide a `configurationComponent` and the config is stored under the node configuration object:

```ts
{ id: string, configuration: Record<string, unknown> }
```

This means:

- prefer serializable config values
- keep config simple and readable
- use zod schemas for uncontrolled or externally supplied data
- use `defineModel` to bind configuration in Vue components when settings are needed
- avoid deeply nested or non-serializable objects in node config

## Development philosophy

Keep implementations intentionally small and aligned to the current app structure.

- do not add unnecessary dependencies
- do not introduce a new abstraction unless the existing architecture already supports it
- prefer minimal changes that fit the project contract
- favor readability and simple browser-safe code over cleverness
- keep the app easy to reason about for a single-page kiosk workflow

## Extension authoring guidance

When creating or updating an extension, follow the project as it exists today instead of the aspirational roadmap.

### Preferred workflow

1. Start from the closest existing extension.
   - use `dummy` for the simplest minimal example
   - use `digicamcontrol` for camera nodes with config and a settings component
   - use `dnpprinters` for processing nodes that use browser APIs and file-system access
   - use `dummy.processingNode.singlePhoto` or `overlay.processingNode.sequence` as examples for capture processing nodes with a `runtimeComponent`
2. Keep the new code minimal and aligned to the current contracts.
3. Export a plain object with the correct id, name, and behavior.
4. Register it in `src/extensions/extensionsRegistry.ts`.
5. Run the type-check before finishing.

### Required patterns

- extension exports: `Extension` with `registerNodes(app)`
- node registration: write into `app.registeredNodes.cameraNodes` or `processingNodes`
- id naming: use a vendor or extension prefix such as `vendor.processingNode.name`
- capture processing node: has a `runtimeComponent` that captures images and emits `continue` with them
- camera node: implements `capture()` and returns `ImageBitmap[]`
- processing node: implements `process(images)` and returns `ImageBitmap[]`

### What to avoid

- creating custom extension factories or class-based node systems unless the project already requires them
- storing complex runtime objects in configuration instead of serializable fields
- changing the app registry shape without updating the core types and all extension registration sites
- overengineering plugin interfaces beyond the current `App` + `Extension` + node contracts

## Validation before completion

Before claiming a change is done, run the relevant project validation command.

Current project commands:

```bash
npm run dev
npm run type-check
npm run build
```

For extension work, the minimum acceptable check is usually:

```bash
npm run type-check
```

## Summary for agents

The project is not a broad plugin ecosystem yet; it is a compact, browser-only photobooth app with a simple registry-based extension system. The most important rule is to keep new work consistent with the existing node contracts and the current extension registry, not with any older conceptual document.

When in doubt, follow the shapes already implemented in:

- `src/core/types/*`
- `src/extensions/dummy/*`
- `src/extensions/digicamcontrol/*`
- `src/extensions/dnpprinters/*`
- `src/extensions/overlay/*`
