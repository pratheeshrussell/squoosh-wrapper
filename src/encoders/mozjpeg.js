/**
 * MozJPEG encoder wrapper.
 * Encodes raw RGBA ImageData to optimized JPEG using the MozJPEG WASM codec.
 *
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0
 */
import { initEmscriptenModule } from '../utils.js';

/** @type {Promise<any>} */
let modulePromise;

function initModule() {
  return import('../../codecs/mozjpeg/enc/mozjpeg_enc.js').then((m) =>
    initEmscriptenModule(m.default),
  );
}

/**
 * MozJpegColorSpace enum (mirrors the C++ enum).
 */
export const MozJpegColorSpace = {
  GRAYSCALE: 1,
  RGB: 2,
  YCbCr: 3,
};

/**
 * Default MozJPEG encode options (matches Squoosh defaults).
 */
export const defaultOptions = {
  quality: 75,
  baseline: false,
  arithmetic: false,
  progressive: true,
  optimize_coding: true,
  smoothing: 0,
  color_space: MozJpegColorSpace.YCbCr,
  quant_table: 3,
  trellis_multipass: false,
  trellis_opt_zero: false,
  trellis_opt_table: false,
  trellis_loops: 1,
  auto_subsample: true,
  chroma_subsample: 2,
  separate_chroma_quality: false,
  chroma_quality: 75,
};

/**
 * Encode ImageData to JPEG using MozJPEG.
 * @param {ImageData} imageData - Raw RGBA image data.
 * @param {Partial<typeof defaultOptions>} [options] - Encode options.
 * @returns {Promise<ArrayBuffer>} The encoded JPEG data.
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

  return result.buffer;
}

export default { encode, defaultOptions, MozJpegColorSpace };
