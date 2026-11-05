import { useEffect } from 'react';

interface KeyboardShortcutHandlers {
  selectedFrameId: string | null;
  onSelectMoveTool: () => void;
  onAddFrame: () => void;
  onFocusFrame: () => void;
  onDuplicateFrame: () => void;
  onDeleteFrame: () => void;
  onExportGIF: () => void;
}

export function useKeyboardShortcuts({
  selectedFrameId,
  onSelectMoveTool,
  onAddFrame,
  onFocusFrame,
  onDuplicateFrame,
  onDeleteFrame,
  onExportGIF,
}: KeyboardShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isTyping =
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName || '') ||
        (document.activeElement as HTMLElement)?.isContentEditable;
      if (isTyping) return;

      const isMod = /Mac|iPod|iPhone|iPad/.test(navigator.userAgent) ? e.metaKey : e.ctrlKey;

      if (e.key.toLowerCase() === 'v') onSelectMoveTool();
      if (e.key.toLowerCase() === 'f') onAddFrame();

      if (e.shiftKey && e.code === 'Digit1' && selectedFrameId) {
        e.preventDefault();
        onFocusFrame();
      }

      if (isMod && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        onDuplicateFrame();
      }

      if ((e.key === 'Backspace' || e.key === 'Delete') && selectedFrameId) {
        e.preventDefault();
        onDeleteFrame();
      }

      if (e.shiftKey && isMod && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        onExportGIF();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFrameId, onSelectMoveTool, onAddFrame, onFocusFrame, onDuplicateFrame, onDeleteFrame, onExportGIF]);
}
