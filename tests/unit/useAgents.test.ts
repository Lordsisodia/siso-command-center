import { describe, expect, it, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAgents, createMockGatewayClient, type Agent } from "@/lib/hooks/useAgents";

describe("useAgents", () => {
  it("calls agents.list via GatewayClient - same as agentFleetHydration.ts", async () => {
    const mockAgents: Agent[] = [
      { id: "agent-1", name: "Test Agent 1", avatarUrl: "https://example.com/1.png" },
      { id: "agent-2", name: "Test Agent 2", emoji: "🤖" },
    ];

    const mockClient = createMockGatewayClient(mockAgents);
    const callSpy = vi.spyOn(mockClient, "call");

    const { result } = renderHook(() => useAgents(mockClient));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(callSpy).toHaveBeenCalledWith("agents.list", {});
    expect(result.current.agents).toHaveLength(2);
    expect(result.current.agents[0]).toEqual({
      id: "agent-1",
      name: "Test Agent 1",
      avatarUrl: "https://example.com/1.png",
      emoji: undefined,
    });
    expect(result.current.error).toBeNull();
  });

  it("returns error when client is null", async () => {
    const { result } = renderHook(() => useAgents(null));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("No gateway client available");
    expect(result.current.agents).toHaveLength(0);
  });

  it("returns error when gateway not connected", async () => {
    const disconnectedClient = {
      connected: false,
      call: async () => { throw new Error("Should not be called"); },
    };

    const { result } = renderHook(() => useAgents(disconnectedClient));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Gateway not connected");
    expect(result.current.agents).toHaveLength(0);
  });

  it("handles gateway errors", async () => {
    const errorClient = {
      connected: true,
      call: async () => {
        throw new Error("Gateway unavailable");
      },
    };

    const { result } = renderHook(() => useAgents(errorClient));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Gateway unavailable");
  });

  it("transforms identity data same as original", async () => {
    const mockAgents: Agent[] = [
      { id: "test-id", name: "My Agent" },
    ];

    const mockClient = createMockGatewayClient(mockAgents);

    const { result } = renderHook(() => useAgents(mockClient));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.agents[0]).toEqual({
      id: "test-id",
      name: "My Agent",
      avatarUrl: undefined,
      emoji: undefined,
    });
  });

  it("refetch reloads agents", async () => {
    const mockAgents: Agent[] = [
      { id: "agent-1", name: "First Agent" },
    ];

    const mockClient = createMockGatewayClient(mockAgents);
    const callSpy = vi.spyOn(mockClient, "call");

    const { result } = renderHook(() => useAgents(mockClient));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(callSpy).toHaveBeenCalledTimes(1);

    await actAsync(async () => {
      await result.current.refetch();
    });

    expect(callSpy).toHaveBeenCalledTimes(2);
  });
});

async function actAsync(fn: () => Promise<void>) {
  await act(fn);
}
