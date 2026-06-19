/**
 * Port for file system operations.
 */
export interface FileSystemPort {
  /**
   * Copies a file from src to dest, creating parent directories as needed.
   */
  copyFile(src: string, dest: string): Promise<void>;
}
