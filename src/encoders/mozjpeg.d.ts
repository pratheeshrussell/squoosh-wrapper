export const MozJpegColorSpace: {
    GRAYSCALE: 1;
    RGB: 2;
    YCbCr: 3;
};

export interface MozJpegOptions {
    quality: number;
    baseline: boolean;
    arithmetic: boolean;
    progressive: boolean;
    optimize_coding: boolean;
    smoothing: number;
    color_space: number;
    quant_table: number;
    trellis_multipass: boolean;
    trellis_opt_zero: boolean;
    trellis_opt_table: boolean;
    trellis_loops: number;
    auto_subsample: boolean;
    chroma_subsample: number;
    separate_chroma_quality: boolean;
    chroma_quality: number;
}

/**
 * Encode ImageData to JPEG using MozJPEG.
 * @returns The encoded JPEG data as an ArrayBuffer.
 */
export function encode(image: ImageData, options?: Partial<MozJpegOptions>): Promise<ArrayBuffer>;

export const defaultOptions: MozJpegOptions;
