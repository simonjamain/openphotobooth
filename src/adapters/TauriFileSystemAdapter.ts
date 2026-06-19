import { copyFile, mkdir } from '@tauri-apps/plugin-fs';
import { dirname } from '../utils/path';
import { FileSystemPort } from '../domain/ports/FileSystemPort';

/**
 * File system adapter backed by the Tauri plugin-fs API.
 * Creates parent directories as needed before copying.
 */
export class TauriFileSystemAdapter implements FileSystemPort {
  async copyFile(src: string, dest: string): Promise<void> {
    await mkdir(dirname(dest), { recursive: true });
    await copyFile(src, dest);
  }
}
