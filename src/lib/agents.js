/**
 * Domain system configuration for First Sale OS.
 *
 * Architecture: 1 in-app orchestrator agent (assistant_principal) + 8 backend function domains.
 * Each step (1-11) maps to a domain via STEP_DOMAIN_MAP.
 *
 * To add/edit a domain: update DOMAINS + STEP_DOMAIN_MAP + functions/<name>.js
 * To change step-to-domain routing: update STEP_DOMAIN_MAP only
 */
export const DOMAINS = [
  { id: "analyzeNicheAndProduct", name: "Niche & Produit", shortName: "Niche", icon: "Target", accent: "blue" },
  { id: "buildOfferAndPositioning", name: "Offre & Positionnement", shortName: "Offre", icon: "FileText", accent: "amber" },
  { id: "createBrandIdentity", name: "Branding", shortName: "Marque", icon: "Sparkles", accent: "purple" },
  { id: "optimizeProductPage", name: "Page Produit", shortName: "Page", icon: "Layout", accent: "emerald" },
  { id: "designCreativeStrategy", name: "Créatives", shortName: "Créatif", icon: "Megaphone", accent: "rose" },
  { id: "setupMetaCampaign", name: "Meta Ads", shortName: "Ads", icon: "TrendingUp", accent: "blue" },
  { id: "setupTracking", name: "Tracking", shortName: "Tracking", icon: "Activity", accent: "emerald" },
  { id: "analyzeKPIs", name: "Analyse KPI", shortName: "KPI", icon: "BarChart2", accent: "rose" },
];

export const STEP_DOMAIN_MAP = {
  1: "analyzeNicheAndProduct",
  2: "analyzeNicheAndProduct",
  3: "analyzeNicheAndProduct",
  4: "buildOfferAndPositioning",
  5: "buildOfferAndPositioning",
  6: "createBrandIdentity",
  7: "optimizeProductPage",
  8: "designCreativeStrategy",
  9: "setupMetaCampaign",
  10: "setupTracking",
  11: "analyzeKPIs",
};

export const accentClasses = {
  primary: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
  blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
  purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
  rose: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200" },
};

export const getDomainForStep = (ordre) => DOMAINS.find((d) => d.id === STEP_DOMAIN_MAP[ordre]);
export const getDomainAccent = (domain) => accentClasses[domain?.accent] || accentClasses.primary;