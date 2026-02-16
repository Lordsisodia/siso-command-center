"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { PipelineNode, type PipelineNodeData } from "../nodes/PipelineNode";

const nodeTypes = {
  pipelineNode: PipelineNode,
};

const COL = { c1: 80, c2: 260, c3: 440, c4: 620, c5: 800, c6: 980 };
const ROW = { r1: 40, r2: 140, r3: 240, r4: 340, r5: 440, r6: 540, r7: 640 };

const bb5Pipeline = {
  nodes: [
    { id: "user", position: { x: COL.c3, y: ROW.r1 }, data: { label: "User", type: "external" as const }, type: "pipelineNode" },
    { id: "orchestrator", position: { x: COL.c2, y: ROW.r2 }, data: { label: "Orchestrator", sublabel: "Chat Interface", type: "team" as const }, type: "pipelineNode" },
    { id: "task-setter", position: { x: COL.c4, y: ROW.r2 }, data: { label: "Task Setter", sublabel: "Queue Manager", type: "team" as const }, type: "pipelineNode" },
    { id: "task-queue", position: { x: COL.c3, y: ROW.r3 }, data: { label: "Task Queue", sublabel: "SQLite + Cron", type: "hub" as const }, type: "pipelineNode" },

    { id: "dev-label", position: { x: COL.c1 - 20, y: ROW.r3 }, data: { label: "DEV PIPELINE", sublabel: "Antfarm Pattern", type: "label" as const }, type: "pipelineNode" },
    { id: "planner", position: { x: COL.c1, y: ROW.r4 }, data: { label: "Planner", sublabel: "Stories & Branch", type: "agent" as const, project: "blackbox5" }, type: "pipelineNode" },
    { id: "developer", position: { x: COL.c1, y: ROW.r5 }, data: { label: "Developer", sublabel: "Implement Stories", type: "agent" as const, project: "blackbox5" }, type: "pipelineNode" },
    { id: "tester", position: { x: COL.c1, y: ROW.r6 }, data: { label: "Tester", sublabel: "E2E Tests", type: "agent" as const, project: "blackbox5" }, type: "pipelineNode" },
    { id: "reviewer", position: { x: COL.c1, y: ROW.r7 }, data: { label: "Reviewer", sublabel: "Code Review", type: "agent" as const, project: "blackbox5" }, type: "pipelineNode" },

    { id: "test-label", position: { x: COL.c3 - 20, y: ROW.r3 }, data: { label: "TESTING", sublabel: "Quality Gates", type: "label" as const }, type: "pipelineNode" },
    { id: "static-analysis", position: { x: COL.c3, y: ROW.r4 }, data: { label: "Static", sublabel: "Lint & Types", type: "agent" as const, project: "lumelle" }, type: "pipelineNode" },
    { id: "e2e-tests", position: { x: COL.c3, y: ROW.r5 }, data: { label: "E2E", sublabel: "Playwright", type: "agent" as const, project: "lumelle" }, type: "pipelineNode" },
    { id: "visual-reg", position: { x: COL.c3, y: ROW.r6 }, data: { label: "Visual", sublabel: "Screenshots", type: "agent" as const, project: "lumelle" }, type: "pipelineNode" },

    { id: "hygiene-label", position: { x: COL.c5 - 20, y: ROW.r3 }, data: { label: "HYGIENE", sublabel: "Code Quality", type: "label" as const }, type: "pipelineNode" },
    { id: "dead-code", position: { x: COL.c5, y: ROW.r4 }, data: { label: "Dead Code", sublabel: "Detection", type: "agent" as const, project: "siso-internal" }, type: "pipelineNode" },
    { id: "deps", position: { x: COL.c5, y: ROW.r5 }, data: { label: "Deps", sublabel: "DAG Analysis", type: "agent" as const, project: "siso-internal" }, type: "pipelineNode" },

    { id: "research-label", position: { x: COL.c6 - 20, y: ROW.r3 }, data: { label: "RESEARCH", sublabel: "Discovery", type: "label" as const }, type: "pipelineNode" },
    { id: "scout", position: { x: COL.c6, y: ROW.r4 }, data: { label: "Scout", sublabel: "GitHub Discovery", type: "agent" as const, project: "blackbox5" }, type: "pipelineNode" },
    { id: "librarian", position: { x: COL.c6, y: ROW.r5 }, data: { label: "Librarian", sublabel: "Documentation", type: "agent" as const, project: "blackbox5" }, type: "pipelineNode" },
  ],

  edges: [
    { id: "e-user-orch", source: "user", target: "orchestrator", markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: "#64748b", strokeWidth: 2 } },
    { id: "e-orch-task", source: "orchestrator", target: "task-setter", markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: "#10b981", strokeWidth: 2 } },
    { id: "e-task-queue", source: "task-setter", target: "task-queue", markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: "#10b981", strokeWidth: 2 } },
    { id: "e-queue-planner", source: "task-queue", target: "planner", markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: "#f59e0b" } },
    { id: "e-queue-static", source: "task-queue", target: "static-analysis", markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: "#f59e0b" } },
    { id: "e-queue-dead", source: "task-queue", target: "dead-code", markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: "#f59e0b" } },
    { id: "e-queue-scout", source: "task-queue", target: "scout", markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: "#f59e0b" } },
    { id: "e-plan-dev", source: "planner", target: "developer", markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: "#3b82f6", strokeWidth: 2 } },
    { id: "e-dev-test", source: "developer", target: "tester", markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: "#3b82f6", strokeWidth: 2 } },
    { id: "e-test-rev", source: "tester", target: "reviewer", markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: "#3b82f6", strokeWidth: 2 } },
    { id: "e-static-e2e", source: "static-analysis", target: "e2e-tests", markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: "#8b5cf6" } },
    { id: "e-e2e-visual", source: "e2e-tests", target: "visual-reg", markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: "#8b5cf6" } },
  ],
};

type AgentPipelinePanelProps = {
  agentStatuses?: Record<string, "idle" | "running" | "error">;
};

export function AgentPipelinePanel({ agentStatuses = {} }: AgentPipelinePanelProps) {
  const nodesWithLiveStatus = useMemo(() => {
    return bb5Pipeline.nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        status: agentStatuses[node.id] || "idle",
      } as PipelineNodeData,
    }));
  }, [agentStatuses]);

  const [nodes, , onNodesChange] = useNodesState(nodesWithLiveStatus);
  const [edges, , onEdgesChange] = useEdgesState(bb5Pipeline.edges);

  return (
    <div className="h-full w-full rounded-md border border-border/80 bg-surface-1 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        proOptions={{ hideAttribution: true }}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        className="bg-background"
        minZoom={0.3}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
      >
        <Background gap={16} size={1} className="!bg-muted/30" />
        <Controls className="!bg-card !border-border !rounded-md" />
        <MiniMap
          nodeColor={(node) => {
            const type = (node.data as PipelineNodeData)?.type;
            if (type === "agent") return "#3b82f6";
            if (type === "team") return "#10b981";
            if (type === "hub") return "#f59e0b";
            return "#64748b";
          }}
          className="!bg-card !border-border !rounded-md"
        />
        <Panel position="top-left" className="!m-2">
          <div className="flex flex-col gap-1 p-2 rounded-md bg-card/90 border border-border text-xs">
            <div className="font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              BlackBox5 Pipeline
            </div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-muted-foreground">Agent</span></div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-muted-foreground">Team</span></div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-muted-foreground">Hub</span></div>
          </div>
        </Panel>
        <Panel position="bottom-left" className="!m-2">
          <div className="text-[10px] text-muted-foreground/60">Drag to pan • Scroll to zoom</div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export { bb5Pipeline };
