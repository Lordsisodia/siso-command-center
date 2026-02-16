"use client";

import { useMemo, useState } from "react";
import { AgentVisualization } from "./AgentVisualization";
import { FleetHealthPanel } from "./FleetHealthPanel";
import { InterventionPanel } from "./InterventionPanel";
import { SwarmDashboard } from "./SwarmDashboard";
import type { AgentState } from "@/features/agents/state/store";
import { ClawAgent, Swarm, Intervention, FleetHealth, Machine, AgentDomain } from "../lib/types";
import { 
  Activity, Filter, Layers, AlertTriangle, Zap
} from "lucide-react";

const getDomain = (agentId: string, name: string): AgentDomain => {
  const id = (agentId + name).toLowerCase();
  if (id.includes("comm") || id.includes("discord") || id.includes("slack")) return "communications";
  if (id.includes("product") || id.includes("task") || id.includes("calendar")) return "productivity";
  if (id.includes("research") || id.includes("scout") || id.includes("librarian")) return "research";
  if (id.includes("dev") || id.includes("build") || id.includes("coder")) return "development";
  return "automation";
};

const MOCK_INTERVENTIONS: Intervention[] = [
  { id: "1", agentId: "research-1", agentName: "Scout", type: "approval_needed", question: "Can I use the browser to search for sensitive data?", context: "Need to access company internal wiki", timestamp: new Date().toISOString(), priority: "high" },
  { id: "2", agentId: "dev-1", agentName: "Developer", type: "clarification", question: "Should I refactor the auth module?", context: "Found legacy code that's hard to maintain", timestamp: new Date().toISOString(), priority: "medium" },
];

const MOCK_SWARMS: Swarm[] = [
  { id: "1", name: "Auth Migration", objective: "Migrate authentication to OAuth2", agents: ["Developer", "Reviewer", "Tester"], leadAgentId: "dev-1", status: "active", progress: 65, tasksTotal: 10, tasksCompleted: 6 },
];

const MOCK_MACHINES: Machine[] = [
  { id: "m1", name: "MacBook Pro", os: "macos", location: "Home Office", isOnline: true, lastSeen: "now" },
  { id: "m2", name: "Linux Server", os: "linux", location: "Server Room", isOnline: true, lastSeen: "now" },
  { id: "m3", name: "ThinkPad", os: "windows", location: "Work", isOnline: false, lastSeen: "2h ago" },
];

type OrcaDashboardProps = {
  agents: AgentState[];
  onAgentClick?: (agentId: string) => void;
};

export function OrcaDashboard({ agents, onAgentClick }: OrcaDashboardProps) {
  const [filter, setFilter] = useState<"all" | "active" | "interventions">("all");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const clawAgents: ClawAgent[] = useMemo(() => {
    return agents.map(agent => ({
      id: agent.agentId,
      name: agent.name,
      machineId: "m1",
      machineName: "MacBook Pro",
      status: agent.status === "running" ? "active" : agent.status === "idle" ? "idle" : "waiting",
      domain: getDomain(agent.agentId, agent.name),
      integrations: [],
      currentTaskId: null,
      currentAction: agent.draft || "Idle",
      memoryUsage: Math.random() * 100,
      uptime: "2h 30m",
      tasksCompleted: Math.floor(Math.random() * 50),
      collaboratingWith: [],
      interventionRequired: Math.random() > 0.8,
      activityLevel: agent.status === "running" ? Math.random() * 100 : 10,
    }));
  }, [agents]);

  const fleetHealth: FleetHealth = useMemo(() => {
    const running = agents.filter(a => a.status === "running").length;
    return {
      totalAgents: agents.length,
      activeAgents: running,
      offlineAgents: agents.length - running,
      interventionsRequired: MOCK_INTERVENTIONS.length,
      tasksInProgress: running,
      tasksCompletedToday: Math.floor(Math.random() * 30),
      swarmsActive: MOCK_SWARMS.filter(s => s.status === "active").length,
      overallHealth: running > 0 ? "healthy" : "degraded",
    };
  }, [agents]);

  const handleAgentClick = (agent: ClawAgent) => {
    setSelectedAgentId(agent.id);
    onAgentClick?.(agent.id);
  };

  const handleResolveIntervention = (id: string, approved: boolean) => {
    console.log(`Intervention ${id} ${approved ? "approved" : "denied"}`);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#0a0c0f]">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold tracking-wide text-white">ORCA FLEET</h2>
          <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400">
            {fleetHealth.activeAgents} ACTIVE
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-black/30 p-1">
            <button
              onClick={() => setFilter("all")}
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition ${
                filter === "all" ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"
              }`}
            >
              <Layers className="w-3 h-3" />
              All
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition ${
                filter === "active" ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"
              }`}
            >
              <Activity className="w-3 h-3" />
              Active
            </button>
            <button
              onClick={() => setFilter("interventions")}
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition ${
                filter === "interventions" ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              {MOCK_INTERVENTIONS.length}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          <AgentVisualization 
            agents={clawAgents}
            swarms={MOCK_SWARMS}
            onAgentClick={handleAgentClick}
            selectedAgentId={selectedAgentId}
            filter={filter}
          />
        </div>

        <div className="flex flex-col gap-2 p-2 border-l border-white/5">
          <FleetHealthPanel 
            fleetHealth={fleetHealth}
            machines={MOCK_MACHINES}
          />
          <InterventionPanel 
            interventions={MOCK_INTERVENTIONS}
            onResolve={handleResolveIntervention}
          />
          <SwarmDashboard 
            swarms={MOCK_SWARMS}
          />
        </div>
      </div>
    </div>
  );
}
