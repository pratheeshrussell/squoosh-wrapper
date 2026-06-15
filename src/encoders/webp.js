/**
 * WebP encoder wrapper.
 * Encodes raw RGBA ImageData to WebP using the libwebp WASM codec.
 * Auto-detects SIMD support and uses the optimized variant when available.
 *
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0
 */
import { initEmscriptenModule } from '../utils.js';
import { simd } from '../feature-detect.js';

/** @type {Promise<any>} */
let modulePromise;

async function initModule() {
  if (await simd()) {
    const mod = await import('../../codecs/webp/enc/webp_enc_simd.js');
    return initEmscriptenModule(mod.default);
  }
  const mod = await import('../../codecs/webp/enc/webp_enc.js');
  return initEmscriptenModule(mod.default);
}

/**
 * Default WebP encode options (matches Squoosh defaults).
 * These come from struct WebPConfig in libwebp's encode.h.
 */
export const defaultOptions = {
  quality: 75,
  target_size: 0,
  target_PSNR: 0,
  method: 4,
  sns_strength: 50,
  filter_strength: 60,
  filter_sharpness: 0,
  filter_type: 1,
  partitions: 0,
  segments: 4,
  pass: 1,
  show_compressed: 0,
  preprocessing: 0,
  autofilter: 0,
  partition_limit: 0,
  alpha_compression: 1,
  alpha_filtering: 1,
  alpha_quality: 100,
  lossless: 0,
  exact: 0,
  image_hint: 0,
  emulate_jpeg_size: 0,
  thread_level: 0,
  low_memory: 0,
  near_lossless: 100,
  use_delta_palette: 0,
  use_sharp_yuv: 0,
};

/**
 * Encode ImageData to WebP.
 * @param {ImageData} imageData - Raw RGBA image data.
 * @param {Partial<typeof defaultOptions>} [options] - Encode options.
 * @returns {Promise<ArrayBuffer>} The encoded WebP data.
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

  if (!result) throw new Error('WebP encoding error');
  return result.buffer;
}

export default { encode, defaultOptions };
