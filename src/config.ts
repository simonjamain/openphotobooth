export interface AppConfig {
  /** Base URL for the DigiCamControl HTTP API. */
  digiCamControlUrl: string;
  /** Folder where originals and processed images are archived. */
  saveFolder: string;
  /** Folder watched by the printing application for auto-printing. */
  hotPrintFolder: string;
}

/**
 * Loads application configuration from Vite build-time environment variables,
 * falling back to sensible Windows defaults.
 *
 * Override at build time via a `.env` file:
 *   VITE_DIGICAM_URL=http://localhost:5513
 *   VITE_SAVE_FOLDER=C:/Users/YourName/PhotoBooth/saved
 *   VITE_HOT_PRINT_FOLDER=C:/Users/YourName/PhotoBooth/hotprint
 */
export function loadConfig(): AppConfig {
  return {
    digiCamControlUrl:
      (import.meta.env.VITE_DIGICAM_URL as string | undefined) ??
      'http://localhost:5513',
    saveFolder:
      (import.meta.env.VITE_SAVE_FOLDER as string | undefined) ??
      'C:/Users/Public/PhotoBooth/saved',
    hotPrintFolder:
      (import.meta.env.VITE_HOT_PRINT_FOLDER as string | undefined) ??
      'C:/Users/Public/PhotoBooth/hotprint',
  };
}
