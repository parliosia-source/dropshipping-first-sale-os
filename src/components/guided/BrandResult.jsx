import React from "react";

export default function BrandResult({ result }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm text-muted-foreground mb-2">3 propositions de noms</div>
        <div className="flex gap-2">
          {result.noms_marque?.map((nom, i) => (
            <div key={i} className="flex-1 bg-purple-50 p-3 rounded-lg text-center">
              <div className="font-semibold">{nom.nom}</div>
              <div className="text-xs text-muted-foreground mt-1">{nom.raison}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="text-sm"><span className="text-muted-foreground">Valeurs:</span> {result.valeurs}</div>
      <div className="text-sm"><span className="text-muted-foreground">Ton:</span> {result.ton_de_voix}</div>
      <div className="bg-primary/5 p-3 rounded-lg text-sm">
        <span className="font-semibold">Recommandé:</span> {result.recommandation_nom}
      </div>
    </div>
  );
}