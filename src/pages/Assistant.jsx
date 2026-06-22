import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Loader2, Zap, ArrowRight, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import useSteps from "@/hooks/useSteps";
import useProject from "@/hooks/useProject";
import StatusBadge from "@/components/shared/StatusBadge";
import { getSpecializedAgents, getAgentForStep, accentClasses } from "@/lib/agents";
import AgentIcon from "@/components/shared/AgentIcon";

const quickButtons = [
  { label: "C'est fait", value: "C'est fait" },
  { label: "Je suis bloqué", value: "Je suis bloqué" },
  { label: "Prochaine étape", value: "Prochaine étape" },
];

const suggestions = [
  "Comment valider cette étape ?",
  "Donne-moi un plan d'action concret",
  "Quels outils me conseilles-tu ?",
  "Vérifie ma checklist",
];

export default function Assistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const messagesEndRef = useRef(null);
  const { activeStep, nextStep, steps, refetch: refetchSteps } = useSteps();
  const { project } = useProject();

  useEffect(() => {
    const load = async () => {
      const data = await base44.entities.Message.list("created_date", 200);
      setMessages(data);
      setLoadingMessages(false);
    };
    load();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const buildSystemContext = () => {
    let context = `Tu es le Coach Dropshipping Principal du système First Sale OS. Tu guides un entrepreneur solo étape par étape vers sa première vente. Tu es direct, actionnable et bienveillant. Réponds toujours en français.\n\n`;

    if (activeStep) {
      context += `ÉTAPE ACTIVE: ${activeStep.ordre}. ${activeStep.nom}\n`;
      context += `Objectif: ${activeStep.objectif}\n`;
      context += `Statut: ${activeStep.statut}\n`;
      if (activeStep.checklist) context += `Checklist: ${activeStep.checklist.join(", ")}\n`;
      if (activeStep.raison_blocage) context += `Blocage: ${activeStep.raison_blocage}\n`;

      const specializedAgent = getAgentForStep(activeStep.ordre);
      if (specializedAgent) {
        context += `\nRÔLE À ADOPTER: ${specializedAgent.name} — ${specializedAgent.role}\n`;
        context += `Adopte explicitement ce rôle et sa logique. Mentionne-le dans la section Contexte lu.\n`;
      }
    }

    if (project) {
      context += `\nPROJET:\n`;
      context += `Produit: ${project.produit || "non défini"} | Niche: ${project.niche || "non définie"} | Plateforme: ${project.plateforme || "non définie"} | Canal: ${project.canal || "non défini"}\n`;
      if (project.avatar) context += `Avatar client: ${project.avatar}\n`;
      if (project.offre) context += `Offre: ${project.offre}\n`;
    }

    if (nextStep) {
      context += `\nPROCHAINE ÉTAPE: ${nextStep.ordre}. ${nextStep.nom} — ${nextStep.objectif}\n`;
    }

    context += `\nFORMAT DE RÉPONSE OBLIGATOIRE — 4 sections avec titres markdown:\n`;
    context += `**Contexte lu** — Rappelle en 1-2 phrases les données projet et étape que tu as lues, et le rôle adopté.\n`;
    context += `**Diagnostic** — Analyse la situation par rapport à l'étape active. Identifie le problème ou l'opportunité principal.\n`;
    context += `**Recommandation** — 2-3 conseils concrets et spécifiques utilisant les données réelles du projet (produit, avatar, canal).\n`;
    context += `**Prochaine action** — Une seule action concrète et immédiate. Sois précis : quoi faire, comment, et avec quel outil.\n`;
    context += `\nRÈGLES ANTI-GÉNÉRIQUE: Pas de conseils génériques. Réfère-toi aux données réelles (produit, niche, avatar, canal). Ne dis jamais "cela dépend" sans donner un point de départ. Ne répète pas le même conseil dans plusieurs sections.\n`;
    return context;
  };

  const sendMessage = async (text) => {
    if (!text.trim() || sending) return;
    setSending(true);
    setInput("");

    const userMsg = await base44.entities.Message.create({
      contenu: text,
      role: "user",
      step_id: activeStep?.id || null,
      timestamp: new Date().toISOString(),
    });
    setMessages((prev) => [...prev, userMsg]);

    let prompt = buildSystemContext();
    prompt += `\nHistorique récent:\n`;
    const recent = messages.slice(-6);
    for (const m of recent) {
      prompt += `${m.role === "user" ? "Utilisateur" : "Coach"}: ${m.contenu}\n`;
    }
    prompt += `Utilisateur: ${text}\n\nRéponds obligatoirement avec les 4 sections: Contexte lu, Diagnostic, Recommandation, Prochaine action.`;

    if (text === "C'est fait") {
      prompt += `\n\nL'utilisateur dit avoir terminé. Vérifie la checklist et la preuve de complétion. S'il manque quelque chose, guide-le précisément. Sinon, félicite-le et indique comment valider dans la page Étape.`;
    } else if (text === "Je suis bloqué") {
      prompt += `\n\nL'utilisateur est bloqué. Aide-le à identifier la cause, propose 2-3 solutions concrètes. Suggère de documenter la raison dans la page Étape si le blocage persiste.`;
    } else if (text === "Prochaine étape") {
      prompt += `\n\nDécris brièvement la prochaine étape, son objectif et les 2 premiers pas concrets à accomplir.`;
    }

    const response = await base44.integrations.Core.InvokeLLM({ prompt });

    const assistantMsg = await base44.entities.Message.create({
      contenu: response,
      role: "assistant",
      step_id: activeStep?.id || null,
      timestamp: new Date().toISOString(),
    });
    setMessages((prev) => [...prev, assistantMsg]);
    setSending(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Context header */}
      <div className="bg-card rounded-2xl border p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-primary" />
          <h1 className="text-lg font-bold font-heading tracking-tight">Coach</h1>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Étape active</p>
            <p className="font-semibold truncate">{activeStep ? `${activeStep.ordre}. ${activeStep.nom}` : "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Statut</p>
            {activeStep ? <StatusBadge status={activeStep.statut} /> : <span className="text-muted-foreground">—</span>}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Prochaine étape</p>
            <p className="font-semibold truncate">{nextStep ? `${nextStep.ordre}. ${nextStep.nom}` : "—"}</p>
          </div>
        </div>
        {/* Specialized agents strip */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3 mt-3 border-t">
          <span className="text-xs text-muted-foreground flex-shrink-0 font-medium">Rôles spécialisés :</span>
          {getSpecializedAgents().map((agent) => {
            const accent = accentClasses[agent.accent] || accentClasses.primary;
            return (
              <div key={agent.id} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border flex-shrink-0 ${accent.bg} ${accent.border}`}>
                <AgentIcon name={agent.icon} className={`w-3 h-3 ${accent.text}`} />
                <span className="text-xs font-medium">{agent.shortName}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-4 pr-1">
        {loadingMessages ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Prêt à démarrer ?</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Je suis votre coach dropshipping. Posez une question ou choisissez une suggestion.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  disabled={sending}
                  className="text-xs px-3 py-1.5 rounded-full border bg-card hover:bg-muted/50 hover:border-primary/30 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-card border rounded-bl-md"
              }`}>
                {msg.role === "assistant" ? (
                  <ReactMarkdown className="prose prose-sm max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2 [&>li]:mb-1">
                    {msg.contenu}
                  </ReactMarkdown>
                ) : (
                  <p>{msg.contenu}</p>
                )}
              </div>
            </div>
          ))
        )}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-card border rounded-2xl rounded-bl-md px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t pt-3 space-y-3">
        <div className="flex gap-2 flex-wrap">
          {quickButtons.map(({ label, value }) => (
            <Button
              key={value}
              variant="outline"
              size="sm"
              onClick={() => sendMessage(value)}
              disabled={sending}
              className="text-xs"
            >
              {label}
            </Button>
          ))}
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez une question…"
            className="flex-1 h-10 px-4 bg-card border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            disabled={sending}
          />
          <Button type="submit" size="icon" disabled={sending || !input.trim()} className="rounded-xl h-10 w-10">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}