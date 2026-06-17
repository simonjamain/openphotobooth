import { CameraPort } from '../domain/ports/CameraPort';

/**
 * Camera adapter that triggers capture via the DigiCamControl simple HTTP API.
 * DigiCamControl must be running with its HTTP server enabled (default port 5513).
 *
 * @see http://digicamcontrol.com/doc/userguide/web
 */
export class DigiCamControlAdapter implements CameraPort {
  constructor(private readonly baseUrl: string = 'http://localhost:5513') {}

  async capture(): Promise<string> {
    const url = `${this.baseUrl}/capturenoaf`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `DigiCamControl capture failed: ${response.status} ${response.statusText}`,
      );
    }

    const filePath = (await response.text()).trim();

    if (!filePath || filePath.toLowerCase().includes('error')) {
      throw new Error(`DigiCamControl returned an error: ${filePath}`);
    }

    return filePath;
  }
}
