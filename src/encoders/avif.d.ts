export const AVIFTune: {
    auto: 0;
    psnr: 1;
    ssim: 2;
};

export interface AvifOptions {
    quality: number;
    qualityAlpha: number;
    denoiseLevel: number;
    tileColsLog2: number;
    tileRowsLog2: number;
    speed: number;
    subsample: number;
    chromaDeltaQ: boolean;
    sharpness: number;
    tune: number;
    enableSharpYUV: boolean;
}

/**
 * Encode ImageData to AVIF.
 * @returns The encoded AVIF data as an ArrayBuffer.
 */
export function encode(image: ImageData, options?: Partial<AvifOptions>): Promise<ArrayBuffer>;

export const defaultOptions: AvifOptions;
