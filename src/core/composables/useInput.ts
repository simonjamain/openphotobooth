import { onUnmounted } from 'vue'
import { InputManager, type Input } from '../services/inputManager'



export function useInput() {
  const inputManager = new InputManager()

  const waitForInput = (): Promise<Input> => {
    return inputManager.waitForInput()
  }

  onUnmounted(() => {
    inputManager.destroy()
  })

  return {
    waitForInput,
  }
}