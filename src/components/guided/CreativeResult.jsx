import React from "react";

export default function CreativeResult({ result }) {
  return (
    <div className="space-y-3">
      {result.angles?.map((a, i) => (
        <div key={i} className="border rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-sm">{a.nom}</span>
            <span className="text-xs bg-muted px-2 py-0.5 rounded">{a.format}</span>
          </div>
          <div className="text-xs text-muted-foreground mb-1">Angle: {a.angle}</div>
          <div className="text-sm font-medium mb-1">Hook: "{a.hook}"</div>
          <p className="text-xs whitespace-pre-wrap text-muted-foreground">{a.script}</p>
        </div>
      ))}
    </div>
  );
}