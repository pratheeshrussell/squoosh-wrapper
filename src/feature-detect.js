/**
 * Feature detection for WASM SIMD and threads support.
 * Inlined from wasm-feature-detect to avoid external dependencies.
 *
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0
 */

/**
 * Detect WASM SIMD support.
 * @returns {Promise<boolean>}
 */
export async function simd() {
  try {
    // A minimal WASM module that uses a v128 SIMD type.
    return WebAssembly.validate(
      new Uint8Array([
        0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10,
        10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11,
      ]),
    );
  } catch {
    return false;
  }
}

/**
 * Detect WASM threads (SharedArrayBuffer) support.
 * Requires Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy headers.
 * @returns {boolean}
 */
export function threads() {
  try {
    if (typeof SharedArrayBuffer === 'undefined') return false;
    new SharedArrayBuffer(1);
    // Also verify WASM shared memory support
    new WebAssembly.Memory({ initial: 1, maximum: 1, shared: true });
    return true;
  } catch {
    return false;
  }
}
