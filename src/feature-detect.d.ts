/**
 * Detect WASM SIMD support.
 */
export function simd(): Promise<boolean>;

/**
 * Detect WASM threads (SharedArrayBuffer) support.
 */
export function threads(): boolean;
