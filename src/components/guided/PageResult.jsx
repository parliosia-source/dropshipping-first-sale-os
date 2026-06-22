import React from "react";

export default function PageResult({ result }) {
  return (
    <div className="space-y-3">
      {result.sections?.map((s, i) => (
        <div key={i} className="border rounded-lg p-3">
          <div className="font-semibold text-sm">{i + 1}. {s.nom}</div>
          <div className="text-xs text-muted-foreground mb-1">{s.objectif}</div>
          <p className="text-sm whitespace-pre-wrap">{s.copy}</p>
        </div>
      ))}
    </div>
  );
}