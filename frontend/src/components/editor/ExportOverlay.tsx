import type { ExportKind } from '../../hooks/useGifExport';

interface ExportOverlayProps {
  status: 'idle' | 'rendering' | 'encoding';
  progress: number;
  kind: ExportKind;
  error: string | null;
  onDismissError: () => void;
}

const KIND_LABEL: Record<ExportKind, string> = {
  gif: 'GIF',
  mp4: 'MP4',
};

export function ExportOverlay({ status, progress, kind, error, onDismissError }: ExportOverlayProps) {
  if (status === 'idle' && !error) return null;

  if (error) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md bg-black/60 animate-in fade-in duration-300">
        <div className="bg-[#141414] border border-[#262626] rounded-[30px] p-8 max-w-sm w-full mx-4 shadow-[0_32px_64px_rgba(0,0,0,0.8)] flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 mb-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">Export Failed</h2>
          <p className="text-xs font-medium text-[#999999] mb-8 break-words max-h-32 overflow-y-auto">
            {error}
          </p>
          <button
            onClick={onDismissError}
            className="px-6 py-2.5 rounded-full bg-white text-black text-[10px] font-bold hover:bg-[#f2f2f2] transition-all uppercase tracking-widest"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md bg-black/60 animate-in fade-in duration-300">
      <div className="bg-[#141414] border border-[#262626] rounded-[30px] p-8 max-w-sm w-full mx-4 shadow-[0_32px_64px_rgba(0,0,0,0.8)] flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-[#262626]" />
          <div
            className="absolute inset-0 rounded-full border-4 border-t-[#0099ff] animate-spin"
            style={{ borderRightColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: 'transparent' }}
          />
        </div>

        <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">
          {status === 'rendering' ? 'Rendering Frames' : `Encoding ${KIND_LABEL[kind]}`}
        </h2>
        <p className="text-xs font-bold text-[#999999] uppercase tracking-widest mb-8">
          Please wait while we process your request
        </p>

        <div className="w-full h-1.5 bg-[#090909] rounded-full overflow-hidden mb-3 border border-[#262626]">
          <div
            className="h-full bg-[#0099ff] transition-all duration-300 ease-out shadow-[0_0_12px_rgba(0,153,255,0.6)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between w-full mb-8">
          <span className="text-[10px] font-bold text-[#0099ff] uppercase tracking-tighter">Processing...</span>
          <span className="text-[10px] font-bold text-[#999999] uppercase">{progress}%</span>
        </div>

        <button
          onClick={() => window.location.reload()} // Quick way to abort worker
          className="px-6 py-2 rounded-full border border-[#262626] text-[10px] font-bold text-[#999999] hover:text-[#ffffff] hover:bg-[#1a1a1a] transition-all uppercase tracking-widest"
        >
          Cancel Export
        </button>
      </div>
    </div>
  );
}
