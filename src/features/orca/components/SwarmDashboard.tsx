"use client";

import { Swarm, domainColors, AgentDomain } from "../lib/types";
import { Zap, Bot, Users } from "lucide-react";

interface SwarmDashboardProps {
  swarms: Swarm[];
  onSwarmClick?: (swarm: Swarm) => void;
}

export function SwarmDashboard({ swarms, onSwarmClick }: SwarmDashboardProps) {
  const activeSwarms = swarms.filter(s => s.status === "active");

  return (
    <div className="hud-panel p-3 w-72 hud-corner-br">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Active Swarms
          </h3>
        </div>
        <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-400">
          {activeSwarms.length}
        </span>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {activeSwarms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <Users className="w-8 h-8 text-muted-foreground mb-2 opacity-50" />
            <p className="text-xs text-muted-foreground">No active swarms</p>
            <p className="text-[10px] text-muted-foreground mt-1">Select multiple agents to form a swarm</p>
          </div>
        ) : (
          activeSwarms.map((swarm) => (
            <button
              key={swarm.id}
              onClick={() => onSwarmClick?.(swarm)}
              className="w-full rounded border border-purple-500/30 bg-purple-500/5 p-3 text-left hover:bg-purple-500/10 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{swarm.name}</span>
                <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[9px] font-medium text-purple-400 uppercase">
                  {swarm.status}
                </span>
              </div>
              
              <p className="text-xs text-muted-foreground mb-3">{swarm.objective}</p>
              
              <div className="mb-2">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>{swarm.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-purple-500" 
                    style={{ width: `${swarm.progress}%` }} 
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-1 flex-wrap">
                {swarm.agents.slice(0, 4).map((agent, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-1 rounded bg-white/5 px-1.5 py-0.5"
                  >
                    <Bot className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">{agent}</span>
                  </div>
                ))}
                {swarm.agents.length > 4 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{swarm.agents.length - 4}
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
