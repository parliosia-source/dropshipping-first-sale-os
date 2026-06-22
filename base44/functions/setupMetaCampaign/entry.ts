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

    const campaignData = await base44.integrations.Core.InvokeLLM({
      prompt: `Tu es un expert en Meta Ads (Facebook/Instagram) pour le dropshipping.

CONTEXTE PROJET :
- Produit : ${project.produit}
- Niche : ${project.niche}
- Avatar client : ${project.avatar}
- Offre : ${project.offre || "non définie"}
- Budget indicatif : 210€ sur 30 jours (7€/jour)

MISSION : Structure une campagne Meta Ads de lancement.

1. STRUCTURE CAMPAGNE — nom, objectif (Conversions/Trafic), budget quotidien
2. AUDIENCES (3) — 3 audiences distinctes (large, intérêt, lookalike ou retargeting)
3. KPI — CPA cible, ROAS cible, CTR minimum, CVR minimum
4. TRACKING — Pixel, événement de conversion, CAPI

Donne des valeurs concètes pour ce produit et cet avatar.`,
      model: 'claude_sonnet_4_6',
      response_json_schema: {
        type: "object",
        properties: {
          campagne: { type: "object", properties: { nom: { type: "string" }, objectif: { type: "string" }, budget_daily: { type: "number" }, budget_total: { type: "number" } } },
          audiences: { type: "array", items: { type: "object", properties: { nom: { type: "string" }, type: { type: "string" }, ciblage: { type: "string" } } }, minItems: 3, maxItems: 3 },
          kpi: { type: "object", properties: { cpa_cible: { type: "number" }, roas_cible: { type: "number" }, ctr_min: { type: "number" }, cvr_min: { type: "number" } } },
          tracking: { type: "object", properties: { pixel: { type: "string" }, event: { type: "string" }, capi: { type: "string" } } }
        },
        required: ["campagne", "audiences", "kpi", "tracking"]
      }
    });

    // Create Campaign record
    const campaign = await base44.entities.Campaign.create({
      project_id,
      nom: campaignData.campagne.nom,
      platform: "meta",
      budget_daily: campaignData.campagne.budget_daily,
      budget_total: campaignData.campagne.budget_total,
      status: "draft",
      objective: campaignData.campagne.objectif,
      target_audience: campaignData.audiences.map(a => `${a.nom}: ${a.ciblage}`).join('\n')
    });

    const tasks = [
      { step_id, nom: "Installer le Pixel Meta", description: "Ajouter le Pixel sur la plateforme e-commerce", agent_source: "setupMetaCampaign", priority: "high", statut: "pending" },
      { step_id, nom: "Créer les 3 audiences", description: campaignData.audiences.map(a => a.nom).join(', '), agent_source: "setupMetaCampaign", priority: "high", statut: "pending" },
      { step_id, nom: "Lancer la campagne en test", description: `Budget ${campaignData.campagne.budget_daily}€/jour, objectif ${campaignData.campagne.objectif}`, agent_source: "setupMetaCampaign", priority: "medium", statut: "pending" }
    ];
    await base44.entities.Task.bulkCreate(tasks);

    await base44.entities.AgentRecommendation.create({
      step_id, agent_name: "setupMetaCampaign",
      title: "Campagne Meta Ads structurée",
      content: `**Campagne** : ${campaignData.campagne.nom} (${campaignData.campagne.objectif})\n**Budget** : ${campaignData.campagne.budget_daily}€/jour\n**Audiences** : ${campaignData.audiences.map(a => a.nom).join(', ')}\n**KPI** : CPA ${campaignData.kpi.cpa_cible}€, ROAS ${campaignData.kpi.roas_cible}x`,
      category: "action", priority: "high", status: "pending"
    });

    return Response.json({ success: true, campaignData, campaign_id: campaign.id, tasks_created: tasks.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});