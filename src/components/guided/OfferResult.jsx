import React from "react";

export default function OfferResult({ result }) {
  return (
    <div className="space-y-3">
      <div>
        <div className="text-xs text-muted-foreground mb-1">Produit principal</div>
        <ul className="list-disc list-inside text-sm space-y-1">
          {result.produit_principal?.description_benefices?.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      </div>
      <div>
        <div className="text-xs text-muted-foreground mb-1">Bonus</div>
        {result.bonus?.map((b, i) => (
          <div key={i} className="text-sm">• {b.nom} — {b.valeur_percue}</div>
        ))}
      </div>
      <div className="text-sm"><span className="text-muted-foreground">Garantie:</span> {result.garantie?.formulation}</div>
      <div className="text-sm"><span className="text-muted-foreground">Urgence:</span> {result.urgence?.formulation}</div>
      <div className="text-sm">
        <span className="text-muted-foreground">Prix:</span>{' '}
        <span className="text-2xl font-bold text-emerald-600">{result.prix?.prix_final}€</span>
        <span className="text-muted-foreground line-through ml-2">{result.prix?.prix_barre}€</span>
      </div>
      <div className="bg-primary/5 p-4 rounded-lg">
        <div className="font-semibold mb-1 text-sm">Positioning Statement</div>
        <p className="italic text-sm">{result.positioning_statement}</p>
      </div>
    </div>
  );
}