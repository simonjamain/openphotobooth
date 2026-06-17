import { promises as fs } from 'fs';
import { ImageProcessingPort } from '../domain/ports/ImageProcessingPort';

/**
 * No-op image processing middleware.
 * Simply copies the input file to the output path without modification.
 * Used as a placeholder until real processing middlewares are implemented.
 */
export class NoOpImageProcessingAdapter implements ImageProcessingPort {
  async process(inputPath: string, outputPath: string): Promise<void> {
    await fs.copyFile(inputPath, outputPath);
  }
}
