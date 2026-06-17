/**
 * Port for an image processing middleware step.
 * Middlewares are applied sequentially to produce the processed image.
 */
export interface ImageProcessingPort {
  /**
   * Reads the image at inputPath, applies processing, and writes the result to outputPath.
   */
  process(inputPath: string, outputPath: string): Promise<void>;
}
