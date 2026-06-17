import { promises as fs } from 'fs';
import * as path from 'path';
import { FileSystemPort } from '../domain/ports/FileSystemPort';

/**
 * File system adapter backed by the Node.js built-in `fs` module.
 */
export class NodeFileSystemAdapter implements FileSystemPort {
  async copyFile(src: string, dest: string): Promise<void> {
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.copyFile(src, dest);
  }
}
