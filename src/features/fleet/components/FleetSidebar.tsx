"use client";

import type { AgentState, FocusFilter } from "@/features/fleet/state/store";
import { useLayoutEffect, useMemo, useRef, useState, useEffect } from "react";
import { AgentAvatar } from "./AgentAvatar";
import { EmptyStatePanel } from "./EmptyStatePanel";
import { ChevronRight, ChevronDown, Bot, Layers, List, Star, StarOff, Play, Square, RotateCcw, Copy, MoreHorizontal, Check, ChevronsUpDown, ChevronsDownUp } from "lucide-react";

type FleetSidebarProps = {
  agents: AgentState[];
  selectedAgentId: string | null;
  filter: FocusFilter;
  onFilterChange: (next: FocusFilter) => void;
  onSelectAgent: (agentId: string) => void;
  onOpenPipeline?: () => void;
  onProjectClick?: (projectId: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onStartAgent?: (agentId: string) => void;
  onStopAgent?: (agentId: string) => void;
  onRestartAgent?: (agentId: string) => void;
};

const FILTER_OPTIONS: Array<{ value: FocusFilter; label: string; testId: string }> = [
  { value: "all", label: "All", testId: "fleet-filter-all" },
  { value: "running", label: "Running", testId: "fleet-filter-running" },
  { value: "idle", label: "Idle", testId: "fleet-filter-idle" },
];

const PROJECTS = [
  { id: "blackbox5", name: "BlackBox5", color: "bg-blue-500", colorClass: "bg-blue-500/10 border-blue-500/30" },
  { id: "lumelle", name: "Lumelle", color: "bg-purple-500", colorClass: "bg-purple-500/10 border-purple-500/30" },
  { id: "siso-internal", name: "SISO Internal", color: "bg-orange-500", colorClass: "bg-orange-500/10 border-orange-500/30" },
];

const statusLabel: Record<AgentState["status"], string> = {
  idle: "Idle",
  running: "Running",
  error: "Error",
};

const statusDotClassName: Record<AgentState["status"], string> = {
  idle: "bg-muted-foreground",
  running: "bg-green-500 animate-pulse",
  error: "bg-destructive",
};

const statusClassName: Record<AgentState["status"], string> = {
  idle: "border border-border/70 bg-muted text-muted-foreground",
  running: "border border-primary/30 bg-primary/15 text-foreground",
  error: "border border-destructive/35 bg-destructive/12 text-destructive",
};

export const FleetSidebar = ({
  agents,
  selectedAgentId,
  filter,
  onFilterChange,
  onSelectAgent,
  onOpenPipeline,
  onProjectClick,
  collapsed = false,
  onToggleCollapse,
  onStartAgent,
  onStopAgent,
  onRestartAgent,
}: FleetSidebarProps) => {
  const [viewMode, setViewMode] = useState<"projects" | "agents">("projects");
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set(PROJECTS.map((p) => p.id))
  );
  const [pinnedAgents, setPinnedAgents] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    const saved = localStorage.getItem("fleet-pinned-agents");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [keyboardIndex, setKeyboardIndex] = useState(-1);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; agentId: string } | null>(null);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());
  const rowRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const previousTopByAgentIdRef = useRef<Map<string, number>>(new Map());
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Persist pinned agents to localStorage
  useEffect(() => {
    localStorage.setItem("fleet-pinned-agents", JSON.stringify([...pinnedAgents]));
  }, [pinnedAgents]);

  // Persist collapsed state to localStorage
  useEffect(() => {
    if (onToggleCollapse) {
      localStorage.setItem("fleet-sidebar-collapsed", JSON.stringify(collapsed));
    }
  }, [collapsed, onToggleCollapse]);

  // Persist filter to localStorage
  useEffect(() => {
    localStorage.setItem("fleet-filter", filter);
  }, [filter]);

  // Load filter from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("fleet-filter") as FocusFilter | null;
    if (saved && ["all", "running", "idle"].includes(saved)) {
      onFilterChange(saved);
    }
  }, []);

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (collapsed) return;
      
      const allAgentIds = getAllAgentIds();
      if (allAgentIds.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setKeyboardIndex((prev) => (prev < allAgentIds.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setKeyboardIndex((prev) => (prev > 0 ? prev - 1 : allAgentIds.length - 1));
      } else if (e.key === "Enter" && keyboardIndex >= 0) {
        e.preventDefault();
        onSelectAgent(allAgentIds[keyboardIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [collapsed, keyboardIndex, onSelectAgent]);

  // Scroll to keyboard-selected agent
  useLayoutEffect(() => {
    const allAgentIds = getAllAgentIds();
    if (keyboardIndex < 0 || keyboardIndex >= allAgentIds.length) return;
    
    const agentId = allAgentIds[keyboardIndex];
    const node = rowRefs.current.get(agentId);
    if (node) {
      node.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [keyboardIndex]);

  const expandAll = () => {
    setExpandedProjects(new Set([...PROJECTS.map((p) => p.id), "other"]));
  };

  const collapseAll = () => {
    setExpandedProjects(new Set());
  };

  const toggleAgentSelection = (agentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedAgents);
    if (next.has(agentId)) {
      next.delete(agentId);
    } else {
      next.add(agentId);
    }
    setSelectedAgents(next);
  };

  const handleContextMenu = (e: React.MouseEvent, agentId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, agentId });
  };

  const copyAgentId = (agentId: string) => {
    navigator.clipboard.writeText(agentId);
    setContextMenu(null);
  };

  const getAllAgentIds = () => {
    if (filter !== "all") {
      return filteredAgents.map((a) => a.agentId);
    }
    if (viewMode === "projects") {
      const ids: string[] = [];
      PROJECTS.forEach((p) => {
        const projectAgents = agentsByProject[p.id] || [];
        if (expandedProjects.has(p.id)) {
          ids.push(...projectAgents.map((a) => a.agentId));
        }
      });
      if (expandedProjects.has("other")) {
        ids.push(...(agentsByProject["other"] || []).map((a) => a.agentId));
      }
      return ids;
    }
    return filteredAgents.map((a) => a.agentId);
  };

  const togglePin = (agentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(pinnedAgents);
    if (next.has(agentId)) {
      next.delete(agentId);
    } else {
      next.add(agentId);
    }
    setPinnedAgents(next);
  };

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

  const filteredAgents = useMemo(() => {
    if (filter === "all") return agents;
    return agents.filter((a) => a.status === filter);
  }, [agents, filter]);

  const toggleProject = (projectId: string) => {
    const next = new Set(expandedProjects);
    if (next.has(projectId)) {
      next.delete(projectId);
    } else {
      next.add(projectId);
      if (onProjectClick) {
        onProjectClick(projectId);
      }
    }
    setExpandedProjects(next);
  };

  const agentOrderKey = useMemo(() => filteredAgents.map((agent) => agent.agentId).join("|"), [filteredAgents]);

  useLayoutEffect(() => {
    const scroller = scrollContainerRef.current;
    if (!scroller) return;
    const scrollerRect = scroller.getBoundingClientRect();

    const getTopInScrollContent = (node: HTMLElement) =>
      node.getBoundingClientRect().top - scrollerRect.top + scroller.scrollTop;

    const nextTopByAgentId = new Map<string, number>();
    const agentIds = agentOrderKey.length === 0 ? [] : agentOrderKey.split("|");
    for (const agentId of agentIds) {
      const node = rowRefs.current.get(agentId);
      if (!node) continue;
      const nextTop = getTopInScrollContent(node);
      nextTopByAgentId.set(agentId, nextTop);
      const previousTop = previousTopByAgentIdRef.current.get(agentId);
      if (typeof previousTop !== "number") continue;
      const deltaY = previousTop - nextTop;
      if (Math.abs(deltaY) < 0.5) continue;
      if (typeof node.animate !== "function") continue;
      node.animate(
        [{ transform: `translateY(${deltaY}px)` }, { transform: "translateY(0px)" }],
        { duration: 300, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
      );
    }
    previousTopByAgentIdRef.current = nextTopByAgentId;
  }, [agentOrderKey]);

  const renderAgentCard = (agent: AgentState, selected: boolean, keyboardSelected: boolean) => {
    const avatarSeed = agent.avatarSeed ?? agent.agentId;
    const agentProject = PROJECTS.find(p => 
      (agent as any).project === p.id || agent.agentId.includes(p.id)
    );
    const isPinned = pinnedAgents.has(agent.agentId);
    const isSelectedForMulti = selectedAgents.has(agent.agentId);
    const currentTask = agent.latestPreview || agent.draft;

    const handleStatusToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (agent.status === "running") {
        onStopAgent?.(agent.agentId);
      } else if (agent.status === "idle") {
        onStartAgent?.(agent.agentId);
      }
    };

    return (
      <button
        key={agent.agentId}
        ref={(node) => {
          if (node) {
            rowRefs.current.set(agent.agentId, node);
            return;
          }
          rowRefs.current.delete(agent.agentId);
        }}
        type="button"
        data-testid={`fleet-agent-row-${agent.agentId}`}
        className={`group relative flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left transition ${
          selected
            ? "border-ring/45 bg-surface-2"
            : keyboardSelected
            ? "border-primary/50 bg-primary/10"
            : "border-border/70 bg-surface-1 hover:border-border hover:bg-surface-2"
        }`}
        onClick={() => onSelectAgent(agent.agentId)}
        onContextMenu={(e) => handleContextMenu(e, agent.agentId)}
      >
        {multiSelectMode && (
          <div
            onClick={(e) => toggleAgentSelection(agent.agentId, e)}
            className={`flex h-4 w-4 items-center justify-center rounded border ${
              isSelectedForMulti
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border"
            }`}
          >
            {isSelectedForMulti && <Check className="h-3 w-3" />}
          </div>
        )}
        <AgentAvatar
          seed={avatarSeed}
          name={agent.name}
          avatarUrl={agent.avatarUrl ?? null}
          size={28}
          isSelected={selected}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${statusDotClassName[agent.status]}`} />
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.13em] text-foreground">
              {agent.name}
            </p>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleStatusToggle}
              className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] transition hover:scale-105 ${statusClassName[agent.status]}`}
              title={agent.status === "running" ? "Click to stop" : "Click to start"}
            >
              {statusLabel[agent.status]}
            </button>
            {agentProject && (
              <span className={`rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] ${agentProject.color} text-white`}>
                {agentProject.name}
              </span>
            )}
          </div>
          {currentTask && currentTask.length > 0 && (
            <div className="mt-1.5 truncate font-mono text-[9px] text-muted-foreground">
              {currentTask.slice(0, 50)}{currentTask.length > 50 ? "..." : ""}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => togglePin(agent.agentId, e)}
          className={`opacity-0 transition group-hover:opacity-100 ${
            isPinned ? "text-yellow-500 opacity-100" : "text-muted-foreground hover:text-yellow-500"
          }`}
          title={isPinned ? "Unpin agent" : "Pin agent"}
        >
          {isPinned ? <Star className="h-3.5 w-3.5 fill-current" /> : <StarOff className="h-3.5 w-3.5" />}
        </button>
      </button>
    );
  };

  return (
    <aside
      className={`glass-panel fade-up-delay relative flex h-full flex-col gap-2 bg-sidebar p-2 xl:border-r xl:border-sidebar-border ${
        collapsed ? "w-16 min-w-16" : "w-full min-w-72 xl:max-w-[320px]"
      }`}
      data-testid="fleet-sidebar"
    >
      {onToggleCollapse && (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="mb-1 flex items-center justify-center rounded-md border border-border/40 bg-surface-1 p-1.5 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronRight className="h-4 w-4 rotate-180" />}
        </button>
      )}
      
      {!collapsed && (
        <div className="flex flex-col gap-2 px-1">
          <div className="flex items-center gap-1 rounded-md border border-border/70 bg-surface-1 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("projects")}
              className={`flex flex-1 items-center justify-center gap-1 rounded px-2 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider transition ${
                viewMode === "projects"
                  ? "bg-surface-2 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="h-3 w-3" />
              Projects
            </button>
            <button
              type="button"
              onClick={() => setViewMode("agents")}
              className={`flex flex-1 items-center justify-center gap-1 rounded px-2 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider transition ${
                viewMode === "agents"
                  ? "bg-surface-2 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="h-3 w-3" />
              Agents
            </button>
          </div>
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => setMultiSelectMode(!multiSelectMode)}
              className={`flex items-center gap-1 rounded px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider transition ${
                multiSelectMode
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Multi-select mode"
            >
              <Check className="h-3 w-3" />
              Select
            </button>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={collapseAll}
                className="rounded p-1 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                title="Collapse all"
              >
                <ChevronsUpDown className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={expandAll}
                className="rounded p-1 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                title="Expand all"
              >
                <ChevronsDownUp className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {collapsed ? (
        <div className="flex flex-col items-center gap-2 overflow-auto">
          {agents.map((agent) => {
            const selected = selectedAgentId === agent.agentId;
            return (
              <button
                key={agent.agentId}
                type="button"
                onClick={() => onSelectAgent(agent.agentId)}
                className={`group relative flex items-center justify-center rounded-md border p-1 transition ${
                  selected
                    ? "border-ring/45 bg-surface-2"
                    : "border-transparent hover:border-border/70 hover:bg-surface-1"
                }`}
                title={agent.name}
              >
                <AgentAvatar
                  seed={agent.avatarSeed ?? agent.agentId}
                  name={agent.name}
                  avatarUrl={agent.avatarUrl ?? null}
                  size={32}
                  isSelected={selected}
                />
                <span className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-sidebar ${statusDotClassName[agent.status]}`} />
              </button>
            );
          })}
        </div>
      ) : (
      <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-auto">
        {agents.length === 0 ? (
          <EmptyStatePanel title="No agents available." compact className="p-3 text-xs" />
        ) : (
          <>
            {pinnedAgents.size > 0 && (
              <div className="mb-2">
                <div className="flex items-center gap-2 px-3 py-1.5">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Pinned
                  </span>
                </div>
                <div className="space-y-1 px-1">
                  {[...pinnedAgents]
                    .map((id) => agents.find((a) => a.agentId === id))
                    .filter(Boolean)
                    .map((agent) => {
                      const selected = selectedAgentId === agent!.agentId;
                      const keyboardSelected = getAllAgentIds()[keyboardIndex] === agent!.agentId;
                      return renderAgentCard(agent!, selected, keyboardSelected);
                    })}
                </div>
              </div>
            )}
            {viewMode === "projects" ? (
          <div className="flex flex-col gap-2">
            {PROJECTS.map((project) => {
              const projectAgents = (agentsByProject[project.id] || []).filter(
                (a) => filter === "all" || a.status === filter
              );
              const isExpanded = expandedProjects.has(project.id);
              const runningCount = (agentsByProject[project.id] || []).filter((a) => a.status === "running").length;
              const totalCount = (agentsByProject[project.id] || []).length;

              if (projectAgents.length === 0 && filter !== "all") return null;

              return (
                <div key={project.id}>
                  <button
                    type="button"
                    onClick={() => toggleProject(project.id)}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 hover:bg-surface-2`}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={`h-2 w-2 rounded-full ${project.color}`} />
                    <span className="font-mono text-xs font-medium text-foreground">
                      {project.name}
                    </span>
                    <span className="ml-auto flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                      {runningCount > 0 && <span className="text-green-500">{runningCount}</span>}
                      <span>/</span>
                      <span>{totalCount}</span>
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-1">
                      {projectAgents.map((agent) => {
                        const selected = selectedAgentId === agent.agentId;
                        const keyboardSelected = getAllAgentIds()[keyboardIndex] === agent.agentId;
                        return renderAgentCard(agent, selected, keyboardSelected);
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {(agentsByProject["other"]?.length || 0) > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => toggleProject("other")}
                  className="flex w-full items-center gap-2 rounded-md bg-surface-2 px-3 py-2 hover:bg-surface-3"
                >
                  {expandedProjects.has("other") ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Bot className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono text-xs font-medium text-foreground">
                    Unassigned
                  </span>
                  <span className="ml-auto flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                    {((agentsByProject["other"] || []).filter(a => a.status === "running").length) > 0 && (
                      <span className="text-green-500">
                        {(agentsByProject["other"] || []).filter(a => a.status === "running").length}
                      </span>
                    )}
                    <span>/</span>
                    <span>{agentsByProject["other"]?.length || 0}</span>
                  </span>
                </button>
                {expandedProjects.has("other") && (
                  <div className="ml-4 mt-1 space-y-1">
                    {(agentsByProject["other"] || [])
                      .filter((a) => filter === "all" || a.status === filter)
                      .map((agent) => {
                        const selected = selectedAgentId === agent.agentId;
                        const keyboardSelected = getAllAgentIds()[keyboardIndex] === agent.agentId;
                        return renderAgentCard(agent, selected, keyboardSelected);
                      })}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredAgents.map((agent) => {
              const selected = selectedAgentId === agent.agentId;
              const keyboardSelected = getAllAgentIds()[keyboardIndex] === agent.agentId;
              return renderAgentCard(agent, selected, keyboardSelected);
            })}
          </div>
        )}
          </>
        )}
      </div>
      )}

      {contextMenu && (
        <div
          className="fixed z-50 min-w-[160px] overflow-hidden rounded-md border border-border bg-popover shadow-lg"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-surface-2"
            onClick={() => {
              const agent = agents.find((a) => a.agentId === contextMenu.agentId);
              if (agent?.status === "running") {
                onStopAgent?.(contextMenu.agentId);
              } else {
                onStartAgent?.(contextMenu.agentId);
              }
              setContextMenu(null);
            }}
          >
            {agents.find((a) => a.agentId === contextMenu.agentId)?.status === "running" ? (
              <>
                <Square className="h-3.5 w-3.5" />
                Stop Agent
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                Start Agent
              </>
            )}
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-surface-2"
            onClick={() => {
              onRestartAgent?.(contextMenu.agentId);
              setContextMenu(null);
            }}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restart Agent
          </button>
          <div className="my-1 border-t border-border" />
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-surface-2"
            onClick={() => {
              const isPinned = pinnedAgents.has(contextMenu.agentId);
              if (!isPinned) {
                setPinnedAgents(new Set([...pinnedAgents, contextMenu.agentId]));
              } else {
                const next = new Set(pinnedAgents);
                next.delete(contextMenu.agentId);
                setPinnedAgents(next);
              }
              setContextMenu(null);
            }}
          >
            {pinnedAgents.has(contextMenu.agentId) ? (
              <>
                <StarOff className="h-3.5 w-3.5" />
                Unpin Agent
              </>
            ) : (
              <>
                <Star className="h-3.5 w-3.5" />
                Pin Agent
              </>
            )}
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-surface-2"
            onClick={() => copyAgentId(contextMenu.agentId)}
          >
            <Copy className="h-3.5 w-3.5" />
            Copy Agent ID
          </button>
        </div>
      )}
    </aside>
  );
};
