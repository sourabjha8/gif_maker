declare module 'gif.js' {
  interface GIFOptions {
    workers?: number;
    quality?: number;
    width?: number;
    height?: number;
    workerScript?: string;
    background?: string;
    transparent?: string | null;
    dither?: boolean | string;
    debug?: boolean;
    repeat?: number;
  }

  class GIF {
    constructor(options?: GIFOptions);
    addFrame(image: CanvasImageSource | CanvasRenderingContext2D | WebGLRenderingContext, options?: { delay?: number; copy?: boolean; dispose?: number }): void;
    render(): void;
    on(event: 'finished', callback: (blob: Blob) => void): void;
    on(event: 'progress', callback: (progress: number) => void): void;
    on(event: 'start', callback: () => void): void;
    on(event: 'abort', callback: () => void): void;
  }

  export default GIF;
}

declare module 'gif.js/dist/gif.worker.js?url' {
  const url: string;
  export default url;
}
