import React from "react";

export default function KpiResult({ result }) {
  const decisionColor = result.decision === 'Scale' ? 'bg-emerald-100 text-emerald-700' :
    result.decision === 'Ajuster' ? 'bg-amber-100 text-amber-700' :
    'bg-red-100 text-red-700';

  return (
    <div className="space-y-4">
      <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${decisionColor}`}>
        Verdict: {result.decision}
      </div>
      <p className="text-sm text-muted-foreground">{result.justification}</p>
      {result.analyse?.length > 0 && (
        <div className="space-y-2">
          {result.analyse.map((a, i) => (
            <div key={i} className="bg-muted/50 p-2 rounded text-sm">
              <span className="font-medium">{a.kpi}</span>: {a.actuel || '—'} / {a.cible || '—'}
              <span className="text-xs text-muted-foreground ml-2">({a.statut})</span>
            </div>
          ))}
        </div>
      )}
      {result.insights?.length > 0 && (
        <div>
          <div className="text-sm font-semibold mb-1">Insights</div>
          {result.insights.map((ins, i) => <p key={i} className="text-sm text-muted-foreground">• {ins}</p>)}
        </div>
      )}
      {result.actions?.length > 0 && (
        <div>
          <div className="text-sm font-semibold mb-1">Actions prioritaires</div>
          {result.actions.map((a, i) => (
            <div key={i} className="text-sm">• {a.action} <span className="text-xs text-muted-foreground">({a.type})</span></div>
          ))}
        </div>
      )}
    </div>
  );
}