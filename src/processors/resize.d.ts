export interface ResizeOptions {
    /** Target width. If omitted, it will be calculated from height to maintain aspect ratio. */
    width?: number;
    /** Target height. If omitted, it will be calculated from width to maintain aspect ratio. */
    height?: number;
    /** Resize algorithm. Default is 'lanczos3'. */
    method?: 'triangle' | 'catrom' | 'mitchell' | 'lanczos3' | number;
    /** Premultiply alpha. Default is true. */
    premultiply?: boolean;
    /** Use linear RGB color space. Default is true. */
    linearRGB?: boolean;
}

/**
 * Resize ImageData to new dimensions.
 */
export function resize(image: ImageData, options: ResizeOptions): Promise<ImageData>;

export const ResizeMethod: {
    triangle: 0;
    catrom: 1;
    mitchell: 2;
    lanczos3: 3;
};

export const defaultOptions: ResizeOptions;
