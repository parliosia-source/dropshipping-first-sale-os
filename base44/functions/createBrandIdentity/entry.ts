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

    const brand = await base44.integrations.Core.InvokeLLM({
      prompt: `Tu es un expert en branding pour marques e-commerce dropshipping.

CONTEXTE PROJET :
- Produit : ${project.produit}
- Niche : ${project.niche}
- Avatar client : ${project.avatar}
- Offre : ${project.offre || "non définie"}

MISSION : Définis l'identité de marque.

1. NOMS DE MARQUE — 3 propositions distinctes (court, mémorisable, disponible .com)
2. VALEURS DE MARQUE — 3-5 valeurs clés qui résonnent avec l'avatar
3. TON DE VOIX — description du ton (ex: "Premium accessible", "Amical et expert")

Pour chaque nom, explique pourquoi il fonctionne pour cette niche et cet avatar.`,
      model: 'claude_sonnet_4_6',
      response_json_schema: {
        type: "object",
        properties: {
          noms_marque: { type: "array", items: { type: "object", properties: { nom: { type: "string" }, raison: { type: "string" } } }, minItems: 3, maxItems: 3 },
          valeurs: { type: "string", description: "Valeurs séparées par virgules" },
          ton_de_voix: { type: "string" },
          recommandation_nom: { type: "string", description: "Le nom recommandé parmi les 3" }
        },
        required: ["noms_marque", "valeurs", "ton_de_voix", "recommandation_nom"]
      }
    });

    await base44.entities.Project.update(project_id, {
      brand_name: brand.recommandation_nom,
      brand_values: brand.valeurs,
      brand_tone: brand.ton_de_voix
    });

    const tasks = [
      { step_id, nom: "Vérifier disponibilité nom de domaine", description: `Tester .com pour : ${brand.noms_marque.map(n => n.nom).join(', ')}`, agent_source: "createBrandIdentity", priority: "high", statut: "pending" },
      { step_id, nom: "Valider le ton de voix", description: `Tester le ton "${brand.ton_de_voix}" sur 2-3 messages marketing`, agent_source: "createBrandIdentity", priority: "medium", statut: "pending" }
    ];
    await base44.entities.Task.bulkCreate(tasks);

    await base44.entities.AgentRecommendation.create({
      step_id, agent_name: "createBrandIdentity",
      title: `Identité de marque créée — ${brand.recommandation_nom}`,
      content: `**Nom recommandé** : ${brand.recommandation_nom}\n**Valeurs** : ${brand.valeurs}\n**Ton** : ${brand.ton_de_voix}\n\n**Alternatives** : ${brand.noms_marque.map(n => n.nom).join(', ')}`,
      category: "action", priority: "high", status: "pending"
    });

    return Response.json({ success: true, brand, tasks_created: tasks.length, project_updated: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});