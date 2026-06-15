/**
 * PNG encoder/decoder wrapper.
 * Uses the squoosh_png Rust WASM codec (wasm-bindgen) for PNG encoding and decoding.
 *
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0
 */

/** @type {Promise<any>} */
let modulePromise;
let pngModule;

async function initModule() {
  const mod = await import('../../codecs/png/pkg/squoosh_png.js');
  await mod.default(); // init() — loads the WASM via import.meta.url
  pngModule = mod;
}

/**
 * Encode raw RGBA ImageData to PNG.
 * @param {ImageData} imageData - Raw RGBA image data.
 * @returns {Promise<ArrayBuffer>} The encoded PNG data.
 */
export async function encode(imageData) {
  if (!modulePromise) modulePromise = initModule();
  await modulePromise;

  const result = pngModule.encode(
    new Uint8Array(imageData.data.buffer),
    imageData.width,
    imageData.height,
  );

  return result.buffer;
}

/**
 * Decode PNG data to ImageData.
 * @param {Uint8Array|ArrayBuffer} data - PNG file data.
 * @returns {Promise<ImageData>} Decoded RGBA ImageData.
 */
export async function decode(data) {
  if (!modulePromise) modulePromise = initModule();
  await modulePromise;

  const input = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
  return pngModule.decode(input);
}

export default { encode, decode };
