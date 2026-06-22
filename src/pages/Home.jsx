import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Target, Package, Tag, Globe, Megaphone, CalendarClock, CheckCircle2, FileText, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/shared/ProgressBar";
import StatusBadge from "@/components/shared/StatusBadge";
import useSteps from "@/hooks/useSteps";
import useProject from "@/hooks/useProject";
import { AGENTS, accentClasses } from "@/lib/agents";
import AgentIcon from "@/components/shared/AgentIcon";

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

  const snapshotItems = [
    { icon: Package, label: "Produit", value: project?.produit },
    { icon: Tag, label: "Niche", value: project?.niche },
    { icon: Globe, label: "Plateforme", value: project?.plateforme },
    { icon: Megaphone, label: "Canal", value: project?.canal },
    { icon: CalendarClock, label: "Objectif 1ère vente", value: project?.objectif_premiere_vente_date },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <Zap className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-heading tracking-tight">First Sale OS</h1>
          <p className="text-xs text-muted-foreground">Cockpit dropshipping — de la niche à la première vente</p>
        </div>
      </div>

      {/* Progress + active step side by side on desktop */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="bg-card rounded-2xl border p-5 space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold font-heading">Progression globale</h2>
            <span className="text-xs text-muted-foreground">{doneCount}/{steps.length}</span>
          </div>
          <ProgressBar value={progress} showLabel={false} />
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-3xl font-bold font-heading">{Math.round(progress)}%</span>
            <span className="text-xs text-muted-foreground">complété</span>
          </div>
        </div>

        {activeStep ? (
          <Link to="/active-step" className="lg:col-span-3">
            <div className="bg-card rounded-2xl border p-5 h-full hover:border-primary/30 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Étape en cours</h3>
                </div>
                <StatusBadge status={activeStep.statut} />
              </div>
              <p className="text-lg font-semibold mb-1">{activeStep.ordre}. {activeStep.nom}</p>
              <p className="text-sm text-muted-foreground line-clamp-2">{activeStep.objectif}</p>
              <div className="flex items-center gap-1.5 mt-3 text-xs font-medium text-primary">
                Ouvrir l'étape <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </Link>
        ) : (
          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5 lg:col-span-3 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">Toutes les étapes sont terminées !</p>
              <p className="text-xs text-emerald-700">Votre système est opérationnel.</p>
            </div>
          </div>
        )}
      </div>

      {/* Project snapshot */}
      <div className="bg-card rounded-2xl border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold font-heading">Projet snapshot</h2>
          <Link to="/project">
            <Button size="sm" variant="ghost" className="text-xs h-7 gap-1">
              Modifier <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
        {project ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {snapshotItems.map(({ icon: Icon, label, value }) => (
              <div key={label} className="space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">{label}</span>
                </div>
                <p className="text-sm font-semibold truncate">{value || "—"}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Aucun projet configuré.</p>
            <Link to="/project">
              <Button size="sm" variant="outline" className="gap-1.5">
                Configurer <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Active support system */}
      <div className="bg-card rounded-2xl border p-5">
        <h2 className="text-sm font-semibold font-heading mb-1">Système d'assistance actif</h2>
        <p className="text-xs text-muted-foreground mb-4">1 orchestrateur + 5 rôles spécialisés derrière votre coach</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {AGENTS.map((agent) => {
            const accent = accentClasses[agent.accent] || accentClasses.primary;
            return (
              <div key={agent.id} className={`rounded-xl border p-3 ${accent.bg} ${accent.border}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <AgentIcon name={agent.icon} className={`w-4 h-4 ${accent.text}`} />
                  <span className="text-sm font-semibold">{agent.name}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-snug">{agent.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <Link to={activeStep ? "/active-step" : "/roadmap"}>
        <Button className="w-full h-12 text-base font-semibold gap-2 rounded-xl">
          {activeStep ? "Reprendre l'étape" : "Voir la roadmap"} <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>
    </div>
  );
}