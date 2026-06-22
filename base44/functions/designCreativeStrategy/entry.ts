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

    // Find or create a draft campaign for this project
    let campaigns = await base44.entities.Campaign.filter({ project_id });
    let campaign = campaigns[0];
    if (!campaign) {
      campaign = await base44.entities.Campaign.create({
        project_id, nom: "Campagne créatives", platform: "meta", status: "draft"
      });
    }

    const strategy = await base44.integrations.Core.InvokeLLM({
      prompt: `Tu es un expert en stratégie créative publicitaire pour le dropshipping.

CONTEXTE PROJET :
- Produit : ${project.produit}
- Niche : ${project.niche}
- Avatar client : ${project.avatar}
- Offre : ${project.offre || "non définie"}
- Canal : ${project.canal || "Meta Ads"}

MISSION : Crée 3 angles créatifs UGC distincts.

Pour chaque angle :
- ANGLE : approche marketing (problème/solution, avant/après, démonstration, témoignage, etc.)
- HOOK : première phrase d'accroche (3 premières secondes)
- SCRIPT : script vidéo complet (30-60s) avec b-roll suggéré
- FORMAT : 9:16 (TikTok/Reels) ou 1:1 (Meta feed)

Les 3 angles doivent être VÉRITABLEMENT distincts, pas 3 variations du même.`,
      model: 'claude_sonnet_4_6',
      response_json_schema: {
        type: "object",
        properties: {
          angles: { type: "array", items: { type: "object", properties: {
            nom: { type: "string" },
            angle: { type: "string" },
            hook: { type: "string" },
            script: { type: "string" },
            format: { type: "string", enum: ["9:16", "1:1"] }
          } }, minItems: 3, maxItems: 3 }
        },
        required: ["angles"]
      }
    });

    // Create 3 Creative records
    const creatives = strategy.angles.map(a => ({
      campaign_id: campaign.id,
      nom: a.nom,
      type: "video_ugc",
      format: a.format,
      hook: a.hook,
      angle: a.angle,
      status: "draft"
    }));
    await base44.entities.Creative.bulkCreate(creatives);

    const tasks = [
      { step_id, nom: "Tourner le premier UGC", description: `Utiliser le script de l'angle "${strategy.angles[0].nom}"`, agent_source: "designCreativeStrategy", priority: "high", statut: "pending" },
      { step_id, nom: "Préparer 2 variations de hook", description: "Tester 2 hooks alternatifs sur le meilleur angle", agent_source: "designCreativeStrategy", priority: "medium", statut: "pending" },
      { step_id, nom: "Lancer 3 créatifs en test", description: "Budget 7€/jour par créatif pendant 3 jours", agent_source: "designCreativeStrategy", priority: "medium", statut: "pending" }
    ];
    await base44.entities.Task.bulkCreate(tasks);

    await base44.entities.AgentRecommendation.create({
      step_id, agent_name: "designCreativeStrategy",
      title: "3 angles créatifs UGC prêts",
      content: strategy.angles.map((a, i) => `**Angle ${i + 1}** : ${a.nom}\nHook: "${a.hook}"\nFormat: ${a.format}`).join('\n\n'),
      category: "action", priority: "high", status: "pending"
    });

    return Response.json({ success: true, strategy, creatives_created: creatives.length, tasks_created: tasks.length, campaign_id: campaign.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});