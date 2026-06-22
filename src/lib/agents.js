/**
 * Agent system configuration for First Sale OS.
 *
 * Architecture: 1 orchestrator (assistant_principal) + 5 specialized roles.
 * Each step (1-11) maps to a specialized agent via STEP_AGENT_MAP.
 *
 * To add/edit an agent: update AGENTS + STEP_AGENT_MAP + agents/<id>.json
 * To change step-to-agent routing: update STEP_AGENT_MAP only
 */
export const AGENTS = [
  {
    id: "assistant_principal",
    name: "Assistant Principal",
    shortName: "Principal",
    role: "Orchestrateur & Coach",
    description: "Guide l'utilisateur étape par étape jusqu'à la première vente. Coordonne les rôles spécialisés.",
    icon: "Zap",
    accent: "primary",
  },
  {
    id: "niche_coach",
    name: "Coach Niche",
    shortName: "Niche",
    role: "Sélection de niche",
    description: "Évalue les idées de niche : demande, différenciation, concurrence, viabilité.",
    icon: "Target",
    accent: "blue",
  },
  {
    id: "product_validator",
    name: "Validateur Produit",
    shortName: "Produit",
    role: "Validation & Sourcing",
    description: "Valide le potentiel produit : marge, fournisseur, livraison, valeur perçue.",
    icon: "Package",
    accent: "emerald",
  },
  {
    id: "offer_builder",
    name: "Builder Offre",
    shortName: "Offre",
    role: "Offre & Page produit",
    description: "Structure l'offre, écrit le positionnement, les bénéfices, la page produit.",
    icon: "FileText",
    accent: "amber",
  },
  {
    id: "creative_strategist",
    name: "Stratégiste Créatif",
    shortName: "Créatif",
    role: "Contenu & Angles pub",
    description: "Génère angles, hooks, concepts UGC, variations de messaging.",
    icon: "Sparkles",
    accent: "purple",
  },
  {
    id: "acquisition_analyst",
    name: "Analyste Acquisition",
    shortName: "Acquisition",
    role: "Analyse & Optimisation",
    description: "Interprète les métriques, identifie les goulots, recommande les actions.",
    icon: "TrendingUp",
    accent: "rose",
  },
];

export const STEP_AGENT_MAP = {
  1: "niche_coach",
  2: "product_validator",
  3: "product_validator",
  4: "offer_builder",
  5: "offer_builder",
  6: "product_validator",
  7: "offer_builder",
  8: "creative_strategist",
  9: "creative_strategist",
  10: "acquisition_analyst",
  11: "acquisition_analyst",
};

export const accentClasses = {
  primary: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
  blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
  purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
  rose: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200" },
};

export const getAgentForStep = (ordre) => AGENTS.find((a) => a.id === STEP_AGENT_MAP[ordre]);
export const getAgentAccent = (agent) => accentClasses[agent?.accent] || accentClasses.primary;
export const getSpecializedAgents = () => AGENTS.filter((a) => a.id !== "assistant_principal");