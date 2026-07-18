<script setup lang="ts">
import { computed, ref } from 'vue'
import { createBoothOrchestrator } from '@/core/booth/orchestrator'
import { boothConfigSchema, type BoothConfigValidated } from '@/core/booth/schemas'
import {
  initialBoothState,
  restartBooth,
  retryFromError,
  selectFlow,
  setArchiveResult,
  setCaptureResult,
  setEntryResult,
  setPrintResult,
  setProcessingResult,
  setStepFailure,
  type BoothState,
} from '@/core/booth/stateMachine'
import { mvpRegistry } from '@/core/plugins/mvpRegistry'

type ConfigFormState = {
  captureDelayMs: string
  printDelayMs: string
  mockCameraEndpoint: string
  mockHotFolderPath: string
}

const orchestrator = createBoothOrchestrator(mvpRegistry)
const flowOptions = mvpRegistry.flows

const state = ref<BoothState>({ ...initialBoothState })
const isBusy = ref(false)
const statusMessage = ref('Select a flow to start the MVP loop.')
const configErrors = ref<string[]>([])

const selectedFlowId = ref(flowOptions[0]?.id ?? '')
const configForm = ref<ConfigFormState>({
  captureDelayMs: '1000',
  printDelayMs: '1000',
  mockCameraEndpoint: 'http://localhost:5513',
  mockHotFolderPath: 'C:/hot-folder',
})

const selectedFlowName = computed(() => {
  return flowOptions.find((flow) => flow.id === state.value.selectedFlowId)?.name ?? 'No flow selected'
})

const parseConfig = (): BoothConfigValidated | undefined => {
  configErrors.value = []

  const parseResult = boothConfigSchema.safeParse({
    captureDelayMs: Number(configForm.value.captureDelayMs),
    printDelayMs: Number(configForm.value.printDelayMs),
    mockCameraEndpoint: configForm.value.mockCameraEndpoint,
    mockHotFolderPath: configForm.value.mockHotFolderPath,
  })

  if (!parseResult.success) {
    configErrors.value = parseResult.error.issues.map((issue) => issue.message)
    return undefined
  }

  return parseResult.data
}

const startFlow = async (): Promise<void> => {
  const config = parseConfig()

  if (!config) {
    state.value = setStepFailure(state.value, 'flow-selection', 'Invalid booth configuration.')
    return
  }

  state.value = selectFlow(state.value, selectedFlowId.value)

  try {
    isBusy.value = true
    statusMessage.value = 'Running entry node...'
    const entry = await orchestrator.runEntry(selectedFlowId.value, config)
    state.value = setEntryResult(state.value, entry)
    statusMessage.value = 'Entry ready. Capture can start.'
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected entry error.'
    state.value = setStepFailure(state.value, 'capture', message)
  } finally {
    isBusy.value = false
  }
}

const runCapture = async (): Promise<void> => {
  const config = parseConfig()

  if (!config) {
    state.value = setStepFailure(state.value, 'capture', 'Capture requires valid config.')
    return
  }

  try {
    isBusy.value = true
    statusMessage.value = 'Capturing photo...'
    const capture = await orchestrator.runCapture(state.value.selectedFlowId!, config)
    state.value = setCaptureResult(state.value, capture)
    statusMessage.value = 'Capture complete. Processing next.'
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected capture error.'
    state.value = setStepFailure(state.value, 'capture', message)
  } finally {
    isBusy.value = false
  }
}

const runProcessing = async (): Promise<void> => {
  const config = parseConfig()

  if (!config) {
    state.value = setStepFailure(state.value, 'processing', 'Processing requires valid config.')
    return
  }

  try {
    isBusy.value = true
    statusMessage.value = 'Processing photo...'
    const processed = await orchestrator.runProcessing(
      state.value.selectedFlowId!,
      state.value.session.capture!,
      config,
    )
    state.value = setProcessingResult(state.value, processed)
    statusMessage.value = 'Processing complete. Archiving next.'
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected processing error.'
    state.value = setStepFailure(state.value, 'processing', message)
  } finally {
    isBusy.value = false
  }
}

const runArchive = async (): Promise<void> => {
  const config = parseConfig()

  if (!config) {
    state.value = setStepFailure(state.value, 'archive', 'Archive requires valid config.')
    return
  }

  try {
    isBusy.value = true
    statusMessage.value = 'Archiving photo...'
    const archived = await orchestrator.runArchive(
      state.value.selectedFlowId!,
      state.value.session.processed!,
      config,
    )
    state.value = setArchiveResult(state.value, archived)
    statusMessage.value = 'Archive complete. Printing next.'
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected archive error.'
    state.value = setStepFailure(state.value, 'archive', message)
  } finally {
    isBusy.value = false
  }
}

const runPrint = async (): Promise<void> => {
  const config = parseConfig()

  if (!config) {
    state.value = setStepFailure(state.value, 'print', 'Print requires valid config.')
    return
  }

  try {
    isBusy.value = true
    statusMessage.value = 'Printing photo...'
    const printed = await orchestrator.runPrinting(
      state.value.selectedFlowId!,
      state.value.session.archived!,
      config,
    )
    state.value = setPrintResult(state.value, printed)
    statusMessage.value = 'Print complete. You can restart the loop.'
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected print error.'
    state.value = setStepFailure(state.value, 'print', message)
  } finally {
    isBusy.value = false
  }
}

const restart = (): void => {
  state.value = restartBooth()
  statusMessage.value = 'Select a flow to start the MVP loop.'
}

const retry = (): void => {
  state.value = retryFromError(state.value)
  statusMessage.value = 'Retry the current step.'
}
</script>

<template>
  <main class="booth-shell">
    <section class="booth-header">
      <p class="eyebrow">Open Photobooth MVP</p>
      <h1>Single Route Workflow</h1>
      <p>
        Current step: <strong>{{ state.step }}</strong>
        <span v-if="state.selectedFlowId"> | Flow: <strong>{{ selectedFlowName }}</strong></span>
      </p>
    </section>

    <section class="panel">
      <h2>Configuration</h2>
      <div class="grid">
        <label>
          Capture delay (ms)
          <input v-model="configForm.captureDelayMs" inputmode="numeric" />
        </label>
        <label>
          Print delay (ms)
          <input v-model="configForm.printDelayMs" inputmode="numeric" />
        </label>
        <label>
          Mock camera endpoint
          <input v-model="configForm.mockCameraEndpoint" />
        </label>
        <label>
          Mock hot folder path
          <input v-model="configForm.mockHotFolderPath" />
        </label>
      </div>
      <ul v-if="configErrors.length" class="errors">
        <li v-for="error in configErrors" :key="error">{{ error }}</li>
      </ul>
    </section>

    <section v-if="state.step === 'flow-selection'" class="panel">
      <h2>1. Flow Selection</h2>
      <label>
        Available flow
        <select v-model="selectedFlowId">
          <option v-for="flow in flowOptions" :key="flow.id" :value="flow.id">{{ flow.name }}</option>
        </select>
      </label>
      <button :disabled="isBusy" @click="startFlow">Start Flow</button>
    </section>

    <section v-else-if="state.step === 'capture'" class="panel">
      <h2>2. Capture</h2>
      <p>Entry sequence count: {{ state.session.entry?.sequenceCount ?? 0 }}</p>
      <button :disabled="isBusy" @click="runCapture">Take Photo</button>
    </section>

    <section v-else-if="state.step === 'processing'" class="panel">
      <h2>3. Processing</h2>
      <p>Captured photo: {{ state.session.capture?.photoId }}</p>
      <button :disabled="isBusy" @click="runProcessing">Run Processing</button>
    </section>

    <section v-else-if="state.step === 'archive'" class="panel">
      <h2>4. Archive</h2>
      <p>Processed photo: {{ state.session.processed?.photoId }}</p>
      <button :disabled="isBusy" @click="runArchive">Run Archive</button>
    </section>

    <section v-else-if="state.step === 'print'" class="panel">
      <h2>5. Print</h2>
      <p>Archived photo: {{ state.session.archived?.photoId }}</p>
      <button :disabled="isBusy" @click="runPrint">Run Print</button>
    </section>

    <section v-else-if="state.step === 'done'" class="panel">
      <h2>Done</h2>
      <p>Printed photo: {{ state.session.printed?.photoId }}</p>
      <button :disabled="isBusy" @click="restart">Restart Loop</button>
    </section>

    <section v-else class="panel error-panel">
      <h2>Error</h2>
      <p>{{ state.errorMessage }}</p>
      <div class="actions">
        <button :disabled="isBusy" @click="retry">Retry Step</button>
        <button :disabled="isBusy" @click="restart">Restart Loop</button>
      </div>
    </section>

    <section class="panel status-panel">
      <h2>Status</h2>
      <p>{{ statusMessage }}</p>
    </section>
  </main>
</template>

<style scoped>
.booth-shell {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem 3rem;
  display: grid;
  gap: 1rem;
}

.booth-header h1 {
  margin-top: 0.35rem;
}

.eyebrow {
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
}

.panel {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
  display: grid;
  gap: 0.75rem;
}

.grid {
  display: grid;
  gap: 0.75rem;
}

label {
  display: grid;
  gap: 0.35rem;
}

input,
select,
button {
  font: inherit;
}

input,
select {
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 0.45rem 0.55rem;
  background: var(--color-background-soft);
  color: var(--color-text);
}

button {
  width: fit-content;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 0.45rem 0.65rem;
  background: var(--color-background-mute);
  color: var(--color-text);
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.errors {
  color: #af2f2f;
  padding-left: 1rem;
}

.error-panel {
  border-color: #af2f2f;
}

.actions {
  display: flex;
  gap: 0.75rem;
}
</style>
