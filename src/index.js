/**
 * Squoosh Library — Main Entry Point
 *
 * Browser library wrapper around Squoosh WASM codecs for image
 * encoding, decoding, resizing, and processing.
 *
 * Each codec is lazy-loaded: the WASM binary is only fetched when you
 * first call a function from that codec.
 *
 * Usage:
 *   import { mozjpeg, webp, avif, png, resize, nativeDecode } from './src/index.js';
 *
 *   // Decode any browser-supported image to ImageData
 *   const imageData = await nativeDecode.decode(file);
 *
 *   // Encode to different formats
 *   const jpegBuf = await mozjpeg.encode(imageData, { quality: 80 });
 *   const webpBuf = await webp.encode(imageData, { quality: 75 });
 *   const avifBuf = await avif.encode(imageData, { quality: 50 });
 *
 *   // Resize
 *   const resized = await resize.resize(imageData, { width: 800, height: 600 });
 *
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0
 */

// ─── Encoders ────────────────────────────────────────────────────────────
export * as mozjpeg from './encoders/mozjpeg.js';
export * as webp from './encoders/webp.js';
export * as avif from './encoders/avif.js';
export * as png from './encoders/png.js';

// ─── Decoders ────────────────────────────────────────────────────────────
export * as webpDecode from './decoders/webp.js';
export * as avifDecode from './decoders/avif.js';
export * as nativeDecode from './decoders/native.js';
// PNG decode is also available via the `png` export above (png.decode)

// ─── Processors ──────────────────────────────────────────────────────────
export * as resize from './processors/resize.js';

// ─── Utilities ───────────────────────────────────────────────────────────
export * as featureDetect from './feature-detect.js';
