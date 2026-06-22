import React from "react";

const statusConfig = {
  todo: { label: "À faire", className: "bg-muted text-muted-foreground" },
  active: { label: "En cours", className: "bg-primary/10 text-primary border border-primary/20" },
  done: { label: "Terminé", className: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  blocked: { label: "Bloqué", className: "bg-red-50 text-red-700 border border-red-200" },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.todo;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}