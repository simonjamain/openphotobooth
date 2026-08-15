export type KeyboardInput = {
  type: 'keyboard'
  code: string
  key: string
}

export type GamepadInput = {
  type: 'gamepad'
  gamepadId: string
  gamepadIndex: number
  button: number
}

export type Input = KeyboardInput | GamepadInput

export class InputManager {
  private gamepads = new Map<number, Gamepad>()
  private previousButtons = new Map<number, boolean[]>()

  private keyboardHandler:
    ((event: KeyboardEvent) => void) | null = null

  private inputResolver:
    ((input: Input) => void) | null = null

  private animationFrameId: number | null = null

  private handleGamepadConnected = (
    event: GamepadEvent,
  ): void => {
    const gamepad = event.gamepad

    this.gamepads.set(gamepad.index, gamepad)

    this.previousButtons.set(
      gamepad.index,
      gamepad.buttons.map(() => false),
    )
  }

  private handleGamepadDisconnected = (
    event: GamepadEvent,
  ): void => {
    this.gamepads.delete(event.gamepad.index)
    this.previousButtons.delete(event.gamepad.index)
  }

  constructor() {
    window.addEventListener(
      'gamepadconnected',
      this.handleGamepadConnected,
    )

    window.addEventListener(
      'gamepaddisconnected',
      this.handleGamepadDisconnected,
    )

    this.updateGamepads()
  }

  private updateGamepads(): void {
    for (const gamepad of navigator.getGamepads()) {
      if (!gamepad) {
        continue
      }

      const previous =
        this.previousButtons.get(gamepad.index) ?? []

      gamepad.buttons.forEach((button, buttonIndex) => {
        const pressed = button.pressed
        const wasPressed = previous[buttonIndex] ?? false

        // On ne déclenche que lors de l'appui initial.
        if (pressed && !wasPressed) {
          this.handleInput({
            type: 'gamepad',
            gamepadId: gamepad.id,
            gamepadIndex: gamepad.index,
            button: buttonIndex,
          })
        }
      })

      this.previousButtons.set(
        gamepad.index,
        gamepad.buttons.map(
          (button) => button.pressed,
        ),
      )
    }

    this.animationFrameId = requestAnimationFrame(
      () => this.updateGamepads(),
    )
  }

  private handleInput(input: Input): void {
    if (!this.inputResolver) {
      return
    }

    const resolve = this.inputResolver

    this.inputResolver = null

    this.stopKeyboardListening()

    resolve(input)
  }

  waitForInput(): Promise<Input> {
    return new Promise<Input>((resolve) => {
      this.inputResolver = resolve

      this.startKeyboardListening()
    })
  }

  private startKeyboardListening(): void {
    // Évite d'enregistrer plusieurs listeners.
    this.stopKeyboardListening()

    this.keyboardHandler = (
      event: KeyboardEvent,
    ): void => {
      // Ignore les répétitions lorsque la touche
      // est maintenue enfoncée.
      if (event.repeat) {
        return
      }

      this.handleInput({
        type: 'keyboard',
        code: event.code,
        key: event.key,
      })
    }

    window.addEventListener(
      'keydown',
      this.keyboardHandler,
    )
  }

  private stopKeyboardListening(): void {
    if (!this.keyboardHandler) {
      return
    }

    window.removeEventListener(
      'keydown',
      this.keyboardHandler,
    )

    this.keyboardHandler = null
  }

  destroy(): void {
    window.removeEventListener(
      'gamepadconnected',
      this.handleGamepadConnected,
    )

    window.removeEventListener(
      'gamepaddisconnected',
      this.handleGamepadDisconnected,
    )

    this.stopKeyboardListening()

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)

      this.animationFrameId = null
    }

    this.gamepads.clear()
    this.previousButtons.clear()

    this.inputResolver = null
  }
}

export function inputsEqual(
  a: Input | null,
  b: Input | null,
): boolean {
  if (!a || !b) {
    return false
  }

  if (a.type !== b.type) {
    return false
  }

  if (
    a.type === 'keyboard' &&
    b.type === 'keyboard'
  ) {
    return a.code === b.code
  }

  if (
    a.type === 'gamepad' &&
    b.type === 'gamepad'
  ) {
    return (
      a.gamepadId === b.gamepadId &&
      a.button === b.button
    )
  }

  return false
}