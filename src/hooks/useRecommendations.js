import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

export default function useRecommendations(filters = {}) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const filterKey = JSON.stringify(filters);

  const fetchRecommendations = useCallback(async () => {
    const filter = { status: "pending", ...filters };
    const data = await base44.entities.AgentRecommendation.filter(filter, "-created_date", 200);
    setRecommendations(data);
    setLoading(false);
  }, [filterKey]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const markApplied = async (recoId) => {
    await base44.entities.AgentRecommendation.update(recoId, {
      status: "applied",
      applied_date: new Date().toISOString(),
    });
    setRecommendations((prev) => prev.filter((r) => r.id !== recoId));
  };

  const dismiss = async (recoId) => {
    await base44.entities.AgentRecommendation.update(recoId, { status: "dismissed" });
    setRecommendations((prev) => prev.filter((r) => r.id !== recoId));
  };

  return { recommendations, loading, refetch: fetchRecommendations, markApplied, dismiss };
}