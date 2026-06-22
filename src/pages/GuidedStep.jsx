import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { STEP_DOMAIN_MAP } from "@/lib/agents";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import AnalysisResult from "@/components/guided/AnalysisResult";
import AssistantChat from "@/components/guided/AssistantChat";
import useProject from "@/hooks/useProject";

const resultKeyMap = {
  analyzeNicheAndProduct: 'analysis',
  buildOfferAndPositioning: 'offer',
  createBrandIdentity: 'brand',
  designCreativeStrategy: 'strategy',
  optimizeProductPage: 'page',
  setupMetaCampaign: 'campaignData',
  setupTracking: 'tracking',
  analyzeKPIs: 'kpiAnalysis'
};

const priorityConfig = {
  high: { label: "Haute", className: "bg-red-50 text-red-700" },
  medium: { label: "Moyenne", className: "bg-amber-50 text-amber-700" },
  low: { label: "Basse", className: "bg-blue-50 text-blue-700" },
};

export default function GuidedStep() {
  const { ordre } = useParams();
  const navigate = useNavigate();
  const { project, loading: projectLoading } = useProject();
  const [step, setStep] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const loadStep = async () => {
      setAnalysisResult(null);
      setTasks([]);
      setRecommendations([]);
      const data = await base44.entities.Step.filter({ ordre: parseInt(ordre) });
      setStep(data[0] || null);
    };
    loadStep();
  }, [ordre]);

  const functionName = step ? STEP_DOMAIN_MAP[step.ordre] : null;

  const handleLaunchAnalysis = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke(functionName, {
        project_id: project.id,
        step_id: step.id
      });
      const resultKey = resultKeyMap[functionName];
      setAnalysisResult(response.data[resultKey]);
      const newTasks = await base44.entities.Task.filter({ step_id: step.id });
      const newRecos = await base44.entities.AgentRecommendation.filter({ step_id: step.id });
      setTasks(newTasks);
      setRecommendations(newRecos);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    await base44.entities.Step.update(step.id, { statut: 'done' });
    const nextOrdre = step.ordre + 1;
    if (nextOrdre <= 11) {
      const nextSteps = await base44.entities.Step.filter({ ordre: nextOrdre });
      if (nextSteps[0]) {
        await base44.entities.Step.update(nextSteps[0].id, { statut: 'active' });
      }
      navigate(`/etape/${nextOrdre}`);
    } else {
      navigate('/dashboard');
    }
  };

  if (projectLoading || !step) return <LoadingSpinner />;

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">Configurez votre projet d'abord.</p>
        <button onClick={() => navigate('/project')} className="text-primary font-medium">Configurer le projet →</button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-4 lg:h-[calc(100vh-4rem)]">
      <div className="overflow-y-auto pr-1">
        <div className="mb-6">
          <div className="text-sm text-muted-foreground">Étape {step.ordre}/11</div>
          <h1 className="text-3xl font-bold font-heading">{step.nom}</h1>
          <p className="text-muted-foreground mt-2">{step.objectif}</p>
        </div>

        <div className="bg-muted/50 p-4 rounded-xl mb-6">
          <h3 className="font-semibold mb-2 text-sm">📝 Projet snapshot</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">Produit:</span> {project.produit || "—"}</div>
            <div><span className="text-muted-foreground">Niche:</span> {project.niche || "—"}</div>
            <div><span className="text-muted-foreground">Avatar:</span> {project.avatar || "—"}</div>
            <div><span className="text-muted-foreground">Canal:</span> {project.canal || "—"}</div>
          </div>
        </div>

        {!analysisResult && (
          <button
            onClick={handleLaunchAnalysis}
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl disabled:opacity-50 transition-colors"
          >
            {loading ? '🤖 Analyse en cours...' : "🚀 Lancer l'analyse"}
          </button>
        )}

        {analysisResult && (
          <div className="mt-6 space-y-4">
            <div className="bg-card border rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">✅ Analyse complète</h3>
              <AnalysisResult result={analysisResult} functionName={functionName} />
            </div>

            {tasks.length > 0 && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <h4 className="font-semibold mb-2 text-sm">📋 {tasks.length} tâches créées</h4>
                <ul className="space-y-2">
                  {tasks.map(task => (
                    <li key={task.id} className="flex items-start gap-2">
                      <span className={`px-2 py-0.5 text-xs rounded ${priorityConfig[task.priority]?.className || priorityConfig.medium.className}`}>
                        {priorityConfig[task.priority]?.label || "Moyenne"}
                      </span>
                      <span className="text-sm">{task.nom}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {recommendations.map(reco => (
              <div key={reco.id} className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h4 className="font-semibold mb-2 text-sm">💡 {reco.title}</h4>
                <p className="text-sm whitespace-pre-wrap text-muted-foreground">{reco.content}</p>
              </div>
            ))}

            <div className="flex gap-4">
              <button
                onClick={handleValidate}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors"
              >
                ✅ Valider et continuer
              </button>
              <button
                onClick={() => { setAnalysisResult(null); setTasks([]); setRecommendations([]); }}
                className="px-6 py-3 bg-muted hover:bg-muted/70 text-muted-foreground font-semibold rounded-xl transition-colors"
              >
                🔄 Relancer
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="lg:h-full">
        <AssistantChat step={step} project={project} />
      </div>
    </div>
  );
}