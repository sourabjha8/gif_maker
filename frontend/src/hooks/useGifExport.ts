import { useState } from 'react';
import GIF from 'gif.js';
import workerScriptUrl from 'gif.js/dist/gif.worker.js?url';
import type { Frame } from '../types/frame';
import { getEasingValue } from '../lib/easing';
import { renderFrameToCanvas } from '../lib/canvasRender';
import { encodeFramesToMp4 } from '../lib/mp4Export';

export type ExportKind = 'gif' | 'mp4';

export function useGifExport(selectedFrame: Frame | undefined, onExportStart?: () => void) {
  const [exportStatus, setExportStatus] = useState<'idle' | 'rendering' | 'encoding'>('idle');
  const [exportProgress, setExportProgress] = useState(0);
  const [exportKind, setExportKind] = useState<ExportKind>('gif');
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExportPNG = async () => {
    if (!selectedFrame) return;
    setExportError(null);
    setExportStatus('rendering');
    setExportProgress(0);

    try {
      const canvas = await renderFrameToCanvas(selectedFrame, selectedFrame.sliderPosition || 50);
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${selectedFrame.name.replace(/\s+/g, '_').toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('PNG Export failed', e);
      setExportError(e instanceof Error ? e.message : 'PNG export failed');
    } finally {
      setExportStatus('idle');
    }
  };

  const handleExportGIF = async () => {
    if (!selectedFrame) return;
    onExportStart?.(); // Stop manual preview
    setExportError(null);
    setExportKind('gif');
    setExportStatus('rendering');
    setExportProgress(0);

    const gif = new GIF({
      workers: 4,
      quality: 10,
      width: selectedFrame.width,
      height: selectedFrame.height,
      workerScript: workerScriptUrl,
    });

    const fps = 25;
    const totalFrames = Math.ceil(selectedFrame.duration * fps);
    const pauseFrames = Math.ceil(selectedFrame.pauseDuration * fps);
    const offset = selectedFrame.sliderOffset ?? 0;

    try {
      // 1. Render animation frames
      for (let i = 0; i < totalFrames; i++) {
        const t = i / (totalFrames - 1);
        const ease = getEasingValue(selectedFrame.animationStyle || 'smooth', t);
        const canvas = await renderFrameToCanvas(selectedFrame, offset + ease * (100 - offset));
        gif.addFrame(canvas, { delay: 1000 / fps });
        setExportProgress(Math.round((i / (totalFrames + pauseFrames)) * 50));
      }

      // 2. Add pause frames
      const lastCanvas = await renderFrameToCanvas(selectedFrame, 100);
      for (let i = 0; i < pauseFrames; i++) {
        gif.addFrame(lastCanvas, { delay: 1000 / fps });
        setExportProgress(50 + Math.round((i / pauseFrames) * 20));
      }

      // 3. Encode
      setExportStatus('encoding');
      gif.on('progress', (p: number) => {
        setExportProgress(70 + Math.round(p * 30));
      });

      gif.on('finished', (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${selectedFrame.name.replace(/\s+/g, '_').toLowerCase()}.gif`;
        link.href = url;
        link.click();
        setExportStatus('idle');
      });

      gif.render();
    } catch (e) {
      console.error('GIF Export failed', e);
      setExportError(e instanceof Error ? e.message : 'GIF export failed');
      setExportStatus('idle');
    }
  };

  const handleExportMP4 = async () => {
    if (!selectedFrame) return;
    onExportStart?.(); // Stop manual preview
    setExportError(null);
    setExportKind('mp4');
    setExportStatus('rendering');
    setExportProgress(0);

    const fps = 25;
    const totalFrames = Math.ceil(selectedFrame.duration * fps);
    const pauseFrames = Math.ceil(selectedFrame.pauseDuration * fps);
    const offset = selectedFrame.sliderOffset ?? 0;

    try {
      const canvases: HTMLCanvasElement[] = [];

      // 1. Render animation frames
      for (let i = 0; i < totalFrames; i++) {
        const t = i / (totalFrames - 1);
        const ease = getEasingValue(selectedFrame.animationStyle || 'smooth', t);
        canvases.push(await renderFrameToCanvas(selectedFrame, offset + ease * (100 - offset)));
        setExportProgress(Math.round((i / (totalFrames + pauseFrames)) * 50));
      }

      // 2. Add pause frames
      const lastCanvas = await renderFrameToCanvas(selectedFrame, 100);
      for (let i = 0; i < pauseFrames; i++) {
        canvases.push(lastCanvas);
        setExportProgress(50 + Math.round((i / pauseFrames) * 20));
      }

      // 3. Encode
      setExportStatus('encoding');
      const blob = await encodeFramesToMp4(canvases, fps, (fraction) => {
        setExportProgress(70 + Math.round(fraction * 30));
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${selectedFrame.name.replace(/\s+/g, '_').toLowerCase()}.mp4`;
      link.href = url;
      link.click();
      setExportStatus('idle');
    } catch (e) {
      console.error('MP4 Export failed', e);
      setExportError(e instanceof Error ? e.message : 'MP4 export failed');
      setExportStatus('idle');
    }
  };

  return {
    exportStatus,
    exportProgress,
    exportKind,
    exportError,
    dismissExportError: () => setExportError(null),
    handleExportPNG,
    handleExportGIF,
    handleExportMP4,
  };
}
