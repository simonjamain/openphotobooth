import type {
  ArchivedPayload,
  CapturePayload,
  EntryPayload,
  PrintPayload,
  ProcessedPayload,
} from '@/core/plugins/contracts'

export type BoothStep =
  | 'flow-selection'
  | 'capture'
  | 'processing'
  | 'archive'
  | 'print'
  | 'done'
  | 'error'

export interface BoothSession {
  entry?: EntryPayload
  capture?: CapturePayload
  processed?: ProcessedPayload
  archived?: ArchivedPayload
  printed?: PrintPayload
}

export interface BoothState {
  step: BoothStep
  selectedFlowId?: string
  session: BoothSession
  errorMessage?: string
  previousStep?: Exclude<BoothStep, 'error'>
}

export const initialBoothState: BoothState = {
  step: 'flow-selection',
  session: {},
}

const withError = (
  state: BoothState,
  errorMessage: string,
  previousStep: Exclude<BoothStep, 'error'>,
): BoothState => {
  return {
    ...state,
    step: 'error',
    errorMessage,
    previousStep,
  }
}

export const selectFlow = (state: BoothState, flowId: string): BoothState => {
  return {
    step: 'capture',
    selectedFlowId: flowId,
    session: {},
    errorMessage: undefined,
    previousStep: undefined,
  }
}

export const setEntryResult = (state: BoothState, entry: EntryPayload): BoothState => {
  return {
    ...state,
    session: {
      ...state.session,
      entry,
    },
    errorMessage: undefined,
    previousStep: undefined,
  }
}

export const setCaptureResult = (state: BoothState, capture: CapturePayload): BoothState => {
  return {
    ...state,
    step: 'processing',
    session: {
      ...state.session,
      capture,
    },
    errorMessage: undefined,
    previousStep: undefined,
  }
}

export const setProcessingResult = (
  state: BoothState,
  processed: ProcessedPayload,
): BoothState => {
  return {
    ...state,
    step: 'archive',
    session: {
      ...state.session,
      processed,
    },
    errorMessage: undefined,
    previousStep: undefined,
  }
}

export const setArchiveResult = (state: BoothState, archived: ArchivedPayload): BoothState => {
  return {
    ...state,
    step: 'print',
    session: {
      ...state.session,
      archived,
    },
    errorMessage: undefined,
    previousStep: undefined,
  }
}

export const setPrintResult = (state: BoothState, printed: PrintPayload): BoothState => {
  return {
    ...state,
    step: 'done',
    session: {
      ...state.session,
      printed,
    },
    errorMessage: undefined,
    previousStep: undefined,
  }
}

export const setStepFailure = (
  state: BoothState,
  step: Exclude<BoothStep, 'error'>,
  message: string,
): BoothState => {
  return withError(state, message, step)
}

export const restartBooth = (): BoothState => {
  return {
    ...initialBoothState,
  }
}

export const retryFromError = (state: BoothState): BoothState => {
  if (state.step !== 'error') {
    return state
  }

  const step = state.previousStep ?? 'flow-selection'

  return {
    ...state,
    step,
    errorMessage: undefined,
    previousStep: undefined,
  }
}
