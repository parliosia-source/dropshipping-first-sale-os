import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/shared/ProgressBar";
import StatusBadge from "@/components/shared/StatusBadge";
import useSteps from "@/hooks/useSteps";
import useProject from "@/hooks/useProject";

export default function Home() {
  const { activeStep, progress, doneCount, steps, loading } = useSteps();
  const { project } = useProject();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading tracking-tight">Dropshipping First Sale OS</h1>
          </div>
        </div>
        <p className="text-muted-foreground text-sm mt-3 max-w-lg">
          Votre cockpit pour atteindre votre première vente en dropshipping. 
          {project ? ` Produit : ${project.produit} · Niche : ${project.niche}` : ""}
        </p>
      </div>

      <div className="bg-card rounded-2xl border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold font-heading">Progression globale</h2>
          <span className="text-xs text-muted-foreground">{doneCount} / {steps.length} étapes</span>
        </div>
        <ProgressBar value={progress} />
      </div>

      {activeStep && (
        <div className="bg-card rounded-2xl border p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold font-heading">Étape en cours</h3>
            </div>
            <StatusBadge status={activeStep.statut} />
          </div>
          <p className="text-lg font-semibold mb-1">{activeStep.ordre}. {activeStep.nom}</p>
          <p className="text-sm text-muted-foreground mb-4">{activeStep.objectif}</p>
          <Link to="/active-step">
            <Button size="sm" variant="outline" className="gap-1.5">
              Voir les détails <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      )}

      <Link to={activeStep ? "/active-step" : "/roadmap"}>
        <Button className="w-full h-12 text-base font-semibold gap-2 rounded-xl">
          Commencer <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>
    </div>
  );
}