import os from "node:os";
import path from "node:path";

export const resolveProjectAgentsRoot = (projectId: string) => {
  return path.join(os.homedir(), ".clawdbot", "agent-canvas", "workspaces", projectId, "agents");
};

export const resolveAgentWorkspaceDir = (projectId: string, agentId: string) => {
  return path.join(resolveProjectAgentsRoot(projectId), agentId);
};
