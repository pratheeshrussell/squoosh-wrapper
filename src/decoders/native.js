/**
 * Native browser image decoder.
 * Uses Canvas to decode any browser-supported image format (JPEG, PNG, GIF, WebP, AVIF, etc.)
 * into raw RGBA ImageData.
 *
 * This is the simplest way to get ImageData from standard image files in the browser.
 * For formats the browser doesn't natively support, use the WASM-based decoders instead.
 */

/**
 * Decode an image file (Blob or ArrayBuffer) to ImageData using the browser's native decoder.
 * Works for JPEG, PNG, GIF, BMP, WebP, AVIF (where browser-supported), etc.
 *
 * @param {Blob|ArrayBuffer|File} source - Image data to decode.
 * @returns {Promise<ImageData>} Decoded RGBA ImageData.
 */
export async function decode(source) {
  const blob =
    source instanceof Blob ? source : new Blob([source]);

  // Use createImageBitmap for efficient off-main-thread decoding
  const bitmap = await createImageBitmap(blob);

  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0);

  return ctx.getImageData(0, 0, bitmap.width, bitmap.height);
}

/**
 * Decode an image from a URL to ImageData.
 * @param {string} url - URL of the image to decode.
 * @returns {Promise<ImageData>} Decoded RGBA ImageData.
 */
export async function decodeUrl(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  return decode(blob);
}

export default { decode, decodeUrl };
