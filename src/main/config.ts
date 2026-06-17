import * as os from 'os';
import * as path from 'path';

export interface AppConfig {
  /** Base URL for the DigiCamControl HTTP API. */
  digiCamControlUrl: string;
  /** Folder where originals and processed images are archived. */
  saveFolder: string;
  /** Folder watched by the printing application for auto-printing. */
  hotPrintFolder: string;
}

/**
 * Loads application configuration from environment variables,
 * falling back to sensible defaults for a Windows environment.
 */
export function loadConfig(): AppConfig {
  return {
    digiCamControlUrl:
      process.env.DIGICAM_URL ?? 'http://localhost:5513',
    saveFolder:
      process.env.SAVE_FOLDER ??
      path.join(os.homedir(), 'PhotoBooth', 'saved'),
    hotPrintFolder:
      process.env.HOT_PRINT_FOLDER ??
      path.join(os.homedir(), 'PhotoBooth', 'hotprint'),
  };
}
