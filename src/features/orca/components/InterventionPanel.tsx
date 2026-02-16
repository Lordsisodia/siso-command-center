"use client";

import { Intervention, domainColors } from "../lib/types";
import { AlertTriangle, Bot, Check, X, MessageSquare } from "lucide-react";

interface InterventionPanelProps {
  interventions: Intervention[];
  onResolve: (id: string, approved: boolean) => void;
}

export function InterventionPanel({ interventions, onResolve }: InterventionPanelProps) {
  return (
    <div className="hud-panel p-3 w-72 hud-corner-br">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Interventions
          </h3>
        </div>
        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
          {interventions.length}
        </span>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {interventions.length === 0 ? (
          <p className="text-xs text-muted-foreground">No interventions pending</p>
        ) : (
          interventions.map((intervention) => (
            <div 
              key={intervention.id} 
              className="rounded border border-amber-500/30 bg-amber-500/5 p-2.5"
            >
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">{intervention.agentName}</span>
                <span className={`ml-auto rounded px-1.5 py-0.5 text-[9px] font-medium uppercase ${
                  intervention.type === "approval_needed" ? "bg-yellow-500/20 text-yellow-400" :
                  intervention.type === "error" ? "bg-red-500/20 text-red-400" :
                  "bg-blue-500/20 text-blue-400"
                }`}>
                  {intervention.type.replace("_", " ")}
                </span>
              </div>
              
              <p className="text-xs text-foreground mb-1">{intervention.question}</p>
              <p className="text-[10px] text-muted-foreground mb-2">{intervention.context}</p>
              
              <div className="flex gap-2">
                <button
                  onClick={() => onResolve(intervention.id, true)}
                  className="flex-1 flex items-center justify-center gap-1 rounded bg-emerald-500/20 px-2 py-1 text-[10px] font-medium text-emerald-400 hover:bg-emerald-500/30"
                >
                  <Check className="w-3 h-3" />
                  Approve
                </button>
                <button
                  onClick={() => onResolve(intervention.id, false)}
                  className="flex-1 flex items-center justify-center gap-1 rounded border border-white/10 px-2 py-1 text-[10px] font-medium text-muted-foreground hover:bg-white/5"
                >
                  <X className="w-3 h-3" />
                  Deny
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
