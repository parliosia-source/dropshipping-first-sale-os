import React from "react";

export default function NicheResult({ result }) {
  const recoColor = result.recommandation === 'Valider' ? 'bg-emerald-100 text-emerald-700' :
    result.recommandation === 'Ajuster' ? 'bg-amber-100 text-amber-700' :
    'bg-red-100 text-red-700';

  return (
    <div>
      <div className="text-2xl font-bold mb-2">Score : {result.score_global}/10</div>
      <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${recoColor}`}>
        {result.recommandation}
      </div>
      <p className="text-sm text-muted-foreground mb-4">{result.justification}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="text-xs text-muted-foreground">Volume marché</div>
          <div className="font-semibold">{result.volume_marche?.verdict}</div>
        </div>
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="text-xs text-muted-foreground">Concurrence</div>
          <div className="font-semibold">{result.concurrence?.verdict}</div>
        </div>
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="text-xs text-muted-foreground">Différenciation</div>
          <div className="font-semibold">{result.differenciation?.verdict}</div>
        </div>
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="text-xs text-muted-foreground">Marges</div>
          <div className="font-semibold">{result.marges?.verdict}</div>
        </div>
      </div>
    </div>
  );
}