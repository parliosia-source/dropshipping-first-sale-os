import React from "react";

export default function CampaignResult({ result }) {
  return (
    <div className="space-y-4">
      <div className="bg-muted/50 p-3 rounded-lg">
        <div className="font-semibold">{result.campagne?.nom}</div>
        <div className="text-sm text-muted-foreground">{result.campagne?.objectif} — {result.campagne?.budget_daily}€/jour</div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground mb-2">3 audiences</div>
        {result.audiences?.map((a, i) => (
          <div key={i} className="text-sm mb-1">• <span className="font-medium">{a.nom}</span>: {a.ciblage}</div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-muted/50 p-2 rounded">CPA cible: <span className="font-semibold">{result.kpi?.cpa_cible}€</span></div>
        <div className="bg-muted/50 p-2 rounded">ROAS cible: <span className="font-semibold">{result.kpi?.roas_cible}x</span></div>
      </div>
    </div>
  );
}