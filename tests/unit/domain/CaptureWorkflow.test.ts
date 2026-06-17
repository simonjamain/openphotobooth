import * as path from 'path';
import { CaptureWorkflow } from '../../../src/main/domain/services/CaptureWorkflow';
import { CameraPort } from '../../../src/main/domain/ports/CameraPort';
import { FileSystemPort } from '../../../src/main/domain/ports/FileSystemPort';
import { ImageProcessingPort } from '../../../src/main/domain/ports/ImageProcessingPort';

const ORIGINAL_PATH = '/captures/photo.jpg';
const FILENAME = 'photo.jpg';

function makeConfig() {
  return { saveFolder: '/save', hotPrintFolder: '/hotprint' };
}

function makeCamera(filePath = ORIGINAL_PATH): jest.Mocked<CameraPort> {
  return { capture: jest.fn().mockResolvedValue(filePath) };
}

function makeFileSystem(): jest.Mocked<FileSystemPort> {
  return { copyFile: jest.fn().mockResolvedValue(undefined) };
}

describe('CaptureWorkflow', () => {
  describe('with no middlewares', () => {
    it('calls camera.capture() exactly once', async () => {
      const camera = makeCamera();
      const fs = makeFileSystem();
      const workflow = new CaptureWorkflow(camera, fs, [], makeConfig());

      await workflow.run();

      expect(camera.capture).toHaveBeenCalledTimes(1);
    });

    it('copies the original to the originals save folder', async () => {
      const camera = makeCamera();
      const fs = makeFileSystem();
      const workflow = new CaptureWorkflow(camera, fs, [], makeConfig());

      await workflow.run();

      expect(fs.copyFile).toHaveBeenCalledWith(
        ORIGINAL_PATH,
        path.join('/save', 'originals', FILENAME),
      );
    });

    it('copies the original to the processed save folder (no-op pipeline)', async () => {
      const camera = makeCamera();
      const fs = makeFileSystem();
      const workflow = new CaptureWorkflow(camera, fs, [], makeConfig());

      await workflow.run();

      expect(fs.copyFile).toHaveBeenCalledWith(
        ORIGINAL_PATH,
        path.join('/save', 'processed', FILENAME),
      );
    });

    it('copies the original to the hot-print folder (no-op pipeline)', async () => {
      const camera = makeCamera();
      const fs = makeFileSystem();
      const workflow = new CaptureWorkflow(camera, fs, [], makeConfig());

      await workflow.run();

      expect(fs.copyFile).toHaveBeenCalledWith(
        ORIGINAL_PATH,
        path.join('/hotprint', FILENAME),
      );
    });

    it('performs exactly 3 file copy operations', async () => {
      const camera = makeCamera();
      const fs = makeFileSystem();
      const workflow = new CaptureWorkflow(camera, fs, [], makeConfig());

      await workflow.run();

      expect(fs.copyFile).toHaveBeenCalledTimes(3);
    });
  });

  describe('with middlewares', () => {
    function makeMiddleware(): jest.Mocked<ImageProcessingPort> {
      return { process: jest.fn().mockResolvedValue(undefined) };
    }

    it('calls the middleware with the original file as input', async () => {
      const camera = makeCamera();
      const fs = makeFileSystem();
      const middleware = makeMiddleware();
      const workflow = new CaptureWorkflow(
        camera,
        fs,
        [middleware],
        makeConfig(),
      );

      await workflow.run();

      expect(middleware.process).toHaveBeenCalledTimes(1);
      const [inputArg] = middleware.process.mock.calls[0];
      expect(inputArg).toBe(ORIGINAL_PATH);
    });

    it('saves the processed file (not the original) to the hot-print folder', async () => {
      const camera = makeCamera();
      const fs = makeFileSystem();
      const middleware = makeMiddleware();
      const workflow = new CaptureWorkflow(
        camera,
        fs,
        [middleware],
        makeConfig(),
      );

      await workflow.run();

      // The processed output path is derived next to the original, with a prefix.
      const [, outputArg] = middleware.process.mock.calls[0];
      expect(fs.copyFile).toHaveBeenCalledWith(
        outputArg,
        path.join('/hotprint', FILENAME),
      );
    });
  });

  describe('error handling', () => {
    it('propagates errors thrown by the camera port', async () => {
      const camera: jest.Mocked<CameraPort> = {
        capture: jest.fn().mockRejectedValue(new Error('Camera offline')),
      };
      const fs = makeFileSystem();
      const workflow = new CaptureWorkflow(camera, fs, [], makeConfig());

      await expect(workflow.run()).rejects.toThrow('Camera offline');
    });

    it('propagates errors thrown by the file system port', async () => {
      const camera = makeCamera();
      const fs: jest.Mocked<FileSystemPort> = {
        copyFile: jest.fn().mockRejectedValue(new Error('Disk full')),
      };
      const workflow = new CaptureWorkflow(camera, fs, [], makeConfig());

      await expect(workflow.run()).rejects.toThrow('Disk full');
    });
  });
});
