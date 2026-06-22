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

    const offer = await base44.integrations.Core.InvokeLLM({
      prompt: `Tu es un expert en copywriting et positionnement de marque pour le dropshipping.

CONTEXTE PROJET :
- Produit : ${project.produit}
- Niche : ${project.niche}
- Avatar client : ${project.avatar}

MISSION : Crée une offre irrésistible et un positioning statement.

1. PRODUIT PRINCIPAL — 3 bullet points bénéfice-orientés
2. BONUS (2-3) — nom + valeur perçue pour chaque bonus
3. GARANTIE — type + formulation rassurante
4. URGENCE — mécanisme + formulation
5. PRIX — prix barré, prix final, économie

POSITIONING STATEMENT — format: "Pour [avatar], qui [problème], [produit] est [catégorie] qui [bénéfice]. Contrairement à [alternatives], nous [différenciation]."`,
      model: 'claude_sonnet_4_6',
      response_json_schema: {
        type: "object",
        properties: {
          produit_principal: { type: "object", properties: { description_benefices: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 } } },
          bonus: { type: "array", items: { type: "object", properties: { nom: { type: "string" }, valeur_percue: { type: "string" } } }, minItems: 2, maxItems: 3 },
          garantie: { type: "object", properties: { type: { type: "string" }, formulation: { type: "string" } } },
          urgence: { type: "object", properties: { mecanisme: { type: "string" }, formulation: { type: "string" } } },
          prix: { type: "object", properties: { prix_barre: { type: "number" }, prix_final: { type: "number" }, economie: { type: "number" } } },
          positioning_statement: { type: "string" }
        },
        required: ["produit_principal", "bonus", "garantie", "urgence", "prix", "positioning_statement"]
      }
    });

    const tasks = [
      { step_id, nom: "Valider les bonus de l'offre", description: `Vérifier pertinence : ${offer.bonus.map(b => b.nom).join(', ')}`, agent_source: "buildOfferAndPositioning", priority: "high", statut: "pending" },
      { step_id, nom: "Tester le positioning statement", description: "Faire valider par 3-5 personnes de l'avatar cible", agent_source: "buildOfferAndPositioning", priority: "medium", statut: "pending" },
      { step_id, nom: "Finaliser la tarification", description: `Valider prix ${offer.prix.prix_final}€ (vs ${offer.prix.prix_barre}€ barré)`, agent_source: "buildOfferAndPositioning", priority: "medium", statut: "pending" }
    ];
    await base44.entities.Task.bulkCreate(tasks);

    await base44.entities.Project.update(project_id, { positioning_statement: offer.positioning_statement });

    await base44.entities.AgentRecommendation.create({
      step_id, agent_name: "buildOfferAndPositioning",
      title: "Offre irrésistible créée",
      content: `**Positioning** : ${offer.positioning_statement}\n\n**Prix** : ${offer.prix.prix_final}€ (économie ${offer.prix.economie}€)\n**Garantie** : ${offer.garantie.formulation}\n**Urgence** : ${offer.urgence.formulation}`,
      category: "action", priority: "high", status: "pending"
    });

    return Response.json({ success: true, offer, tasks_created: tasks.length, project_updated: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});