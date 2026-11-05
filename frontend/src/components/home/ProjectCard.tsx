import { colors } from '../../constants/theme';
import type { Project } from '../../types/project';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer flex flex-col rounded-[15px] border ${colors.border} ${colors.surface} hover:border-[#0099ff] ${colors.transition} overflow-hidden shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] active:scale-[0.99]`}
    >
      <div className={`w-full aspect-[4/3] ${colors.bg} border-b ${colors.border} flex items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 bg-[#0099ff]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className={`text-[#555555] font-medium text-xs group-hover:text-[#999999] ${colors.transition} group-hover:scale-110`}>Preview</span>
      </div>
      <div className={`p-4 ${colors.surface}`}>
        <h3 className={`font-semibold text-[14px] ${colors.textPrimary} truncate mb-1 group-hover:text-[#0099ff] transition-colors`}>{project.name}</h3>
        <p className={`text-[11px] font-medium ${colors.textSecondary}`}>{project.date}</p>
      </div>
    </div>
  );
}
