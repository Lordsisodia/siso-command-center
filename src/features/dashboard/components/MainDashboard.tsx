"use client";

import { useMemo, useState } from "react";
import type { AgentState } from "@/features/agents/state/store";
import { ProjectWidget, PROJECTS } from "./ProjectWidget";
import { LayoutDashboard, Plus, Bot, Play, Pause, AlertCircle, Clock, ChevronRight, Server, Bell, Activity, Wifi, WifiOff, Cpu, HardDrive, X, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { AgentAvatar } from "@/features/agents/components/AgentAvatar";

type MainDashboardProps = {
  agents: AgentState[];
  onSelectProject: (projectId: string) => void;
  onCreateAgent: () => void;
};

export const MainDashboard = ({ agents, onSelectProject, onCreateAgent }: MainDashboardProps) => {
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [showSystemStatus, setShowSystemStatus] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  const agentsByProject = useMemo(() => {
    const map: Record<string, AgentState[]> = {};
    PROJECTS.forEach((p) => {
      map[p.id] = agents.filter(
        (a) => (a as any).project === p.id || a.agentId.includes(p.id)
      );
    });
    map["other"] = agents.filter((a) => {
      const project = (a as any).project;
      return !project || !PROJECTS.find((p) => p.id === project);
    });
    return map;
  }, [agents]);

  const stats = useMemo(() => ({
    total: agents.length,
    running: agents.filter((a) => a.status === "running").length,
    idle: agents.filter((a) => a.status === "idle").length,
    error: agents.filter((a) => a.status === "error").length,
  }), [agents]);

  const recentAgents = useMemo(() => {
    return [...agents]
      .sort((a, b) => (b.lastActivityAt || 0) - (a.lastActivityAt || 0))
      .slice(0, 5);
  }, [agents]);

  const formatTime = (timestamp?: number | null) => {
    if (!timestamp) return "Never";
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  const toggleProjectExpand = (projectId: string) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  const mockNotifications = [
    { id: "1", type: "error", message: "Agent 'E2E Testing' failed: Test suite timeout", time: "5m ago" },
    { id: "2", type: "warning", message: "Rate limit approaching for OpenAI API", time: "15m ago" },
    { id: "3", type: "success", message: "Visual tests: 100% pass rate", time: "30m ago" },
    { id: "4", type: "info", message: "New agent template available", time: "1h ago" },
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-border/40 bg-card/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <LayoutDashboard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
              <p className="text-xs text-muted-foreground">{stats.total} agents total</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCreateAgent}
            className="flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New Agent
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Projects</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {PROJECTS.map((project) => (
                <ProjectWidget
                  key={project.id}
                  project={project}
                  agents={agentsByProject[project.id] || []}
                  onClick={() => onSelectProject(project.id)}
                  expanded={expandedProject === project.id}
                  onToggleExpand={() => toggleProjectExpand(project.id)}
                />
              ))}
              <button
                type="button"
                className="flex h-full min-h-[120px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-card/30 p-4 text-muted-foreground transition hover:border-primary/40 hover:bg-card/50"
              >
                <Plus className="h-6 w-6" />
                <span className="text-sm font-medium">Add Project</span>
              </button>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Agents</h2>
            <div className="space-y-2">
              {agents.slice(0, 8).map((agent) => (
                <button
                  key={agent.agentId}
                  onClick={() => onSelectProject((agent as any).project || "other")}
                  className="flex w-full items-center gap-3 rounded-lg border border-border/40 bg-card/50 p-2 text-left transition hover:bg-card"
                >
                  <div className={`h-2 w-2 rounded-full ${
                    agent.status === "running" ? "bg-green-500" :
                    agent.status === "error" ? "bg-red-500" : "bg-muted-foreground"
                  }`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">{agent.name}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatTime(agent.lastActivityAt)}</span>
                </button>
              ))}
              {agents.length === 0 && (
                <p className="py-4 text-center text-xs text-muted-foreground">No agents</p>
              )}
            </div>
          </div>
        </div>

        <div className="w-80 shrink-0 border-l border-border/40 bg-card/30 p-6">
          <div className="space-y-6">
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Activity className="h-3 w-3" />
                Quick Stats
              </h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-md bg-card p-2">
                  <span className="text-sm text-muted-foreground">Running</span>
                  <span className="font-mono text-sm font-medium text-green-500">{stats.running}</span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-card p-2">
                  <span className="text-sm text-muted-foreground">Idle</span>
                  <span className="font-mono text-sm font-medium text-yellow-500">{stats.idle}</span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-card p-2">
                  <span className="text-sm text-muted-foreground">Errors</span>
                  <span className="font-mono text-sm font-medium text-red-500">{stats.error}</span>
                </div>
              </div>
            </div>

            {showSystemStatus && (
              <div>
                <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Server className="h-3 w-3" />
                  System Status
                  <button 
                    type="button"
                    onClick={() => setShowSystemStatus(false)}
                    className="ml-auto rounded p-0.5 hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </h2>
                <div className="space-y-2 rounded-md bg-card p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-foreground">Gateway</span>
                    </div>
                    <span className="text-xs font-medium text-green-500">Running</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-foreground">VPS</span>
                    </div>
                    <span className="text-xs font-medium text-green-500">Connected</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-foreground">Mac Mini</span>
                    </div>
                    <span className="text-xs font-medium text-green-500">Online</span>
                  </div>
                  <div className="border-t border-border/40 pt-2 mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Cpu className="h-3 w-3" /> CPU
                      </span>
                      <span className="text-foreground">45%</span>
                    </div>
                    <div className="mt-1 h-1 w-full rounded-full bg-muted">
                      <div className="h-full w-[45%] rounded-full bg-blue-500" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Bell className="h-3 w-3" />
                Notifications
                <span className="ml-auto rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {mockNotifications.length}
                </span>
              </h2>
              <div className="space-y-1 max-h-64 overflow-auto">
                {mockNotifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`flex items-start gap-2 rounded-md p-2 text-left ${
                      notif.type === "error" ? "bg-red-500/10" :
                      notif.type === "warning" ? "bg-yellow-500/10" :
                      notif.type === "success" ? "bg-green-500/10" : "bg-blue-500/10"
                    }`}
                  >
                    {notif.type === "error" ? (
                      <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    ) : notif.type === "warning" ? (
                      <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                    ) : notif.type === "success" ? (
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground line-clamp-2">{notif.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{notif.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Clock className="h-3 w-3" />
                Recent
              </h2>
              <div className="space-y-1">
                {recentAgents.map((agent) => (
                  <div key={agent.agentId} className="flex items-center gap-2 rounded p-1.5 hover:bg-card/50">
                    <div className={`h-1.5 w-1.5 rounded-full ${
                      agent.status === "running" ? "bg-green-500" : "bg-muted"
                    }`} />
                    <span className="truncate text-xs text-foreground">{agent.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{formatTime(agent.lastActivityAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
