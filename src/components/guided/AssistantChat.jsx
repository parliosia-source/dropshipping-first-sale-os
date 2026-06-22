import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Send } from "lucide-react";

export default function AssistantChat({ step, project }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput("");
    setSending(true);
    try {
      const prompt = `Tu es l'Assistant Dropshipping. L'utilisateur est à l'étape ${step.ordre}: ${step.nom}. Projet: ${project?.produit}, niche: ${project?.niche}. Question: ${userMsg}`;
      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Désolé, une erreur est survenue." }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[600px] lg:max-h-none border rounded-xl overflow-hidden bg-card">
      <div className="p-4 border-b bg-muted/50">
        <h2 className="font-bold text-sm">💬 Assistant</h2>
        <p className="text-xs text-muted-foreground">Pose tes questions en temps réel</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
        {messages.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">Pose une question sur cette étape...</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === 'user' ? 'text-right' : ''}>
            <div className={`inline-block px-3 py-2 rounded-lg text-sm max-w-[85%] ${
              msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="text-center">
            <div className="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pose une question..."
            className="flex-1 px-3 py-2 text-sm border rounded-lg bg-background"
          />
          <button
            onClick={handleSend}
            disabled={sending}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}