"use client";

import { useMemo, useState } from "react";
import { AgentAvatar } from "@/features/agents/components/AgentAvatar";
import type { AgentState } from "@/features/agents/state/store";
import { 
  Activity, Users, AlertTriangle, CheckCircle, Clock, Zap, 
  Bot, MessageSquare, Shield, Search, Code, Timer, Plus, X,
  ChevronRight, Play, Pause, RotateCcw
} from "lucide-react";

type AgentDomain = "communications" | "productivity" | "research" | "development" | "automation";

interface Intervention {
  id: string;
  agentId: string;
  agentName: string;
  type: "approval_needed" | "clarification" | "permission" | "error" | "cost_limit";
  question: string;
  context: string;
  timestamp: Date;
}

interface Swarm {
  id: string;
  name: string;
  objective: string;
  agents: string[];
  status: "forming" | "active" | "completed" | "disbanded";
  progress: number;
}

const DOMAIN_CONFIG: Record<AgentDomain, { color: string; bgColor: string; icon: React.ReactNode; label: string }> = {
  communications: { color: "text-pink-400", bgColor: "bg-pink-500/20 border-pink-500/30", icon: <MessageSquare className="h-4 w-4" />, label: "Communications" },
  productivity: { color: "text-blue-400", bgColor: "bg-blue-500/20 border-blue-500/30", icon: <Clock className="h-4 w-4" />, label: "Productivity" },
  research: { color: "text-purple-400", bgColor: "bg-purple-500/20 border-purple-500/30", icon: <Search className="h-4 w-4" />, label: "Research" },
  development: { color: "text-green-400", bgColor: "bg-green-500/20 border-green-500/30", icon: <Code className="h-4 w-4" />, label: "Development" },
  automation: { color: "text-amber-400", bgColor: "bg-amber-500/20 border-amber-500/30", icon: <Timer className="h-4 w-4" />, label: "Automation" },
};

const getDomain = (agentId: string, name: string): AgentDomain => {
  const id = (agentId + name).toLowerCase();
  if (id.includes("comm") || id.includes("discord") || id.includes("slack")) return "communications";
  if (id.includes("product") || id.includes("task") || id.includes("calendar")) return "productivity";
  if (id.includes("research") || id.includes("scout") || id.includes("librarian")) return "research";
  if (id.includes("dev") || id.includes("build") || id.includes("coder")) return "development";
  return "automation";
};

const MOCK_INTERVENTIONS: Intervention[] = [
  { id: "1", agentId: "research-1", agentName: "Scout", type: "approval_needed", question: "Can I use the browser to search for sensitive data?", context: "Need to access company internal wiki", timestamp: new Date(Date.now() - 1000 * 60 * 5) },
  { id: "2", agentId: "dev-1", agentName: "Developer", type: "clarification", question: "Should I refactor the auth module?", context: "Found legacy code that's hard to maintain", timestamp: new Date(Date.now() - 1000 * 60 * 12) },
];

const MOCK_SWARMS: Swarm[] = [
  { id: "1", name: "Auth Migration", objective: "Migrate authentication to OAuth2", agents: ["Developer", "Reviewer", "Tester"], status: "active", progress: 65 },
];

type OrcaDashboardProps = {
  agents: AgentState[];
  onAgentClick?: (agentId: string) => void;
};

export function OrcaDashboard({ agents, onAgentClick }: OrcaDashboardProps) {
  const [selectedDomain, setSelectedDomain] = useState<AgentDomain | "all">("all");
  const [showInterventions, setShowInterventions] = useState(true);
  const [showSwarms, setShowSwarms] = useState(true);

  const agentsByDomain = useMemo(() => {
    const grouped: Record<AgentDomain, AgentState[]> = {
      communications: [],
      productivity: [],
      research: [],
      development: [],
      automation: [],
    };
    agents.forEach((agent) => {
      const domain = getDomain(agent.agentId, agent.name);
      grouped[domain].push(agent);
    });
    return grouped;
  }, [agents]);

  const filteredAgents = useMemo(() => {
    if (selectedDomain === "all") return agents;
    return agentsByDomain[selectedDomain] || [];
  }, [agents, selectedDomain, agentsByDomain]);

  const stats = useMemo(() => {
    const running = agents.filter((a) => a.status === "running").length;
    const idle = agents.filter((a) => a.status === "idle").length;
    return { total: agents.length, running, idle, interventions: MOCK_INTERVENTIONS.length, swarms: MOCK_SWARMS.length };
  }, [agents]);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-surface-1">
      <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Orca Fleet View</h2>
          <p className="text-sm text-muted-foreground">Multi-agent coordination dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-surface-2 p-1">
            <button
              type="button"
              onClick={() => setSelectedDomain("all")}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                selectedDomain === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            {(Object.keys(DOMAIN_CONFIG) as AgentDomain[]).map((domain) => (
              <button
                key={domain}
                type="button"
                onClick={() => setSelectedDomain(domain)}
                className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition ${
                  selectedDomain === domain ? `${DOMAIN_CONFIG[domain].color} bg-surface-1` : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {DOMAIN_CONFIG[domain].icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          <div className="mb-6 grid grid-cols-5 gap-4">
            <div className="rounded-lg border border-border/60 bg-surface-2 p-4">
              <div className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" /><span className="text-xs font-medium uppercase">Total Agents</span></div>
              <p className="mt-1 text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
              <div className="flex items-center gap-2 text-green-400"><Play className="h-4 w-4" /><span className="text-xs font-medium uppercase">Running</span></div>
              <p className="mt-1 text-2xl font-bold text-green-400">{stats.running}</p>
            </div>
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
              <div className="flex items-center gap-2 text-yellow-400"><Pause className="h-4 w-4" /><span className="text-xs font-medium uppercase">Idle</span></div>
              <p className="mt-1 text-2xl font-bold text-yellow-400">{stats.idle}</p>
            </div>
            <button type="button" onClick={() => setShowInterventions(!showInterventions)} className={`rounded-lg border ${stats.interventions > 0 ? "border-red-500/30 bg-red-500/10" : "border-border/60 bg-surface-2"} p-4`}>
              <div className="flex items-center gap-2 text-muted-foreground"><AlertTriangle className={`h-4 w-4 ${stats.interventions > 0 ? "text-red-400" : ""}`} /><span className="text-xs font-medium uppercase">Interventions</span></div>
              <p className={`mt-1 text-2xl font-bold ${stats.interventions > 0 ? "text-red-400" : "text-foreground"}`}>{stats.interventions}</p>
            </button>
            <button type="button" onClick={() => setShowSwarms(!showSwarms)} className={`rounded-lg border ${stats.swarms > 0 ? "border-purple-500/30 bg-purple-500/10" : "border-border/60 bg-surface-2"} p-4`}>
              <div className="flex items-center gap-2 text-muted-foreground"><Zap className={`h-4 w-4 ${stats.swarms > 0 ? "text-purple-400" : ""}`} /><span className="text-xs font-medium uppercase">Swarms</span></div>
              <p className={`mt-1 text-2xl font-bold ${stats.swarms > 0 ? "text-purple-400" : "text-foreground"}`}>{stats.swarms}</p>
            </button>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {(Object.keys(DOMAIN_CONFIG) as AgentDomain[]).map((domain) => {
              const domainAgents = agentsByDomain[domain];
              const running = domainAgents.filter((a) => a.status === "running").length;
              return (
                <button
                  key={domain}
                  type="button"
                  onClick={() => setSelectedDomain(domain)}
                  className={`rounded-lg border p-4 text-left transition hover:scale-[1.02] ${
                    selectedDomain === domain
                      ? `${DOMAIN_CONFIG[domain].bgColor} border-current`
                      : "border-border/60 bg-surface-2 hover:border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`${DOMAIN_CONFIG[domain].color}`}>{DOMAIN_CONFIG[domain].icon}</div>
                    <span className="text-xs text-muted-foreground">{domainAgents.length} agents</span>
                  </div>
                  <p className={`mt-2 font-semibold ${DOMAIN_CONFIG[domain].color}`}>{DOMAIN_CONFIG[domain].label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{running} running</p>
                </button>
              );
            })}
          </div>

          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              {selectedDomain === "all" ? "All Agents" : DOMAIN_CONFIG[selectedDomain].label} Agents
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {filteredAgents.map((agent) => {
                const domain = getDomain(agent.agentId, agent.name);
                const config = DOMAIN_CONFIG[domain];
                return (
                  <button
                    key={agent.agentId}
                    type="button"
                    onClick={() => onAgentClick?.(agent.agentId)}
                    className="group flex items-center gap-3 rounded-lg border border-border/60 bg-surface-2 p-3 text-left transition hover:border-primary/50"
                  >
                    <div className={`h-3 w-3 rounded-full ${agent.status === "running" ? "bg-green-500 animate-pulse" : agent.status === "idle" ? "bg-yellow-500" : "bg-muted-foreground"}`} />
                    <AgentAvatar seed={agent.avatarSeed ?? agent.agentId} name={agent.name} avatarUrl={agent.avatarUrl ?? null} size={32} isSelected={false} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{agent.name}</p>
                      <p className={`truncate text-xs ${config.color}`}>{config.label}</p>
                    </div>
                    <div className="opacity-0 transition group-hover:opacity-100">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                );
              })}
              {filteredAgents.length === 0 && (
                <div className="col-span-4 flex h-32 items-center justify-center rounded-lg border border-dashed border-border/40">
                  <p className="text-sm text-muted-foreground">No agents in this domain</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Interventions & Swarms */}
        {(showInterventions || showSwarms) && (
          <div className="w-80 border-l border-border/60 bg-surface-2 overflow-auto">
            {showInterventions && (
              <div className="border-b border-border/40 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    Interventions
                  </h3>
                  <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400">{MOCK_INTERVENTIONS.length}</span>
                </div>
                <div className="space-y-2">
                  {MOCK_INTERVENTIONS.map((intervention) => (
                    <div key={intervention.id} className="rounded-lg border border-border/40 bg-surface-1 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-medium text-foreground">{intervention.agentName}</span>
                        <span className={`ml-auto rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${
                          intervention.type === "approval_needed" ? "bg-yellow-500/20 text-yellow-400" :
                          intervention.type === "error" ? "bg-red-500/20 text-red-400" :
                          "bg-blue-500/20 text-blue-400"
                        }`}>{intervention.type.replace("_", " ")}</span>
                      </div>
                      <p className="text-sm text-foreground mb-1">{intervention.question}</p>
                      <p className="text-xs text-muted-foreground mb-2">{intervention.context}</p>
                      <div className="flex gap-2">
                        <button type="button" className="flex-1 rounded bg-primary/20 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/30">Approve</button>
                        <button type="button" className="flex-1 rounded border border-border/40 px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-surface-2">Deny</button>
                      </div>
                    </div>
                  ))}
                  {MOCK_INTERVENTIONS.length === 0 && (
                    <p className="text-xs text-muted-foreground">No interventions pending</p>
                  )}
                </div>
              </div>
            )}

            {showSwarms && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Zap className="h-4 w-4 text-purple-400" />
                    Active Swarms
                  </h3>
                  <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-400">{MOCK_SWARMS.length}</span>
                </div>
                <div className="space-y-2">
                  {MOCK_SWARMS.map((swarm) => (
                    <div key={swarm.id} className="rounded-lg border border-border/40 bg-surface-1 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">{swarm.name}</span>
                        <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-medium text-purple-400 uppercase">{swarm.status}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{swarm.objective}</p>
                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress</span><span>{swarm.progress}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                          <div className="h-full rounded-full bg-purple-500" style={{ width: `${swarm.progress}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {swarm.agents.map((agent, i) => (
                          <div key={i} className="flex items-center gap-1 rounded bg-surface-2 px-1.5 py-0.5">
                            <Bot className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">{agent}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {MOCK_SWARMS.length === 0 && (
                    <p className="text-xs text-muted-foreground">No active swarms</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
