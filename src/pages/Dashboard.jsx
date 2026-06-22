import React from "react";
import { Link } from "react-router-dom";
import { TrendingUp, ArrowRight, CheckCircle2, Lightbulb, AlertTriangle, Zap } from "lucide-react";
import ProgressBar from "@/components/shared/ProgressBar";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import useSteps from "@/hooks/useSteps";
import useProject from "@/hooks/useProject";
import useRecommendations from "@/hooks/useRecommendations";
import useTasks from "@/hooks/useTasks";

const priorityConfig = {
  high: { label: "Haute", className: "bg-red-50 text-red-700 border-red-200" },
  medium: { label: "Moyenne", className: "bg-amber-50 text-amber-700 border-amber-200" },
  low: { label: "Basse", className: "bg-blue-50 text-blue-700 border-blue-200" },
};

export default function Dashboard() {
  const { progress, doneCount, steps, loading: stepsLoading } = useSteps();
  const { project, loading: projectLoading } = useProject();
  const { recommendations } = useRecommendations({});
  const { tasks } = useTasks();

  if (stepsLoading || projectLoading) return <LoadingSpinner />;

  const topRecos = recommendations.filter((r) => r.priority === "high").slice(0, 3);
  const inProgressTasks = tasks.filter((t) => t.statut === "in_progress").slice(0, 5);
  const kpis = [
    { nom: project?.kpi1_nom, cible: project?.kpi1_cible, actuel: project?.kpi1_actuel },
    { nom: project?.kpi2_nom, cible: project?.kpi2_cible, actuel: project?.kpi2_actuel },
    { nom: project?.kpi3_nom, cible: project?.kpi3_cible, actuel: project?.kpi3_actuel },
  ].filter((k) => k.nom);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Vue d'ensemble de votre projet</p>
      </div>

      {/* Progress */}
      <div className="bg-card rounded-2xl border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold font-heading">Progression globale</h2>
          <span className="text-xs text-muted-foreground">{doneCount}/{steps.length} étapes</span>
        </div>
        <ProgressBar value={progress} showLabel={false} />
        <div className="flex items-baseline gap-1.5 pt-1">
          <span className="text-3xl font-bold font-heading">{Math.round(progress)}%</span>
          <span className="text-xs text-muted-foreground">complété</span>
        </div>
      </div>

      {/* KPI widgets */}
      {kpis.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {kpis.map((kpi, i) => (
            <div key={i} className="bg-card rounded-2xl border p-5 space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{kpi.nom}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Actuel</p>
                  <p className="text-xl font-bold">{kpi.actuel || "—"}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Cible</p>
                  <p className="text-sm font-semibold text-muted-foreground">{kpi.cible || "—"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top recommendations */}
        <div className="bg-card rounded-2xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold font-heading">Recommandations prioritaires</h2>
            <Link to="/recommendations" className="text-xs text-primary flex items-center gap-1 hover:underline">
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {topRecos.length > 0 ? (
            <div className="space-y-3">
              {topRecos.map((reco) => (
                <div key={reco.id} className="rounded-xl border p-3 space-y-1">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-semibold">{reco.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 pl-6">{reco.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucune recommandation prioraire.</p>
          )}
        </div>

        {/* Top tasks */}
        <div className="bg-card rounded-2xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold font-heading">Tâches en cours</h2>
            <Link to="/tasks" className="text-xs text-primary flex items-center gap-1 hover:underline">
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {inProgressTasks.length > 0 ? (
            <div className="space-y-2">
              {inProgressTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 rounded-xl border p-3">
                  <Zap className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.nom}</p>
                    <p className="text-xs text-muted-foreground truncate">{task.agent_source}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityConfig[task.priority]?.className || priorityConfig.medium.className}`}>
                    {priorityConfig[task.priority]?.label || "Moyenne"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucune tâche en cours.</p>
          )}
        </div>
      </div>
    </div>
  );
}