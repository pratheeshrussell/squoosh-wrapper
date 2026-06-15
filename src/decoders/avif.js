/**
 * AVIF decoder wrapper.
 * Decodes AVIF data to raw RGBA ImageData using the libavif WASM codec.
 *
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0
 */
import { initEmscriptenModule } from '../utils.js';

/** @type {Promise<any>} */
let modulePromise;

function initModule() {
  return import('../../codecs/avif/dec/avif_dec.js').then((m) =>
    initEmscriptenModule(m.default),
  );
}

/**
 * Decode AVIF data to ImageData.
 * @param {ArrayBuffer|Uint8Array} data - AVIF file data.
 * @returns {Promise<ImageData>} Decoded RGBA ImageData.
 */
export async function decode(data) {
  if (!modulePromise) modulePromise = initModule();
  const module = await modulePromise;

  const input = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
  const result = module.decode(input.buffer);

  if (!result) throw new Error('AVIF decoding error');
  return result;
}

export default { decode };
