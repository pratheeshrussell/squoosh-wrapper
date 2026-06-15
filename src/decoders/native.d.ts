/**
 * Decode an image file (Blob, ArrayBuffer, or File) to ImageData using the browser's native decoder.
 * Works for JPEG, PNG, GIF, BMP, WebP, AVIF (where supported), etc.
 */
export function decode(source: Blob | File | ArrayBuffer): Promise<ImageData>;

/**
 * Decode an image from a URL to ImageData.
 */
export function decodeUrl(url: string): Promise<ImageData>;
