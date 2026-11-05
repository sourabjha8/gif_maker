import { colors, buttonPrimary, radius, typography } from '../../constants/theme';

interface HomeHeaderProps {
  onNewProject: () => void;
}

export function HomeHeader({ onNewProject }: HomeHeaderProps) {
  return (
    <header className={`h-16 flex items-center justify-between px-8 border-b ${colors.border} ${colors.surface}`}>
      <div className={`flex items-center gap-2.5 ${colors.textPrimary} select-none`}>
        <div className="w-6 h-6 rounded-md bg-white shadow-inner" />
        <span className={`${typography.headline} text-lg`}>GifMaker</span>
      </div>

      <button
        onClick={onNewProject}
        className={`flex items-center gap-2 h-9 px-4 ${radius.pill} text-sm ${typography.button} ${colors.transition} ${buttonPrimary} active:scale-[0.97] cursor-pointer shadow-sm`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        New Project
      </button>
    </header>
  );
}
