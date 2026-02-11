import { useState, useEffect } from "react";
import { projectsBase, type ProjectData } from "../data/projects";

export default function useProjects() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setProjects(projectsBase);
    setLoading(false);
  }, []);

  return { projects, loading };
}
