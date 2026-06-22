import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

export default function useTasks(stepId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    const filter = stepId ? { step_id: stepId } : {};
    const data = await base44.entities.Task.filter(filter, "-created_date", 200);
    setTasks(data);
    setLoading(false);
  }, [stepId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const markTaskDone = async (taskId) => {
    await base44.entities.Task.update(taskId, {
      statut: "done",
      completed_date: new Date().toISOString(),
    });
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, statut: "done" } : t)));
  };

  return { tasks, loading, refetch: fetchTasks, markTaskDone };
}