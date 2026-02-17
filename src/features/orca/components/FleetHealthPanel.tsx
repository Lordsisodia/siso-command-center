"use client";

import { FleetHealth, Machine } from "../lib/types";
import { 
  Activity, Server, CheckCircle, AlertTriangle, 
  Wifi, WifiOff, Zap, ListChecks 
} from "lucide-react";

interface FleetHealthPanelProps {
  fleetHealth: FleetHealth;
  machines: Machine[];
}

export function FleetHealthPanel({ fleetHealth, machines }: FleetHealthPanelProps) {
  const healthColor = 
    fleetHealth.overallHealth === "healthy" ? "text-emerald-500" :
    fleetHealth.overallHealth === "degraded" ? "text-amber-500" : "text-red-500";

  const healthBg = 
    fleetHealth.overallHealth === "healthy" ? "bg-emerald-500/10 border-emerald-500/30" :
    fleetHealth.overallHealth === "degraded" ? "bg-amber-500/10 border-amber-500/30" : 
    "bg-red-500/10 border-red-500/30";

  return (
    <div className="hud-panel p-3 hud-corner-br shrink-0">
      <div className="flex items-center gap-2 mb-3">
        <Activity className={`w-4 h-4 ${healthColor}`} />
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
          Fleet Health
        </h3>
      </div>

      <div className={`p-2.5 rounded border mb-3 ${healthBg}`}>
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium uppercase ${healthColor}`}>
            {fleetHealth.overallHealth}
          </span>
          <div className="flex items-center gap-1">
            {fleetHealth.overallHealth === "healthy" && <CheckCircle className="w-4 h-4 text-emerald-500" />}
            {fleetHealth.overallHealth === "degraded" && <AlertTriangle className="w-4 h-4 text-amber-500" />}
            {fleetHealth.overallHealth === "critical" && <AlertTriangle className="w-4 h-4 text-red-500" />}
          </div>
        </div>
      </div>

      <div className="space-y-2.5 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs text-muted-foreground">Active</span>
          </div>
          <span className="text-sm font-mono text-foreground">{fleetHealth.activeAgents}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs text-muted-foreground">Offline</span>
          </div>
          <span className="text-sm font-mono text-foreground">{fleetHealth.offlineAgents}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs text-muted-foreground">Interventions</span>
          </div>
          <span className="text-sm font-mono text-foreground">
            {fleetHealth.interventionsRequired}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListChecks className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-xs text-muted-foreground">Tasks Today</span>
          </div>
          <span className="text-sm font-mono text-foreground">{fleetHealth.tasksCompletedToday}</span>
        </div>
      </div>

      <div className="border-t border-white/5 pt-2">
        <div className="text-xs text-muted-foreground mb-2">Machines</div>
        <div className="space-y-1.5">
          {machines.slice(0, 3).map((machine) => (
            <div key={machine.id} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {machine.isOnline ? (
                  <Wifi className="w-3 h-3 text-emerald-500" />
                ) : (
                  <WifiOff className="w-3 h-3 text-gray-500" />
                )}
                <span className="text-foreground truncate max-w-[100px]">{machine.name}</span>
              </div>
              <span className="text-muted-foreground">{machine.lastSeen}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
