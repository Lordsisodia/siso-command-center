"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { ArrowLeft, Users, Brain, CheckCircle, Zap, Clock, Activity, Plus, Settings, Search, Rocket, Shield, Play, Square, RotateCcw, GitCommit, GitPullRequest, Bell, Download, X, Cpu, HardDrive, Gauge, AlertCircle, ListChecks, Timer, DollarSign, LayoutGrid, GripVertical, TrendingUp, TrendingDown, Terminal, Sparkles, Target, Trophy, Flame, Cpu as CpuIcon, Search as SearchIcon, Command, XCircle } from "lucide-react";
import { AgentAvatar } from "@/features/fleet/components/AgentAvatar";
import type { AgentState } from "@/features/fleet/state/store";

type Project = {
  id: string;
  name: string;
  color: string;
  colorClass: string;
  accentColor: string;
  accentGlow: string;
};

type ProjectDashboardProps = {
  project: Project;
  agents: AgentState[];
  onClose: () => void;
};

type Swarm = {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  agentPatterns: string[];
};

type TimeRange = "1h" | "24h" | "7d" | "30d";

type Notification = {
  id: string;
  type: "error" | "warning" | "info" | "success";
  message: string;
  timestamp: Date;
};

// Enhanced projects with accent colors for theming
const PROJECTS: Record<string, Project> = {
  blackbox5: { id: "blackbox5", name: "BlackBox5", color: "bg-blue-500", colorClass: "bg-blue-500/10 border-blue-500/30", accentColor: "text-blue-400", accentGlow: "blue" },
  lumelle: { id: "lumelle", name: "Lumelle", color: "bg-purple-500", colorClass: "bg-purple-500/10 border-purple-500/30", accentColor: "text-purple-400", accentGlow: "purple" },
  "siso-internal": { id: "siso-internal", name: "SISO Internal", color: "bg-orange-500", colorClass: "bg-orange-500/10 border-orange-500/30", accentColor: "text-orange-400", accentGlow: "orange" },
};

const SWARMS: Swarm[] = [
  { id: "research", name: "Research Swarm", icon: <Search className="h-4 w-4" />, color: "bg-blue-500", agentPatterns: ["scout", "librarian", "analyst", "research"] },
  { id: "execution", name: "Execution Swarm", icon: <Rocket className="h-4 w-4" />, color: "bg-green-500", agentPatterns: ["planner", "developer", "tester", "reviewer", "build"] },
  { id: "hygiene", name: "Hygiene Swarm", icon: <Shield className="h-4 w-4" />, color: "bg-orange-500", agentPatterns: ["dead", "deps", "security", "audit", "clean"] },
];

const MOCK_PROJECT_STATS: Record<string, {
  tasksCompleted: number;
  tasksInProgress: number;
  tokensUsed: number;
  tokensPerHour: number;
  tokensPerMin: number;
  achievements: string[];
  recentActivity: { id: string; action: string; timestamp: Date; agentName?: string; type?: string }[];
  taskQueue: { id: string; title: string; status: "pending" | "running" | "completed"; agent?: string; priority?: "high" | "medium" | "low"; progress?: number }[];
  commits: { id: string; message: string; author: string; timestamp: Date; hash: string }[];
  notifications: Notification[];
  cpuUsage: number;
  memoryUsage: number;
  apiRate: number;
}> = {
  blackbox5: {
    tasksCompleted: 247,
    tasksInProgress: 12,
    tokensUsed: 1250000,
    tokensPerHour: 45000,
    tokensPerMin: 750,
    achievements: ["Auto-merged 50 PRs", "Fixed 30 critical bugs", "Deployed 15 features", "Zero downtime releases"],
    recentActivity: [
      { id: "1", action: "PR #247 merged", timestamp: new Date(Date.now() - 1000 * 60 * 5), agentName: "Reviewer", type: "success" },
      { id: "2", action: "Story completed: Auth flow", timestamp: new Date(Date.now() - 1000 * 60 * 15), agentName: "Developer", type: "success" },
      { id: "3", action: "E2E tests passed", timestamp: new Date(Date.now() - 1000 * 60 * 30), agentName: "Tester", type: "success" },
      { id: "4", action: "Deploying v2.4.0", timestamp: new Date(Date.now() - 1000 * 60 * 45), agentName: "Deploy", type: "info" },
    ],
    taskQueue: [
      { id: "1", title: "Implement OAuth2 flow", status: "running", agent: "Developer", priority: "high", progress: 65 },
      { id: "2", title: "Write API documentation", status: "pending", agent: "Librarian", priority: "medium" },
      { id: "3", title: "Fix login bug", status: "pending", agent: "Developer", priority: "high" },
      { id: "4", title: "Add dark mode", status: "completed", agent: "Developer", progress: 100 },
      { id: "5", title: "Setup CI/CD pipeline", status: "completed", agent: "Deps", progress: 100 },
    ],
    commits: [
      { id: "1", message: "feat: add OAuth2 authentication", author: "Developer", timestamp: new Date(Date.now() - 1000 * 60 * 30), hash: "abc1234" },
      { id: "2", message: "fix: resolve login redirect issue", author: "Reviewer", timestamp: new Date(Date.now() - 1000 * 60 * 60), hash: "def5678" },
      { id: "3", message: "chore: update dependencies", author: "Deps", timestamp: new Date(Date.now() - 1000 * 60 * 120), hash: "ghi9012" },
    ],
    notifications: [
      { id: "1", type: "error", message: "Agent 'Tester' failed: Test suite timeout", timestamp: new Date(Date.now() - 1000 * 60 * 5) },
      { id: "2", type: "warning", message: "Rate limit approaching for OpenAI API", timestamp: new Date(Date.now() - 1000 * 60 * 15) },
      { id: "3", type: "info", message: "New agent template available", timestamp: new Date(Date.now() - 1000 * 60 * 30) },
    ],
    cpuUsage: 45,
    memoryUsage: 30,
    apiRate: 78,
  },
  lumelle: {
    tasksCompleted: 89,
    tasksInProgress: 5,
    tokensUsed: 450000,
    tokensPerHour: 18000,
    tokensPerMin: 300,
    achievements: ["100% visual regression pass rate", "Reduced CI time by 40%", "Auto-documented 20 components"],
    recentActivity: [
      { id: "1", action: "Visual tests passed", timestamp: new Date(Date.now() - 1000 * 60 * 10), agentName: "E2E", type: "success" },
      { id: "2", action: "Component library updated", timestamp: new Date(Date.now() - 1000 * 60 * 25), agentName: "Static", type: "info" },
    ],
    taskQueue: [
      { id: "1", title: "Update component library", status: "running", agent: "Static", priority: "high", progress: 80 },
      { id: "2", title: "Add new icons", status: "pending", agent: "Developer", priority: "low" },
    ],
    commits: [
      { id: "1", message: "feat: add Button variants", author: "Developer", timestamp: new Date(Date.now() - 1000 * 60 * 45), hash: "xyz7890" },
    ],
    notifications: [
      { id: "1", type: "success", message: "Visual tests: 100% pass rate", timestamp: new Date(Date.now() - 1000 * 60 * 10) },
    ],
    cpuUsage: 28,
    memoryUsage: 22,
    apiRate: 45,
  },
  "siso-internal": {
    tasksCompleted: 156,
    tasksInProgress: 8,
    tokensUsed: 780000,
    tokensPerHour: 32000,
    tokensPerMin: 530,
    achievements: ["Found 200+ dead code paths", "Updated 50 dependencies", "Saved 1000+ lines of code"],
    recentActivity: [
      { id: "1", action: "Dep update completed", timestamp: new Date(Date.now() - 1000 * 60 * 8), agentName: "Deps", type: "success" },
      { id: "2", action: "Security audit started", timestamp: new Date(Date.now() - 1000 * 60 * 20), agentName: "Security", type: "info" },
    ],
    taskQueue: [
      { id: "1", title: "Security audit", status: "running", agent: "Security", priority: "high", progress: 40 },
      { id: "2", title: "Remove dead code", status: "completed", agent: "Dead Code", progress: 100 },
    ],
    commits: [
      { id: "1", message: "refactor: remove unused modules", author: "Dead Code", timestamp: new Date(Date.now() - 1000 * 60 * 20), hash: "1234abc" },
    ],
    notifications: [
      { id: "1", type: "warning", message: "Vulnerability found in dependency", timestamp: new Date(Date.now() - 1000 * 60 * 40) },
      { id: "2", type: "success", message: "Dependencies updated successfully", timestamp: new Date(Date.now() - 1000 * 60 * 60) },
    ],
    cpuUsage: 62,
    memoryUsage: 45,
    apiRate: 55,
  }
};

type TaskItem = {
  id: string;
  title: string;
  status: "pending" | "running" | "completed";
  agent?: string;
  priority?: "high" | "medium" | "low";
  progress?: number;
};

type ActivityItemType = {
  id: string;
  action: string;
  timestamp: Date;
  agentName?: string;
  type?: string;
};

const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(0) + "K";
  return num.toString();
};

// Arc gauge component
const ArcGauge = ({ value, label, color, size = 60 }: { value: number; label: string; color: string; size?: number }) => {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  const getColor = () => {
    if (color === "blue") return "#3b82f6";
    if (color === "purple") return "#a855f7";
    if (color === "orange") return "#f97316";
    if (color === "green") return "#22c55e";
    if (color === "yellow") return "#eab308";
    if (color === "red") return "#ef4444";
    return color;
  };

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-surface-1" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={getColor()} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">{animatedValue}%</span>
    </div>
  );
};

// Glass card with hover effects
const GlassCard = ({ children, className = "", glowColor = "", hoverEffect = true }: { children: React.ReactNode; className?: string; glowColor?: string; hoverEffect?: boolean }) => {
  const baseClasses = "relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-surface-2/60 to-surface-1/40 backdrop-blur-xl shadow-xl";
  const hoverClasses = hoverEffect ? "transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-white/10" : "";
  const glowClasses = glowColor ? { blue: "hover:shadow-blue-500/20", purple: "hover:shadow-purple-500/20", orange: "hover:shadow-orange-500/20" }[glowColor] || "" : "";

  return (
    <div className={`${baseClasses} ${hoverClasses} ${glowClasses} ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      {children}
    </div>
  );
};

// Mini sparkline chart component
const Sparkline = ({ data, color, height = 24 }: { data: number[]; color: string; height?: number }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 60;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  const getColor = () => {
    if (color === "green") return "#22c55e";
    if (color === "red") return "#ef4444";
    if (color === "blue") return "#3b82f6";
    if (color === "purple") return "#a855f7";
    if (color === "orange") return "#f97316";
    if (color === "yellow") return "#eab308";
    return "#3b82f6";
  };

  const isPositive = data[data.length - 1] >= data[0];
  const fillColor = isPositive ? `${getColor()}20` : "#ef444420";

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`sparkGrad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={getColor()} stopOpacity="0.3" />
          <stop offset="100%" stopColor={getColor()} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${points} ${width},${height}`} fill={`url(#sparkGrad-${color})`} />
      <polyline points={points} fill="none" stroke={getColor()} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// Animated stat card
const StatCard = ({ icon: Icon, label, value, subValue, color, glowColor, trend, sparkData }: { icon: React.ElementType; label: string; value: string | number; subValue?: string; color: string; glowColor: string; trend?: "up" | "down"; sparkData?: number[] }) => {
  const colorClasses: Record<string, { bg: string; text: string }> = {
    blue: { bg: "from-blue-500/20 to-blue-600/10", text: "text-blue-400" },
    purple: { bg: "from-purple-500/20 to-purple-600/10", text: "text-purple-400" },
    orange: { bg: "from-orange-500/20 to-orange-600/10", text: "text-orange-400" },
    green: { bg: "from-green-500/20 to-green-600/10", text: "text-green-400" },
    yellow: { bg: "from-yellow-500/20 to-yellow-600/10", text: "text-yellow-400" },
  };
  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <GlassCard glowColor={glowColor} className="p-4 group">
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="p-1.5 rounded-lg bg-surface-1/50"><Icon className="h-4 w-4" /></div>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
          </div>
          {trend && <div className={`flex items-center gap-1 text-xs ${trend === "up" ? "text-green-400" : "text-red-400"}`}>{trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}</div>}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground tabular-nums">{value}</span>
          {subValue && <span className="text-xs text-muted-foreground">{subValue}</span>}
        </div>
        {sparkData && (
          <div className="mt-2 flex items-end">
            <Sparkline data={sparkData} color={trend === "up" ? "green" : trend === "down" ? "red" : color} height={20} />
          </div>
        )}
      </div>
    </GlassCard>
  );
};

// Achievement badge with glow
const AchievementBadge = ({ achievement, color }: { achievement: string; color: string }) => {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
    purple: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
    orange: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30" },
    green: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/30" },
  };
  const c = colors[color] || colors.green;

  return (
    <div className={`group flex items-center gap-2 rounded-full border ${c.border} ${c.bg} px-4 py-1.5 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-default`}>
      <Trophy className={`h-3 w-3 ${c.text}`} />
      <span className={`text-xs font-medium ${c.text}`}>{achievement}</span>
      <Sparkles className={`h-3 w-3 ${c.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
    </div>
  );
};

// Enhanced task card with progress
const TaskCard = ({ task, onDragStart }: { task: TaskItem; onDragStart?: (taskId: string) => void }) => {
  const priorityColors = { high: "text-red-400 bg-red-500/10 border-red-500/30", medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30", low: "text-blue-400 bg-blue-500/10 border-blue-500/30" };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", task.id);
    onDragStart?.(task.id);
  };

  return (
    <div 
      className="group relative overflow-hidden rounded-xl border border-border/40 bg-surface-1/50 p-3 transition-all duration-200 hover:border-primary/30 hover:bg-surface-1 hover:shadow-lg cursor-grab active:cursor-grabbing"
      draggable
      onDragStart={handleDragStart}
    >
      {task.status === "running" && task.progress !== undefined && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-surface-1"><div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500" style={{ width: `${task.progress}%` }} /></div>
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          {task.status === "completed" ? <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" /> : task.status === "running" ? <div className="relative mt-0.5"><Timer className="h-4 w-4 text-blue-500" /><div className="absolute inset-0 animate-pulse rounded-full bg-blue-500/50 blur-sm" /></div> : <Target className="h-4 w-4 text-muted-foreground mt-0.5" />}
          <div>
            <p className="text-sm font-medium text-foreground">{task.title}</p>
            {task.agent && <p className="text-xs text-muted-foreground mt-0.5">{task.agent}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {task.priority && <span className={`rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${priorityColors[task.priority]}`}>{task.priority}</span>}
          <span className={`h-2 w-2 rounded-full ${task.status === "completed" ? "bg-green-500" : task.status === "running" ? "bg-blue-500 animate-pulse" : "bg-muted-foreground"}`} />
        </div>
      </div>
    </div>
  );
};

// Enhanced agent card with rich hover
const AgentCard = ({ agent }: { agent: AgentState }) => {
  const [isHovered, setIsHovered] = useState(false);
  const currentTasks = ["Implementing OAuth", "Writing tests", "Building UI", "Refactoring"][Math.floor(Math.random() * 4)];
  const uptime = Math.floor(Math.random() * 120) + 5;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border/40 bg-surface-1/50 p-3 transition-all duration-300 hover:border-primary/30 hover:bg-surface-1 hover:shadow-xl hover:scale-[1.01]" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="flex items-center gap-3">
        <div className="relative">
          <AgentAvatar seed={agent.avatarSeed ?? agent.agentId} name={agent.name} avatarUrl={agent.avatarUrl ?? null} size={36} />
          {agent.status === "running" && <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" /><span className="relative inline-flex h-3 w-3 rounded-full bg-green-500 border-2 border-surface-1" /></div>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground">{agent.name}</p>
            <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize ${agent.status === "running" ? "bg-green-500/10 text-green-400 border border-green-500/30" : agent.status === "error" ? "bg-red-500/10 text-red-400 border border-red-500/30" : "bg-muted/10 text-muted-foreground border border-muted/30"}`}>{agent.status}</span>
          </div>
          <div className={`overflow-hidden transition-all duration-300 ${isHovered ? "max-h-20 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
            {agent.status === "running" && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Terminal className="h-3 w-3" /><span className="truncate">{currentTasks}</span><span className="text-green-400">· {uptime}m</span></div>}
          </div>
        </div>
        <div className={`flex items-center gap-1 transition-all duration-200 ${isHovered ? "opacity-100" : "opacity-0"}`}>
          {agent.status === "running" ? <button type="button" className="rounded-lg p-1.5 hover:bg-yellow-500/20 text-yellow-400" title="Stop"><Square className="h-4 w-4" /></button> : <button type="button" className="rounded-lg p-1.5 hover:bg-green-500/20 text-green-400" title="Start"><Play className="h-4 w-4" /></button>}
          <button type="button" className="rounded-lg p-1.5 hover:bg-surface-2 text-muted-foreground" title="Restart"><RotateCcw className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
};

// Enhanced activity item
const ActivityItem = ({ activity }: { activity: ActivityItemType }) => {
  const typeColors: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    success: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10" },
    error: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10" },
    warning: { icon: AlertCircle, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    info: { icon: Activity, color: "text-blue-400", bg: "bg-blue-500/10" },
  };
  const activityType = activity.type || "info";
  const { icon: Icon, color, bg } = typeColors[activityType] || typeColors.info;

  return (
    <div className="group flex items-start gap-3 border-b border-border/20 pb-3 last:border-0 transition-all duration-200 hover:bg-surface-1/30 -mx-2 px-2 rounded-lg">
      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${bg}`}><Icon className={`h-4 w-4 ${color}`} /></div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground group-hover:text-white transition-colors">{activity.action}</p>
        <div className="flex items-center gap-2 mt-1">
          {activity.agentName && <span className="text-xs font-medium text-muted-foreground bg-surface-2 px-1.5 py-0.5 rounded">{activity.agentName}</span>}
          <span className="text-xs text-muted-foreground/60">{formatTimeAgo(activity.timestamp)}</span>
        </div>
      </div>
    </div>
  );
};

export const ProjectDashboard = ({ project, agents, onClose }: ProjectDashboardProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showKanban, setShowKanban] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandSearch, setCommandSearch] = useState("");
  const [fabExpanded, setFabExpanded] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  // Animation delays for staggered reveals
  const animDelays = {
    stats: 0,
    swarms: 100,
    widgets: 200,
    agents: 300,
    activity: 400,
    achievements: 500,
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if (e.key === "Escape") {
        setShowCommandPalette(false);
        setFabExpanded(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const projectTheme = project ? (PROJECTS[project.id] || { accentColor: "text-blue-400", accentGlow: "blue" }) : { accentColor: "text-blue-400", accentGlow: "blue" };
  const accentColorName = projectTheme.accentGlow;

  const projectAgents = useMemo(() => agents.filter((a) => (a as any).project === project.id || a.agentId.includes(project.id)), [agents, project.id]);

  useEffect(() => { setTimeout(() => setIsVisible(true), 100); }, []);

  const commands = useMemo(() => {
    const allCommands = [
      { id: "new-agent", label: "Create New Agent", icon: Plus, action: () => {} },
      { id: "new-task", label: "Create New Task", icon: ListChecks, action: () => {} },
      { id: "view-kanban", label: "View Kanban Board", icon: LayoutGrid, action: () => setShowKanban(true) },
      { id: "view-stats", label: "View Statistics", icon: Activity, action: () => {} },
      { id: "export", label: "Export Project Data", icon: Download, action: () => {} },
      { id: "settings", label: "Project Settings", icon: Settings, action: () => setShowSettings(true) },
      ...projectAgents.map(agent => ({
        id: `agent-${agent.agentId}`,
        label: `Go to: ${agent.name}`,
        icon: Play,
        action: () => {}
      })),
    ];
    if (!commandSearch) return allCommands;
    return allCommands.filter(cmd => cmd.label.toLowerCase().includes(commandSearch.toLowerCase()));
  }, [commandSearch, projectAgents]);

  const baseStats = MOCK_PROJECT_STATS[project.id] || { tasksCompleted: 0, tasksInProgress: 0, tokensUsed: 0, tokensPerHour: 0, tokensPerMin: 0, achievements: [], recentActivity: [], taskQueue: [], commits: [], notifications: [], cpuUsage: 0, memoryUsage: 0, apiRate: 0 };

  const stats = useMemo(() => {
    const multiplier = timeRange === "1h" ? 1 : timeRange === "24h" ? 24 : timeRange === "7d" ? 168 : 720;
    return { ...baseStats, tasksCompleted: Math.floor(baseStats.tasksCompleted * (multiplier / 24)), tokensUsed: Math.floor(baseStats.tokensUsed * (multiplier / 24)), tokensPerHour: Math.floor(baseStats.tokensPerHour * (multiplier / 24)), tokensPerMin: Math.floor(baseStats.tokensPerMin * (multiplier / 24)) };
  }, [baseStats, timeRange]);

  const [taskQueue, setTaskQueue] = useState(stats.taskQueue);
  
  useEffect(() => {
    if (stats.taskQueue.length > 0 && taskQueue.length === 0) {
      setTaskQueue(stats.taskQueue);
    }
  }, [stats.taskQueue, taskQueue.length]);

  const runningAgents = projectAgents.filter(a => a.status === "running").length;
  const idleAgents = projectAgents.filter(a => a.status === "idle").length;

  const getSwarmAgents = (swarm: Swarm) => projectAgents.filter(agent => swarm.agentPatterns.some(pattern => agent.name.toLowerCase().includes(pattern.toLowerCase()) || agent.agentId.toLowerCase().includes(pattern.toLowerCase())));

  const handleExport = () => {
    const data = { project: project.name, timeRange, stats: { tasksCompleted: stats.tasksCompleted, tasksInProgress: stats.tasksInProgress, tokensUsed: stats.tokensUsed, tokensPerHour: stats.tokensPerHour }, agents: projectAgents.map(a => ({ name: a.name, status: a.status })), taskQueue: stats.taskQueue };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.id}-stats-${timeRange}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "error": return "text-red-400 bg-red-500/10 border-red-500/30";
      case "warning": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "success": return "text-green-400 bg-green-500/10 border-green-500/30";
      default: return "text-blue-400 bg-blue-500/10 border-blue-500/30";
    }
  };

  return (
    <div className={`flex h-full w-full flex-col transition-opacity duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}>
      <div className={`flex items-center justify-between gap-4 border-b border-border/80 px-6 py-4 transition-all duration-500 ${project.colorClass}`}>
        <div className="flex items-center gap-4">
          <button type="button" onClick={onClose} className="flex items-center gap-2 rounded-xl border border-border/60 bg-surface-2/80 backdrop-blur-sm px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-3 hover:scale-105 transition-all duration-200"><ArrowLeft className="h-4 w-4" />Back</button>
          <div className="flex items-center gap-3">
            <div className={`h-4 w-4 rounded-full ${project.color} shadow-lg shadow-current/30 animate-pulse`} />
            <h2 className="text-xl font-bold text-foreground tracking-tight">{project.name}</h2>
            <span className="rounded-full bg-surface-2/80 backdrop-blur-sm px-3 py-1 text-xs font-medium text-muted-foreground border border-border/40">{projectAgents.length} agents</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-white/5 bg-surface-2/50 backdrop-blur-md p-0.5">
            {(["1h", "24h", "7d", "30d"] as TimeRange[]).map((range) => (
              <button key={range} type="button" onClick={() => setTimeRange(range)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${timeRange === range ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25" : "text-muted-foreground hover:text-foreground hover:bg-surface-1"}`}>{range}</button>
            ))}
          </div>
          <button type="button" onClick={handleExport} className="flex items-center gap-2 rounded-xl border border-border/60 bg-surface-2/80 backdrop-blur-sm px-3 py-2.5 text-xs font-medium text-foreground hover:bg-surface-3 hover:scale-105 transition-all duration-200"><Download className="h-4 w-4" /></button>
          <button type="button" onClick={() => setShowKanban(!showKanban)} className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 hover:scale-105 ${showKanban ? "border-primary bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25" : "border-border/60 bg-surface-2/80 backdrop-blur-sm text-foreground hover:bg-surface-3"}`}><LayoutGrid className="h-4 w-4" />Kanban</button>
          <button type="button" onClick={() => setShowNotifications(true)} className="relative flex items-center gap-2 rounded-xl border border-border/60 bg-surface-2/80 backdrop-blur-sm px-3 py-2.5 text-xs font-medium text-foreground hover:bg-surface-3 hover:scale-105 transition-all duration-200"><Bell className="h-4 w-4" />{stats.notifications.length > 0 && <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 text-[10px] font-bold text-white shadow-lg shadow-red-500/50 animate-bounce">{stats.notifications.length}</span>}</button>
          <button type="button" onClick={() => setShowSettings(true)} className="flex items-center gap-2 rounded-xl border border-border/60 bg-surface-2/80 backdrop-blur-sm px-3 py-2.5 text-xs font-medium text-foreground hover:bg-surface-3 hover:scale-105 transition-all duration-200"><Settings className="h-4 w-4" />Settings</button>
          <button type="button" className="flex items-center gap-2 rounded-xl border border-primary/50 bg-gradient-to-r from-primary to-primary/80 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-lg shadow-primary/25 hover:scale-105 transition-all duration-200"><Plus className="h-4 w-4" />New Agent</button>
        </div>
      </div>

      {showKanban ? (
        <div className="flex-1 overflow-hidden p-6">
          <div className="flex h-full gap-4 overflow-x-auto">
            {(["To Do", "In Progress", "Review", "Done"] as const).map((column) => {
              const targetStatus = column === "To Do" ? "pending" : column === "In Progress" ? "running" : column === "Done" ? "completed" : "running";
              const columnTasks = taskQueue.filter(task => column === "To Do" ? task.status === "pending" : column === "In Progress" ? task.status === "running" : column === "Done" ? task.status === "completed" : column === "Review" ? task.status === "running" && task.agent : false);
              
              const handleDragOver = (e: React.DragEvent) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              };
              
              const handleDrop = (e: React.DragEvent) => {
                e.preventDefault();
                const taskId = e.dataTransfer.getData("text/plain");
                setTaskQueue(prev => prev.map(t => t.id === taskId ? { ...t, status: targetStatus } : t));
              };
              
              return (
                <div 
                  key={column} 
                  className="flex w-80 shrink-0 flex-col rounded-2xl border border-white/5 bg-surface-2/40 backdrop-blur-xl transition-colors duration-200 hover:border-primary/30"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                    <div className="flex items-center gap-3"><GripVertical className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-semibold text-foreground">{column}</span><span className="rounded-full bg-surface-1 px-2.5 py-0.5 text-xs font-bold text-muted-foreground border border-border/40">{columnTasks.length}</span></div>
                    <button type="button" className="rounded-lg p-1.5 hover:bg-surface-1 transition-colors"><Plus className="h-4 w-4 text-muted-foreground" /></button>
                  </div>
                  <div className="flex-1 overflow-auto p-3 space-y-3">
                    {columnTasks.map(task => <TaskCard key={task.id} task={task} onDragStart={setDraggedTask} />)}
                    {columnTasks.length === 0 && <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-border/40 bg-surface-1/30"><div className="text-center"><Target className="mx-auto h-6 w-6 text-muted-foreground/50 mb-1" /><p className="text-xs text-muted-foreground">Drop tasks here</p></div></div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Stats - fade in first */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4" style={{ animationDelay: `${animDelays.stats}ms` }}>
            <StatCard icon={CheckCircle} label="Tasks Done" value={stats.tasksCompleted} color="green" glowColor={accentColorName} trend="up" sparkData={[12, 19, 15, 25, 22, 30, 28, 35, 42, 38, 45, 52]} />
            <StatCard icon={Activity} label="In Progress" value={stats.tasksInProgress} color="blue" glowColor={accentColorName} sparkData={[8, 12, 6, 15, 10, 18, 14, 20, 16, 22, 18, 25]} />
            <StatCard icon={Zap} label="Total Tokens" value={formatNumber(stats.tokensUsed)} subValue="tokens" color="purple" glowColor={accentColorName} trend="up" sparkData={[12000, 18000, 22000, 28000, 35000, 42000, 48000, 55000, 62000, 70000, 85000, 95000]} />
            <StatCard icon={Clock} label="Tokens/hr" value={formatNumber(stats.tokensPerHour)} color="orange" glowColor={accentColorName} sparkData={[35000, 42000, 38000, 45000, 52000, 48000, 55000, 60000, 58000, 65000, 72000, 78000]} />
            <StatCard icon={DollarSign} label="Est. Cost" value={`$${(stats.tokensUsed / 1000000 * 10).toFixed(2)}`} subValue="@ $10/M" color="yellow" glowColor={accentColorName} sparkData={[0.12, 0.18, 0.22, 0.28, 0.35, 0.42, 0.48, 0.55, 0.62, 0.70, 0.85, 0.95]} />
          </div>

          {/* Swarms - fade in second */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SWARMS.map((swarm) => {
              const swarmAgents = getSwarmAgents(swarm);
              const running = swarmAgents.filter(a => a.status === "running").length;
              return (
                <GlassCard key={swarm.id} glowColor={swarm.color.replace("bg-", "")} className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${swarm.color} text-white shadow-lg shadow-current/30`}>{swarm.icon}</div>
                      <div><h4 className="font-bold text-foreground">{swarm.name}</h4><p className="text-xs text-muted-foreground">{swarmAgents.length} agents</p></div>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${running > 0 ? "bg-green-500/10 border border-green-500/30" : "bg-surface-1 border border-border/40"}`}><span className={`h-2.5 w-2.5 rounded-full ${running > 0 ? "bg-green-500 animate-pulse" : "bg-muted-foreground"}`} /><span className={`text-xs font-semibold ${running > 0 ? "text-green-400" : "text-muted-foreground"}`}>{running} running</span></div>
                  </div>
                  <div className="space-y-2">
                    {swarmAgents.length === 0 ? <p className="text-xs text-muted-foreground py-4 text-center">No agents in this swarm</p> : swarmAgents.slice(0, 4).map(agent => <AgentCard key={agent.agentId} agent={agent} />)}
                  </div>
                </GlassCard>
              );
            })}
          </div>

          {/* Widgets - fade in third */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ animationDelay: `${animDelays.widgets}ms` }}>
            <GlassCard glowColor={accentColorName} className="p-5">
              <div className="flex items-center gap-3 mb-4"><div className="p-2 rounded-xl bg-surface-1"><ListChecks className="h-5 w-5 text-muted-foreground" /></div><h3 className="font-bold text-foreground text-lg">Task Queue</h3><span className="ml-auto text-xs text-muted-foreground bg-surface-1 px-2 py-1 rounded">{stats.taskQueue.length}</span></div>
              <div className="space-y-3 max-h-64 overflow-auto pr-1">{stats.taskQueue.map(task => <TaskCard key={task.id} task={task} />)}</div>
            </GlassCard>

            <GlassCard glowColor={accentColorName} className="p-5">
              <div className="flex items-center gap-3 mb-4"><div className="p-2 rounded-xl bg-surface-1"><GitCommit className="h-5 w-5 text-muted-foreground" /></div><h3 className="font-bold text-foreground text-lg">Recent Commits</h3></div>
              <div className="space-y-3 max-h-64 overflow-auto pr-1">
                {stats.commits.map(commit => (
                  <div key={commit.id} className="group flex items-start gap-3 p-3 rounded-xl bg-surface-1/50 hover:bg-surface-1 transition-all duration-200 border border-transparent hover:border-primary/20">
                    <div className="mt-0.5 p-1.5 rounded-lg bg-green-500/10"><GitPullRequest className="h-4 w-4 text-green-400" /></div>
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium text-foreground truncate">{commit.message}</p><div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground"><span className="font-medium">{commit.author}</span><span>·</span><code className="font-mono bg-surface-2 px-1.5 py-0.5 rounded">{commit.hash.slice(0, 7)}</code><span>·</span><span>{formatTimeAgo(commit.timestamp)}</span></div></div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard glowColor={accentColorName} className="p-5">
              <div className="flex items-center gap-3 mb-6"><div className="p-2 rounded-xl bg-surface-1"><Gauge className="h-5 w-5 text-muted-foreground" /></div><h3 className="font-bold text-foreground text-lg">Resources</h3></div>
              <div className="flex justify-around">
                <div className="flex flex-col items-center gap-2"><ArcGauge value={stats.cpuUsage} label="CPU" color={stats.cpuUsage > 70 ? "red" : stats.cpuUsage > 40 ? "yellow" : "green"} size={70} /><span className="text-xs font-medium text-muted-foreground flex items-center gap-1"><CpuIcon className="h-3 w-3" /> CPU</span></div>
                <div className="flex flex-col items-center gap-2"><ArcGauge value={stats.memoryUsage} label="Memory" color={stats.memoryUsage > 70 ? "red" : stats.memoryUsage > 40 ? "yellow" : "purple"} size={70} /><span className="text-xs font-medium text-muted-foreground flex items-center gap-1"><HardDrive className="h-3 w-3" /> Memory</span></div>
                <div className="flex flex-col items-center gap-2"><ArcGauge value={stats.apiRate} label="API" color={stats.apiRate > 80 ? "red" : stats.apiRate > 50 ? "yellow" : "blue"} size={70} /><span className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Zap className="h-3 w-3" /> API Rate</span></div>
              </div>
            </GlassCard>
          </div>

          {/* Agents & Activity - fade in fourth */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ animationDelay: `${animDelays.agents}ms` }}>
            <GlassCard glowColor={accentColorName} className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3"><div className="p-2 rounded-xl bg-surface-1"><Users className="h-5 w-5 text-muted-foreground" /></div><h3 className="font-bold text-foreground text-lg">All Agents</h3></div>
                <div className="flex items-center gap-3 text-xs"><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" /><span className="text-green-400 font-semibold">{runningAgents}</span><span className="text-muted-foreground">running</span></span><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-muted-foreground" /><span className="text-muted-foreground font-semibold">{idleAgents}</span><span className="text-muted-foreground">idle</span></span></div>
              </div>
              <div className="space-y-2 max-h-72 overflow-auto pr-1">
                {projectAgents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center"><div className="p-4 rounded-2xl bg-surface-1 mb-3"><Users className="h-8 w-8 text-muted-foreground" /></div><p className="text-sm text-muted-foreground mb-3">No agents in this project</p><button type="button" className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90 transition-colors"><Plus className="h-3 w-3" /> Create Agent</button></div>
                ) : projectAgents.map(agent => <AgentCard key={agent.agentId} agent={agent} />)}
              </div>
            </GlassCard>

            <GlassCard glowColor={accentColorName} className="p-5">
              <div className="flex items-center gap-3 mb-4"><div className="p-2 rounded-xl bg-surface-1"><Flame className="h-5 w-5 text-muted-foreground" /></div><h3 className="font-bold text-foreground text-lg">Activity Feed</h3></div>
              <div className="space-y-1 max-h-72 overflow-auto pr-1">{stats.recentActivity.length === 0 ? <p className="text-sm text-muted-foreground py-8 text-center">No recent activity</p> : stats.recentActivity.map(activity => <ActivityItem key={activity.id} activity={activity} />)}</div>
            </GlassCard>
          </div>

          <GlassCard glowColor={accentColorName} className="p-6">
            <div className="flex items-center gap-3 mb-5"><div className="p-2 rounded-xl bg-surface-1"><Trophy className="h-5 w-5 text-yellow-400" /></div><h3 className="font-bold text-foreground text-lg">Achievements</h3><span className="ml-auto text-xs text-muted-foreground bg-surface-1 px-2 py-1 rounded">{stats.achievements.length}</span></div>
            <div className="flex flex-wrap gap-3">{stats.achievements.map((achievement, i) => <AchievementBadge key={i} achievement={achievement} color={["blue", "purple", "orange", "green"][i % 4]} />)}</div>
          </GlassCard>
        </div>
      )}

      {showNotifications && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowNotifications(false)} />
          <div className="relative z-10 mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-surface-1/95 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><h3 className="font-bold text-lg text-foreground">Notifications</h3><button type="button" onClick={() => setShowNotifications(false)} className="rounded-lg p-1.5 hover:bg-surface-2 transition-colors"><X className="h-5 w-5" /></button></div>
            <div className="max-h-96 overflow-auto p-4">
              {stats.notifications.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No notifications</p> : (
                <div className="space-y-3">
                  {stats.notifications.map(notif => (
                    <div key={notif.id} className={`flex items-start gap-3 rounded-xl border p-4 transition-all duration-200 hover:scale-[1.01] ${getNotificationColor(notif.type)}`}>
                      {notif.type === "error" ? <AlertCircle className="h-5 w-5" /> : notif.type === "warning" ? <AlertCircle className="h-5 w-5" /> : notif.type === "success" ? <CheckCircle className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                      <div className="flex-1"><p className="text-sm font-medium text-foreground">{notif.message}</p><p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(notif.timestamp)}</p></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
          <div className="relative z-10 mx-4 w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-surface-1/95 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><h3 className="font-bold text-lg text-foreground">Project Settings</h3><button type="button" onClick={() => setShowSettings(false)} className="rounded-lg p-1.5 hover:bg-surface-2 transition-colors"><X className="h-5 w-5" /></button></div>
            <div className="p-5 space-y-5">
              <div><label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Project Name</label><input type="text" defaultValue={project.name} className="w-full rounded-xl border border-border/60 bg-surface-2/50 backdrop-blur-sm px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" /></div>
              <div><label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Agent Templates</label><select className="w-full rounded-xl border border-border/60 bg-surface-2/50 backdrop-blur-sm px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"><option>Default</option><option>Research Agent</option><option>Development Agent</option><option>Testing Agent</option></select></div>
              <div><label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Environment Variables</label><textarea rows={4} placeholder="KEY=value" className="w-full rounded-xl border border-border/60 bg-surface-2/50 backdrop-blur-sm px-4 py-3 text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none" /></div>
              <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setShowSettings(false)} className="rounded-xl border border-border/60 bg-surface-2/50 backdrop-blur-sm px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-3 transition-all">Cancel</button><button type="button" onClick={() => setShowSettings(false)} className="rounded-xl bg-gradient-to-r from-primary to-primary/80 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:scale-105 transition-all">Save Changes</button></div>
            </div>
          </div>
        </div>
      )}

      {/* Command Palette */}
      {showCommandPalette && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCommandPalette(false)} />
          <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-surface-1/95 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <SearchIcon className="h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search commands, agents, tasks..."
                value={commandSearch}
                onChange={(e) => setCommandSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                autoFocus
              />
              <kbd className="hidden rounded-md bg-surface-2 px-2 py-0.5 text-xs text-muted-foreground sm:inline-flex">ESC</kbd>
            </div>
            <div className="max-h-80 overflow-auto p-2">
              {commands.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <XCircle className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No results found</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {commands.map((cmd, idx) => (
                    <button
                      key={cmd.id}
                      type="button"
                      onClick={() => { cmd.action(); setShowCommandPalette(false); setCommandSearch(""); }}
                      className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                        idx === selectedIndex ? "bg-primary/10 border border-primary/30" : "hover:bg-surface-2"
                      }`}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2">
                        <cmd.icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="flex-1 text-sm text-foreground">{cmd.label}</span>
                      {idx === selectedIndex && <kbd className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted-foreground">↵</kbd>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-white/10 px-4 py-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1"><kbd className="rounded bg-surface-2 px-1.5 py-0.5">↑↓</kbd> Navigate</span>
                <span className="flex items-center gap-1"><kbd className="rounded bg-surface-2 px-1.5 py-0.5">↵</kbd> Select</span>
              </div>
              <span className="flex items-center gap-1"><kbd className="rounded bg-surface-2 px-1.5 py-0.5">⌘K</kbd> to open</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => setFabExpanded(!fabExpanded)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-110"
      >
        {fabExpanded ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </button>

      {/* FAB Menu */}
      {fabExpanded && (
        <div className="fixed bottom-24 right-6 z-40 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {}}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface-2/90 backdrop-blur-sm px-4 py-2.5 text-sm font-medium text-foreground shadow-lg hover:bg-surface-3 transition-all animate-in fade-in slide-in-from-bottom-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20"><Plus className="h-4 w-4 text-blue-400" /></div>
            New Agent
          </button>
          <button
            type="button"
            onClick={() => {}}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface-2/90 backdrop-blur-sm px-4 py-2.5 text-sm font-medium text-foreground shadow-lg hover:bg-surface-3 transition-all animate-in fade-in slide-in-from-bottom-2"
            style={{ animationDelay: "50ms" }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20"><ListChecks className="h-4 w-4 text-green-400" /></div>
            New Task
          </button>
          <button
            type="button"
            onClick={() => {}}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface-2/90 backdrop-blur-sm px-4 py-2.5 text-sm font-medium text-foreground shadow-lg hover:bg-surface-3 transition-all animate-in fade-in slide-in-from-bottom-2"
            style={{ animationDelay: "100ms" }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20"><Rocket className="h-4 w-4 text-purple-400" /></div>
            Quick Action
          </button>
        </div>
      )}
    </div>
  );
};
