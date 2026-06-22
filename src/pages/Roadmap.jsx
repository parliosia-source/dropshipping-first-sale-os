import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Circle, Loader2, AlertTriangle } from "lucide-react";
import ProgressBar from "@/components/shared/ProgressBar";
import StatusBadge from "@/components/shared/StatusBadge";
import useSteps from "@/hooks/useSteps";
import { getAgentForStep, accentClasses } from "@/lib/agents";
import AgentIcon from "@/components/shared/AgentIcon";

const statusIcons = {
  done: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
  active: <Loader2 className="w-5 h-5 text-primary animate-spin" />,
  blocked: <AlertTriangle className="w-5 h-5 text-red-500" />,
  todo: <Circle className="w-5 h-5 text-muted-foreground/40" />,
};

export default function Roadmap() {
  const { steps, progress, doneCount, loading } = useSteps();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading tracking-tight">Roadmap</h1>
        <p className="text-sm text-muted-foreground mt-1">{doneCount} sur {steps.length} étapes complétées</p>
      </div>

      <div className="bg-card rounded-2xl border p-5">
        <ProgressBar value={progress} />
      </div>

      <div className="space-y-2">
        {steps.map((step, index) => (
          <Link
            key={step.id}
            to={step.statut === "active" ? "/active-step" : `/step/${step.id}`}
            className="block"
          >
            <div className={`bg-card rounded-xl border p-4 flex items-center gap-4 transition-all duration-150 hover:shadow-sm hover:border-primary/30 ${
              step.statut === "active" ? "border-primary/40 shadow-sm ring-1 ring-primary/10" : ""
            }`}>
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                {step.ordre}
              </div>
              <div className="flex-shrink-0">
                {statusIcons[step.statut]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{step.nom}</p>
                <p className="text-xs text-muted-foreground truncate">{step.objectif}</p>
                {(() => {
                  const agent = getAgentForStep(step.ordre);
                  if (!agent) return null;
                  const accent = accentClasses[agent.accent] || accentClasses.primary;
                  return (
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs mt-1 ${accent.bg} ${accent.text}`}>
                      <AgentIcon name={agent.icon} className="w-3 h-3" />
                      {agent.shortName}
                    </div>
                  );
                })()}
              </div>
              <StatusBadge status={step.statut} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}