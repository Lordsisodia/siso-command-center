import type { Node, Edge } from "@xyflow/react";

export type WorkflowPhase = {
  id: string;
  label: string;
  status: "pending" | "active" | "completed" | "error";
};

export type WorkflowDefinition = {
  id: string;
  name: string;
  phases: WorkflowPhase[];
  currentPhase: string | null;
};

const PHASE_POSITIONS: Record<string, { x: number; y: number }> = {
  start: { x: 100, y: 200 },
  creating: { x: 300, y: 100 },
  applying: { x: 500, y: 100 },
  pending: { x: 500, y: 300 },
  completed: { x: 700, y: 200 },
  error: { x: 300, y: 300 },
  queued: { x: 100, y: 200 },
  mutating: { x: 300, y: 200 },
  "awaiting-restart": { x: 500, y: 200 },
};

const getStatusColor = (status: WorkflowPhase["status"]): string => {
  switch (status) {
    case "active":
      return "var(--primary)";
    case "completed":
      return "#22c55e";
    case "error":
      return "var(--destructive)";
    default:
      return "var(--muted-foreground)";
  }
};

export const workflowToReactFlow = (
  workflow: WorkflowDefinition
): { nodes: Node[]; edges: Edge[] } => {
  const nodes: Node[] = workflow.phases.map((phase) => ({
    id: phase.id,
    type: "workflowNode",
    position: PHASE_POSITIONS[phase.id] ?? { x: 200, y: 200 },
    data: {
      label: phase.label,
      status: phase.status,
      isActive: phase.id === workflow.currentPhase,
      color: getStatusColor(phase.status),
    },
  }));

  const edges: Edge[] = [];

  if (workflow.id === "guided-create") {
    edges.push(
      { id: "e-start-creating", source: "start", target: "creating", animated: false },
      { id: "e-creating-applying", source: "creating", target: "applying", animated: false },
      { id: "e-applying-completed", source: "applying", target: "completed", animated: false },
      { id: "e-applying-pending", source: "applying", target: "pending", animated: false },
      { id: "e-pending-completed", source: "pending", target: "completed", animated: false }
    );
  } else if (workflow.id === "config-mutation") {
    edges.push(
      { id: "e-queued-mutating", source: "queued", target: "mutating", animated: false },
      { id: "e-mutating-awaiting", source: "mutating", target: "awaiting-restart", animated: false },
      { id: "e-mutating-completed", source: "mutating", target: "completed", animated: false },
      { id: "e-awaiting-completed", source: "awaiting-restart", target: "completed", animated: false }
    );
  }

  const currentPhase = workflow.phases.find((p) => p.id === workflow.currentPhase);
  if (currentPhase) {
    edges.forEach((edge) => {
      if (edge.source === workflow.currentPhase) {
        edge.animated = true;
        edge.style = { stroke: "var(--primary)", strokeWidth: 2 };
      }
    });
  }

  return { nodes, edges };
};

export const buildGuidedCreateWorkflow = (
  currentPhase: "start" | "creating" | "applying" | "pending" | "completed" | null,
  hasError: boolean = false
): WorkflowDefinition => ({
  id: "guided-create",
  name: "Agent Creation",
  phases: [
    { id: "start", label: "Start", status: currentPhase === "start" ? "active" : currentPhase ? "completed" : "pending" },
    { id: "creating", label: "Creating Agent", status: currentPhase === "creating" ? "active" : ["applying", "pending", "completed"].includes(currentPhase ?? "") ? "completed" : "pending" },
    { id: "applying", label: "Applying Setup", status: currentPhase === "applying" ? (hasError ? "error" : "active") : ["pending", "completed"].includes(currentPhase ?? "") ? "completed" : "pending" },
    { id: "pending", label: "Pending Restart", status: currentPhase === "pending" ? "active" : "pending" },
    { id: "completed", label: "Completed", status: currentPhase === "completed" ? "completed" : "pending" },
  ],
  currentPhase: hasError ? "applying" : currentPhase,
});

export const buildConfigMutationWorkflow = (
  currentPhase: "queued" | "mutating" | "awaiting-restart" | "completed" | null,
  hasError: boolean = false
): WorkflowDefinition => ({
  id: "config-mutation",
  name: "Config Mutation",
  phases: [
    { id: "queued", label: "Queued", status: currentPhase === "queued" ? "active" : currentPhase ? "completed" : "pending" },
    { id: "mutating", label: "Mutating Config", status: currentPhase === "mutating" ? (hasError ? "error" : "active") : ["awaiting-restart", "completed"].includes(currentPhase ?? "") ? "completed" : "pending" },
    { id: "awaiting-restart", label: "Awaiting Restart", status: currentPhase === "awaiting-restart" ? "active" : currentPhase === "completed" ? "completed" : "pending" },
    { id: "completed", label: "Completed", status: currentPhase === "completed" ? "completed" : "pending" },
  ],
  currentPhase: hasError ? "mutating" : currentPhase,
});
