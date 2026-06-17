import * as path from 'path';
import { CameraPort } from '../ports/CameraPort';
import { FileSystemPort } from '../ports/FileSystemPort';
import { ImageProcessingPort } from '../ports/ImageProcessingPort';

export interface WorkflowConfig {
  /** Folder where both the original and processed images are saved. */
  saveFolder: string;
  /** Folder watched by the printing application for auto-printing. */
  hotPrintFolder: string;
}

/**
 * Orchestrates the photobooth capture workflow:
 *  1. Trigger camera capture → raw image
 *  2. Apply image-processing middlewares (none by default)
 *  3. Copy original + processed images to the save folder
 *  4. Copy processed image to the hot-print folder
 */
export class CaptureWorkflow {
  constructor(
    private readonly camera: CameraPort,
    private readonly fileSystem: FileSystemPort,
    private readonly middlewares: ImageProcessingPort[],
    private readonly config: WorkflowConfig,
  ) {}

  async run(): Promise<void> {
    // Step 1 – capture
    const originalPath = await this.camera.capture();
    const filename = path.basename(originalPath);

    // Step 2 – process
    const processedPath = await this.applyMiddlewares(originalPath, filename);

    // Step 3 – save originals and processed copies
    await this.fileSystem.copyFile(
      originalPath,
      path.join(this.config.saveFolder, 'originals', filename),
    );
    await this.fileSystem.copyFile(
      processedPath,
      path.join(this.config.saveFolder, 'processed', filename),
    );

    // Step 4 – hot-print drop
    await this.fileSystem.copyFile(
      processedPath,
      path.join(this.config.hotPrintFolder, filename),
    );
  }

  /**
   * Applies the registered middlewares sequentially.
   * With no middlewares the original path is returned unchanged.
   */
  private async applyMiddlewares(
    originalPath: string,
    filename: string,
  ): Promise<string> {
    if (this.middlewares.length === 0) {
      return originalPath;
    }

    // Derive a processing output path next to the original file.
    const processingDir = path.dirname(originalPath);
    const outputPath = path.join(processingDir, `processed_${filename}`);

    let currentInput = originalPath;
    for (let i = 0; i < this.middlewares.length; i++) {
      const isLast = i === this.middlewares.length - 1;
      const currentOutput = isLast
        ? outputPath
        : path.join(processingDir, `mw${i}_${filename}`);
      await this.middlewares[i].process(currentInput, currentOutput);
      currentInput = currentOutput;
    }

    return outputPath;
  }
}
