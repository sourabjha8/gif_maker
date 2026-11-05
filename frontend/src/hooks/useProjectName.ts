import { useEffect, useState } from 'react';
import { DEFAULT_PROJECT_NAME, getProject, renameProject as persistRenameProject } from '../lib/db';

export function useProjectName(projectId: string) {
  const [projectName, setProjectName] = useState(DEFAULT_PROJECT_NAME);

  useEffect(() => {
    (async () => {
      const project = await getProject(projectId);
      setProjectName(project?.name ?? DEFAULT_PROJECT_NAME);
    })();
  }, [projectId]);

  const renameProject = (name: string) => {
    const trimmed = name.trim() || DEFAULT_PROJECT_NAME;
    setProjectName(trimmed);
    void persistRenameProject(projectId, trimmed);
  };

  return { projectName, renameProject };
}
