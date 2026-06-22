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

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Tu es un expert en validation de niches dropshipping.

CONTEXTE PROJET :
- Produit : ${project.produit}
- Niche : ${project.niche}
- Canal : ${project.canal}
- Plateforme : ${project.plateforme}

MISSION : Évalue cette niche sur 4 axes.

1. VOLUME DE MARCHÉ — tendance 6 mois, recherches mensuelles, saisonnalité. Verdict: Fort/Moyen/Faible.
2. CONCURRENCE — nombre annonceurs, saturation, différenciation. Verdict: Abordable/Compétitive/Saturée.
3. DIFFÉRENCIATION — angle unique, 3 exemples concrets, barrières entrée. Verdict: Facile/Moyen/Difficile.
4. MARGES — prix vente estimé, coût produit+shipping, marge nette %. Verdict: Excellente(>50%)/Correcte(30-50%)/Faible(<30%).

SYNTHÈSE — Score /10, Recommandation: Valider/Ajuster/Pivoter, Justification 2-3 phrases.`,
      model: 'claude_sonnet_4_6',
      response_json_schema: {
        type: "object",
        properties: {
          volume_marche: { type: "object", properties: { trends: { type: "string" }, recherches_mensuelles: { type: "string" }, saisonnalite: { type: "string" }, verdict: { type: "string", enum: ["Fort", "Moyen", "Faible"] } } },
          concurrence: { type: "object", properties: { nb_annonceurs_estim: { type: "string" }, niveau_saturation: { type: "string" }, facilite_differenciation: { type: "string" }, verdict: { type: "string", enum: ["Abordable", "Compétitive", "Saturée"] } } },
          differenciation: { type: "object", properties: { angle_unique_possible: { type: "string" }, exemples_angles: { type: "array", items: { type: "string" } }, barrieres_entree: { type: "string" }, verdict: { type: "string", enum: ["Facile", "Moyen", "Difficile"] } } },
          marges: { type: "object", properties: { prix_vente_estim: { type: "number" }, cout_produit_shipping: { type: "number" }, marge_nette_pct: { type: "number" }, verdict: { type: "string", enum: ["Excellente", "Correcte", "Faible"] } } },
          score_global: { type: "number", minimum: 0, maximum: 10 },
          recommandation: { type: "string", enum: ["Valider", "Ajuster", "Pivoter"] },
          justification: { type: "string" }
        },
        required: ["volume_marche", "concurrence", "differenciation", "marges", "score_global", "recommandation", "justification"]
      }
    });

    const tasks = [
      { step_id, nom: "Vérifier Google Trends niche", description: "Analyser tendance sur 6 derniers mois + saisonnalité", agent_source: "analyzeNicheAndProduct", priority: "high", statut: "pending" },
      { step_id, nom: "Analyser Meta Ad Library concurrence", description: "Compter annonceurs actifs sur cette niche", agent_source: "analyzeNicheAndProduct", priority: "high", statut: "pending" },
      { step_id, nom: "Définir angle de différenciation", description: `Choisir 1 des 3 angles : ${analysis.differenciation.exemples_angles.join(', ')}`, agent_source: "analyzeNicheAndProduct", priority: "medium", statut: "pending" },
      { step_id, nom: "Calculer marge nette réelle", description: `Valider prix vente ${analysis.marges.prix_vente_estim}€ - coût ${analysis.marges.cout_produit_shipping}€`, agent_source: "analyzeNicheAndProduct", priority: "medium", statut: "pending" }
    ];
    await base44.entities.Task.bulkCreate(tasks);

    await base44.entities.AgentRecommendation.create({
      step_id, agent_name: "analyzeNicheAndProduct",
      title: `Niche "${project.niche}" : Score ${analysis.score_global}/10`,
      content: `**Recommandation : ${analysis.recommandation}**\n\n${analysis.justification}\n\n**Volume marché** : ${analysis.volume_marche.verdict}\n**Concurrence** : ${analysis.concurrence.verdict}\n**Différenciation** : ${analysis.differenciation.verdict}\n**Marges** : ${analysis.marges.verdict}`,
      category: analysis.recommandation === "Pivoter" ? "warning" : "insight",
      priority: analysis.recommandation === "Pivoter" ? "high" : "medium",
      status: "pending"
    });

    return Response.json({ success: true, analysis, tasks_created: tasks.length, recommendations_created: 1 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});