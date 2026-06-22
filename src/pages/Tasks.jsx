import React, { useState } from "react";
import { Check, Circle } from "lucide-react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import useTasks from "@/hooks/useTasks";
import useSteps from "@/hooks/useSteps";

const priorityConfig = {
  high: { label: "Haute", className: "bg-red-50 text-red-700 border-red-200" },
  medium: { label: "Moyenne", className: "bg-amber-50 text-amber-700 border-amber-200" },
  low: { label: "Basse", className: "bg-blue-50 text-blue-700 border-blue-200" },
};

const columns = [
  { key: "pending", label: "À faire" },
  { key: "in_progress", label: "En cours" },
  { key: "done", label: "Terminé" },
];

export default function Tasks() {
  const [selectedStep, setSelectedStep] = useState("");
  const { steps, loading: stepsLoading } = useSteps();
  const { tasks, loading: tasksLoading, markTaskDone } = useTasks(selectedStep || undefined);

  if (stepsLoading || tasksLoading) return <LoadingSpinner />;

  const filtered = selectedStep ? tasks.filter((t) => t.step_id === selectedStep) : tasks;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading tracking-tight">Tâches</h1>
          <p className="text-sm text-muted-foreground mt-1">Tâches décomposées par les fonctions backend</p>
        </div>
        <select
          value={selectedStep}
          onChange={(e) => setSelectedStep(e.target.value)}
          className="h-9 px-3 text-sm border rounded-lg bg-card"
        >
          <option value="">Toutes les étapes</option>
          {steps.map((s) => (
            <option key={s.id} value={s.id}>{s.ordre}. {s.nom}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {columns.map((col) => {
          const colTasks = filtered.filter((t) => t.statut === col.key);
          return (
            <div key={col.key} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold font-heading">{col.label}</h3>
                <span className="text-xs text-muted-foreground">{colTasks.length}</span>
              </div>
              <div className="space-y-2 min-h-[100px]">
                {colTasks.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-4 text-center">
                    <Circle className="w-5 h-5 text-muted-foreground/30 mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Vide</p>
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div key={task.id} className="bg-card rounded-xl border p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{task.nom}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${priorityConfig[task.priority]?.className || priorityConfig.medium.className}`}>
                          {priorityConfig[task.priority]?.label || "Moyenne"}
                        </span>
                      </div>
                      {task.description && <p className="text-xs text-muted-foreground">{task.description}</p>}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-muted-foreground">{task.agent_source}</span>
                        {col.key !== "done" && (
                          <button
                            onClick={() => markTaskDone(task.id)}
                            className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-medium"
                          >
                            <Check className="w-3 h-3" /> Terminer
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}