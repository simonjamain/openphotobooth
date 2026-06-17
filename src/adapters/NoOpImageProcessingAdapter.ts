import { FileSystemPort } from '../domain/ports/FileSystemPort';
import { ImageProcessingPort } from '../domain/ports/ImageProcessingPort';

/**
 * No-op image processing middleware.
 * Simply delegates to the file system port to copy input to output unchanged.
 * Used as a placeholder until real processing middlewares are implemented.
 */
export class NoOpImageProcessingAdapter implements ImageProcessingPort {
  constructor(private readonly fs: FileSystemPort) {}

  async process(inputPath: string, outputPath: string): Promise<void> {
    await this.fs.copyFile(inputPath, outputPath);
  }
}
