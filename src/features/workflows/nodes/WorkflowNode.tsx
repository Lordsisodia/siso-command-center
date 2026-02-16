import { memo } from "react";
import { Handle, Position } from "@xyflow/react";

type WorkflowNodeData = {
  label: string;
  status: "pending" | "active" | "completed" | "error";
  isActive: boolean;
  color: string;
};

type WorkflowNodeProps = {
  data: WorkflowNodeData;
};

const WorkflowNode = memo(({ data }: WorkflowNodeProps) => {
  const { label, status, isActive, color } = data;

  return (
    <div
      className="px-4 py-2 rounded-md border-2 font-mono text-xs uppercase tracking-wider transition-all duration-200"
      style={{
        backgroundColor: status === "active" ? "var(--card)" : status === "completed" ? "color-mix(in oklch, #22c55e 15%, var(--card))" : "var(--muted)",
        borderColor: color,
        boxShadow: isActive ? `0 0 12px ${color}40` : "none",
        color: status === "pending" ? "var(--muted-foreground)" : "var(--foreground)",
      }}
    >
      <Handle type="target" position={Position.Left} className="!bg-primary !w-2 !h-2 !border-2" />
      <div className="flex items-center gap-2">
        {status === "active" && (
          <span className="inline-block w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: color }} />
        )}
        {status === "completed" && (
          <span className="inline-block text-green-500">✓</span>
        )}
        {status === "error" && (
          <span className="inline-block text-red-500">✗</span>
        )}
        <span>{label}</span>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-primary !w-2 !h-2 !border-2" />
    </div>
  );
});

WorkflowNode.displayName = "WorkflowNode";

export { WorkflowNode };
export type { WorkflowNodeData };
