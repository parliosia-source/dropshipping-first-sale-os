import React from "react";
import { Zap, Target, Package, FileText, Sparkles, TrendingUp, Layout, Megaphone, Activity, BarChart2 } from "lucide-react";

const iconMap = { Zap, Target, Package, FileText, Sparkles, TrendingUp, Layout, Megaphone, Activity, BarChart2 };

export default function AgentIcon({ name, className }) {
  const Icon = iconMap[name] || Zap;
  return <Icon className={className} />;
}