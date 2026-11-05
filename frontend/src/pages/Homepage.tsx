import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeHeader } from '../components/home/HomeHeader';
import { ProjectCard } from '../components/home/ProjectCard';
import { colors, buttonPrimary, radius, typography } from '../constants/theme';
import { formatRelativeTime } from '../lib/formatRelativeTime';
import { createProject, getAllProjects, DEFAULT_PROJECT_NAME, type ProjectRecord } from '../lib/db';
import { slugify } from '../lib/slugify';
import type { Project } from '../types/project';

function toDisplayProject(record: ProjectRecord): Project {
  return { id: record.id, name: record.name, date: formatRelativeTime(record.updatedAt) };
}

export function Homepage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const records = await getAllProjects();
      setProjects(records.map(toDisplayProject));
      setIsLoaded(true);
    })();
  }, []);

  const openProject = (project: Project) => {
    navigate(`/editor/${project.id}/${slugify(project.name)}`);
  };

  const openNewProject = async () => {
    const project = await createProject(DEFAULT_PROJECT_NAME);
    navigate(`/editor/${project.id}/${slugify(project.name)}`);
  };

  if (!isLoaded) {
    return (
      <div className="flex-1 flex flex-col w-full h-full">
        <HomeHeader onNewProject={openNewProject} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col w-full h-full">
      <HomeHeader onNewProject={openNewProject} />

      <main className="flex-1 overflow-y-auto px-8 py-10 w-full max-w-[1400px] mx-auto flex flex-col">
        {projects.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <h2 className={`${typography.displayMd} text-xl mb-2 ${colors.textPrimary}`}>No projects yet</h2>
            <p className={`text-sm mb-8 ${colors.textSecondary}`}>Start creating your first animation or GIF</p>
            <button
              onClick={openNewProject}
              className={`flex items-center gap-2 h-10 px-5 ${radius.pill} text-sm ${typography.button} ${colors.transition} ${buttonPrimary} active:scale-[0.97] cursor-pointer shadow-md`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Create your first project
            </button>
          </div>
        ) : (
          <>
            <h1 className={`${typography.displayMd} text-xl mb-8`}>Recent Projects</h1>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-8">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} onClick={() => openProject(project)} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
