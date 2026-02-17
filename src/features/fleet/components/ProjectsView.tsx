"use client";

import { useMemo, useState } from "react";
import type { AgentState } from "@/features/fleet/state/store";
import { AgentAvatar } from "./AgentAvatar";
import { X, Network, ChevronRight, ChevronDown, Bot } from "lucide-react";

type ProjectsViewProps = {
  agents: AgentState[];
  selectedAgentId: string | null;
  onSelectAgent: (agentId: string) => void;
  onOpenPipeline: () => void;
};

const PROJECTS = [
  { id: "blackbox5", name: "BlackBox5", color: "bg-blue-500" },
  { id: "lumelle", name: "Lumelle", color: "bg-purple-500" },
  { id: "siso-internal", name: "SISO Internal", color: "bg-orange-500" },
];

export const ProjectsView = ({
  agents,
  selectedAgentId,
  onSelectAgent,
  onOpenPipeline,
}: ProjectsViewProps) => {
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set(PROJECTS.map((p) => p.id))
  );

  const agentsByProject = useMemo(() => {
    const map: Record<string, AgentState[]> = {};
    PROJECTS.forEach((p) => {
      map[p.id] = agents.filter(
        (a) => (a as any).project === p.id || a.agentId.includes(p.id)
      );
    });
    // Also add agents without a project
    map["other"] = agents.filter((a) => {
      const project = (a as any).project;
      return !project || !PROJECTS.find((p) => p.id === project);
    });
    return map;
  }, [agents]);

  const toggleProject = (projectId: string) => {
    const next = new Set(expandedProjects);
    if (next.has(projectId)) {
      next.delete(projectId);
    } else {
      next.add(projectId);
    }
    setExpandedProjects(next);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
        <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-foreground">
          Projects
        </h2>
        <button
          type="button"
          onClick={onOpenPipeline}
          className="flex items-center gap-2 rounded-md border border-border bg-surface-2 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-foreground hover:bg-surface-3"
        >
          <Network className="h-3 w-3" />
          Pipeline
        </button>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto p-2">
        {PROJECTS.map((project) => {
          const projectAgents = agentsByProject[project.id] || [];
          const isExpanded = expandedProjects.has(project.id);

          return (
            <div key={project.id} className="mb-2">
              {/* Project Header */}
              <button
                type="button"
                onClick={() => toggleProject(project.id)}
                className="flex w-full items-center gap-2 rounded-md bg-surface-2 px-3 py-2 hover:bg-surface-3"
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
                <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                  {projectAgents.length}
                </span>
              </button>

              {/* Agents in Project */}
              {isExpanded && (
                <div className="ml-6 mt-1 space-y-1">
                  {projectAgents.length === 0 ? (
                    <div className="px-3 py-2 font-mono text-[10px] text-muted-foreground">
                      No agents
                    </div>
                  ) : (
                    projectAgents.map((agent) => (
                      <button
                        key={agent.agentId}
                        type="button"
                        onClick={() => onSelectAgent(agent.agentId)}
                        className={`flex w-full items-center gap-2 rounded-md px-3 py-2 hover:bg-surface-2 ${
                          selectedAgentId === agent.agentId
                            ? "bg-surface-2"
                            : ""
                        }`}
                      >
                    <AgentAvatar 
                      seed={agent.avatarSeed ?? agent.agentId}
                      name={agent.name}
                      avatarUrl={agent.avatarUrl ?? null}
                      size={24}
                    />
                        <div className="flex-1 text-left">
                          <div className="font-mono text-xs text-foreground">
                            {agent.name}
                          </div>
                          <div className="font-mono text-[10px] text-muted-foreground">
                            {agent.status}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Other/Unassigned */}
        {(agentsByProject["other"]?.length || 0) > 0 && (
          <div className="mb-2">
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
              <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                {agentsByProject["other"]?.length || 0}
              </span>
            </button>
            {expandedProjects.has("other") && (
              <div className="ml-6 mt-1 space-y-1">
                {(agentsByProject["other"] || []).map((agent) => (
                  <button
                    key={agent.agentId}
                    type="button"
                    onClick={() => onSelectAgent(agent.agentId)}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 hover:bg-surface-2 ${
                      selectedAgentId === agent.agentId ? "bg-surface-2" : ""
                    }`}
                  >
                    <AgentAvatar 
                      seed={agent.avatarSeed ?? agent.agentId}
                      name={agent.name}
                      avatarUrl={agent.avatarUrl ?? null}
                      size={24}
                    />
                    <div className="flex-1 text-left">
                      <div className="font-mono text-xs text-foreground">
                        {agent.name}
                      </div>
                      <div className="font-mono text-[10px] text-muted-foreground">
                        {agent.status}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
