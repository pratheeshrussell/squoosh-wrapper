/**
 * WebP decoder wrapper.
 * Decodes WebP data to raw RGBA ImageData using the libwebp WASM codec.
 *
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0
 */
import { initEmscriptenModule } from '../utils.js';

/** @type {Promise<any>} */
let modulePromise;

function initModule() {
  return import('../../codecs/webp/dec/webp_dec.js').then((m) =>
    initEmscriptenModule(m.default),
  );
}

/**
 * Decode WebP data to ImageData.
 * @param {ArrayBuffer|Uint8Array} data - WebP file data.
 * @returns {Promise<ImageData>} Decoded RGBA ImageData.
 */
export async function decode(data) {
  if (!modulePromise) modulePromise = initModule();
  const module = await modulePromise;

  const input = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
  const result = module.decode(input.buffer);

  if (!result) throw new Error('WebP decoding error');
  return result;
}

export default { decode };
