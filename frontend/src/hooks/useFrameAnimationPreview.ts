import { useEffect, useRef, useState } from 'react';
import type { Frame } from '../types/frame';
import { getEasingValue } from '../lib/easing';

export function useFrameAnimationPreview(setFrames: React.Dispatch<React.SetStateAction<Frame[]>>) {
  const [isAnimating, setIsAnimating] = useState(false);
  const animationStartTime = useRef<number | null>(null);

  useEffect(() => {
    let animFrame: number;

    const animate = (time: number) => {
      if (!animationStartTime.current) animationStartTime.current = time;

      setFrames((prev) =>
        prev.map((frame) => {
          const totalCycle = (frame.duration + frame.pauseDuration) * 1000;
          const elapsed = (time - animationStartTime.current!) % totalCycle;

          let newPos = frame.sliderPosition ?? 50;
          const offset = frame.sliderOffset ?? 0;

          if (elapsed < frame.duration * 1000) {
            // Animation phase — sweeps from the offset up to fully revealed, not always from 0.
            const t = elapsed / (frame.duration * 1000);
            const ease = getEasingValue(frame.animationStyle || 'smooth', t);
            newPos = offset + ease * (100 - offset);
          } else {
            // Pause phase
            newPos = 100;
          }

          return { ...frame, sliderPosition: newPos };
        })
      );

      animFrame = requestAnimationFrame(animate);
    };

    if (isAnimating) {
      animFrame = requestAnimationFrame(animate);
    } else {
      animationStartTime.current = null;
    }

    return () => cancelAnimationFrame(animFrame);
  }, [isAnimating, setFrames]);

  return { isAnimating, setIsAnimating };
}
