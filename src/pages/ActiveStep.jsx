import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Check, AlertTriangle, FileText, Target, Lightbulb, StickyNote, ShieldCheck, Lock, CheckCircle2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import StatusBadge from "@/components/shared/StatusBadge";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useToast } from "@/components/ui/use-toast";
import { getDomainForStep, getDomainAccent } from "@/lib/agents";
import AgentIcon from "@/components/shared/AgentIcon";

export default function ActiveStep() {
  const { stepId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(null);
  const [allSteps, setAllSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [preuve, setPreuve] = useState("");
  const [blocage, setBlocage] = useState("");
  const [checklistDone, setChecklistDone] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const steps = await base44.entities.Step.list("ordre", 50);
      setAllSteps(steps);
      let target;
      if (stepId) {
        target = steps.find((s) => s.id === stepId);
      } else {
        target = steps.find((s) => s.statut === "active") || steps[0];
      }
      if (target) {
        setStep(target);
        setNotes(target.notes || "");
        setPreuve(target.preuve_completion || "");
        setBlocage(target.raison_blocage || "");
        setChecklistDone(target.checklist_done || []);
      }
      setLoading(false);
    };
    load();
  }, [stepId]);

  const toggleChecklist = (index) => {
    setChecklistDone((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const persist = async (extraData = {}) => {
    setSaving(true);
    const updated = await base44.entities.Step.update(step.id, {
      notes,
      preuve_completion: preuve,
      raison_blocage: blocage,
      checklist_done: checklistDone,
      ...extraData,
    });
    setStep({ ...step, ...extraData, statut: extraData.statut || step.statut });
    setSaving(false);
    return updated;
  };

  const handleValidate = async () => {
    const allChecked = step.checklist && step.checklist.length > 0 && step.checklist.every((_, i) => checklistDone.includes(i));
    if (!allChecked) {
      toast({ title: "Checklist incomplète", description: "Cochez tous les éléments avant de valider.", variant: "destructive" });
      return;
    }
    if (!preuve.trim()) {
      toast({ title: "Preuve manquante", description: "Ajoutez une preuve de complétion.", variant: "destructive" });
      return;
    }
    await persist({ statut: "done" });
    const nextStep = allSteps.find((s) => s.ordre === step.ordre + 1);
    if (nextStep) {
      await base44.entities.Step.update(nextStep.id, { statut: "active" });
    }
    toast({ title: "Étape validée ✓", description: nextStep ? `Prochaine étape : ${nextStep.nom}` : "Toutes les étapes sont terminées !" });
    navigate("/roadmap");
  };

  const handleBlock = async () => {
    if (!blocage.trim()) {
      toast({ title: "Raison requise", description: "Décrivez la raison du blocage.", variant: "destructive" });
      return;
    }
    await persist({ statut: "blocked" });
    toast({ title: "Étape marquée bloquée", description: "L'assistant peut vous aider à débloquer." });
  };

  const handleUnblock = async () => {
    setBlocage("");
    await persist({ statut: "active", raison_blocage: "" });
    toast({ title: "Étape réactivée" });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!step) {
    return <p className="text-muted-foreground text-sm">Aucune étape trouvée.</p>;
  }

  const isDone = step.statut === "done";
  const isBlocked = step.statut === "blocked";
  const checklistComplete = step.checklist && step.checklist.length > 0 && step.checklist.every((_, i) => checklistDone.includes(i));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-primary">ÉTAPE {step.ordre}/11</span>
            <StatusBadge status={step.statut} />
          </div>
          <h1 className="text-2xl font-bold font-heading tracking-tight">{step.nom}</h1>
        </div>
      </div>

      {/* Done banner */}
      {isDone && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Étape terminée</p>
            <p className="text-xs text-emerald-700">{step.preuve_completion}</p>
          </div>
        </div>
      )}

      {/* Blocked banner */}
      {isBlocked && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm font-semibold text-red-800">Étape bloquée</p>
          </div>
          <p className="text-sm text-red-700 pl-8">{step.raison_blocage}</p>
          <div className="pl-8">
            <Button size="sm" variant="outline" onClick={handleUnblock} disabled={saving} className="border-red-200 text-red-700 hover:bg-red-50">
              Réactiver l'étape
            </Button>
          </div>
        </div>
      )}

      {/* Info cards */}
      <div className="grid gap-3 md:grid-cols-3">
        <InfoCard icon={Target} title="Objectif" content={step.objectif} />
        <InfoCard icon={Lightbulb} title="Importance" content={step.importance} />
        <InfoCard icon={FileText} title="Livrable" content={step.livrable} />
      </div>

      {/* Best agent for this step */}
      {(() => {
        const agent = getDomainForStep(step.ordre);
        if (!agent) return null;
        const accent = getDomainAccent(agent);
        return (
          <div className={`rounded-2xl border p-4 flex items-center gap-3 ${accent.bg} ${accent.border}`}>
            <AgentIcon name={agent.icon} className={`w-5 h-5 ${accent.text}`} />
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Domaine spécialisé pour cette étape</p>
              <p className={`text-sm font-semibold ${accent.text}`}>{agent.name} — {agent.role}</p>
            </div>
          </div>
        );
      })()}

      {/* Checklist — main focus */}
      <div className="bg-card rounded-2xl border-2 border-primary/20 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold font-heading">Checklist</h3>
          <span className="text-xs font-medium text-muted-foreground">
            {checklistDone.length}/{step.checklist?.length || 0}
          </span>
        </div>
        <div className="space-y-2.5">
          {step.checklist && step.checklist.map((item, i) => (
            <label key={i} className="flex items-start gap-3 cursor-pointer group p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
              <Checkbox
                checked={checklistDone.includes(i)}
                onCheckedChange={() => toggleChecklist(i)}
                className="mt-0.5"
              />
              <span className={`text-sm ${checklistDone.includes(i) ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {item}
              </span>
            </label>
          ))}
        </div>
        {checklistComplete && !isDone && (
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 pt-1">
            <Check className="w-3.5 h-3.5" /> Checklist complète — ajoutez votre preuve puis validez.
          </div>
        )}
      </div>

      {/* Notes / Proof / Blockage — visually distinct */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Notes — neutral */}
        <div className="bg-card rounded-2xl border p-4 space-y-2">
          <div className="flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-muted-foreground" />
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notes</h4>
          </div>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Vos notes…" rows={4} className="border-0 bg-muted/30 resize-none" />
        </div>

        {/* Proof — green accent */}
        <div className="bg-emerald-50/50 rounded-2xl border border-emerald-200 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Preuve de complétion</h4>
          </div>
          <Textarea value={preuve} onChange={(e) => setPreuve(e.target.value)} placeholder="URL, description, screenshot…" rows={4} className="border-emerald-200 bg-white resize-none" />
        </div>

        {/* Blockage — red accent */}
        <div className="bg-red-50/50 rounded-2xl border border-red-200 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <h4 className="text-xs font-semibold text-red-700 uppercase tracking-wide">Raison de blocage</h4>
          </div>
          <Textarea value={blocage} onChange={(e) => setBlocage(e.target.value)} placeholder="Ce qui vous bloque…" rows={4} className="border-red-200 bg-white resize-none" />
        </div>
      </div>

      {/* Actions */}
      {!isDone && (
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => persist()} variant="outline" disabled={saving} className="gap-1.5">
            <Save className="w-4 h-4" /> Sauvegarder
          </Button>
          <Button onClick={handleValidate} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700" disabled={saving}>
            <Check className="w-4 h-4" /> Valider l'étape
          </Button>
          {!isBlocked && (
            <Button onClick={handleBlock} variant="destructive" className="gap-1.5" disabled={saving}>
              <AlertTriangle className="w-4 h-4" /> Marquer bloqué
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function InfoCard({ icon: Icon, title, content }) {
  return (
    <div className="bg-card rounded-xl border p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</h4>
      </div>
      <p className="text-sm">{content}</p>
    </div>
  );
}