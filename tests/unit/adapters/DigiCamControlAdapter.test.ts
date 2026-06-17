import { DigiCamControlAdapter } from '../../../src/main/adapters/DigiCamControlAdapter';

describe('DigiCamControlAdapter', () => {
  const BASE_URL = 'http://localhost:5513';
  let adapter: DigiCamControlAdapter;

  beforeEach(() => {
    adapter = new DigiCamControlAdapter(BASE_URL);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls the capturenoaf endpoint', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue('C:\\captures\\photo.jpg'),
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    await adapter.capture();

    expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/capturenoaf`);
  });

  it('returns the trimmed file path from the response body', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue('  C:\\captures\\photo.jpg\n'),
    }) as unknown as typeof fetch;

    const result = await adapter.capture();

    expect(result).toBe('C:\\captures\\photo.jpg');
  });

  it('throws when the HTTP response is not ok', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    }) as unknown as typeof fetch;

    await expect(adapter.capture()).rejects.toThrow(
      /DigiCamControl capture failed/,
    );
  });

  it('throws when the response body contains an error message', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue('Capture error'),
    }) as unknown as typeof fetch;

    await expect(adapter.capture()).rejects.toThrow(
      /DigiCamControl returned an error/,
    );
  });

  it('uses the default base URL when none is provided', async () => {
    const defaultAdapter = new DigiCamControlAdapter();
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue('/path/to/photo.jpg'),
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    await defaultAdapter.capture();

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:5513/capturenoaf');
  });
});
