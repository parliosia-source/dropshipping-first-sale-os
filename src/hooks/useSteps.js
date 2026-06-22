import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

export default function useSteps() {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSteps = useCallback(async () => {
    const data = await base44.entities.Step.list("ordre", 50);
    setSteps(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSteps();
  }, [fetchSteps]);

  const activeStep = steps.find((s) => s.statut === "active") || null;
  const nextStep = activeStep ? steps.find((s) => s.ordre === activeStep.ordre + 1) : steps[0];
  const doneCount = steps.filter((s) => s.statut === "done").length;
  const progress = steps.length > 0 ? (doneCount / steps.length) * 100 : 0;

  return { steps, activeStep, nextStep, doneCount, progress, loading, refetch: fetchSteps };
}