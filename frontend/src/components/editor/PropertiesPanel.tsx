import { useRef, useState } from 'react';
import type React from 'react';
import type { Frame } from '../../types/frame';
import type { AnimationPreset } from '../../lib/db';
import { colors } from '../../constants/theme';
import { useClickOutside } from '../../hooks/useClickOutside';

const ANIMATION_STYLES: { id: Frame['animationStyle']; label: string; desc: string }[] = [
  { id: 'smooth', label: 'Smooth Slide', desc: 'Natural ease-out' },
  { id: 'linear', label: 'Linear', desc: 'Constant speed' },
  { id: 'elastic', label: 'Elastic', desc: 'Playful overshoot' },
  { id: 'bounce', label: 'Bounce', desc: 'Physical impact' },
];

const CANVAS_PRESETS = [
  { label: '1:1', w: 1080, h: 1080 },
  { label: '16:9', w: 1920, h: 1080 },
  { label: '9:16', w: 1080, h: 1920 },
  { label: '4:3', w: 1440, h: 1080 },
  { label: '3:4', w: 1080, h: 1440 },
];

const DIRECTION_OPTIONS: { dir: NonNullable<Frame['sliderDirection']>; icon: React.ReactNode }[] = [
  { dir: 'ltr', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg> },
  { dir: 'rtl', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg> },
  { dir: 'ttb', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg> },
  { dir: 'btt', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg> },
];

interface PropertiesPanelProps {
  selectedFrame: Frame | undefined;
  selectedFrameId: string | null;
  updateSelectedFrameSize: (w: number, h: number) => void;
  updateSelectedFrameDirection: (dir: Frame['sliderDirection']) => void;
  updateSelectedFrameAnimation: (
    key: 'duration' | 'pauseDuration' | 'animationStyle' | 'sliderOffset',
    val: Frame['duration'] | Frame['pauseDuration'] | Frame['animationStyle'] | Frame['sliderOffset']
  ) => void;
  onImageUpload: (type: 'before' | 'after', e: React.ChangeEvent<HTMLInputElement>) => void;
  onSwapImages: () => void;
  onExportPNG: () => void;
  onExportGIF: () => void;
  onExportMP4: () => void;
  isAnimating: boolean;
  setIsAnimating: (updater: (v: boolean) => boolean) => void;
  animationPresets: AnimationPreset[];
  onSaveAnimationPreset: (name: string) => void;
  onApplyAnimationPreset: (preset: AnimationPreset) => void;
  onDeleteAnimationPreset: (id: string) => void;
}

export function PropertiesPanel({
  selectedFrame,
  selectedFrameId,
  updateSelectedFrameSize,
  updateSelectedFrameDirection,
  updateSelectedFrameAnimation,
  onImageUpload,
  onSwapImages,
  onExportPNG,
  onExportGIF,
  onExportMP4,
  isAnimating,
  setIsAnimating,
  animationPresets,
  onSaveAnimationPreset,
  onApplyAnimationPreset,
  onDeleteAnimationPreset,
}: PropertiesPanelProps) {
  const [isAspectRatioLocked, setIsAspectRatioLocked] = useState(true);
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [presetNameDraft, setPresetNameDraft] = useState('');
  const styleMenuRef = useRef<HTMLDivElement>(null);

  useClickOutside(styleMenuRef, isStyleMenuOpen, () => setIsStyleMenuOpen(false));

  const currentRatio = selectedFrame ? selectedFrame.width / selectedFrame.height : 1;

  const confirmSavePreset = () => {
    if (!presetNameDraft.trim()) return;
    onSaveAnimationPreset(presetNameDraft);
    setPresetNameDraft('');
    setIsSavingPreset(false);
  };

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      className={`absolute right-6 top-20 bottom-8 w-[300px] flex flex-col ${colors.surface} border ${colors.border} rounded-[20px] overflow-y-auto shadow-2xl z-10 select-none`}
    >
      {/* Section 1: Canvas Size */}
      <div className={`flex flex-col p-5 border-b border-[#262626] ${!selectedFrameId ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[11px] uppercase tracking-wider text-[#ffffff]">Canvas Size</h3>
        </div>

        <div className="flex bg-[#090909] border border-[#262626] rounded-md p-1 grid grid-cols-5 gap-1 mb-4 shadow-inner">
          {CANVAS_PRESETS.map((preset) => {
            const isActive = selectedFrame && selectedFrame.width === preset.w && selectedFrame.height === preset.h;
            return (
              <button
                key={preset.label}
                onClick={() => updateSelectedFrameSize(preset.w, preset.h)}
                className={`py-1 text-[10px] font-bold rounded cursor-pointer ${colors.transition} ${isActive ? 'bg-[#262626] text-white shadow-sm' : 'text-[#999999] hover:text-white hover:bg-[#1a1a1a]'}`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 items-center">
          <div className={`flex-1 flex items-center bg-[#090909] border border-[#262626] rounded-md px-2.5 focus-within:border-[#0099ff] hover:border-[#333] ${colors.transition} group-focus-within:bg-[#0d0d0d]`}>
            <span className="text-[9px] font-bold text-[#555] mr-1.5 select-none group-focus-within:text-[#0099ff]">W</span>
            <input
              type="number"
              value={selectedFrame?.width || ''}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                if (isAspectRatioLocked && selectedFrame) {
                  updateSelectedFrameSize(val, Math.round(val / currentRatio));
                } else {
                  updateSelectedFrameSize(val, selectedFrame?.height || 0);
                }
              }}
              className="w-full bg-transparent text-xs font-semibold text-[#ffffff] py-2 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <div
            onClick={() => setIsAspectRatioLocked(!isAspectRatioLocked)}
            className={`flex items-center justify-center ${isAspectRatioLocked ? 'text-[#0099ff]' : 'text-[#444]'} hover:text-[#999999] ${colors.transition} cursor-pointer`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isAspectRatioLocked ? (
                <path d="m13 10-3 3m1.42 1.42L14 11m4.24-4.24a5 5 0 0 0-7.07 0L9.46 8.46M12 12l2.54 2.54m1.71 1.71A5 5 0 0 0 21 16.24l-3-3" />
              ) : (
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71m-4.21 8.53a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              )}
            </svg>
          </div>

          <div className={`flex-1 flex items-center bg-[#090909] border border-[#262626] rounded-md px-2.5 focus-within:border-[#0099ff] hover:border-[#333] ${colors.transition}`}>
            <span className="text-[9px] font-bold text-[#555] mr-1.5 select-none text-nowrap">H</span>
            <input
              type="number"
              value={selectedFrame?.height || ''}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                if (isAspectRatioLocked && selectedFrame) {
                  updateSelectedFrameSize(Math.round(val * currentRatio), val);
                } else {
                  updateSelectedFrameSize(selectedFrame?.width || 0, val);
                }
              }}
              className="w-full bg-transparent text-xs font-semibold text-[#ffffff] py-2 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Images */}
      <div className={`flex flex-col p-5 border-b border-[#262626] ${!selectedFrameId ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[11px] uppercase tracking-wider text-[#ffffff]">Images</h3>
        </div>

        <div className="relative grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-2.5 cursor-pointer group">
            <input type="file" accept="image/*" className="hidden" disabled={!selectedFrameId} onChange={(e) => onImageUpload('before', e)} />
            <div className={`aspect-square rounded-xl border border-dashed border-[#262626] bg-[#090909] overflow-hidden flex flex-col items-center justify-center group-hover:border-[#0099ff] group-hover:bg-[#0099ff]/5 ${colors.transition} shadow-sm active:scale-95`}>
              {selectedFrame?.beforeImage ? (
                <img src={selectedFrame.beforeImage} className="w-full h-full object-cover" alt="Before preview" />
              ) : (
                <>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-1.5 group-hover:stroke-[#0099ff] transition-all duration-200 ease-out"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                  <span className={`text-[10px] font-bold text-[#999999] group-hover:text-[#0099ff] ${colors.transition} uppercase tracking-tight`}>Upload</span>
                </>
              )}
            </div>
            <span className="text-[10px] font-bold text-[#999999] uppercase tracking-wide group-hover:text-[#ffffff] transition-colors pl-0.5">Before Image</span>
          </label>

          <label className="flex flex-col gap-2.5 cursor-pointer group">
            <input type="file" accept="image/*" className="hidden" disabled={!selectedFrameId} onChange={(e) => onImageUpload('after', e)} />
            <div className={`aspect-square rounded-xl border border-dashed border-[#262626] bg-[#090909] overflow-hidden flex flex-col items-center justify-center group-hover:border-[#0099ff] group-hover:bg-[#0099ff]/5 ${colors.transition} shadow-sm active:scale-95`}>
              {selectedFrame?.afterImage ? (
                <img src={selectedFrame.afterImage} className="w-full h-full object-cover" alt="After preview" />
              ) : (
                <>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-1.5 group-hover:stroke-[#0099ff] transition-all duration-200 ease-out"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                  <span className={`text-[10px] font-bold text-[#999999] group-hover:text-[#0099ff] ${colors.transition} uppercase tracking-tight`}>Upload</span>
                </>
              )}
            </div>
            <span className="text-[10px] font-bold text-[#999999] uppercase tracking-wide group-hover:text-[#ffffff] transition-colors pl-0.5">After Image</span>
          </label>

          <button
            type="button"
            onClick={onSwapImages}
            disabled={!selectedFrameId}
            title="Swap before/after"
            className={`absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-[#1a1a1a] hover:bg-[#0099ff] border border-[#333] flex items-center justify-center text-[#ffffff] shadow-md ${colors.transition} hover:scale-110 active:scale-95 cursor-pointer`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 1 21 5 17 9" />
              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <polyline points="7 23 3 19 7 15" />
              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Section 3: Animation */}
      <div className="flex flex-col p-5 border-b border-[#262626]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[11px] uppercase tracking-wider text-[#ffffff]">Animation</h3>
        </div>

        <div className="flex flex-col gap-4">
          {/* Dropdown: Style */}
          <div ref={styleMenuRef} className={`flex items-center justify-between group relative ${!selectedFrameId ? 'opacity-40 pointer-events-none' : ''}`}>
            <span className="text-[10px] font-bold text-[#999999] uppercase tracking-wide w-24 group-hover:text-[#ffffff] transition-colors">Style</span>
            <div
              onClick={() => setIsStyleMenuOpen(!isStyleMenuOpen)}
              className={`flex-1 flex items-center justify-between bg-[#090909] border ${isStyleMenuOpen ? 'border-[#0099ff]' : 'border-[#262626]'} rounded-md px-2.5 py-2 cursor-pointer hover:border-[#333] hover:bg-[#0d0d0d] transition-all active:scale-[0.98]`}
            >
              <span className="text-xs font-semibold text-[#ffffff] capitalize">
                {selectedFrame?.animationStyle || 'Smooth'}
              </span>
              <svg
                className={`${isStyleMenuOpen ? 'rotate-180' : ''} transition-transform`}
                width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#999999" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            {isStyleMenuOpen && (
              <div className="absolute top-full left-24 right-0 mt-2 bg-[#1a1a1a] border border-[#333] rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.8)] py-1.5 z-50 overflow-hidden">
                {ANIMATION_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => {
                      updateSelectedFrameAnimation('animationStyle', style.id);
                      setIsStyleMenuOpen(false);
                    }}
                    className={`w-full flex flex-col items-start px-3 py-2 hover:bg-[#0099ff] group/item transition-colors text-left ${selectedFrame?.animationStyle === style.id ? 'bg-[#0099ff]/10' : ''}`}
                  >
                    <span className={`text-[11px] font-bold ${selectedFrame?.animationStyle === style.id ? 'text-[#0099ff]' : 'text-[#ffffff]'} group-hover/item:text-white`}>
                      {style.label}
                    </span>
                    <span className="text-[9px] text-[#555] group-hover/item:text-white/60 font-medium tracking-tight">
                      {style.desc}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input: Duration */}
          <div className={`flex items-center justify-between group ${!selectedFrameId ? 'opacity-40 pointer-events-none' : ''}`}>
            <span className="text-[10px] font-bold text-[#999999] uppercase tracking-wide w-24 group-hover:text-[#ffffff] transition-all duration-200 ease-out">Duration</span>
            <div className={`flex-1 flex items-center bg-[#090909] border border-[#262626] rounded-md px-2.5 focus-within:border-[#0099ff] hover:border-[#333] ${colors.transition}`}>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={selectedFrame?.duration || 2.0}
                onChange={(e) => updateSelectedFrameAnimation('duration', parseFloat(e.target.value) || 0.1)}
                className="w-full bg-transparent text-xs font-semibold text-white py-2 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-[10px] font-bold text-[#444] select-none">s</span>
            </div>
          </div>

          {/* Input: Pause at end */}
          <div className={`flex items-center justify-between group text-nowrap ${!selectedFrameId ? 'opacity-40 pointer-events-none' : ''}`}>
            <span className="text-[10px] font-bold text-[#999999] uppercase tracking-wide w-24 group-hover:text-[#ffffff] transition-all duration-200 ease-out">Pause at end</span>
            <div className={`flex-1 flex items-center bg-[#090909] border border-[#262626] rounded-md px-2.5 focus-within:border-[#0099ff] hover:border-[#333] ${colors.transition} ml-2`}>
              <input
                type="number"
                step="0.1"
                min="0"
                value={selectedFrame?.pauseDuration || 1.0}
                onChange={(e) => updateSelectedFrameAnimation('pauseDuration', parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent text-xs font-semibold text-white py-2 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-[10px] font-bold text-[#444] select-none">s</span>
            </div>
          </div>

          {/* Input: Start Offset */}
          <div className={`flex items-center justify-between group ${!selectedFrameId ? 'opacity-40 pointer-events-none' : ''}`}>
            <span className="text-[10px] font-bold text-[#999999] uppercase tracking-wide w-24 group-hover:text-[#ffffff] transition-all duration-200 ease-out">Start Offset</span>
            <div className={`flex-1 flex items-center bg-[#090909] border border-[#262626] rounded-md px-2.5 focus-within:border-[#0099ff] hover:border-[#333] ${colors.transition}`}>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={selectedFrame?.sliderOffset ?? 0}
                onChange={(e) => {
                  const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                  updateSelectedFrameAnimation('sliderOffset', val);
                }}
                className="w-full bg-transparent text-xs font-semibold text-white py-2 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-[10px] font-bold text-[#444] select-none">%</span>
            </div>
          </div>

          {/* Buttons: Reveal Direction */}
          <div className={`flex items-center justify-between group mt-1 ${!selectedFrameId ? 'opacity-40 pointer-events-none' : ''}`}>
            <span className="text-[10px] font-bold text-[#999999] uppercase tracking-wide w-24 group-hover:text-[#ffffff] transition-all duration-200 ease-out">Direction</span>
            <div className="flex-1 bg-[#090909] border border-[#262626] rounded-md p-0.5 grid grid-cols-4 gap-0.5 shadow-inner text-[#ffffff]">
              {DIRECTION_OPTIONS.map((item) => {
                const isActive = selectedFrame?.sliderDirection === item.dir;
                return (
                  <button
                    key={item.dir}
                    onClick={() => updateSelectedFrameDirection(item.dir)}
                    className={`py-1.5 px-1 rounded flex justify-center items-center ${isActive ? 'bg-[#262626] text-[#ffffff] shadow-sm' : 'hover:bg-[#222] text-[#999999] hover:text-white'} ${colors.transition} cursor-pointer active:scale-90`}
                  >
                    {item.icon}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Saved Animation Styles */}
          <div className={`flex flex-col gap-2.5 pt-4 border-t border-[#262626] ${!selectedFrameId ? 'opacity-40 pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#999999] uppercase tracking-wide">Saved Styles</span>
              <button
                onClick={() => setIsSavingPreset((v) => !v)}
                className={`text-[10px] font-bold uppercase tracking-wide cursor-pointer ${colors.transition} ${isSavingPreset ? 'text-[#ffffff]' : 'text-[#0099ff] hover:text-[#ffffff]'}`}
              >
                {isSavingPreset ? 'Cancel' : '+ Save Current'}
              </button>
            </div>

            {isSavingPreset && (
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={presetNameDraft}
                  onChange={(e) => setPresetNameDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') confirmSavePreset();
                    if (e.key === 'Escape') setIsSavingPreset(false);
                  }}
                  placeholder="Style name"
                  className="flex-1 min-w-0 bg-[#090909] border border-[#262626] focus:border-[#0099ff] rounded-md px-2.5 py-1.5 text-xs font-semibold text-white outline-none"
                />
                <button
                  onClick={confirmSavePreset}
                  className="px-3 py-1.5 rounded-md bg-white text-black text-[10px] font-bold hover:bg-[#f2f2f2] transition-all cursor-pointer active:scale-95"
                >
                  Save
                </button>
              </div>
            )}

            {animationPresets.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {animationPresets.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => onApplyAnimationPreset(preset)}
                    title={`Apply "${preset.name}" to this frame`}
                    className="group flex items-center gap-1.5 bg-[#090909] border border-[#262626] hover:border-[#0099ff] rounded-full pl-3 pr-1.5 py-1 cursor-pointer transition-all active:scale-95"
                  >
                    <span className="text-[10px] font-bold text-white">{preset.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteAnimationPreset(preset.id);
                      }}
                      title="Delete style"
                      className="w-3.5 h-3.5 flex items-center justify-center rounded-full text-[#666] hover:text-white hover:bg-red-500/70 transition-colors text-[10px] leading-none cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              !isSavingPreset && (
                <p className="text-[10px] font-medium text-[#555]">No saved styles yet.</p>
              )
            )}
          </div>

          {/* Preview Toggle */}
          <div className="mt-1 pt-4 border-t border-[#262626]">
            <button
              onClick={() => setIsAnimating((v) => !v)}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold ${colors.transition} ${isAnimating
                ? 'bg-[#0099ff]/10 text-[#0099ff] border border-[#0099ff]/20'
                : 'bg-[#ffffff] text-black hover:bg-white active:scale-95 cursor-pointer shadow-lg'}`}
            >
              {isAnimating ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-[#0099ff] animate-pulse" />
                  <span>Stop Preview</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  <span>Preview Animation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Section 4: Export */}
      <div className={`flex flex-col p-5 ${!selectedFrameId ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[11px] uppercase tracking-wider text-[#ffffff]">Export</h3>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={onExportPNG}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border border-[#262626] bg-[#090909] hover:border-[#333] hover:bg-[#0d0d0d] active:scale-95 transition-all group`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-[#ffffff]"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span className="text-[10px] font-bold text-[#999999] group-hover:text-[#ffffff] uppercase tracking-tight">PNG</span>
          </button>

          <button
            onClick={onExportGIF}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border border-[#262626] bg-[#090909] hover:border-[#0099ff]/30 hover:bg-[#0099ff]/5 active:scale-95 transition-all group`}
          >
            <div className="relative">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-[#0099ff]"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 3v18"/><path d="M3 7h4"/><path d="M3 12h4"/><path d="M3 17h4"/></svg>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#0099ff] rounded-full scale-0 group-hover:scale-100 transition-transform"/>
            </div>
            <span className="text-[10px] font-bold text-[#999999] group-hover:text-[#0099ff] uppercase tracking-tight">GIF</span>
          </button>

          <button
            onClick={onExportMP4}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border border-[#262626] bg-[#090909] hover:border-[#0099ff]/30 hover:bg-[#0099ff]/5 active:scale-95 transition-all group`}
          >
            <div className="relative">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-[#0099ff]"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m10 9 5 3-5 3z"/></svg>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#0099ff] rounded-full scale-0 group-hover:scale-100 transition-transform"/>
            </div>
            <span className="text-[10px] font-bold text-[#999999] group-hover:text-[#0099ff] uppercase tracking-tight">MP4</span>
          </button>
        </div>
      </div>
    </div>
  );
}
