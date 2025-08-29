/**
 * Safely parses a JSON string.
 * Returns null (or a fallback) if parsing fails or input is invalid.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function safeParseJSON<T>(str: string | undefined | null): T | undefined {
  try {
    if (!str || typeof str !== 'string' || str.trim() === '') {
      return undefined;
    }
    return JSON.parse(str) as T;
  } catch (e) {
    console.error('Invalid JSON:', e);
    return undefined;
  }
}
