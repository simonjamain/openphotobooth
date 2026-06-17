import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as tauriFs from '@tauri-apps/plugin-fs';
import { TauriFileSystemAdapter } from '../../../src/adapters/TauriFileSystemAdapter';

vi.mock('@tauri-apps/plugin-fs');

describe('TauriFileSystemAdapter', () => {
  let adapter: TauriFileSystemAdapter;

  beforeEach(() => {
    adapter = new TauriFileSystemAdapter();
    vi.mocked(tauriFs.mkdir).mockResolvedValue(undefined);
    vi.mocked(tauriFs.copyFile).mockResolvedValue(undefined);
  });

  it('creates the destination directory before copying', async () => {
    await adapter.copyFile('/src/photo.jpg', '/dest/folder/photo.jpg');

    expect(tauriFs.mkdir).toHaveBeenCalledWith('/dest/folder', {
      recursive: true,
    });
  });

  it('copies the source file to the destination path', async () => {
    await adapter.copyFile('/src/photo.jpg', '/dest/folder/photo.jpg');

    expect(tauriFs.copyFile).toHaveBeenCalledWith(
      '/src/photo.jpg',
      '/dest/folder/photo.jpg',
    );
  });

  it('handles Windows-style destination paths', async () => {
    await adapter.copyFile(
      'C:/src/photo.jpg',
      'C:/dest/folder/photo.jpg',
    );

    expect(tauriFs.mkdir).toHaveBeenCalledWith('C:/dest/folder', {
      recursive: true,
    });
    expect(tauriFs.copyFile).toHaveBeenCalledWith(
      'C:/src/photo.jpg',
      'C:/dest/folder/photo.jpg',
    );
  });

  it('propagates mkdir errors', async () => {
    vi.mocked(tauriFs.mkdir).mockRejectedValue(new Error('Permission denied'));

    await expect(
      adapter.copyFile('/src/photo.jpg', '/dest/folder/photo.jpg'),
    ).rejects.toThrow('Permission denied');
  });

  it('propagates copyFile errors', async () => {
    vi.mocked(tauriFs.copyFile).mockRejectedValue(new Error('Disk full'));

    await expect(
      adapter.copyFile('/src/photo.jpg', '/dest/folder/photo.jpg'),
    ).rejects.toThrow('Disk full');
  });
});
