import { contextBridge, ipcRenderer } from 'electron';

/**
 * Exposes a minimal, safe API to the renderer via the context bridge.
 * This keeps nodeIntegration disabled while still allowing renderer↔main IPC.
 */
contextBridge.exposeInMainWorld('photobooth', {
  /**
   * Triggers a full capture cycle.
   * Resolves when the cycle completes successfully, rejects on error.
   */
  capture: (): Promise<void> => ipcRenderer.invoke('capture'),

  /**
   * Registers a listener for capture status updates sent from the main process.
   * @param callback Receives a status string: 'capturing' | 'ready' | 'error: <message>'
   */
  onStatus: (callback: (status: string) => void): void => {
    ipcRenderer.on('capture-status', (_event, status: string) =>
      callback(status),
    );
  },
});
