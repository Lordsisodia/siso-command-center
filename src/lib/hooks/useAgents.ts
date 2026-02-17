"use client";

import { useState, useEffect, useCallback } from "react";
import type { GatewayClientLike } from "./types";

export type Agent = {
  id: string;
  name?: string;
  avatarUrl?: string;
  emoji?: string;
  status?: "idle" | "running" | "error";
};

export type UseAgentsResult = {
  agents: Agent[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

type GatewayClient = GatewayClientLike & {
  connected: boolean;
};

export function useAgents(client: GatewayClient | null): UseAgentsResult {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    if (!client) {
      setError("No gateway client available");
      setLoading(false);
      return;
    }

    if (!client.connected) {
      setError("Gateway not connected");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await client.call("agents.list", {}) as {
        defaultId: string;
        mainKey: string;
        agents: Array<{
          id: string;
          name?: string;
          identity?: {
            name?: string;
            emoji?: string;
            avatar?: string;
            avatarUrl?: string;
          };
        }>;
      };

      const mappedAgents: Agent[] = result.agents.map((agent) => ({
        id: agent.id,
        name: agent.identity?.name ?? agent.name ?? agent.id,
        avatarUrl: agent.identity?.avatarUrl ?? agent.identity?.avatar,
        emoji: agent.identity?.emoji,
      }));

      setAgents(mappedAgents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch agents");
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return { agents, loading, error, refetch: fetchAgents };
}

export function createMockGatewayClient(agents: Agent[] = []) {
  return {
    connected: true,
    call: async (method: string, _params: unknown) => {
      if (method === "agents.list") {
        return {
          defaultId: agents[0]?.id ?? "default",
          mainKey: "main",
          agents: agents.map((a) => ({
            id: a.id,
            name: a.name,
            identity: { name: a.name, avatarUrl: a.avatarUrl, emoji: a.emoji },
          })),
        };
      }
      throw new Error(`Unknown method: ${method}`);
    },
  };
}
