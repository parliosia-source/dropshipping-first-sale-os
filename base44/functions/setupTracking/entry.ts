import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { project_id, step_id } = await req.json();
    const projects = await base44.entities.Project.filter({ id: project_id });
    const project = projects[0];
    if (!project) return Response.json({ error: 'Project not found' }, { status: 404 });

    const tracking = await base44.integrations.Core.InvokeLLM({
      prompt: `Tu es un expert en tracking et analytics pour e-commerce dropshipping.

CONTEXTE PROJET :
- Produit : ${project.produit}
- Plateforme : ${project.plateforme || "Shopify"}
- Canal : ${project.canal || "Meta Ads"}

MISSION : Configure le tracking complet.

1. PIXEL META — installation, événements standards (PageView, ViewContent, AddToCart, Purchase), CAPI
2. PIXEL TIKTOK — installation, événements standards
3. GOOGLE ANALYTICS 4 — installation, événements e-commerce, audiences
4. DASHBOARD KPI — métriques à suivre (CTR, CPC, CVR, CPA, ROAS, AOV), alertes seuils

Pour chaque étape, donne les instructions d'installation concrètes.`,
      model: 'claude_sonnet_4_6',
      response_json_schema: {
        type: "object",
        properties: {
          pixel_meta: { type: "object", properties: { installation: { type: "string" }, evenements: { type: "array", items: { type: "string" } }, capi: { type: "string" } } },
          pixel_tiktok: { type: "object", properties: { installation: { type: "string" }, evenements: { type: "array", items: { type: "string" } } } },
          ga4: { type: "object", properties: { installation: { type: "string" }, evenements: { type: "array", items: { type: "string" } } } },
          dashboard: { type: "object", properties: { metriques: { type: "array", items: { type: "string" } }, alertes: { type: "array", items: { type: "string" } } } }
        },
        required: ["pixel_meta", "pixel_tiktok", "ga4", "dashboard"]
      }
    });

    const tasks = [
      { step_id, nom: "Installer Pixel Meta + CAPI", description: tracking.pixel_meta.installation, agent_source: "setupTracking", priority: "high", statut: "pending" },
      { step_id, nom: "Installer Pixel TikTok", description: tracking.pixel_tiktok.installation, agent_source: "setupTracking", priority: "high", statut: "pending" },
      { step_id, nom: "Configurer Google Analytics 4", description: tracking.ga4.installation, agent_source: "setupTracking", priority: "medium", statut: "pending" },
      { step_id, nom: "Créer le dashboard KPI", description: `Suivre: ${tracking.dashboard.metriques.join(', ')}`, agent_source: "setupTracking", priority: "medium", statut: "pending" }
    ];
    await base44.entities.Task.bulkCreate(tasks);

    await base44.entities.AgentRecommendation.create({
      step_id, agent_name: "setupTracking",
      title: "Tracking configuré (Meta + TikTok + GA4)",
      content: `**Pixel Meta** : ${tracking.pixel_meta.evenements.length} événements\n**Pixel TikTok** : ${tracking.pixel_tiktok.evenements.length} événements\n**GA4** : ${tracking.ga4.evenements.length} événements\n**Dashboard** : ${tracking.dashboard.metriques.join(', ')}`,
      category: "action", priority: "high", status: "pending"
    });

    return Response.json({ success: true, tracking, tasks_created: tasks.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});