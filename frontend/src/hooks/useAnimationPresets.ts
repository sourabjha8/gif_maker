import { useEffect, useState } from 'react';
import type { Frame } from '../types/frame';
import {
  createAnimationPreset,
  deleteAnimationPreset,
  getAllAnimationPresets,
  type AnimationPreset,
} from '../lib/db';

export function useAnimationPresets() {
  const [presets, setPresets] = useState<AnimationPreset[]>([]);

  useEffect(() => {
    getAllAnimationPresets().then(setPresets);
  }, []);

  const savePresetFromFrame = async (name: string, frame: Frame) => {
    const preset = await createAnimationPreset(name, {
      animationStyle: frame.animationStyle,
      duration: frame.duration,
      pauseDuration: frame.pauseDuration,
      sliderOffset: frame.sliderOffset,
      sliderDirection: frame.sliderDirection,
    });
    setPresets((prev) => [preset, ...prev]);
  };

  const removePreset = async (id: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== id));
    await deleteAnimationPreset(id);
  };

  return { presets, savePresetFromFrame, removePreset };
}
