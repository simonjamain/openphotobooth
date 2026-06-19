/**
 * Minimal path utilities that handle both POSIX and Windows separators.
 * Used in places where Node's built-in `path` module is unavailable
 * (e.g. inside Tauri plugin adapters that run in the browser context).
 */

/** Returns the directory portion of a file path. */
export function dirname(filePath: string): string {
  const normalized = filePath.replace(/\\/g, '/');
  const lastSlash = normalized.lastIndexOf('/');
  if (lastSlash < 0) return '.';
  if (lastSlash === 0) return '/';
  return filePath.slice(0, lastSlash);
}
