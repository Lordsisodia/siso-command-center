"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Users, Brain, CheckCircle, Zap, Clock, Activity, Plus, Settings, Search, Rocket, Shield, Play, Square, RotateCcw, GitCommit, GitPullRequest, Bell, Download, X, Cpu, HardDrive, Gauge, AlertCircle, ListChecks, Timer, DollarSign, LayoutGrid, GripVertical, Sparkles } from "lucide-react";
import { AgentAvatar } from "@/features/agents/components/AgentAvatar";
import type { AgentState } from "@/features/agents/state/store";
import { PlanningModal } from "./PlanningModal";

type Project = { id: string; name: string; color: string; colorClass: string; };
type ProjectDashboardProps = { project: Project; agents: AgentState[]; onClose: () => void; };

type Notification = { id: string; type: "error" | "warning" | "info" | "success"; message: string; timestamp: Date; };

const MOCK_STATS: Record<string, { tasksCompleted: number; tasksInProgress: number; tokensUsed: number; tokensPerHour: number; tokensPerMin: number; achievements: string[]; recentActivity: { id: string; action: string; timestamp: Date; agentName?: string }[]; taskQueue: { id: string; title: string; status: "pending" | "running" | "completed"; agent?: string }[]; commits: { id: string; message: string; author: string; timestamp: Date; hash: string }[]; notifications: Notification[]; }> = {
  blackbox5: { tasksCompleted: 247, tasksInProgress: 12, tokensUsed: 1250000, tokensPerHour: 45000, tokensPerMin: 750, achievements: ["Auto-merged 50 PRs", "Fixed 30 critical bugs", "Deployed 15 features"], recentActivity: [{ id: "1", action: "PR #247 merged", timestamp: new Date(Date.now() - 1000 * 60 * 5), agentName: "Reviewer" }], taskQueue: [{ id: "1", title: "Implement OAuth2 flow", status: "running", agent: "Developer" }, { id: "2", title: "Write API docs", status: "pending" }, { id: "3", title: "Fix login bug", status: "pending" }, { id: "4", title: "Add dark mode", status: "completed" }], commits: [{ id: "1", message: "feat: add OAuth2", author: "Developer", timestamp: new Date(Date.now() - 1000 * 60 * 30), hash: "abc1234" }], notifications: [{ id: "1", type: "error", message: "Test timeout", timestamp: new Date(Date.now() - 1000 * 60 * 5) }] },
  lumelle: { tasksCompleted: 89, tasksInProgress: 5, tokensUsed: 450000, tokensPerHour: 18000, tokensPerMin: 300, achievements: ["100% visual pass rate"], recentActivity: [{ id: "1", action: "Visual tests passed", timestamp: new Date(Date.now() - 1000 * 60 * 10) }], taskQueue: [{ id: "1", title: "Update component lib", status: "running" }], commits: [], notifications: [] },
  siso: { tasksCompleted: 156, tasksInProgress: 8, tokensUsed: 890000, tokensPerHour: 32000, tokensPerMin: 530, achievements: [], recentActivity: [], taskQueue: [], commits: [], notifications: [] },
};

const formatTimeAgo = (date: Date): string => { const seconds = Math.floor((Date.now() - date.getTime()) / 1000); if (seconds < 60) return "just now"; const minutes = Math.floor(seconds / 60); if (minutes < 60) return `${minutes}m ago`; const hours = Math.floor(minutes / 60); if (hours < 24) return `${hours}h ago`; return `${Math.floor(hours / 24)}d ago`; };
const formatNumber = (num: number): string => { if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"; if (num >= 1000) return (num / 1000).toFixed(0) + "K"; return num.toString(); };

export const ProjectDashboard = ({ project, agents, onClose }: ProjectDashboardProps) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showKanban, setShowKanban] = useState(false);
  const [showPlanning, setShowPlanning] = useState(false);

  const baseStats = MOCK_STATS[project.id] || { tasksCompleted: 0, tasksInProgress: 0, tokensUsed: 0, tokensPerHour: 0, tokensPerMin: 0, achievements: [], recentActivity: [], taskQueue: [], commits: [], notifications: [] };
  const stats = { ...baseStats };
  const runningAgents = agents.filter(a => a.status === "running").length;

  const handleTaskCreated = (task: { id: string; title: string; description: string }) => {
    stats.taskQueue.unshift({ id: task.id, title: task.title, status: "pending" });
  };

  return (
    <div className="flex h-full flex-col">
      <PlanningModal isOpen={showPlanning} onClose={() => setShowPlanning(false)} onTaskCreated={handleTaskCreated} />
      <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
        <div className="flex items-center gap-4">
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-surface-2"><ArrowLeft className="h-5 w-5 text-foreground" /></button>
          <div><h2 className="text-xl font-bold text-foreground">{project.name}</h2><p className="text-sm text-muted-foreground">{runningAgents} agents running</p></div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setShowKanban(!showKanban)} className={`flex items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-xs font-medium ${showKanban ? "bg-primary/10 text-primary" : "bg-surface-2 text-foreground hover:bg-surface-3"}`}><LayoutGrid className="h-4 w-4" />{showKanban ? "Stats" : "Kanban"}</button>
          <button type="button" onClick={() => setShowNotifications(true)} className="relative flex items-center gap-2 rounded-md border border-border/60 bg-surface-2 px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-3"><Bell className="h-4 w-4" />{stats.notifications.length > 0 && <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">{stats.notifications.length}</span>}</button>
          <button type="button" onClick={() => setShowSettings(true)} className="flex items-center gap-2 rounded-md border border-border/60 bg-surface-2 px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-3"><Settings className="h-4 w-4" />Settings</button>
          <button type="button" onClick={() => setShowPlanning(true)} className="flex items-center gap-2 rounded-md border border-border/60 bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"><Sparkles className="h-4 w-4" />Plan with AI</button>
          <button type="button" className="flex items-center gap-2 rounded-md border border-border/60 bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"><Plus className="h-4 w-4" />New Agent</button>
        </div>
      </div>

      {showKanban ? (
        <div className="flex-1 overflow-hidden p-6">
          <div className="flex h-full gap-4 overflow-x-auto">
            {["To Do", "In Progress", "Review", "Done"].map((column) => {
              const columnTasks = stats.taskQueue.filter(task => column === "To Do" ? task.status === "pending" : column === "In Progress" ? task.status === "running" : column === "Done" ? task.status === "completed" : column === "Review" ? task.status === "running" && task.agent : false);
              return (
                <div key={column} className="flex w-72 shrink-0 flex-col rounded-lg border border-border/60 bg-surface-2">
                  <div className="flex items-center justify-between border-b border-border/40 px-3 py-2">
                    <div className="flex items-center gap-2"><GripVertical className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium text-foreground">{column}</span><span className="rounded-full bg-surface-1 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{columnTasks.length}</span></div>
                    <button type="button" className="rounded p-1 hover:bg-surface-1"><Plus className="h-3 w-3 text-muted-foreground" /></button>
                  </div>
                  <div className="flex-1 overflow-auto p-2 space-y-2">
                    {columnTasks.map(task => (
                      <div key={task.id} className="group cursor-grab rounded-lg border border-border/40 bg-surface-1 p-3 shadow-sm hover:border-primary/40">
                        <div className="flex items-start justify-between gap-2"><p className="text-sm font-medium text-foreground">{task.title}</p><button type="button" className="opacity-0 group-hover:opacity-100 rounded hover:bg-surface-2"><GripVertical className="h-3 w-3 text-muted-foreground" /></button></div>
                        <div className="mt-2 flex items-center gap-2">{task.agent && <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{task.agent}</span>}<span className={`ml-auto h-2 w-2 rounded-full ${task.status === "completed" ? "bg-green-500" : task.status === "running" ? "bg-blue-500 animate-pulse" : "bg-muted-foreground"}`} /></div>
                      </div>
                    ))}
                    {columnTasks.length === 0 && <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-border/40"><p className="text-xs text-muted-foreground">No tasks</p></div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="rounded-lg border border-border/60 bg-surface-2 p-4"><div className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="h-4 w-4" /><span className="text-xs font-medium uppercase">Tasks Done</span></div><p className="mt-1 text-2xl font-bold text-foreground">{stats.tasksCompleted}</p></div>
            <div className="rounded-lg border border-border/60 bg-surface-2 p-4"><div className="flex items-center gap-2 text-muted-foreground"><Activity className="h-4 w-4" /><span className="text-xs font-medium uppercase">In Progress</span></div><p className="mt-1 text-2xl font-bold text-foreground">{stats.tasksInProgress}</p></div>
            <div className="rounded-lg border border-border/60 bg-surface-2 p-4"><div className="flex items-center gap-2 text-muted-foreground"><Zap className="h-4 w-4" /><span className="text-xs font-medium uppercase">Total Tokens</span></div><p className="mt-1 text-2xl font-bold text-foreground">{formatNumber(stats.tokensUsed)}</p></div>
            <div className="rounded-lg border border-border/60 bg-surface-2 p-4"><div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /><span className="text-xs font-medium uppercase">Tokens/hr</span></div><p className="mt-1 text-2xl font-bold text-foreground">{formatNumber(stats.tokensPerHour)}</p></div>
            <div className="rounded-lg border border-border/60 bg-surface-2 p-4"><div className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" /><span className="text-xs font-medium uppercase">Agents</span></div><p className="mt-1 text-2xl font-bold text-foreground">{agents.length}</p></div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg border border-border/60 bg-surface-2 p-4">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Recent Activity</h3>
              <div className="space-y-3">{stats.recentActivity.length > 0 ? stats.recentActivity.map(activity => (<div key={activity.id} className="flex items-center gap-3"><div className="h-2 w-2 rounded-full bg-green-500" /><div className="flex-1"><p className="text-sm text-foreground">{activity.action}</p><p className="text-xs text-muted-foreground">{formatTimeAgo(activity.timestamp)} {activity.agentName && `• ${activity.agentName}`}</p></div></div>)) : <p className="text-sm text-muted-foreground">No recent activity</p>}</div>
            </div>
            <div className="rounded-lg border border-border/60 bg-surface-2 p-4">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Recent Commits</h3>
              <div className="space-y-3">{stats.commits.length > 0 ? stats.commits.map(commit => (<div key={commit.id} className="flex items-center gap-3"><GitCommit className="h-4 w-4 text-muted-foreground" /><div className="flex-1 min-w-0"><p className="truncate text-sm text-foreground">{commit.message}</p><p className="text-xs text-muted-foreground">{commit.author} • {formatTimeAgo(commit.timestamp)}</p></div></div>)) : <p className="text-sm text-muted-foreground">No commits</p>}</div>
            </div>
          </div>

          {stats.achievements.length > 0 && (<div className="mt-6 rounded-lg border border-border/60 bg-surface-2 p-4"><h3 className="mb-3 text-sm font-semibold text-foreground">Achievements</h3><div className="flex flex-wrap gap-2">{stats.achievements.map((a, i) => (<span key={i} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{a}</span>))}</div></div>)}
        </div>
      )}
    </div>
  );
};
