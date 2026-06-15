/**
 * AVIF encoder wrapper.
 * Encodes raw RGBA ImageData to AVIF using the libavif/libaom WASM codec.
 * Auto-detects threads support and uses the multi-threaded variant when available.
 *
 * Note: Multi-threaded AVIF encoding requires Cross-Origin-Opener-Policy and
 * Cross-Origin-Embedder-Policy headers on the page. Without these headers,
 * the encoder falls back to single-threaded mode gracefully.
 *
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0
 */
import { initEmscriptenModule } from '../utils.js';
import { threads } from '../feature-detect.js';

/** @type {Promise<any>} */
let modulePromise;

async function initModule() {
  if (threads()) {
    const mod = await import('../../codecs/avif/enc/avif_enc_mt.js');
    return initEmscriptenModule(mod.default);
  }
  const mod = await import('../../codecs/avif/enc/avif_enc.js');
  return initEmscriptenModule(mod.default);
}

/**
 * AVIFTune enum.
 */
export const AVIFTune = {
  auto: 0,
  psnr: 1,
  ssim: 2,
};

/**
 * Default AVIF encode options (matches Squoosh defaults).
 */
export const defaultOptions = {
  quality: 50,
  qualityAlpha: -1,
  denoiseLevel: 0,
  tileColsLog2: 0,
  tileRowsLog2: 0,
  speed: 6,
  subsample: 1,
  chromaDeltaQ: false,
  sharpness: 0,
  tune: AVIFTune.auto,
  enableSharpYUV: false,
};

/**
 * Encode ImageData to AVIF.
 * @param {ImageData} imageData - Raw RGBA image data.
 * @param {Partial<typeof defaultOptions>} [options] - Encode options.
 * @returns {Promise<ArrayBuffer>} The encoded AVIF data.
 */
export async function encode(imageData, options = {}) {
  if (!modulePromise) modulePromise = initModule();
  const module = await modulePromise;

  const opts = { ...defaultOptions, ...options };
  const result = module.encode(
    imageData.data,
    imageData.width,
    imageData.height,
    opts,
  );

  if (!result) throw new Error('AVIF encoding error');
  return result.buffer;
}

export default { encode, defaultOptions, AVIFTune };
