/**
 * Image resize processor wrapper.
 * Resizes raw RGBA ImageData using the squoosh_resize Rust WASM codec (wasm-bindgen).
 *
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0
 */

/** @type {Promise<void>} */
let initPromise;
let resizeModule;

async function initModule() {
  const mod = await import('../../codecs/resize/pkg/squoosh_resize.js');
  await mod.default(); // init() — loads WASM via import.meta.url
  resizeModule = mod;
}

/**
 * Resize method constants.
 * These map to the `typ_idx` parameter of the WASM resize function.
 */
export const ResizeMethod = {
  triangle: 0,
  catrom: 1,
  mitchell: 2,
  lanczos3: 3,
};

/**
 * Default resize options.
 */
export const defaultOptions = {
  method: 'lanczos3',
  premultiply: true,
  linearRGB: true,
};

/**
 * Resize ImageData to new dimensions.
 * @param {ImageData} imageData - Source RGBA image data.
 * @param {object} options - Resize options.
 * @param {number} options.width - Target width.
 * @param {number} options.height - Target height.
 * @param {'triangle'|'catrom'|'mitchell'|'lanczos3'} [options.method='lanczos3'] - Resize algorithm.
 * @param {boolean} [options.premultiply=true] - Premultiply alpha.
 * @param {boolean} [options.linearRGB=true] - Use linear RGB color space.
 * @returns {Promise<ImageData>} Resized RGBA ImageData.
 */
export async function resize(imageData, options) {
  if (!initPromise) initPromise = initModule();
  await initPromise;

  const opts = { ...defaultOptions, ...options };
  const methodIdx =
    typeof opts.method === 'number'
      ? opts.method
      : ResizeMethod[opts.method] ?? ResizeMethod.lanczos3;

  const result = resizeModule.resize(
    new Uint8Array(imageData.data.buffer),
    imageData.width,
    imageData.height,
    opts.width,
    opts.height,
    methodIdx,
    opts.premultiply,
    opts.linearRGB,
  );

  return new ImageData(
    new Uint8ClampedArray(result.buffer),
    opts.width,
    opts.height,
  );
}

export default { resize, ResizeMethod, defaultOptions };
