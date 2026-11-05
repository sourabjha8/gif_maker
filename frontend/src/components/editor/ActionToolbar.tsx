import { colors, buttonPrimary } from '../../constants/theme';

interface ActionToolbarProps {
  activeTool: 'move' | 'frame';
  setActiveTool: (tool: 'move' | 'frame') => void;
  selectedFrameId: string | null;
  onAddFrame: () => void;
  onFocusFrame: () => void;
  onDuplicateFrame: () => void;
  onDeleteFrame: () => void;
  onExportGIF: () => void;
}

export function ActionToolbar({
  activeTool,
  setActiveTool,
  selectedFrameId,
  onAddFrame,
  onFocusFrame,
  onDuplicateFrame,
  onDeleteFrame,
  onExportGIF,
}: ActionToolbarProps) {
  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      className={`absolute bottom-8 left-[50%] lg:left-[calc(50%-150px)] -translate-x-1/2 flex items-center gap-2 p-1.5 ${colors.surface} border ${colors.border} rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-20 select-none`}
    >
      {/* Move Tool */}
      <div className="relative group flex items-center justify-center">
        <div className="absolute bottom-[calc(100%+12px)] opacity-0 group-hover:opacity-100 flex items-center bg-[#1a1a1a] border border-[#333] px-3 py-2 rounded-lg shadow-2xl font-bold text-[10px] whitespace-nowrap z-30 pointer-events-none ring-1 ring-white/5 transition-all duration-150 translate-y-2 group-hover:translate-y-0 uppercase tracking-wider backdrop-blur-md">
          <span className="text-[#ffffff]">Move</span>
          <span className="text-[#555] ml-4 font-bold border-l border-[#333] pl-2.5">V</span>
        </div>
        <button
          onClick={() => setActiveTool('move')}
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeTool === 'move' ? `${colors.surface2} text-[#ffffff]` : 'hover:bg-[#262626] text-[#999999] hover:text-[#ffffff]'} ${colors.transition} cursor-pointer active:scale-90`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z" /><path d="m13 13 6 6" /></svg>
        </button>
      </div>

      <div className="w-px h-6 bg-[#262626] mx-0.5" />

      {/* Add Frame */}
      <div className="relative group flex items-center justify-center">
        <div className="absolute bottom-[calc(100%+12px)] opacity-0 group-hover:opacity-100 flex items-center bg-[#1a1a1a] border border-[#333] px-3 py-2 rounded-lg shadow-2xl font-bold text-[10px] whitespace-nowrap z-30 pointer-events-none ring-1 ring-white/5 transition-all duration-150 translate-y-2 group-hover:translate-y-0 uppercase tracking-wider backdrop-blur-md">
          <span className="text-[#ffffff]">Add Frame</span>
          <span className="text-[#555] ml-4 font-bold border-l border-[#333] pl-2.5">F</span>
        </div>
        <button
          onClick={onAddFrame}
          className={`w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[#262626] ${colors.transition} text-[#999999] hover:text-[#ffffff] cursor-pointer active:scale-90`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 18 16 14 16 14 12 10 12 10 8 14 8 14 4 18 4 18 8 22 8"></polyline><path d="M5 19H19"></path><path d="M5 5h4"></path><path d="M5 12h4"></path></svg>
        </button>
      </div>

      {/* Focus Frame */}
      <div className="relative group flex items-center justify-center">
        <div className="absolute bottom-[calc(100%+12px)] opacity-0 group-hover:opacity-100 flex items-center bg-[#1a1a1a] border border-[#333] px-3 py-2 rounded-lg shadow-2xl font-bold text-[10px] whitespace-nowrap z-30 pointer-events-none ring-1 ring-white/5 transition-all duration-150 translate-y-2 group-hover:translate-y-0 uppercase tracking-wider backdrop-blur-md">
          <span className="text-[#ffffff]">Focus Frame</span>
          <span className="text-[#555] ml-4 font-bold border-l border-[#333] pl-2.5">⇧1</span>
        </div>
        <button
          onClick={onFocusFrame}
          disabled={!selectedFrameId}
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.transition} ${selectedFrameId ? 'hover:bg-[#262626] text-[#999999] hover:text-[#ffffff] cursor-pointer active:scale-90' : 'text-[#444] cursor-not-allowed'}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>
        </button>
      </div>

      <div className="w-px h-6 bg-[#262626] mx-0.5" />

      {/* Duplicate */}
      <div className="relative group flex items-center justify-center">
        <div className="absolute bottom-[calc(100%+12px)] opacity-0 group-hover:opacity-100 flex items-center bg-[#1a1a1a] border border-[#333] px-3 py-2 rounded-lg shadow-2xl font-bold text-[10px] whitespace-nowrap z-30 pointer-events-none ring-1 ring-white/5 transition-all duration-150 translate-y-2 group-hover:translate-y-0 uppercase tracking-wider backdrop-blur-md">
          <span className="text-[#ffffff]">Duplicate</span>
          <span className="text-[#555] ml-4 font-bold border-l border-[#333] pl-2.5">⌘D</span>
        </div>
        <button
          onClick={onDuplicateFrame}
          disabled={!selectedFrameId}
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedFrameId ? 'hover:bg-[#262626] text-[#999999] hover:text-[#ffffff] cursor-pointer' : 'text-[#333] cursor-not-allowed'} ${colors.transition} active:scale-90`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
        </button>
      </div>

      {/* Delete */}
      <div className="relative group flex items-center justify-center">
        <div className="absolute bottom-[calc(100%+12px)] opacity-0 group-hover:opacity-100 flex items-center bg-[#1a1a1a] border border-[#333] px-3 py-2 rounded-lg shadow-2xl font-bold text-[10px] whitespace-nowrap z-30 pointer-events-none ring-1 ring-white/5 transition-all duration-150 translate-y-2 group-hover:translate-y-0 uppercase tracking-wider backdrop-blur-md">
          <span className="text-[#ffffff]">Delete</span>
          <span className="text-[#555] ml-4 font-bold border-l border-[#333] pl-2.5">⌫</span>
        </div>
        <button
          onClick={onDeleteFrame}
          disabled={!selectedFrameId}
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedFrameId ? 'hover:bg-[#a62b2b]/10 group-hover:text-red-400 cursor-pointer active:scale-90' : 'text-[#333] cursor-not-allowed'} ${colors.transition} text-[#999999]`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-red-500"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
        </button>
      </div>

      <div className="w-px h-6 bg-[#262626] mx-1" />

      {/* Download */}
      <div className="relative group flex items-center justify-center">
        <div className="absolute bottom-[calc(100%+12px)] opacity-0 group-hover:opacity-100 flex items-center bg-[#1a1a1a] border border-[#333] px-3 py-2 rounded-lg shadow-2xl font-bold text-[10px] whitespace-nowrap z-30 pointer-events-none ring-1 ring-white/5 transition-all duration-150 translate-y-2 group-hover:translate-y-0 uppercase tracking-wider backdrop-blur-md">
          <span className="text-[#ffffff]">Download</span>
          <span className="text-[#555] ml-4 font-bold border-l border-[#333] pl-2.5">⇧⌘E</span>
        </div>
        <button
          onClick={onExportGIF}
          disabled={!selectedFrameId}
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedFrameId ? `${buttonPrimary} shadow-[0_4px_12px_rgba(0,0,0,0.3)] active:scale-90 animate-in fade-in zoom-in` : 'text-[#333] cursor-not-allowed'} ${colors.transition}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
        </button>
      </div>
    </div>
  );
}
