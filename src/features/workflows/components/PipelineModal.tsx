"use client";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { PipelineNode, type PipelineNodeData } from "../nodes/PipelineNode";
import { X } from "lucide-react";

const nodeTypes = {
  pipelineNode: PipelineNode,
};

const COL = { c1: 80, c2: 260, c3: 440, c4: 620, c5: 800, c6: 980 };
const ROW = { r1: 40, r2: 140, r3: 240, r4: 340, r5: 440, r6: 540, r7: 640 };

const bb5PipelineNodes = [
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
];

const bb5PipelineEdges = [
  { id: "e1", source: "user", target: "orchestrator", animated: true },
  { id: "e2", source: "orchestrator", target: "task-setter", animated: true },
  { id: "e3", source: "task-setter", target: "task-queue", animated: true },
  { id: "e4", source: "task-queue", target: "planner", animated: true },
  { id: "e5", source: "planner", target: "developer", animated: true },
  { id: "e6", source: "developer", target: "tester", animated: true },
  { id: "e7", source: "tester", target: "reviewer", animated: true },
  { id: "e8", source: "task-queue", target: "static-analysis", animated: true },
  { id: "e9", source: "static-analysis", target: "e2e-tests", animated: true },
  { id: "e10", source: "e2e-tests", target: "visual-reg", animated: true },
  { id: "e11", source: "task-queue", target: "dead-code", animated: true },
  { id: "e12", source: "dead-code", target: "deps", animated: true },
  { id: "e13", source: "task-queue", target: "scout", animated: true },
  { id: "e14", source: "scout", target: "librarian", animated: true },
];

type PipelineModalProps = {
  open: boolean;
  onClose: () => void;
};

export const PipelineModal = ({ open, onClose }: PipelineModalProps) => {
  const [nodes, , onNodesChange] = useNodesState(bb5PipelineNodes);
  const [edges, , onEdgesChange] = useEdgesState(bb5PipelineEdges);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative h-[80vh] w-[90vw] max-w-6xl rounded-lg border border-border bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-mono text-sm font-semibold uppercase tracking-wider">
            BlackBox5 Pipeline
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 hover:bg-surface-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* React Flow */}
        <div className="h-[calc(100%-52px)]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Background color="#444" gap={20} />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                const data = node.data as PipelineNodeData;
                switch (data.type) {
                  case "agent":
                    return "#3b82f6";
                  case "team":
                    return "#10b981";
                  case "hub":
                    return "#f59e0b";
                  case "external":
                    return "#64748b";
                  default:
                    return "#64748b";
                }
              }}
            />
            <Panel position="top-right" className="flex gap-2">
              <div className="rounded-md bg-surface-2 px-2 py-1 font-mono text-[10px]">
                <span className="text-blue-500">●</span> Agent
                <span className="ml-2 text-green-500">●</span> Team
                <span className="ml-2 text-amber-500">●</span> Hub
                <span className="ml-2 text-gray-500">●</span> External
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};
