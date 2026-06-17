/**
 * Port for controlling a camera/tethering application.
 */
export interface CameraPort {
  /**
   * Triggers a capture and returns the file path of the captured image.
   */
  capture(): Promise<string>;
}
