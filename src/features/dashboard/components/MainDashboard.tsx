"use client";

import { useMemo, useState } from "react";
import type { AgentState } from "@/features/agents/state/store";
import { ProjectWidget, PROJECTS } from "./ProjectWidget";
import { CommandPalette, useCommandPalette } from "./CommandPalette";
import { 
  LayoutDashboard, Plus, Bot, Play, Pause, AlertCircle, Clock, ChevronRight, Server, 
  Bell, Activity, Wifi, WifiOff, Cpu, HardDrive, X, CheckCircle, AlertTriangle, Info,
  Zap, RotateCcw, RefreshCw, ArrowRight, Timer, ListChecks, GitCommit, GitPullRequest,
  CircleDot, CheckCircle2, Clock3, Command
} from "lucide-react";
import { AgentAvatar } from "@/features/agents/components/AgentAvatar";

type TimeRange = "1h" | "24h" | "7d" | "30d";

type MainDashboardProps = {
  agents: AgentState[];
  onSelectProject: (projectId: string) => void;
  onCreateAgent: () => void;
  onSelectAgent?: (agentId: string) => void;
  onOpenSettings?: () => void;
};

type ActivityItem = {
  id: string;
  type: "commit" | "task" | "agent" | "error" | "success";
  message: string;
  agent?: string;
  project?: string;
  timestamp: Date;
};

type TaskItem = {
  id: string;
  title: string;
  status: "pending" | "running" | "completed";
  agent?: string;
  project?: string;
};

export const MainDashboard = ({ agents, onSelectProject, onCreateAgent }: MainDashboardProps) => {
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [showSystemStatus, setShowSystemStatus] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");

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

  const mockActivity: ActivityItem[] = useMemo(() => [
    { id: "1", type: "commit", message: "PR #247 merged: Add OAuth2 authentication", agent: "Reviewer", project: "blackbox5", timestamp: new Date(Date.now() - 1000 * 60 * 5) },
    { id: "2", type: "task", message: "Story completed: Auth flow implementation", agent: "Developer", project: "blackbox5", timestamp: new Date(Date.now() - 1000 * 60 * 15) },
    { id: "3", type: "success", message: "E2E tests passed: 100% pass rate", agent: "E2E Testing", project: "lumelle", timestamp: new Date(Date.now() - 1000 * 60 * 30) },
    { id: "4", type: "commit", message: "feat: Add Button variants", agent: "Developer", project: "lumelle", timestamp: new Date(Date.now() - 1000 * 60 * 45) },
    { id: "5", type: "error", message: "Agent 'Static Analysis' failed: Lint timeout", agent: "Static Analysis", project: "lumelle", timestamp: new Date(Date.now() - 1000 * 60 * 60) },
    { id: "6", type: "task", message: "Dep update completed", agent: "Deps", project: "siso-internal", timestamp: new Date(Date.now() - 1000 * 60 * 90) },
  ], []);

  const mockTasks: TaskItem[] = useMemo(() => [
    { id: "1", title: "Implement OAuth2 flow", status: "running", agent: "Developer", project: "blackbox5" },
    { id: "2", title: "Write API documentation", status: "pending", project: "blackbox5" },
    { id: "3", title: "Fix login bug", status: "pending", project: "blackbox5" },
    { id: "4", title: "Visual regression tests", status: "running", agent: "E2E Testing", project: "lumelle" },
    { id: "5", title: "Security audit", status: "pending", project: "siso-internal" },
    { id: "6", title: "Add dark mode", status: "completed", project: "blackbox5" },
    { id: "7", title: "Setup CI/CD pipeline", status: "completed", project: "blackbox5" },
  ], []);

  const formatTime = (timestamp?: number | null) => {
    if (!timestamp) return "Never";
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  const formatActivityTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const toggleProjectExpand = (projectId: string) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  const mockNotifications = [
    { id: "1", type: "error" as const, message: "Agent 'E2E Testing' failed: Test suite timeout", time: "5m ago" },
    { id: "2", type: "warning" as const, message: "Rate limit approaching for OpenAI API", time: "15m ago" },
    { id: "3", type: "success" as const, message: "Visual tests: 100% pass rate", time: "30m ago" },
    { id: "4", type: "info" as const, message: "New agent template available", time: "1h ago" },
  ];

  const taskStats = useMemo(() => ({
    pending: mockTasks.filter(t => t.status === "pending").length,
    running: mockTasks.filter(t => t.status === "running").length,
    completed: mockTasks.filter(t => t.status === "completed").length,
  }), [mockTasks]);

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
          <div className="flex items-center gap-3">
            <div className="flex rounded-md border border-border/60 bg-card p-0.5">
              {(["1h", "24h", "7d", "30d"] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setTimeRange(range)}
                  className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                    timeRange === range 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {range}
                </button>
              ))}
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
      </div>

      <div className="flex items-center gap-2 border-b border-border/40 bg-muted/20 px-6 py-2">
        <span className="text-xs font-medium text-muted-foreground">Quick Actions:</span>
        <button type="button" className="flex items-center gap-1.5 rounded-md bg-card border border-border/60 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition">
          <Zap className="h-3 w-3 text-yellow-500" />
          Run Heartbeats
        </button>
        <button type="button" onClick={onCreateAgent} className="flex items-center gap-1.5 rounded-md bg-card border border-border/60 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition">
          <Plus className="h-3 w-3 text-green-500" />
          New Agent
        </button>
        <button type="button" className="flex items-center gap-1.5 rounded-md bg-card border border-border/60 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition">
          <RotateCcw className="h-3 w-3 text-blue-500" />
          Restart Failed
        </button>
        <button type="button" className="flex items-center gap-1.5 rounded-md bg-card border border-border/60 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition">
          <RefreshCw className="h-3 w-3 text-purple-500" />
          Sync
        </button>
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

        <div className="w-80 shrink-0 border-l border-border/40 bg-card/30 p-6 overflow-auto">
          <div className="space-y-5">
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

            <div>
              <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <ListChecks className="h-3 w-3" />
                Tasks
                <span className="ml-auto text-[10px] font-normal text-muted-foreground">
                  {taskStats.pending} pending · {taskStats.running} running · {taskStats.completed} done
                </span>
              </h2>
              <div className="space-y-1 rounded-md bg-card p-2">
                {mockTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center gap-2 rounded p-1.5 hover:bg-muted/50">
                    {task.status === "completed" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    ) : task.status === "running" ? (
                      <CircleDot className="h-3.5 w-3.5 text-blue-500 animate-pulse shrink-0" />
                    ) : (
                      <Clock3 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    )}
                    <span className="flex-1 truncate text-xs text-foreground">{task.title}</span>
                    {task.agent && (
                      <span className="text-[10px] text-muted-foreground">{task.agent}</span>
                    )}
                  </div>
                ))}
                <button type="button" className="flex w-full items-center justify-center gap-1 rounded p-1.5 text-xs text-muted-foreground hover:text-foreground transition">
                  <span>View all tasks</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div>
              <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <GitCommit className="h-3 w-3" />
                Activity
                <span className="ml-auto text-[10px] font-normal text-muted-foreground">last {timeRange}</span>
              </h2>
              <div className="space-y-1 max-h-56 overflow-auto">
                {mockActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-2 rounded-md p-2 hover:bg-card/50">
                    <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                      activity.type === "error" ? "bg-red-500" :
                      activity.type === "success" ? "bg-green-500" :
                      activity.type === "commit" ? "bg-purple-500" :
                      activity.type === "task" ? "bg-blue-500" : "bg-muted-foreground"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs text-foreground">{activity.message}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        {activity.agent && <span>{activity.agent}</span>}
                        {activity.agent && activity.timestamp && <span>·</span>}
                        <span>{formatActivityTime(activity.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))}
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
              <div className="space-y-1 max-h-48 overflow-auto">
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
