import { memo } from "react";
import { Handle, Position } from "@xyflow/react";

type PipelineNodeType = "agent" | "team" | "hub" | "external" | "label";

type PipelineNodeData = {
  label: string;
  sublabel?: string;
  type: PipelineNodeType;
  status?: "idle" | "running" | "error";
  project?: string;
};

type PipelineNodeProps = {
  data: PipelineNodeData;
};

const NODE_STYLES: Record<PipelineNodeType, { bg: string; border: string; text: string }> = {
  agent: { bg: "bg-blue-500/10", border: "border-blue-500", text: "text-blue-400" },
  team: { bg: "bg-emerald-500/10", border: "border-emerald-500", text: "text-emerald-400" },
  hub: { bg: "bg-amber-500/10", border: "border-amber-500", text: "text-amber-400" },
  external: { bg: "bg-slate-500/10", border: "border-slate-500", text: "text-slate-400" },
  label: { bg: "bg-transparent", border: "border-transparent", text: "text-muted-foreground" },
};

const STATUS_COLORS = {
  idle: "",
  running: "ring-2 ring-primary ring-offset-1 ring-offset-background animate-pulse",
  error: "ring-2 ring-destructive ring-offset-1 ring-offset-background",
};

const PipelineNode = memo(({ data }: PipelineNodeProps) => {
  const { label, sublabel, type, status = "idle", project } = data;
  const styles = NODE_STYLES[type];

  if (type === "label") {
    return (
      <div className="flex flex-col items-center">
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
          {label}
        </div>
        {sublabel && (
          <div className="text-[9px] text-muted-foreground/70">{sublabel}</div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`
        px-3 py-2 rounded-lg border-2 min-w-[100px] max-w-[140px]
        ${styles.bg} ${styles.border}
        ${status !== "idle" ? STATUS_COLORS[status] : ""}
        transition-all duration-200
      `}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-muted-foreground !border-background"
      />
      
      <div className="flex flex-col gap-0.5">
        <div className={`font-mono text-[10px] font-semibold uppercase tracking-wider ${styles.text} truncate`}>
          {label}
        </div>
        {sublabel && (
          <div className="text-[9px] text-muted-foreground truncate">
            {sublabel}
          </div>
        )}
        {project && (
          <div className="text-[8px] text-muted-foreground/60 mt-0.5 px-1 py-0.5 bg-muted/30 rounded truncate">
            {project}
          </div>
        )}
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-muted-foreground !border-background"
      />
    </div>
  );
});

PipelineNode.displayName = "PipelineNode";

export { PipelineNode };
export type { PipelineNodeData, PipelineNodeType };
