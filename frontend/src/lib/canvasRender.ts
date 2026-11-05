import type { Frame } from '../types/frame';

export const isHorizontal = (dir: string) => dir === 'ltr' || dir === 'rtl';

export const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

export const renderFrameToCanvas = async (frame: Frame, pos: number): Promise<HTMLCanvasElement> => {
  const canvas = document.createElement('canvas');
  canvas.width = frame.width;
  canvas.height = frame.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Load images
  let beforeImg: HTMLImageElement | null = null;
  let afterImg: HTMLImageElement | null = null;

  try {
    if (frame.beforeImage) beforeImg = await loadImage(frame.beforeImage);
    if (frame.afterImage) afterImg = await loadImage(frame.afterImage);
  } catch (e) {
    console.error('Failed to load images for render', e);
  }

  // Background
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Render After Image (Base)
  if (afterImg) {
    const scale = Math.max(canvas.width / afterImg.width, canvas.height / afterImg.height);
    const x = (canvas.width - afterImg.width * scale) / 2;
    const y = (canvas.height - afterImg.height * scale) / 2;
    ctx.drawImage(afterImg, x, y, afterImg.width * scale, afterImg.height * scale);
  }

  // Render Before Image (Masked)
  if (beforeImg) {
    ctx.save();

    // Determine Clip Region
    const direction = frame.sliderDirection || 'ltr';
    const percentage = pos / 100;

    ctx.beginPath();
    if (direction === 'ltr') {
      ctx.rect(0, 0, canvas.width * percentage, canvas.height);
    } else if (direction === 'rtl') {
      ctx.rect(canvas.width * (1 - percentage), 0, canvas.width * percentage, canvas.height);
    } else if (direction === 'ttb') {
      ctx.rect(0, 0, canvas.width, canvas.height * percentage);
    } else if (direction === 'btt') {
      ctx.rect(0, canvas.height * (1 - percentage), canvas.width, canvas.height * percentage);
    }
    ctx.clip();

    const scale = Math.max(canvas.width / beforeImg.width, canvas.height / beforeImg.height);
    const x = (canvas.width - beforeImg.width * scale) / 2;
    const y = (canvas.height - beforeImg.height * scale) / 2;
    ctx.drawImage(beforeImg, x, y, beforeImg.width * scale, beforeImg.height * scale);
    ctx.restore();

    // Divider Line
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (isHorizontal(direction)) {
      const lineX = direction === 'ltr' ? canvas.width * percentage : canvas.width * (1 - percentage);
      ctx.moveTo(lineX, 0);
      ctx.lineTo(lineX, canvas.height);
    } else {
      const lineY = direction === 'ttb' ? canvas.height * percentage : canvas.height * (1 - percentage);
      ctx.moveTo(0, lineY);
      ctx.lineTo(canvas.width, lineY);
    }
    ctx.stroke();
  }

  return canvas;
};
