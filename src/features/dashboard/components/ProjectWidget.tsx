"use client";

import { useMemo, useState } from "react";
import type { AgentState } from "@/features/agents/state/store";
import { Bot, ChevronRight, ChevronDown, Activity, Play, Square, RotateCcw, Users, Clock, CheckCircle, AlertCircle, X } from "lucide-react";
import { AgentAvatar } from "@/features/agents/components/AgentAvatar";

export type Project = {
  id: string;
  name: string;
  color: string;
  colorBg: string;
};

export const PROJECTS: Project[] = [
  { id: "blackbox5", name: "BlackBox5", color: "text-blue-400", colorBg: "bg-blue-500" },
  { id: "lumelle", name: "Lumelle", color: "text-purple-400", colorBg: "bg-purple-500" },
  { id: "siso-internal", name: "SISO Internal", color: "text-orange-400", colorBg: "bg-orange-500" },
];

type ProjectWidgetProps = {
  project: Project;
  agents: AgentState[];
  onClick?: () => void;
  expanded?: boolean;
  onToggleExpand?: () => void;
};

export const ProjectWidget = ({ project, agents, onClick, expanded = false, onToggleExpand }: ProjectWidgetProps) => {
  const [showQuickView, setShowQuickView] = useState(false);
  
  const stats = useMemo(() => {
    const running = agents.filter((a) => a.status === "running").length;
    const idle = agents.filter((a) => a.status === "idle").length;
    const error = agents.filter((a) => a.status === "error").length;
    return { running, idle, error, total: agents.length };
  }, [agents]);

  const runningAgents = useMemo(() => agents.filter((a) => a.status === "running"), [agents]);
  const idleAgents = useMemo(() => agents.filter((a) => a.status === "idle"), [agents]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand?.();
  };

  const formatTime = (timestamp?: number | null) => {
    if (!timestamp) return "Never";
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h`;
  };

  const statusDots = useMemo(() => {
    const dots: React.ReactNode[] = [];
    const maxVisible = 8;
    
    for (let i = 0; i < Math.min(stats.running, maxVisible); i++) {
      dots.push(
        <span
          key={`running-${i}`}
          className="h-2 w-2 rounded-full bg-green-500 ring-1 ring-green-500/30"
        />
      );
    }
    
    const remaining = maxVisible - dots.length;
    for (let i = 0; i < Math.min(stats.idle, remaining); i++) {
      dots.push(
        <span
          key={`idle-${i}`}
          className="h-2 w-2 rounded-full border-2 border-muted-foreground/40"
        />
      );
    }
    
    const remainingAfterIdle = maxVisible - dots.length;
    for (let i = 0; i < Math.min(stats.error, remainingAfterIdle); i++) {
      dots.push(
        <span
          key={`error-${i}`}
          className="h-2 w-2 rounded-full bg-red-500 ring-1 ring-red-500/30"
        />
      );
    }
    
    if (stats.total > maxVisible) {
      dots.push(
        <span key="overflow" className="text-xs text-muted-foreground">
          +{stats.total - maxVisible}
        </span>
      );
    }
    
    return dots;
  }, [stats]);

  return (
    <div className="group relative flex w-full flex-col rounded-xl border border-border/60 bg-card transition-all hover:border-border hover:shadow-lg hover:shadow-black/5">
      {/* Header - always visible */}
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${project.colorBg}`}>
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{project.name}</h3>
            <p className="text-xs text-muted-foreground">
              {stats.total} agent{stats.total !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          )}
        </div>
      </button>

      {/* Status bar */}
      <div className="flex items-center gap-2 px-4 pb-2">
        {statusDots}
        <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
          <Activity className="h-3 w-3" />
          {stats.running > 0 ? `${stats.running} running` : "All idle"}
        </span>
      </div>

      {/* Stats row */}
      <div className="flex gap-4 border-t border-border/40 px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-sm font-medium text-foreground">{stats.running}</span>
          <span className="text-xs text-muted-foreground">Running</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full border-2 border-muted-foreground/40" />
          <span className="text-sm font-medium text-foreground">{stats.idle}</span>
          <span className="text-xs text-muted-foreground">Idle</span>
        </div>
        {stats.error > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-sm font-medium text-red-400">{stats.error}</span>
            <span className="text-xs text-muted-foreground">Error</span>
          </div>
        )}
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border/40 bg-muted/20 p-4">
          {/* Running agents */}
          {runningAgents.length > 0 && (
            <div className="mb-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
                <Play className="h-3 w-3 text-green-500" />
                Running
              </div>
              <div className="space-y-1">
                {runningAgents.slice(0, 4).map((agent) => (
                  <div key={agent.agentId} className="flex items-center gap-2 rounded bg-card p-2">
                    <AgentAvatar seed={agent.avatarSeed ?? agent.agentId} name={agent.name} avatarUrl={agent.avatarUrl ?? null} size={20} />
                    <span className="flex-1 truncate text-xs text-foreground">{agent.name}</span>
                    <div className="flex items-center gap-1">
                      <button type="button" className="rounded p-1 hover:bg-muted" title="Stop">
                        <Square className="h-3 w-3 text-yellow-500" />
                      </button>
                      <button type="button" className="rounded p-1 hover:bg-muted" title="Restart">
                        <RotateCcw className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Idle agents */}
          {idleAgents.length > 0 && (
            <div className="mb-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
                <Clock className="h-3 w-3" />
                Idle
              </div>
              <div className="space-y-1">
                {idleAgents.slice(0, 4).map((agent) => (
                  <div key={agent.agentId} className="flex items-center gap-2 rounded bg-card p-2">
                    <AgentAvatar seed={agent.avatarSeed ?? agent.agentId} name={agent.name} avatarUrl={agent.avatarUrl ?? null} size={20} />
                    <span className="flex-1 truncate text-xs text-foreground">{agent.name}</span>
                    <div className="flex items-center gap-1">
                      <button type="button" className="rounded p-1 hover:bg-muted" title="Start">
                        <Play className="h-3 w-3 text-green-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button 
              type="button" 
              onClick={onClick}
              className="flex-1 rounded-md bg-primary/10 px-3 py-2 text-center text-xs font-medium text-primary hover:bg-primary/20"
            >
              View Full Dashboard
            </button>
            <button 
              type="button" 
              className="flex items-center gap-1 rounded-md border border-border/60 px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
            >
              <Users className="h-3 w-3" />
              Add Agent
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
