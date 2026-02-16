"use client";

import { useMemo } from "react";
import type { AgentState } from "@/features/agents/state/store";
import { Activity, Bot, CheckCircle2, AlertCircle, Clock } from "lucide-react";

export type ActivityEvent = {
  id: string;
  type: "started" | "completed" | "error" | "heartbeat" | "message";
  agentId: string;
  agentName: string;
  project?: string;
  message: string;
  timestamp: number;
};

type GlobalActivityFeedProps = {
  agents: AgentState[];
  maxEvents?: number;
};

export const GlobalActivityFeed = ({ agents, maxEvents = 20 }: GlobalActivityFeedProps) => {
  const events = useMemo(() => {
    const allEvents: ActivityEvent[] = [];
    
    agents.forEach((agent) => {
      allEvents.push({
        id: `${agent.agentId}-heartbeat`,
        type: "heartbeat",
        agentId: agent.agentId,
        agentName: agent.name,
        project: (agent as any).project,
        message: agent.status === "running" ? "Heartbeat received" : "Last heartbeat",
        timestamp: (agent as any).lastHeartbeatAt || Date.now() - 60000,
      });

      if (agent.status === "error") {
        allEvents.push({
          id: `${agent.agentId}-error`,
          type: "error",
          agentId: agent.agentId,
          agentName: agent.name,
          project: (agent as any).project,
          message: "Agent in error state",
          timestamp: (agent as any).lastHeartbeatAt || Date.now(),
        });
      }
    });

    return allEvents
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, maxEvents);
  }, [agents, maxEvents]);

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const getEventIcon = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "started":
        return <Bot className="h-4 w-4 text-green-400" />;
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-blue-400" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case "heartbeat":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getProjectColor = (projectId?: string) => {
    switch (projectId) {
      case "blackbox5":
        return "bg-blue-500";
      case "lumelle":
        return "bg-purple-500";
      case "siso-internal":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="flex h-full flex-col rounded-lg border border-border/60 bg-card">
      <div className="flex items-center gap-2 border-b border-border/40 p-4">
        <Activity className="h-4 w-4 text-primary" />
        <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
          Activity
        </h2>
        <span className="ml-auto text-xs text-muted-foreground">
          {events.length} events
        </span>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {events.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            No recent activity
          </div>
        ) : (
          <div className="space-y-1">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 rounded-md p-2 transition hover:bg-muted/50"
              >
                <div className="mt-0.5">{getEventIcon(event.type)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {event.agentName}
                    </span>
                    {event.project && (
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${getProjectColor(event.project)}`}
                      />
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {event.message}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatTime(event.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
