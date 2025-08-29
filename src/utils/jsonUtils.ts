/**
 * Safely parses a JSON string.
 * Returns null (or a fallback) if parsing fails or input is invalid.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function safeParseJSON<T = any>(str: string, fallback: T | null = null): T | null {
  try {
    if (!str || typeof str !== 'string' || str.trim() === '') {
      return fallback;
    }
    return JSON.parse(str) as T;
  } catch (e) {
    console.error('Invalid JSON:', e instanceof Error ? e.message : e);
    return fallback;
  }
}
