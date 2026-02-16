export type AgentDomain = 'communications' | 'productivity' | 'research' | 'development' | 'automation';
export type AgentStatus = 'active' | 'idle' | 'waiting' | 'offline' | 'intervention_required';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type Integration = 
  | 'whatsapp' | 'telegram' | 'discord' | 'slack' | 'signal' | 'imessage' | 'email'
  | 'browser' | 'files' | 'terminal' | 'calendar' | 'notes' | 'github' | 'gmail';

export interface Machine {
  id: string;
  name: string;
  os: 'macos' | 'windows' | 'linux' | 'android';
  location?: string;
  isOnline: boolean;
  lastSeen: string;
}

export interface ClawAgent {
  id: string;
  name: string;
  machineId: string;
  machineName: string;
  status: AgentStatus;
  domain: AgentDomain;
  integrations: Integration[];
  currentTaskId: string | null;
  currentAction: string;
  memoryUsage: number;
  uptime: string;
  tasksCompleted: number;
  collaboratingWith: string[];
  interventionRequired: boolean;
  interventionReason?: string;
  activityLevel: number;
}

export interface AgentTask {
  id: string;
  agentId: string;
  agentName: string;
  domain: AgentDomain;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'waiting_approval';
  priority: TaskPriority;
  progress: number;
  startTime: string;
  estimatedCompletion?: string;
  integrationsUsed: Integration[];
  collaborators: string[];
}

export interface ActionEntry {
  id: string;
  agentId: string;
  timestamp: string;
  type: 'email_sent' | 'message_sent' | 'file_modified' | 'browser_action' | 'calendar_update' | 'command_run' | 'api_call' | 'decision';
  description: string;
  details?: string;
  integration: Integration;
  outcome: 'success' | 'failure' | 'pending';
  requiresApproval: boolean;
}

export interface Swarm {
  id: string;
  name: string;
  objective: string;
  agents: string[];
  leadAgentId: string;
  status: 'forming' | 'active' | 'completed' | 'disbanded';
  progress: number;
  tasksTotal: number;
  tasksCompleted: number;
}

export interface Intervention {
  id: string;
  agentId: string;
  agentName: string;
  type: 'approval_needed' | 'clarification' | 'permission' | 'error' | 'cost_limit';
  question: string;
  context: string;
  options?: string[];
  timestamp: string;
  priority: TaskPriority;
}

export interface FleetHealth {
  totalAgents: number;
  activeAgents: number;
  offlineAgents: number;
  interventionsRequired: number;
  tasksInProgress: number;
  tasksCompletedToday: number;
  swarmsActive: number;
  overallHealth: 'healthy' | 'degraded' | 'critical';
}

export const domainColors: Record<AgentDomain, string> = {
  communications: '#ec4899',
  productivity: '#3b82f6',
  research: '#8b5cf6',
  development: '#22c55e',
  automation: '#f59e0b',
};

export const statusColors: Record<AgentStatus, string> = {
  active: '#22c55e',
  idle: '#6b7280',
  waiting: '#3b82f6',
  offline: '#374151',
  intervention_required: '#f59e0b',
};

export const domainLabels: Record<AgentDomain, string> = {
  communications: 'COMMS',
  productivity: 'PRODUCTIVITY',
  research: 'RESEARCH',
  development: 'DEVELOPMENT',
  automation: 'AUTOMATION',
};
