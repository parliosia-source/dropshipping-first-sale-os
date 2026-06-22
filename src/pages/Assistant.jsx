import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import useSteps from "@/hooks/useSteps";
import useProject from "@/hooks/useProject";

const quickButtons = [
  { label: "C'est fait", value: "C'est fait" },
  { label: "Je suis bloqué", value: "Je suis bloqué" },
  { label: "Prochaine étape", value: "Prochaine étape" },
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
    let context = `Tu es un assistant expert en dropshipping et ecommerce. Tu guides l'utilisateur étape par étape vers sa première vente. Réponds toujours en français, de manière concise et actionnable.\n\n`;
    
    if (activeStep) {
      context += `ÉTAPE ACTIVE: ${activeStep.ordre}. ${activeStep.nom}\n`;
      context += `Objectif: ${activeStep.objectif}\n`;
      context += `Statut: ${activeStep.statut}\n`;
      if (activeStep.raison_blocage) context += `Blocage: ${activeStep.raison_blocage}\n`;
    }
    
    if (project) {
      context += `\nPROJET:\n`;
      context += `Produit: ${project.produit || "non défini"}\n`;
      context += `Niche: ${project.niche || "non définie"}\n`;
      context += `Offre: ${project.offre || "non définie"}\n`;
      context += `Avatar: ${project.avatar || "non défini"}\n`;
      context += `Canal: ${project.canal || "non défini"}\n`;
      context += `Plateforme: ${project.plateforme || "non définie"}\n`;
    }

    if (nextStep) {
      context += `\nPROCHAINE ÉTAPE: ${nextStep.ordre}. ${nextStep.nom} — ${nextStep.objectif}\n`;
    }

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
      prompt += `${m.role === "user" ? "Utilisateur" : "Assistant"}: ${m.contenu}\n`;
    }
    prompt += `Utilisateur: ${text}\n\nRéponds de manière concise et actionnable. Guide vers la prochaine action concrète.`;

    if (text === "C'est fait") {
      prompt += `\n\nL'utilisateur dit avoir terminé l'action. Vérifie s'il a bien complété la checklist et ajouté une preuve de complétion. S'il manque quelque chose, guide-le. Sinon, félicite-le et indique comment valider l'étape dans la page "Étape active".`;
    } else if (text === "Je suis bloqué") {
      prompt += `\n\nL'utilisateur est bloqué. Aide-le à identifier et formuler la raison du blocage. Propose des solutions concrètes et des ressources. Si le blocage persiste, suggère-lui de marquer l'étape comme bloquée dans la page "Étape active" avec la raison.`;
    } else if (text === "Prochaine étape") {
      prompt += `\n\nL'utilisateur veut un aperçu de la prochaine étape. Décris brièvement ce qui l'attend, son objectif et les premiers pas concrets à accomplir.`;
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
      <div className="mb-4">
        <h1 className="text-2xl font-bold font-heading tracking-tight">Assistant</h1>
        {activeStep && (
          <p className="text-sm text-muted-foreground mt-1">
            Étape en cours : {activeStep.ordre}. {activeStep.nom}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pb-4 pr-1">
        {loadingMessages ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-muted-foreground">Envoyez un message pour commencer.</p>
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
                  <ReactMarkdown className="prose prose-sm max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2">
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