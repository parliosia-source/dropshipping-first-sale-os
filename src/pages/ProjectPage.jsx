import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Save, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import useProject from "@/hooks/useProject";

export default function ProjectPage() {
  const { project, loading, refetch } = useProject();
  const { toast } = useToast();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (project && !form) setForm({ ...project });
  }, [project, form]);

  if (loading || !form) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    const { id, created_date, updated_date, created_by_id, ...data } = form;
    await base44.entities.Project.update(project.id, data);
    await refetch();
    setSaving(false);
    toast({ title: "Projet sauvegardé" });
  };

  const fields = [
    { key: "produit", label: "Produit", type: "input" },
    { key: "niche", label: "Niche", type: "input" },
    { key: "offre", label: "Offre", type: "input" },
    { key: "avatar", label: "Avatar client", type: "textarea" },
    { key: "canal", label: "Canal d'acquisition", type: "input" },
    { key: "plateforme", label: "Plateforme", type: "input" },
    { key: "objectif_premiere_vente_date", label: "Date objectif 1ère vente", type: "date" },
  ];

  const kpis = [
    { nom: "kpi1_nom", cible: "kpi1_cible", actuel: "kpi1_actuel" },
    { nom: "kpi2_nom", cible: "kpi2_cible", actuel: "kpi2_actuel" },
    { nom: "kpi3_nom", cible: "kpi3_cible", actuel: "kpi3_actuel" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading tracking-tight">Projet</h1>
          <p className="text-sm text-muted-foreground mt-1">Configuration de votre projet dropshipping</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-1.5">
          <Save className="w-4 h-4" /> Sauvegarder
        </Button>
      </div>

      <div className="bg-card rounded-2xl border p-5 space-y-4">
        <h3 className="text-sm font-semibold font-heading">Informations du projet</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {fields.map(({ key, label, type }) => (
            <div key={key} className={type === "textarea" ? "md:col-span-2" : ""}>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
              {type === "textarea" ? (
                <Textarea value={form[key] || ""} onChange={(e) => update(key, e.target.value)} rows={3} />
              ) : (
                <Input type={type === "date" ? "date" : "text"} value={form[key] || ""} onChange={(e) => update(key, e.target.value)} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {kpis.map(({ nom, cible, actuel }, i) => (
          <div key={i} className="bg-card rounded-2xl border p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">KPI {i + 1}</span>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Nom</label>
              <Input value={form[nom] || ""} onChange={(e) => update(nom, e.target.value)} placeholder="Ex: Taux de conversion" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Cible</label>
              <Input value={form[cible] || ""} onChange={(e) => update(cible, e.target.value)} placeholder="Ex: 2.5%" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Actuel</label>
              <Input value={form[actuel] || ""} onChange={(e) => update(actuel, e.target.value)} placeholder="—" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}