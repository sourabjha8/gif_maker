import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EditorHeader } from '../components/editor/EditorHeader';
import { CanvasWorkspace } from '../components/editor/CanvasWorkspace';
import { PropertiesPanel } from '../components/editor/PropertiesPanel';
import { ActionToolbar } from '../components/editor/ActionToolbar';
import { ExportOverlay } from '../components/editor/ExportOverlay';
import { useFrames } from '../hooks/useFrames';
import { useProjectName } from '../hooks/useProjectName';
import { useCanvasWorkspace } from '../hooks/useCanvasWorkspace';
import { useFrameAnimationPreview } from '../hooks/useFrameAnimationPreview';
import { useGifExport } from '../hooks/useGifExport';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useAnimationPresets } from '../hooks/useAnimationPresets';
import { slugify } from '../lib/slugify';

export function Editor() {
  const navigate = useNavigate();
  // The route "/editor/:id/:slug" guarantees `id` is present whenever this component renders.
  const { id } = useParams<{ id: string }>();
  const projectId = id!;
  const [activeTool, setActiveTool] = useState<'move' | 'frame'>('move');

  const {
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
  } = useFrames(projectId);

  const { presets, savePresetFromFrame, removePreset } = useAnimationPresets();

  const { projectName, renameProject } = useProjectName(projectId);

  const handleRenameProject = (name: string) => {
    renameProject(name);
    navigate(`/editor/${projectId}/${slugify(name)}`, { replace: true });
  };

  const { isAnimating, setIsAnimating } = useFrameAnimationPreview(setFrames);

  const {
    camera,
    zoom,
    setZoom,
    isPanning,
    isSpacePressed,
    viewportSize,
    workspaceRef,
    draggingFrameId,
    draggingSliderFrameId,
    beginFrameDrag,
    beginSliderDrag,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleFocusFrame,
  } = useCanvasWorkspace(frames, setFrames, selectedFrameId, setSelectedFrameId, activeTool);

  const {
    exportStatus,
    exportProgress,
    exportKind,
    exportError,
    dismissExportError,
    handleExportPNG,
    handleExportGIF,
    handleExportMP4,
  } = useGifExport(selectedFrame, () => setIsAnimating(() => false));

  useKeyboardShortcuts({
    selectedFrameId,
    onSelectMoveTool: () => setActiveTool('move'),
    onAddFrame: handleAddFrame,
    onFocusFrame: () => handleFocusFrame(),
    onDuplicateFrame: handleDuplicateFrame,
    onDeleteFrame: handleDeleteFrame,
    onExportGIF: handleExportGIF,
  });

  if (!isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center w-full h-full">
        <p className="text-sm text-[#999999]">Loading project…</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col w-full h-full relative overflow-hidden">
      <EditorHeader onBack={() => navigate('/')} projectName={projectName} onRenameProject={handleRenameProject} />

      <CanvasWorkspace
        frames={frames}
        selectedFrameId={selectedFrameId}
        activeTool={activeTool}
        camera={camera}
        zoom={zoom}
        setZoom={setZoom}
        isPanning={isPanning}
        isSpacePressed={isSpacePressed}
        viewportSize={viewportSize}
        draggingFrameId={draggingFrameId}
        draggingSliderFrameId={draggingSliderFrameId}
        workspaceRef={workspaceRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onFramePointerDown={beginFrameDrag}
        onFocusFrame={(frameId) => handleFocusFrame(frameId)}
        onSliderPointerDown={beginSliderDrag}
      />

      <PropertiesPanel
        selectedFrame={selectedFrame}
        selectedFrameId={selectedFrameId}
        updateSelectedFrameSize={updateSelectedFrameSize}
        updateSelectedFrameDirection={updateSelectedFrameDirection}
        updateSelectedFrameAnimation={updateSelectedFrameAnimation}
        onImageUpload={handleImageUpload}
        onSwapImages={() => handleSwapImages()}
        onExportPNG={handleExportPNG}
        onExportGIF={handleExportGIF}
        onExportMP4={handleExportMP4}
        isAnimating={isAnimating}
        setIsAnimating={setIsAnimating}
        animationPresets={presets}
        onSaveAnimationPreset={(name) => selectedFrame && savePresetFromFrame(name, selectedFrame)}
        onApplyAnimationPreset={applyAnimationPresetToSelectedFrame}
        onDeleteAnimationPreset={removePreset}
      />

      <ActionToolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        selectedFrameId={selectedFrameId}
        onAddFrame={handleAddFrame}
        onFocusFrame={() => handleFocusFrame()}
        onDuplicateFrame={handleDuplicateFrame}
        onDeleteFrame={handleDeleteFrame}
        onExportGIF={handleExportGIF}
      />

      <ExportOverlay
        status={exportStatus}
        progress={exportProgress}
        kind={exportKind}
        error={exportError}
        onDismissError={dismissExportError}
      />
    </div>
  );
}
