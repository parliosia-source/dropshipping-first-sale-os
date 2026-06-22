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

    const page = await base44.integrations.Core.InvokeLLM({
      prompt: `Tu es un expert en optimisation de page produit e-commerce (CRO + copywriting).

CONTEXTE PROJET :
- Produit : ${project.produit}
- Niche : ${project.niche}
- Avatar client : ${project.avatar}
- Offre : ${project.offre || "non définie"}
- Plateforme : ${project.plateforme || "Shopify"}

MISSION : Structure une page produit haute conversion en 7 sections.

1. HERO — headline + subheadline + visuel + CTA
2. PROBLÈME — douleur de l'avatar (3 points)
3. SOLUTION — présentation du produit (3 bénéfices clés)
4. PREUVE — témoignages, notes, certifications
5. OFFRE — bonus, garantie, urgence
6. FAQ — 5 objections courantes levées
7. CTA FINAL — rappel offre + bouton

Pour chaque section, donne le copywriting complet prêt à utiliser.`,
      model: 'claude_sonnet_4_6',
      response_json_schema: {
        type: "object",
        properties: {
          sections: { type: "array", items: { type: "object", properties: {
            nom: { type: "string" },
            objectif: { type: "string" },
            copy: { type: "string", description: "Copywriting complet de la section" }
          } }, minItems: 7, maxItems: 7 }
        },
        required: ["sections"]
      }
    });

    const tasks = page.sections.map(s => ({
      step_id,
      nom: `Rédiger section: ${s.nom}`,
      description: s.objectif,
      agent_source: "optimizeProductPage",
      priority: s.nom === "HERO" || s.nom === "CTA FINAL" ? "high" : "medium",
      statut: "pending"
    }));
    await base44.entities.Task.bulkCreate(tasks);

    await base44.entities.AgentRecommendation.create({
      step_id, agent_name: "optimizeProductPage",
      title: "Page produit structurée (7 sections)",
      content: page.sections.map(s => `**${s.nom}** : ${s.objectif}`).join('\n'),
      category: "action", priority: "high", status: "pending"
    });

    return Response.json({ success: true, page, tasks_created: tasks.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});