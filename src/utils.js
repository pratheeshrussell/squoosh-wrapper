/**
 * Shared utilities for Squoosh codec wrappers.
 *
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0
 */

/**
 * Initialize an Emscripten WASM module from its factory function.
 * @template {EmscriptenWasm.Module} T
 * @param {function} moduleFactory - The factory function exported by the Emscripten JS glue.
 * @returns {Promise<T>}
 */
export function initEmscriptenModule(moduleFactory) {
  return moduleFactory({ noInitialRun: true });
}

/**
 * Create an ImageData-like object from raw RGBA pixel data.
 * Useful in contexts where the global ImageData constructor isn't available (e.g., Workers).
 * @param {Uint8ClampedArray} data - RGBA pixel data
 * @param {number} width
 * @param {number} height
 * @returns {{ data: Uint8ClampedArray, width: number, height: number }}
 */
export function createImageData(data, width, height) {
  if (typeof ImageData !== 'undefined') {
    return new ImageData(data, width, height);
  }
  return { data, width, height };
}
