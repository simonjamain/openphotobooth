import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DigiCamControlAdapter } from '../../../src/adapters/DigiCamControlAdapter';

describe('DigiCamControlAdapter', () => {
  const BASE_URL = 'http://localhost:5513';
  let adapter: DigiCamControlAdapter;

  beforeEach(() => {
    adapter = new DigiCamControlAdapter(BASE_URL);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls the capturenoaf endpoint', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue('C:\\captures\\photo.jpg'),
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    await adapter.capture();

    expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/capturenoaf`);
  });

  it('returns a forward-slash normalised file path', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue('  C:\\captures\\photo.jpg\n'),
    }) as unknown as typeof fetch;

    const result = await adapter.capture();

    expect(result).toBe('C:/captures/photo.jpg');
  });

  it('throws when the HTTP response is not ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    }) as unknown as typeof fetch;

    await expect(adapter.capture()).rejects.toThrow(
      /DigiCamControl capture failed/,
    );
  });

  it('throws when the response body contains an error message', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue('Capture error'),
    }) as unknown as typeof fetch;

    await expect(adapter.capture()).rejects.toThrow(
      /DigiCamControl returned an error/,
    );
  });

  it('uses the default base URL when none is provided', async () => {
    const defaultAdapter = new DigiCamControlAdapter();
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue('/path/to/photo.jpg'),
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    await defaultAdapter.capture();

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:5513/capturenoaf');
  });
});
