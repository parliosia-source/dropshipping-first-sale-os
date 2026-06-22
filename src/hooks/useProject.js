import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

export default function useProject() {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProject = useCallback(async () => {
    const data = await base44.entities.Project.list("-created_date", 1);
    setProject(data[0] || null);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  return { project, loading, refetch: fetchProject };
}