import React from "react";

export default function TrackingResult({ result }) {
  return (
    <div className="space-y-3">
      <div className="border rounded-lg p-3">
        <div className="font-semibold text-sm mb-1">Pixel Meta + CAPI</div>
        <p className="text-xs text-muted-foreground">{result.pixel_meta?.installation}</p>
        <div className="text-xs mt-1">Événements: {result.pixel_meta?.evenements?.join(', ')}</div>
      </div>
      <div className="border rounded-lg p-3">
        <div className="font-semibold text-sm mb-1">Pixel TikTok</div>
        <p className="text-xs text-muted-foreground">{result.pixel_tiktok?.installation}</p>
      </div>
      <div className="border rounded-lg p-3">
        <div className="font-semibold text-sm mb-1">Google Analytics 4</div>
        <p className="text-xs text-muted-foreground">{result.ga4?.installation}</p>
      </div>
      <div className="border rounded-lg p-3">
        <div className="font-semibold text-sm mb-1">Dashboard KPI</div>
        <div className="text-xs">Métriques: {result.dashboard?.metriques?.join(', ')}</div>
      </div>
    </div>
  );
}