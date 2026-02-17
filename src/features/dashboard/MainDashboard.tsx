"use client";

import { useMemo, useState } from "react";
import type { AgentState } from "@/features/fleet/state/store";
import { ProjectWidget, PROJECTS } from "./ProjectWidget";
import { CommandPalette, useCommandPalette } from "./CommandPalette";
import { 
  LayoutDashboard, Plus, Bot, Play, AlertCircle, Clock, Server, 
  Bell, Activity, Wifi, Cpu, X, CheckCircle, AlertTriangle, Info,
  CircleDot, CheckCircle2, Clock3, Command, TrendingUp
} from "lucide-react";

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

export const MainDashboard = ({ agents, onSelectProject, onCreateAgent, onSelectAgent, onOpenSettings }: MainDashboardProps) => {
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");

  const { isOpen: isCmdOpen, setIsOpen: setCmdOpen, CommandPalette: CmdPalette } = useCommandPalette({
    agents: agents.map(a => ({ id: a.agentId, name: a.name })),
    onCreateAgent,
    onOpenDashboard: () => {},
    onOpenSettings: onOpenSettings || (() => {}),
    onRunHeartbeats: () => {},
    onSelectAgent: onSelectAgent || (() => {}),
  });

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
    { id: "1", type: "commit", message: "PR #247 merged", agent: "Reviewer", project: "blackbox5", timestamp: new Date(Date.now() - 1000 * 60 * 5) },
    { id: "2", type: "task", message: "Story completed: Auth flow", agent: "Developer", project: "blackbox5", timestamp: new Date(Date.now() - 1000 * 60 * 15) },
    { id: "3", type: "success", message: "E2E tests passed", agent: "E2E Testing", project: "lumelle", timestamp: new Date(Date.now() - 1000 * 60 * 30) },
    { id: "4", type: "commit", message: "feat: Add Button variants", agent: "Developer", project: "lumelle", timestamp: new Date(Date.now() - 1000 * 60 * 45) },
    { id: "5", type: "error", message: "Agent failed: Lint timeout", agent: "Static Analysis", project: "lumelle", timestamp: new Date(Date.now() - 1000 * 60 * 60) },
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
  ];

  const taskStats = useMemo(() => ({
    pending: mockTasks.filter(t => t.status === "pending").length,
    running: mockTasks.filter(t => t.status === "running").length,
    completed: mockTasks.filter(t => t.status === "completed").length,
  }), [mockTasks]);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <div className="flex items-center justify-between border-b border-border/40 px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <LayoutDashboard className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground">Dashboard</h1>
              <p className="text-xs text-muted-foreground">
                {stats.total} agents · {stats.running} running
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCmdOpen(true)}
            className="flex items-center gap-2 rounded-md border border-border/60 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition"
          >
            <Command className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Search</span>
          </button>
          <button
            type="button"
            onClick={onCreateAgent}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Agent</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          <div className="mb-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {PROJECTS.map((project) => {
                const projectAgents = agentsByProject[project.id] || [];
                const running = projectAgents.filter(a => a.status === "running").length;
                return (
                  <button
                    key={project.id}
                    onClick={() => onSelectProject(project.id)}
                    className="group relative flex flex-col rounded-xl border border-border/60 bg-card p-4 text-left transition-all hover:border-primary/40 hover:shadow-md"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${project.colorBg}`}>
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">{project.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {projectAgents.length} agents
                          </p>
                        </div>
                      </div>
                      {running > 0 && (
                        <span className="flex h-2 w-2">
                          <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: Math.min(projectAgents.length, 6) }).map((_, i) => (
                        <span
                          key={i}
                          className={`h-1.5 w-1.5 rounded-full ${
                            i < running ? "bg-green-500" : "bg-muted-foreground/40"
                          }`}
                        />
                      ))}
                      {projectAgents.length > 6 && (
                        <span className="text-[10px] text-muted-foreground">+{projectAgents.length - 6}</span>
                      )}
                      <span className="ml-auto text-xs text-muted-foreground">
                        {running > 0 ? `${running} running` : "idle"}
                      </span>
                    </div>
                  </button>
                );
              })}
              <button
                type="button"
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-card/30 p-4 text-muted-foreground transition hover:border-primary/40 hover:bg-card/50"
              >
                <Plus className="h-5 w-5" />
                <span className="text-xs font-medium">Add Project</span>
              </button>
            </div>
          </div>
        </div>

        <div className="w-72 shrink-0 border-l border-border/40 bg-card/30 p-4 overflow-auto">
          <div className="space-y-4">
            <div className="rounded-lg bg-card p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Tasks</span>
                <span className="text-[10px] text-muted-foreground">
                  {taskStats.running} running
                </span>
              </div>
              <div className="space-y-1">
                {mockTasks.slice(0, 4).map((task) => (
                  <div key={task.id} className="flex items-center gap-2 rounded py-1">
                    {task.status === "completed" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    ) : task.status === "running" ? (
                      <CircleDot className="h-3.5 w-3.5 text-blue-500 animate-pulse shrink-0" />
                    ) : (
                      <Clock3 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    )}
                    <span className="flex-1 truncate text-xs text-foreground">{task.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-card p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Activity</span>
                <span className="text-[10px] text-muted-foreground">last {timeRange}</span>
              </div>
              <div className="space-y-1">
                {mockActivity.slice(0, 4).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-2 rounded py-1">
                    <div className={`mt-0.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                      activity.type === "error" ? "bg-red-500" :
                      activity.type === "success" ? "bg-green-500" :
                      activity.type === "commit" ? "bg-purple-500" : "bg-blue-500"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs text-foreground">{activity.message}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {activity.agent && `${activity.agent} · `}{formatActivityTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-card p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">System</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-xs text-foreground">Gateway</span>
                  </div>
                  <span className="text-[10px] font-medium text-green-500">Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-xs text-foreground">VPS</span>
                  </div>
                  <span className="text-[10px] font-medium text-green-500">Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-foreground">CPU</span>
                  </div>
                  <span className="text-[10x] font-medium text-foreground">45%</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-card p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Alerts</span>
                </div>
                {mockNotifications.length > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-medium text-white">
                    {mockNotifications.length}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                {mockNotifications.slice(0, 3).map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`flex items-start gap-2 rounded p-1.5 text-left ${
                      notif.type === "error" ? "bg-red-500/10" :
                      notif.type === "warning" ? "bg-yellow-500/10" : "bg-green-500/10"
                    }`}
                  >
                    {notif.type === "error" ? (
                      <AlertCircle className="h-3 w-3 text-red-500 shrink-0 mt-0.5" />
                    ) : notif.type === "warning" ? (
                      <AlertTriangle className="h-3 w-3 text-yellow-500 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle className="h-3 w-3 text-green-500 shrink-0 mt-0.5" />
                    )}
                    <p className="flex-1 truncate text-[10px] text-foreground">{notif.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <CmdPalette />
    </div>
  );
};
