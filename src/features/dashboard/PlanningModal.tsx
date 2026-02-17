"use client";

import { useState, useEffect, useRef } from "react";
import { X, CheckCircle, Loader2, Sparkles, ArrowRight, Lock, AlertCircle } from "lucide-react";

interface PlanningOption { id: string; label: string; }
interface PlanningQuestion { question: string; options: PlanningOption[]; }
interface PlanningMessage { role: "user" | "assistant"; content: string; timestamp: number; }
interface PlanningSpec { title: string; summary: string; deliverables: string[]; success_criteria: string[]; }
interface GeneratedAgent { name: string; role: string; avatar_emoji: string; }

interface PlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated?: (task: { id: string; title: string; description: string; spec?: PlanningSpec; agents?: GeneratedAgent[] }) => void;
}

export function PlanningModal({ isOpen, onClose, onTaskCreated }: PlanningModalProps) {
  const [step, setStep] = useState<"initial" | "planning" | "complete">("initial");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [currentQuestion, setCurrentQuestion] = useState<PlanningQuestion | null>(null);
  const [messages, setMessages] = useState<PlanningMessage[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [otherText, setOtherText] = useState("");
  const [spec, setSpec] = useState<PlanningSpec | null>(null);
  const [generatedAgents, setGeneratedAgents] = useState<GeneratedAgent[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setStep("initial");
      setTaskTitle("");
      setTaskDescription("");
      setCurrentQuestion(null);
      setMessages([]);
      setSpec(null);
      setGeneratedAgents([]);
      setError(null);
    }
  }, [isOpen]);

  const startPlanning = async () => {
    if (!taskTitle.trim()) { setError("Please enter a task title"); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/planning/start", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: taskTitle, description: taskDescription }),
      });
      const data = await res.json();
      if (res.ok && data.question) {
        setCurrentQuestion(data.question);
        setMessages(data.messages || []);
        setStep("planning");
      } else { setError(data.error || "Failed to start planning"); }
    } catch (err) {
      console.error("Planning error:", err);
      setError("Failed to connect to AI. Make sure OpenClaw Gateway is running.");
    } finally { setLoading(false); }
  };

  const submitAnswer = async () => {
    if (!selectedOption && !otherText) return;
    const answer = selectedOption === "other" || selectedOption?.toLowerCase() === "other" ? `Other: ${otherText}` : selectedOption;
    setSubmitting(true); setError(null);
    const userMessage: PlanningMessage = { role: "user", content: answer || "", timestamp: Date.now() };
    setMessages((prev) => [...prev, userMessage]);
    try {
      const res = await fetch("/api/planning/answer", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: taskTitle, description: taskDescription, messages: [...messages, userMessage], answer }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.complete) {
          setSpec(data.spec);
          setGeneratedAgents(data.agents || []);
          setStep("complete");
        } else {
          setCurrentQuestion(data.question);
          setMessages(data.messages || []);
        }
      } else { setError(data.error || "Failed to process answer"); }
    } catch (err) { console.error("Answer error:", err); setError("Failed to get response from AI"); }
    finally { setSubmitting(false); setSelectedOption(null); setOtherText(""); }
  };

  const createTask = () => {
    const taskId = crypto.randomUUID();
    onTaskCreated?.({ id: taskId, title: spec?.title || taskTitle, description: spec?.summary || taskDescription, spec: spec || undefined, agents: generatedAgents });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl border border-border bg-surface-1 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              {step === "initial" && "Plan New Task"}
              {step === "planning" && "AI Planning"}
              {step === "complete" && "Planning Complete"}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-surface-2">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4" />{error}
            </div>
          )}

          {step === "initial" && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Task Title</label>
                <input type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g., Research best coffee machines under $200"
                  className="w-full rounded-lg border border-border bg-surface-2 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Description (optional)</label>
                <textarea value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Any details about what you need..." rows={4}
                  className="w-full rounded-lg border border-border bg-surface-2 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none" />
              </div>
              <div className="rounded-lg bg-surface-2 p-4">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />How it works</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>1. Describe your task above</li><li>2. AI will ask clarifying questions</li>
                  <li>3. Answer by clicking options</li><li>4. Get a detailed plan + agents</li>
                </ul>
              </div>
            </div>
          )}

          {step === "planning" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
                <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                AI is asking questions to understand your needs...
              </div>

              <div className="max-h-60 space-y-3 overflow-y-auto rounded-lg border border-border bg-surface-2 p-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-lg px-4 py-2 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-surface-3 text-foreground"}`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {currentQuestion && (
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">{currentQuestion.question}</h4>
                  <div className="space-y-2">
                    {currentQuestion.options.map((option) => {
                      const isSelected = selectedOption === option.label;
                      const isOther = option.id === "other" || option.label.toLowerCase() === "other";
                      return (
                        <div key={option.id}>
                          <button type="button" onClick={() => setSelectedOption(option.label)} disabled={submitting}
                            className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                              isSelected ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
                            <span className="flex h-6 w-6 items-center justify-center rounded bg-surface-2 text-xs font-bold">{option.id.toUpperCase()}</span>
                            <span className="flex-1 text-sm">{option.label}</span>
                            {isSelected && <CheckCircle className="h-4 w-4 text-primary" />}
                          </button>
                          {isOther && isSelected && (
                            <div className="ml-9 mt-2">
                              <input type="text" value={otherText} onChange={(e) => setOtherText(e.target.value)} placeholder="Specify..."
                                className="w-full rounded border border-border bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <button type="button" onClick={submitAnswer} disabled={!selectedOption || submitting}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                    {submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Processing...</> : <>Continue<ArrowRight className="h-4 w-4" /></>}
                  </button>
                </div>
              )}
            </div>
          )}

          {step === "complete" && spec && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-green-400">
                <Lock className="h-4 w-4" />Planning complete! Here's your plan.
              </div>

              <div className="rounded-lg border border-border bg-surface-2 p-4">
                <h3 className="mb-2 font-semibold text-foreground">{spec.title}</h3>
                <p className="mb-4 text-sm text-muted-foreground">{spec.summary}</p>
                {spec.deliverables && spec.deliverables.length > 0 && (
                  <div className="mb-3">
                    <h4 className="mb-1 text-sm font-medium text-foreground">Deliverables:</h4>
                    <ul className="list-disc pl-4 text-sm text-muted-foreground">{spec.deliverables.map((d, i) => <li key={i}>{d}</li>)}</ul>
                  </div>
                )}
                {spec.success_criteria && spec.success_criteria.length > 0 && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium text-foreground">Success Criteria:</h4>
                    <ul className="list-disc pl-4 text-sm text-muted-foreground">{spec.success_criteria.map((c, i) => <li key={i}>{c}</li>)}</ul>
                  </div>
                )}
              </div>

              {generatedAgents.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-medium text-foreground">Agents to create:</h4>
                  <div className="space-y-2">
                    {generatedAgents.map((agent, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 p-3">
                        <span className="text-2xl">{agent.avatar_emoji}</span>
                        <div><p className="font-medium text-foreground">{agent.name}</p><p className="text-sm text-muted-foreground">{agent.role}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          {step === "initial" && (
            <>
              <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-surface-2">Cancel</button>
              <button type="button" onClick={startPlanning} disabled={loading || !taskTitle.trim()}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Starting...</> : <><Sparkles className="h-4 w-4" />Start Planning</>}
              </button>
            </>
          )}
          {step === "complete" && (
            <>
              <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-surface-2">Cancel</button>
              <button type="button" onClick={createTask} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                <CheckCircle className="h-4 w-4" />Create Task
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
