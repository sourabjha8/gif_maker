import { useEffect, useRef, useState } from 'react';
import type { Frame } from '../types/frame';
import {
  DEFAULT_PROJECT_NAME,
  deleteFrameMeta,
  deleteImageBlob,
  ensureProject,
  getFrameMetasForProject,
  getImageBlob,
  imageKey,
  putFrameMeta,
  putImageBlob,
  swapImageBlobs,
  toStoredMeta,
  touchProject,
  type AnimationPreset,
} from '../lib/db';

function createInitialFrames(): Frame[] {
  return [
    {
      id: `f-${crypto.randomUUID()}`,
      name: 'Instagram Post',
      width: 320,
      height: 320,
      x: -420,
      y: -40,
      beforeImage: null,
      afterImage: null,
      sliderPosition: 50,
      sliderDirection: 'ltr',
      sliderOffset: 0,
      duration: 2.0,
      pauseDuration: 1.0,
      animationStyle: 'smooth',
    },
    {
      id: `f-${crypto.randomUUID()}`,
      name: 'Landscape Banner',
      width: 480,
      height: 320,
      x: 0,
      y: 0,
      beforeImage: null,
      afterImage: null,
      sliderPosition: 50,
      sliderDirection: 'ltr',
      sliderOffset: 0,
      duration: 2.0,
      pauseDuration: 1.0,
      animationStyle: 'smooth',
    },
    {
      id: `f-${crypto.randomUUID()}`,
      name: 'Web Story',
      width: 240,
      height: 400,
      x: 580,
      y: 100,
      beforeImage: null,
      afterImage: null,
      sliderPosition: 50,
      sliderDirection: 'ltr',
      sliderOffset: 0,
      duration: 2.0,
      pauseDuration: 1.0,
      animationStyle: 'smooth',
    },
  ];
}

export function useFrames(projectId: string) {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const isLoadedRef = useRef(false);
  const prevIdsRef = useRef<Set<string>>(new Set());

  const selectedFrame = frames.find((f) => f.id === selectedFrameId);

  // Load this project's persisted frames (and their images) from IndexedDB on mount.
  // The route remounts this hook's owner per project id, so this only ever runs once per project.
  useEffect(() => {
    (async () => {
      await ensureProject(projectId, DEFAULT_PROJECT_NAME);
      const metas = await getFrameMetasForProject(projectId);

      if (metas.length > 0) {
        const loaded: Frame[] = await Promise.all(
          metas.map(async (meta) => {
            const [beforeBlob, afterBlob] = await Promise.all([
              getImageBlob(imageKey(meta.id, 'before')),
              getImageBlob(imageKey(meta.id, 'after')),
            ]);
            return {
              ...meta,
              beforeImage: beforeBlob ? URL.createObjectURL(beforeBlob) : null,
              afterImage: afterBlob ? URL.createObjectURL(afterBlob) : null,
            };
          })
        );
        prevIdsRef.current = new Set(loaded.map((f) => f.id));
        setFrames(loaded);
        setSelectedFrameId(loaded[1]?.id ?? loaded[0]?.id ?? null);
      } else {
        const initialFrames = createInitialFrames();
        await Promise.all(initialFrames.map((f) => putFrameMeta(toStoredMeta(f, projectId))));
        prevIdsRef.current = new Set(initialFrames.map((f) => f.id));
        setFrames(initialFrames);
        setSelectedFrameId(initialFrames[1].id);
      }

      isLoadedRef.current = true;
      setIsLoaded(true);
    })();
  }, [projectId]);

  // Persist frame metadata (position, size, name, animation settings, ...) whenever it changes.
  useEffect(() => {
    if (!isLoadedRef.current) return;

    (async () => {
      const currentIds = new Set(frames.map((f) => f.id));

      for (const id of prevIdsRef.current) {
        if (!currentIds.has(id)) {
          await deleteFrameMeta(id);
          await deleteImageBlob(imageKey(id, 'before'));
          await deleteImageBlob(imageKey(id, 'after'));
        }
      }

      await Promise.all(frames.map((f) => putFrameMeta(toStoredMeta(f, projectId))));
      await touchProject(projectId);
      prevIdsRef.current = currentIds;
    })();
  }, [frames, projectId]);

  const updateSelectedFrameSize = (newWidth: number, newHeight: number) => {
    if (!selectedFrameId) return;
    setFrames((prev) =>
      prev.map((f) => (f.id === selectedFrameId ? { ...f, width: newWidth, height: newHeight } : f))
    );
  };

  const updateSelectedFrameDirection = (dir: Frame['sliderDirection']) => {
    if (!selectedFrameId) return;
    setFrames((prev) => prev.map((f) => (f.id === selectedFrameId ? { ...f, sliderDirection: dir } : f)));
  };

  const updateSelectedFrameAnimation = (
    key: 'duration' | 'pauseDuration' | 'animationStyle' | 'sliderOffset',
    val: Frame['duration'] | Frame['pauseDuration'] | Frame['animationStyle'] | Frame['sliderOffset']
  ) => {
    if (!selectedFrameId) return;
    setFrames((prev) => prev.map((f) => (f.id === selectedFrameId ? { ...f, [key]: val } : f)));
  };

  const applyAnimationPresetToSelectedFrame = (preset: AnimationPreset) => {
    if (!selectedFrameId) return;
    setFrames((prev) =>
      prev.map((f) =>
        f.id === selectedFrameId
          ? {
              ...f,
              animationStyle: preset.animationStyle,
              duration: preset.duration,
              pauseDuration: preset.pauseDuration,
              sliderOffset: preset.sliderOffset,
              sliderDirection: preset.sliderDirection,
            }
          : f
      )
    );
  };

  const handleAddFrame = () => {
    const newFrame: Frame = {
      id: `f-${crypto.randomUUID()}`,
      name: `Frame ${frames.length + 1}`,
      width: 1080,
      height: 1080,
      x: 0,
      y: 0,
      beforeImage: null,
      afterImage: null,
      sliderPosition: 50,
      sliderDirection: 'ltr',
      sliderOffset: 0,
      duration: 2.0,
      pauseDuration: 1.0,
      animationStyle: 'smooth',
    };
    setFrames((prev) => [...prev, newFrame]);
    setSelectedFrameId(newFrame.id);
  };

  const handleDuplicateFrame = () => {
    if (!selectedFrame) return;
    const newId = `f-${crypto.randomUUID()}`;
    const newFrame: Frame = {
      ...selectedFrame,
      id: newId,
      name: `${selectedFrame.name} (Copy)`,
      x: selectedFrame.x + 40,
      y: selectedFrame.y + 40,
    };
    setFrames((prev) => [...prev, newFrame]);
    setSelectedFrameId(newId);

    (async () => {
      const [beforeBlob, afterBlob] = await Promise.all([
        getImageBlob(imageKey(selectedFrame.id, 'before')),
        getImageBlob(imageKey(selectedFrame.id, 'after')),
      ]);
      if (beforeBlob) await putImageBlob(imageKey(newId, 'before'), beforeBlob);
      if (afterBlob) await putImageBlob(imageKey(newId, 'after'), afterBlob);
    })();
  };

  const handleDeleteFrame = () => {
    if (!selectedFrameId) return;
    setFrames((prev) => prev.filter((f) => f.id !== selectedFrameId));
    setSelectedFrameId(null);
  };

  const handleImageUpload = (type: 'before' | 'after', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedFrameId) return;

    const imageUrl = URL.createObjectURL(file);
    setFrames((prev) =>
      prev.map((f) => {
        if (f.id === selectedFrameId) {
          return type === 'before' ? { ...f, beforeImage: imageUrl } : { ...f, afterImage: imageUrl };
        }
        return f;
      })
    );
    void putImageBlob(imageKey(selectedFrameId, type), file);
  };

  const handleSwapImages = (frameId?: string) => {
    const targetId = frameId ?? selectedFrameId;
    if (!targetId) return;

    setFrames((prev) =>
      prev.map((f) =>
        f.id === targetId ? { ...f, beforeImage: f.afterImage, afterImage: f.beforeImage } : f
      )
    );
    void swapImageBlobs(targetId);
  };

  return {
    frames,
    setFrames,
    selectedFrameId,
    setSelectedFrameId,
    selectedFrame,
    isLoaded,
    updateSelectedFrameSize,
    updateSelectedFrameDirection,
    updateSelectedFrameAnimation,
    applyAnimationPresetToSelectedFrame,
    handleAddFrame,
    handleDuplicateFrame,
    handleDeleteFrame,
    handleImageUpload,
    handleSwapImages,
  };
}
