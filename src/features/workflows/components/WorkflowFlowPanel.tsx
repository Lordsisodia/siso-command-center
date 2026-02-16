"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { WorkflowNode, type WorkflowNodeData } from "../nodes/WorkflowNode";
import {
  workflowToReactFlow,
  buildGuidedCreateWorkflow,
  buildConfigMutationWorkflow,
  type WorkflowDefinition,
} from "../utils/workflowToNodes";

const nodeTypes = {
  workflowNode: WorkflowNode,
};

type WorkflowFlowPanelProps = {
  guidedCreatePhase?: "start" | "creating" | "applying" | "pending" | "completed" | null;
  guidedCreateError?: boolean;
  configMutationPhase?: "queued" | "mutating" | "awaiting-restart" | "completed" | null;
  configMutationError?: boolean;
  activeWorkflow?: "guided-create" | "config-mutation" | null;
};

export function WorkflowFlowPanel({
  guidedCreatePhase = null,
  guidedCreateError = false,
  configMutationPhase = null,
  configMutationError = false,
  activeWorkflow = null,
}: WorkflowFlowPanelProps) {
  const workflows = useMemo<WorkflowDefinition[]>(() => {
    const result: WorkflowDefinition[] = [];

    if (guidedCreatePhase || activeWorkflow === "guided-create") {
      result.push(buildGuidedCreateWorkflow(guidedCreatePhase, guidedCreateError));
    }

    if (configMutationPhase || activeWorkflow === "config-mutation") {
      result.push(buildConfigMutationWorkflow(configMutationPhase, configMutationError));
    }

    if (result.length === 0) {
      result.push(buildGuidedCreateWorkflow(null, false));
      result.push(buildConfigMutationWorkflow(null, false));
    }

    return result;
  }, [guidedCreatePhase, guidedCreateError, configMutationPhase, configMutationError, activeWorkflow]);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    let allNodes: ReturnType<typeof workflowToReactFlow>["nodes"] = [];
    let allEdges: ReturnType<typeof workflowToReactFlow>["edges"] = [];

    workflows.forEach((workflow, index) => {
      const { nodes, edges } = workflowToReactFlow(workflow);

      const offsetX = index * 400;
      const offsetNodes = nodes.map((node) => ({
        ...node,
        position: {
          x: node.position.x + offsetX,
          y: node.position.y,
        },
      }));

      allNodes = [...allNodes, ...offsetNodes];
      allEdges = [...allEdges, ...edges];
    });

    return { nodes: allNodes, edges: allEdges };
  }, [workflows]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const proOptions = useMemo(() => ({ hideAttribution: true }), []);

  return (
    <div className="h-full w-full rounded-md border border-border/80 bg-surface-1 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        proOptions={proOptions}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-background"
      >
        <Background gap={16} size={1} color="var(--border)" />
        <Controls
          className="!bg-card !border-border !rounded-md"
          showZoom={true}
          showFitView={true}
          showInteractive={false}
        />
        <MiniMap
          className="!bg-card !border-border !rounded-md"
          nodeColor={(node) => {
            const data = node.data as WorkflowNodeData | undefined;
            if (!data) return "var(--muted)";
            switch (data.status) {
              case "active":
                return "var(--primary)";
              case "completed":
                return "#22c55e";
              case "error":
                return "var(--destructive)";
              default:
                return "var(--muted)";
            }
          }}
          maskColor="var(--background)"
        />
      </ReactFlow>
    </div>
  );
}

export function WorkflowFlowPanelEmpty() {
  return (
    <div className="h-full w-full rounded-md border border-border/80 bg-surface-1 flex items-center justify-center">
      <div className="text-center px-6 py-8">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Workflow Visualization
        </div>
        <div className="mt-3 text-sm text-muted-foreground">
          Select an agent or trigger a workflow to see its state
        </div>
      </div>
    </div>
  );
}
