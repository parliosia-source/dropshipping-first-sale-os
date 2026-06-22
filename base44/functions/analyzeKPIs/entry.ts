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

    const kpiAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Tu es un expert en analyse de métriques publicitaires e-commerce dropshipping.

CONTEXTE PROJET :
- Produit : ${project.produit}
- Niche : ${project.niche}
- KPI 1 : ${project.kpi1_nom || "non défini"} (cible: ${project.kpi1_cible || "?"}, actuel: ${project.kpi1_actuel || "?"})
- KPI 2 : ${project.kpi2_nom || "non défini"} (cible: ${project.kpi2_cible || "?"}, actuel: ${project.kpi2_actuel || "?"})
- KPI 3 : ${project.kpi3_nom || "non défini"} (cible: ${project.kpi3_cible || "?"}, actuel: ${project.kpi3_actuel || "?"})

MISSION : Analyse les KPI actuels et recommande des optimisations.

1. ANALYSE MÉTRIQUES — compare cible vs actuel pour chaque KPI. Identifie les goulots (créatif, page, offre, audience).
2. INSIGHTS — 2-3 insights clés sur la performance.
3. ACTIONS PRIORITAIRES — 3 optimisations concrètes par ordre d'impact (scale, ajuster, couper).
4. DÉCISION — verdict global: Scale / Ajuster / Pivoter.

Si les valeurs actuelles sont manquantes, donne un cadre d'analyse avec les seuils de référence (CTR > 1.5%, CVR > 2%, etc.).`,
      model: 'claude_sonnet_4_6',
      response_json_schema: {
        type: "object",
        properties: {
          analyse: { type: "array", items: { type: "object", properties: { kpi: { type: "string" }, cible: { type: "string" }, actuel: { type: "string" }, statut: { type: "string", enum: ["atteint", "proche", "loin"] }, goulot: { type: "string" } } } },
          insights: { type: "array", items: { type: "string" } },
          actions: { type: "array", items: { type: "object", properties: { action: { type: "string" }, priorite: { type: "string", enum: ["high", "medium", "low"] }, type: { type: "string", enum: ["scale", "ajuster", "couper"] } } }, minItems: 3, maxItems: 3 },
          decision: { type: "string", enum: ["Scale", "Ajuster", "Pivoter"] },
          justification: { type: "string" }
        },
        required: ["analyse", "insights", "actions", "decision", "justification"]
      }
    });

    const tasks = kpiAnalysis.actions.map(a => ({
      step_id,
      nom: a.action,
      description: `Type: ${a.type} — Priorité: ${a.priorite}`,
      agent_source: "analyzeKPIs",
      priority: a.priorite,
      statut: "pending"
    }));
    await base44.entities.Task.bulkCreate(tasks);

    await base44.entities.AgentRecommendation.create({
      step_id, agent_name: "analyzeKPIs",
      title: `Analyse KPI — Verdict: ${kpiAnalysis.decision}`,
      content: kpiAnalysis.justification,
      category: "insight", priority: "high", status: "pending"
    });

    await base44.entities.AgentRecommendation.create({
      step_id, agent_name: "analyzeKPIs",
      title: `${kpiAnalysis.actions.length} optimisations prioritaires`,
      content: kpiAnalysis.actions.map((a, i) => `${i + 1}. ${a.action} (${a.type})`).join('\n'),
      category: "optimization", priority: "high", status: "pending"
    });

    return Response.json({ success: true, kpiAnalysis, tasks_created: tasks.length, recommendations_created: 2 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});