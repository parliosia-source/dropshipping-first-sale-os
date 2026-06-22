import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Check, AlertTriangle, ArrowRight, FileText, Target, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import StatusBadge from "@/components/shared/StatusBadge";
import { useToast } from "@/components/ui/use-toast";

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

  const save = async (extraData = {}) => {
    setSaving(true);
    await base44.entities.Step.update(step.id, {
      notes,
      preuve_completion: preuve,
      raison_blocage: blocage,
      checklist_done: checklistDone,
      ...extraData,
    });
    setSaving(false);
  };

  const handleValidate = async () => {
    const allChecked = step.checklist && step.checklist.length > 0 && step.checklist.every((_, i) => checklistDone.includes(i));
    if (!allChecked) {
      toast({ title: "Checklist incomplète", description: "Cochez tous les éléments de la checklist.", variant: "destructive" });
      return;
    }
    if (!preuve.trim()) {
      toast({ title: "Preuve manquante", description: "Ajoutez une preuve de complétion.", variant: "destructive" });
      return;
    }
    await save({ statut: "done" });
    const nextStep = allSteps.find((s) => s.ordre === step.ordre + 1);
    if (nextStep) {
      await base44.entities.Step.update(nextStep.id, { statut: "active" });
    }
    toast({ title: "Étape validée ✓", description: nextStep ? `Étape suivante : ${nextStep.nom}` : "Toutes les étapes sont terminées !" });
    navigate("/roadmap");
  };

  const handleBlock = async () => {
    if (!blocage.trim()) {
      toast({ title: "Raison requise", description: "Décrivez la raison du blocage.", variant: "destructive" });
      return;
    }
    await save({ statut: "blocked" });
    toast({ title: "Étape marquée bloquée", description: "Rendez-vous dans l'assistant pour de l'aide." });
  };

  const handleSaveNotes = async () => {
    await save();
    toast({ title: "Sauvegardé" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!step) {
    return <p className="text-muted-foreground text-sm">Aucune étape trouvée.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-primary">ÉTAPE {step.ordre}/11</span>
            <StatusBadge status={step.statut} />
          </div>
          <h1 className="text-2xl font-bold font-heading tracking-tight">{step.nom}</h1>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard icon={Target} title="Objectif" content={step.objectif} />
        <InfoCard icon={Lightbulb} title="Pourquoi c'est important" content={step.importance} />
        <InfoCard icon={FileText} title="Livrable attendu" content={step.livrable} />
      </div>

      {step.checklist && step.checklist.length > 0 && (
        <div className="bg-card rounded-2xl border p-5 space-y-3">
          <h3 className="text-sm font-semibold font-heading">Checklist</h3>
          <div className="space-y-2">
            {step.checklist.map((item, i) => (
              <label key={i} className="flex items-center gap-3 cursor-pointer group">
                <Checkbox
                  checked={checklistDone.includes(i)}
                  onCheckedChange={() => toggleChecklist(i)}
                />
                <span className={`text-sm ${checklistDone.includes(i) ? "line-through text-muted-foreground" : ""}`}>
                  {item}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl border p-5 space-y-4">
        <h3 className="text-sm font-semibold font-heading">Notes</h3>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Vos notes pour cette étape…" rows={3} />
      </div>

      <div className="bg-card rounded-2xl border p-5 space-y-4">
        <h3 className="text-sm font-semibold font-heading">Preuve de complétion</h3>
        <Textarea value={preuve} onChange={(e) => setPreuve(e.target.value)} placeholder="URL, description, screenshot…" rows={3} />
      </div>

      <div className="bg-card rounded-2xl border p-5 space-y-4">
        <h3 className="text-sm font-semibold font-heading">Raison de blocage</h3>
        <Textarea value={blocage} onChange={(e) => setBlocage(e.target.value)} placeholder="Décrivez ce qui vous bloque…" rows={3} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleSaveNotes} variant="outline" disabled={saving}>
          Sauvegarder
        </Button>
        {step.statut !== "done" && (
          <>
            <Button onClick={handleValidate} className="gap-1.5" disabled={saving}>
              <Check className="w-4 h-4" /> Valider l'étape
            </Button>
            <Button onClick={handleBlock} variant="destructive" className="gap-1.5" disabled={saving}>
              <AlertTriangle className="w-4 h-4" /> Marquer bloqué
            </Button>
          </>
        )}
      </div>
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