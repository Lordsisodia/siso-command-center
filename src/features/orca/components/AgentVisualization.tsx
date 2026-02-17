"use client";

import { useRef, useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ClawAgent, Swarm, domainColors, statusColors, domainLabels,
  AgentDomain, AgentStatus
} from "../lib/types";
import { ZoomIn, ZoomOut, Maximize2, Bot } from "lucide-react";

interface AgentVisualizationProps {
  agents: ClawAgent[];
  swarms: Swarm[];
  onAgentClick: (agent: ClawAgent) => void;
  selectedAgentId?: string | null;
  filter: "all" | "active" | "interventions";
}

interface AgentPosition {
  agent: ClawAgent;
  x: number;
  y: number;
  size: number;
}

export function AgentVisualization({ 
  agents, 
  swarms, 
  onAgentClick, 
  selectedAgentId,
  filter 
}: AgentVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 2;

  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    
    const observer = new ResizeObserver(updateDimensions);
    observer.observe(containerRef.current);
    updateDimensions();
    
    return () => observer.disconnect();
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z * delta)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInteractive = target.closest("[data-interactive]") || 
                          target.closest("button") || 
                          target.closest("[data-agent]");
    if (e.button === 0 && !isInteractive) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => setIsPanning(false), []);
  const handleMouseLeave = useCallback(() => setIsPanning(false), []);

  const resetView = useCallback(() => {
    setPan({ x: 0, y: 0 });
    setZoom(1);
  }, []);

  const filteredAgents = useMemo(() => {
    switch (filter) {
      case "interventions":
        return agents.filter(a => a.interventionRequired);
      case "active":
        return agents.filter(a => a.status === "active");
      default:
        return agents;
    }
  }, [agents, filter]);

  // Responsive orbits based on container size
  const orbitScale = useMemo(() => {
    const minDim = Math.min(dimensions.width, dimensions.height);
    if (minDim <= 0) return 1;
    const maxRadius = (minDim / 2) - 80;
    return Math.min(maxRadius / 440, 1);
  }, [dimensions]);

  const agentPositions = useMemo<AgentPosition[]>(() => {
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    
    const orbits: { domain: AgentDomain; radius: number }[] = [
      { domain: "communications", radius: 130 * orbitScale },
      { domain: "productivity", radius: 200 * orbitScale },
      { domain: "research", radius: 280 * orbitScale },
      { domain: "development", radius: 360 * orbitScale },
      { domain: "automation", radius: 440 * orbitScale },
    ];
    
    const result: AgentPosition[] = [];
    
    orbits.forEach(({ domain, radius }) => {
      const domainAgents = filteredAgents.filter(a => a.domain === domain);
      const count = domainAgents.length;
      if (count === 0) return;
      
      const angleStep = (Math.PI * 2) / Math.max(count, 1);
      const startAngle = -Math.PI / 2;
      
      domainAgents.forEach((agent, index) => {
        const angle = startAngle + index * angleStep;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        result.push({
          agent,
          x,
          y,
          size: 40 + (agent.activityLevel / 100) * 20,
        });
      });
    });
    
    return result;
  }, [filteredAgents, dimensions, orbitScale]);

  const getStatusGlow = (status: AgentStatus) => {
    if (status === "active") return "shadow-[0_0_15px_rgba(34,197,94,0.4)]";
    if (status === "intervention_required") return "shadow-[0_0_20px_rgba(245,158,11,0.7)] animate-pulse";
    return "";
  };

  const orbits = [130, 200, 280, 360, 440].map(r => r * orbitScale);

  return (
    <div 
      ref={containerRef}
      className="relative h-full w-full overflow-hidden loop-canvas-bg"
      style={{ cursor: isPanning ? "grabbing" : "grab" }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: `${dimensions.width / 2}px ${dimensions.height / 2}px`,
        }}
        className="absolute inset-0"
      >
        <svg className="absolute inset-0 h-full w-full pointer-events-none">
          <defs>
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(239,68,68,0.15)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          
          <circle 
            cx={dimensions.width / 2} 
            cy={dimensions.height / 2} 
            r="60"
            fill="url(#centerGlow)"
          />

          {orbits.map((orbit, i) => {
            const domains: AgentDomain[] = ["communications", "productivity", "research", "development", "automation"];
            const domain = domains[i];
            return (
              <g key={i}>
                <circle
                  cx={dimensions.width / 2}
                  cy={dimensions.height / 2}
                  r={orbit}
                  fill="none"
                  stroke={`${domainColors[domain]}55`}
                  strokeWidth="1.5"
                  strokeDasharray="6 10"
                />
                <text
                  x={dimensions.width / 2 + orbit + 10}
                  y={dimensions.height / 2 - 5}
                  fill={`${domainColors[domain]}aa`}
                  fontSize="10"
                  fontFamily="monospace"
                  className="uppercase"
                >
                  {domainLabels[domain]}
                </text>
              </g>
            );
          })}

          {swarms.filter(s => s.status === "active").map(swarm => {
            const swarmAgentPositions = agentPositions.filter(
              ap => swarm.agents.includes(ap.agent.id)
            );
            if (swarmAgentPositions.length < 2) return null;

            return swarmAgentPositions.map((pos, i) => {
              const nextPos = swarmAgentPositions[(i + 1) % swarmAgentPositions.length];
              return (
                <line
                  key={`swarm-${swarm.id}-${i}`}
                  x1={pos.x}
                  y1={pos.y}
                  x2={nextPos.x}
                  y2={nextPos.y}
                  stroke="rgba(139,92,246,0.5)"
                  strokeWidth="2"
                  strokeDasharray="5 5"
                />
              );
            });
          })}
        </svg>

        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border border-red-500/30 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-red-500 font-mono">
                  {agents.filter(a => a.status === "active").length}
                </div>
                <div className="text-[8px] uppercase tracking-wider text-muted-foreground">
                  Active
                </div>
              </div>
            </div>
            <div className="absolute -inset-4 rounded-full border border-dashed border-red-500/40 animate-spin" style={{ animationDuration: "15s" }} />
          </div>
        </div>

        <AnimatePresence>
          {agentPositions.map((pos) => {
            const isSelected = selectedAgentId === pos.agent.id;
            const isIntervention = pos.agent.interventionRequired;
            const isActive = pos.agent.status === "active";
            
            return (
              <motion.button
                key={pos.agent.id}
                data-agent={pos.agent.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: isSelected ? 1.2 : 1,
                  y: isActive ? [0, -4, 0] : 0,
                }}
                exit={{ opacity: 0, scale: 0 }}
                whileHover={{ scale: 1.1 }}
                transition={isActive ? {
                  y: { duration: 0.8 + (1 - pos.agent.activityLevel / 100) * 0.6, repeat: Infinity }
                } : {}}
                className={`absolute flex flex-col items-center justify-center rounded-full cursor-pointer transition-all ${getStatusGlow(pos.agent.status)}`}
                style={{
                  left: pos.x - pos.size / 2,
                  top: pos.y - pos.size / 2,
                  width: pos.size,
                  height: pos.size,
                  backgroundColor: `${domainColors[pos.agent.domain]}20`,
                  border: `2px solid ${domainColors[pos.agent.domain]}`,
                }}
                onClick={() => onAgentClick(pos.agent)}
              >
                <Bot 
                  className="w-1/2 h-1/2" 
                  style={{ color: domainColors[pos.agent.domain] }} 
                />
                {isIntervention && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          onClick={() => setZoom(z => Math.min(MAX_ZOOM, z * 1.2))}
          className="p-2 rounded bg-black/50 backdrop-blur border border-white/10 hover:bg-white/10"
        >
          <ZoomIn className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(MIN_ZOOM, z * 0.8))}
          className="p-2 rounded bg-black/50 backdrop-blur border border-white/10 hover:bg-white/10"
        >
          <ZoomOut className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={resetView}
          className="p-2 rounded bg-black/50 backdrop-blur border border-white/10 hover:bg-white/10"
        >
          <Maximize2 className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}
