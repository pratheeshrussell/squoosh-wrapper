/**
 * Encode ImageData to PNG.
 * @returns The encoded PNG data as an ArrayBuffer.
 */
export function encode(image: ImageData): Promise<ArrayBuffer>;

/**
 * Decode PNG data to ImageData.
 */
export function decode(data: ArrayBuffer | Uint8Array): Promise<ImageData>;
