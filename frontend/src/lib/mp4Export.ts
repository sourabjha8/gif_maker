import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
// Self-hosted core: served by Vite from node_modules, no CDN/network dependency at runtime.
// Only these two subpaths are declared in @ffmpeg/core's package.json "exports" field.
import ffmpegCoreJsUrl from '@ffmpeg/core?url';
import ffmpegCoreWasmUrl from '@ffmpeg/core/wasm?url';

const LOAD_TIMEOUT_MS = 30_000;

let ffmpegPromise: Promise<FFmpeg> | null = null;

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
}

function loadFFmpeg(): Promise<FFmpeg> {
  if (!ffmpegPromise) {
    ffmpegPromise = withTimeout(
      (async () => {
        const ffmpeg = new FFmpeg();
        const [coreURL, wasmURL] = await Promise.all([
          toBlobURL(ffmpegCoreJsUrl, 'text/javascript'),
          toBlobURL(ffmpegCoreWasmUrl, 'application/wasm'),
        ]);
        await ffmpeg.load({ coreURL, wasmURL });
        return ffmpeg;
      })(),
      LOAD_TIMEOUT_MS,
      'Timed out loading the MP4 encoder'
    ).catch((err) => {
      ffmpegPromise = null; // allow a retry on the next export attempt
      throw err;
    });
  }
  return ffmpegPromise;
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to encode canvas frame as PNG'));
    }, 'image/png');
  });
}

export async function encodeFramesToMp4(
  canvases: HTMLCanvasElement[],
  fps: number,
  onProgress?: (fraction: number) => void
): Promise<Blob> {
  const ffmpeg = await loadFFmpeg();

  const progressHandler = ({ progress }: { progress: number }) => {
    onProgress?.(Math.max(0, Math.min(1, progress)));
  };
  // ffmpeg.exec() resolves even when the encode itself fails (non-zero exit) — the
  // only signal of what went wrong is its log output, so keep a tail of it to
  // surface in the thrown error instead of silently downloading an empty file.
  const recentLogs: string[] = [];
  const logHandler = ({ message }: { message: string }) => {
    recentLogs.push(message);
    if (recentLogs.length > 20) recentLogs.shift();
  };
  ffmpeg.on('progress', progressHandler);
  ffmpeg.on('log', logHandler);

  const frameNames: string[] = [];
  try {
    // Each writeFile() is a request/response round trip through the worker's message
    // channel; firing them all without awaiting piles up dozens of concurrent calls
    // and the channel loses track of which response answers which call, hanging
    // forever. Writing frames one at a time keeps that channel one-at-a-time too.
    for (let i = 0; i < canvases.length; i++) {
      const blob = await canvasToPngBlob(canvases[i]);
      const name = `frame${String(i).padStart(5, '0')}.png`;
      frameNames.push(name);
      await ffmpeg.writeFile(name, new Uint8Array(await blob.arrayBuffer()));
    }

    const exitCode = await ffmpeg.exec([
      '-framerate', String(fps),
      '-i', 'frame%05d.png',
      // yuv420p (required for broad player compatibility) needs even width/height,
      // but frame canvas sizes are freely editable in the properties panel and can
      // be odd — trim at most 1px off each edge rather than fail the whole encode.
      '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      'out.mp4',
    ]);

    if (exitCode !== 0) {
      throw new Error(`ffmpeg exited with code ${exitCode}: ${recentLogs.join('\n')}`);
    }

    const data = await ffmpeg.readFile('out.mp4');
    const bytes = new Uint8Array(data as Uint8Array);
    if (bytes.length === 0) {
      throw new Error(`MP4 encode produced an empty file: ${recentLogs.join('\n')}`);
    }
    return new Blob([bytes.buffer], { type: 'video/mp4' });
  } finally {
    ffmpeg.off('progress', progressHandler);
    ffmpeg.off('log', logHandler);
    await Promise.all(frameNames.map((name) => ffmpeg.deleteFile(name).catch(() => {})));
    await ffmpeg.deleteFile('out.mp4').catch(() => {});
  }
}
