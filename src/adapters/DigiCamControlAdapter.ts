import { CameraPort } from '../domain/ports/CameraPort';

/**
 * Camera adapter that triggers capture via the DigiCamControl simple HTTP API.
 * DigiCamControl must be running with its HTTP server enabled (default port 5513).
 * The returned file path is normalised to forward slashes for cross-platform use.
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

    const rawPath = (await response.text()).trim();

    if (!rawPath || rawPath.toLowerCase().includes('error')) {
      throw new Error(`DigiCamControl returned an error: ${rawPath}`);
    }

    // Normalise Windows backslashes so downstream path utilities work correctly.
    return rawPath.replace(/\\/g, '/');
  }
}
