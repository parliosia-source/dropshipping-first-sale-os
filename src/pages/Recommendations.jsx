import React, { useState } from "react";
import { Check, X, Lightbulb, AlertTriangle, Wrench, TrendingUp } from "lucide-react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import useRecommendations from "@/hooks/useRecommendations";

const categoryConfig = {
  action: { label: "Action", icon: Wrench, className: "bg-blue-50 text-blue-700 border-blue-200" },
  insight: { label: "Insight", icon: Lightbulb, className: "bg-purple-50 text-purple-700 border-purple-200" },
  warning: { label: "Warning", icon: AlertTriangle, className: "bg-red-50 text-red-700 border-red-200" },
  optimization: { label: "Optimization", icon: TrendingUp, className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

const priorityColors = {
  high: "border-l-red-500",
  medium: "border-l-amber-500",
  low: "border-l-blue-500",
};

const categories = [
  { key: "", label: "Toutes" },
  { key: "action", label: "Actions" },
  { key: "insight", label: "Insights" },
  { key: "warning", label: "Warnings" },
  { key: "optimization", label: "Optimizations" },
];

export default function Recommendations() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const { recommendations, loading, markApplied, dismiss } = useRecommendations(
    selectedCategory ? { category: selectedCategory } : {}
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading tracking-tight">Recommandations</h1>
        <p className="text-sm text-muted-foreground mt-1">Issues des fonctions backend spécialisées</p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              selectedCategory === cat.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground hover:bg-muted/50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      {recommendations.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center">
          <Lightbulb className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Aucune recommandation en attente.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map((reco) => {
            const cat = categoryConfig[reco.category] || categoryConfig.insight;
            const CatIcon = cat.icon;
            return (
              <div key={reco.id} className={`bg-card rounded-2xl border border-l-4 p-4 space-y-3 ${priorityColors[reco.priority] || priorityColors.medium}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <CatIcon className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold">{reco.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{reco.agent_name}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${cat.className}`}>
                    {cat.label}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{reco.content}</p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => markApplied(reco.id)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1 font-medium"
                  >
                    <Check className="w-3 h-3" /> Appliquer
                  </button>
                  <button
                    onClick={() => dismiss(reco.id)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground border hover:bg-muted/70 flex items-center gap-1 font-medium"
                  >
                    <X className="w-3 h-3" /> Ignorer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}