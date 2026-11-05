import type React from 'react';
import type { Frame } from '../../types/frame';
import { colors } from '../../constants/theme';

interface FrameCanvasProps {
  frame: Frame;
  isSelected: boolean;
  activeTool: 'move' | 'frame';
  isDraggingFrame: boolean;
  isDraggingSlider: boolean;
  onFramePointerDown: (frame: Frame, e: React.PointerEvent) => void;
  onFocus: (frameId: string) => void;
  onSliderPointerDown: (frameId: string, e: React.PointerEvent) => void;
}

export function FrameCanvas({
  frame,
  isSelected,
  activeTool,
  isDraggingFrame,
  isDraggingSlider,
  onFramePointerDown,
  onFocus,
  onSliderPointerDown,
}: FrameCanvasProps) {
  return (
    <div
      onPointerDown={(e) => {
        if (activeTool === 'move') onFramePointerDown(frame, e);
      }}
      onDoubleClick={() => onFocus(frame.id)}
      className={`absolute ${isDraggingFrame ? 'cursor-grabbing' : activeTool === 'move' ? 'cursor-grab' : ''}`}
      style={{
        left: frame.x,
        top: frame.y,
        width: frame.width,
        height: frame.height,
      }}
    >
      {/* Frame Name */}
      <div
        className={`text-[11px] font-semibold mb-2 flex items-center gap-1.5 px-0.5 select-none absolute bottom-full left-0 ${isSelected ? 'text-[#0099ff] font-[Inter]' : 'text-[#999999]'}`}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 18 16 14 16 14 12 10 12 10 8 14 8 14 4 18 4 18 8 22 8"></polyline><path d="M5 19H19"></path><path d="M5 5h4"></path><path d="M5 12h4"></path></svg>
        {frame.name}
      </div>

      {/* Frame Container */}
      <div
        className={`relative w-full h-full rounded-xl border bg-[#141414] ${colors.transition} ${isSelected
          ? 'border-[2px] border-[#0099ff] shadow-[0_20px_60px_rgba(0,0,0,0.6)] cursor-default'
          : 'border-[#262626] shadow-xl hover:border-[#333] cursor-pointer'
          }`}
      >
        {/* Inner UI (Masks content) */}
        <div className="w-full h-full rounded-lg overflow-hidden relative bg-[#141414]">
          {/* Base Layer (After) */}
          <div className="absolute inset-0 flex items-center justify-center bg-[#090909]">
            {frame.afterImage ? (
              <img src={frame.afterImage} alt="After" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full absolute inset-0 flex items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={isSelected ? "#333" : "#1a1a1a"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
              </div>
            )}
            <span className="absolute top-4 right-4 px-2 py-1 rounded bg-black/60 text-[10px] font-bold text-[#ffffff] shadow-sm tracking-widest uppercase z-10 pointer-events-none">After</span>
          </div>

          {/* Masked Layer (Before) */}
          <div
            className="absolute overflow-hidden"
            style={{
              ...(frame.sliderDirection === 'rtl' ? { right: 0, top: 0, bottom: 0, width: `${frame.sliderPosition ?? 50}%` } :
                frame.sliderDirection === 'ttb' ? { left: 0, top: 0, right: 0, height: `${frame.sliderPosition ?? 50}%` } :
                  frame.sliderDirection === 'btt' ? { left: 0, bottom: 0, right: 0, height: `${frame.sliderPosition ?? 50}%` } :
                    { left: 0, top: 0, bottom: 0, width: `${frame.sliderPosition ?? 50}%` }) // default ltr
            }}
          >
            <div
              className="absolute bg-[#090909] flex items-center justify-center"
              style={{
                width: frame.width,
                height: frame.height,
                ...(frame.sliderDirection === 'rtl' ? { right: 0 } :
                  frame.sliderDirection === 'ttb' ? { top: 0 } :
                    frame.sliderDirection === 'btt' ? { bottom: 0 } :
                      { left: 0 })
              }}
            >
              {frame.beforeImage ? (
                <img src={frame.beforeImage} alt="Before" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full absolute inset-0 flex items-center justify-center opacity-80">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={isSelected ? "#262626" : "#1a1a1a"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                </div>
              )}
              <span className={`absolute px-2 py-1 rounded bg-black/60 text-[10px] font-bold text-[#ffffff] shadow-sm tracking-widest uppercase z-10 pointer-events-none
                ${frame.sliderDirection === 'btt' ? 'bottom-4 left-4' : 'top-4 left-4'}`}>
                Before
              </span>

              {/* Border of the Mask */}
              <div className={`absolute bg-white shadow-[0_0_15px_rgba(0,0,0,1)] pointer-events-none
                ${frame.sliderDirection === 'rtl' ? 'left-0 top-0 bottom-0 w-px' :
                  frame.sliderDirection === 'ttb' ? 'bottom-0 left-0 right-0 h-px' :
                    frame.sliderDirection === 'btt' ? 'top-0 left-0 right-0 h-px' :
                      'right-0 top-0 bottom-0 w-px'}`}
              />
            </div>
          </div>

          {/* Slider Handle */}
          {isSelected && (
            <div
              className={`absolute z-20 group
                ${(frame.sliderDirection === 'ttb' || frame.sliderDirection === 'btt') ? 'left-0 right-0 h-8 -translate-y-1/2 cursor-ns-resize' : 'top-0 bottom-0 w-8 -translate-x-1/2 cursor-ew-resize'}`}
              style={{
                ...(frame.sliderDirection === 'rtl' ? { right: `${frame.sliderPosition ?? 50}%`, left: 'auto' } :
                  frame.sliderDirection === 'ttb' ? { top: `${frame.sliderPosition ?? 50}%` } :
                    frame.sliderDirection === 'btt' ? { bottom: `${frame.sliderPosition ?? 50}%`, top: 'auto' } :
                      { left: `${frame.sliderPosition ?? 50}%` })
              }}
              onPointerDown={(e) => onSliderPointerDown(frame.id, e)}
            >
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-xl ${isDraggingSlider ? 'scale-110' : 'group-hover:scale-110'} ${colors.transition}
                ${(frame.sliderDirection === 'ttb' || frame.sliderDirection === 'btt') ? 'flex-col' : 'flex-row'}`}>
                <div className={`bg-[#ccc] rounded-full ${(frame.sliderDirection === 'ttb' || frame.sliderDirection === 'btt') ? 'w-3.5 h-0.5 my-[1.5px]' : 'w-0.5 h-3.5 mx-[1.5px]'}`} />
                <div className={`bg-[#ccc] rounded-full ${(frame.sliderDirection === 'ttb' || frame.sliderDirection === 'btt') ? 'w-3.5 h-0.5 my-[1.5px]' : 'w-0.5 h-3.5 mx-[1.5px]'}`} />
              </div>
            </div>
          )}
        </div>

        {/* Selection Handles */}
        {isSelected && (
          <>
            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-[1.5px] border-[#0099ff] rounded-sm pointer-events-none" />
            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-[1.5px] border-[#0099ff] rounded-sm pointer-events-none" />
            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-[1.5px] border-[#0099ff] rounded-sm pointer-events-none" />
            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-[1.5px] border-[#0099ff] rounded-sm pointer-events-none" />
          </>
        )}
      </div>
    </div>
  );
}
