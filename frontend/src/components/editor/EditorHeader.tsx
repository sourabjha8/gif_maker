import { useEffect, useRef, useState } from 'react';
import { colors } from '../../constants/theme';

interface EditorHeaderProps {
  onBack: () => void;
  projectName: string;
  onRenameProject: (name: string) => void;
}

export function EditorHeader({ onBack, projectName, onRenameProject }: EditorHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(projectName);
  const inputRef = useRef<HTMLInputElement>(null);
  // Prevents onBlur (fired when input unmounts) from double-committing after
  // Enter or Escape have already handled the outcome.
  const handledRef = useRef(false);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const startEditing = () => {
    handledRef.current = false;
    setDraftName(projectName);
    setIsEditing(true);
  };

  const commit = () => {
    if (handledRef.current) return;
    handledRef.current = true;
    setIsEditing(false);
    onRenameProject(draftName);
  };

  const cancel = () => {
    handledRef.current = true;
    setIsEditing(false);
  };

  return (
    <header
      onPointerDown={(e) => e.stopPropagation()}
      className={`absolute top-0 left-0 right-0 z-10 h-14 flex items-center px-4 border-b ${colors.border} ${colors.surface} select-none`}
    >
      <button
        onClick={onBack}
        className={`flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[#262626] ${colors.transition} active:scale-90 mr-3 cursor-pointer group`}
        title="Back to home"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-[#0099ff] transition-colors" />
        </svg>
      </button>
      <div className="flex flex-col">
        {isEditing ? (
          <input
            ref={inputRef}
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                commit();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                cancel();
              }
            }}
            className="bg-transparent font-bold text-[13px] tracking-tight text-[#ffffff] outline-none border-b border-[#0099ff] w-[220px]"
          />
        ) : (
          <span
            onClick={startEditing}
            title="Click to rename"
            className="font-bold text-[13px] tracking-tight cursor-text hover:text-[#0099ff] transition-colors"
          >
            {projectName}
          </span>
        )}
      </div>
    </header>
  );
}
