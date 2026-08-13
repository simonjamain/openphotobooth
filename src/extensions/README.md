# Extension authoring guide

This short guide is intended for AI agents and contributors adding new extensions to the app.

## 1. Start from a close example

Use the existing extensions as templates:

- dummy: the smallest possible extension with entry, camera, and processing nodes
- digicamcontrol: camera node with configuration and a Vue settings component
- dnpprinters: processing node using browser APIs and file-system permissions

## 2. Match the architecture

Extensions should register nodes through the extension contract:

- an extension exports a registerNodes(app) function
- it writes into app.registeredNodes.entryNodes, cameraNodes, or processingNodes
- node ids should be namespaced, for example: vendor.entryNode.singlePhoto

## 3. Keep node implementations small

Prefer these shapes:

- entry node: export an object with id, name, component, configurationSchema
- camera node: export an object with id, name, capture(), configurationSchema
- processing node: export an object with id, name, process(images), configurationSchema

Use plain objects instead of classes.

## 4. Configuration conventions

- use zod schemas for any user-controlled or external input
- expose configuration through a Vue component only when the node actually needs settings
- keep configuration simple and serializable
- when using browser-only APIs, surface errors clearly and keep the UI responsive

## 5. Registration checklist

Before finishing an extension, verify that:

- the extension file exists and exports a valid Extension object
- the extension is imported and added to src/extensions/extensionsRegistry.ts
- the node id is unique and namespaced
- the configuration schema matches the runtime data shape
- the app still type-checks successfully

## 6. Minimal implementation workflow

1. copy the closest extension example
2. rename the symbols and ids
3. adapt the node behavior and configuration
4. register the extension
5. run the type check
