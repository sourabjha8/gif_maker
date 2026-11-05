import { useRef, useState } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';

interface ZoomControlProps {
  zoom: number;
  setZoom: (updater: (z: number) => number) => void;
}

export function ZoomControl({ zoom, setZoom }: ZoomControlProps) {
  const [isZoomMenuOpen, setIsZoomMenuOpen] = useState(false);
  const zoomMenuRef = useRef<HTMLDivElement>(null);

  useClickOutside(zoomMenuRef, isZoomMenuOpen, () => setIsZoomMenuOpen(false));

  return (
    <div ref={zoomMenuRef} onPointerDown={(e) => e.stopPropagation()} className="absolute top-20 left-6 z-30">
      <div
        onClick={() => setIsZoomMenuOpen(!isZoomMenuOpen)}
        className={`bg-[#141414] border ${isZoomMenuOpen ? 'border-[#0099ff]' : 'border-[#262626] hover:border-[#333]'} rounded-md px-2.5 py-1 text-[11px] font-bold text-[#999999] shadow-sm select-none cursor-pointer hover:text-[#ffffff] active:scale-95 transition-all duration-200 ease-out`}
      >
        {Math.round(zoom * 100)}%
      </div>

      {isZoomMenuOpen && (
        <div className="absolute top-full left-0 mt-2 w-[220px] bg-[#222222] border border-[#333] rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.8)] py-1.5 z-50 text-[12px] font-semibold text-[#ffffff]">
          <div className="px-2 mb-1">
            <div className="w-full bg-[#1a1a1a] border border-[#0099ff] rounded-md px-2.5 py-1.5 text-white outline-none select-none text-[12px]">
              {Math.round(zoom * 100)}%
            </div>
          </div>
          <div className="w-full h-px bg-[#333] my-1" />
          <button onClick={() => { setZoom((z) => Math.min(Math.max(z + 0.1, 0.25), 3.0)); setIsZoomMenuOpen(false); }} className="w-full flex items-center justify-between px-4 py-1.5 hover:bg-[#0099ff] hover:text-white text-[#ffffff] transition-colors cursor-pointer">
            <span>Zoom in</span>
            <span className="text-inherit opacity-60 text-[10px]">Ctrl++</span>
          </button>
          <button onClick={() => { setZoom((z) => Math.min(Math.max(z - 0.1, 0.25), 3.0)); setIsZoomMenuOpen(false); }} className="w-full flex items-center justify-between px-4 py-1.5 hover:bg-[#0099ff] hover:text-white text-[#ffffff] transition-colors cursor-pointer">
            <span>Zoom out</span>
            <span className="text-inherit opacity-60 text-[10px]">Ctrl+-</span>
          </button>
          <button onClick={() => { setZoom(() => 1); setIsZoomMenuOpen(false); }} className="w-full flex items-center justify-between px-4 py-1.5 hover:bg-[#0099ff] hover:text-white text-[#ffffff] transition-colors cursor-pointer">
            <span>Zoom to fit</span>
            <span className="text-inherit opacity-60 text-[10px]">Shift+1</span>
          </button>
          <button onClick={() => { setZoom(() => 0.5); setIsZoomMenuOpen(false); }} className="w-full flex items-center justify-between px-4 py-1.5 hover:bg-[#0099ff] hover:text-white text-[#ffffff] transition-colors cursor-pointer">
            <span>Zoom to 50%</span>
          </button>
          <button onClick={() => { setZoom(() => 1); setIsZoomMenuOpen(false); }} className="w-full flex items-center justify-between px-4 py-1.5 hover:bg-[#0099ff] hover:text-white text-[#ffffff] transition-colors cursor-pointer">
            <span>Zoom to 100%</span>
            <span className="text-inherit opacity-60 text-[10px]">Ctrl+0</span>
          </button>
          <button onClick={() => { setZoom(() => 2); setIsZoomMenuOpen(false); }} className="w-full flex items-center justify-between px-4 py-1.5 hover:bg-[#0099ff] hover:text-white text-[#ffffff] transition-colors cursor-pointer">
            <span>Zoom to 200%</span>
          </button>
        </div>
      )}
    </div>
  );
}
