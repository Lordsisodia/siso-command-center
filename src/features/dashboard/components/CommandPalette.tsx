"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Search, Plus, LayoutDashboard, Bot, Settings, Play, Zap, RotateCcw, Bell, Command, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type CommandAction = {
  id: string;
  label: string;
  shortcut?: string;
  icon: React.ReactNode;
  category: "agent" | "navigation" | "action" | "system";
  action: () => void;
};

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateAgent: () => void;
  onOpenDashboard: () => void;
  onOpenSettings: () => void;
  onRunHeartbeats: () => void;
  agents: { id: string; name: string }[];
  onSelectAgent: (agentId: string) => void;
};

export const CommandPalette = ({
  open,
  onOpenChange,
  onCreateAgent,
  onOpenDashboard,
  onOpenSettings,
  onRunHeartbeats,
  agents,
  onSelectAgent,
}: CommandPaletteProps) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandAction[] = useMemo(() => [
    {
      id: "new-agent",
      label: "Create New Agent",
      shortcut: "N",
      icon: <Plus className="h-4 w-4" />,
      category: "action",
      action: () => { onCreateAgent(); onOpenChange(false); },
    },
    {
      id: "dashboard",
      label: "Go to Dashboard",
      shortcut: "D",
      icon: <LayoutDashboard className="h-4 w-4" />,
      category: "navigation",
      action: () => { onOpenDashboard(); onOpenChange(false); },
    },
    {
      id: "run-heartbeats",
      label: "Run All Heartbeats",
      shortcut: "H",
      icon: <Zap className="h-4 w-4" />,
      category: "action",
      action: () => { onRunHeartbeats(); onOpenChange(false); },
    },
    {
      id: "settings",
      label: "Open Settings",
      shortcut: ",",
      icon: <Settings className="h-4 w-4" />,
      category: "system",
      action: () => { onOpenSettings(); onOpenChange(false); },
    },
    ...agents.map((agent) => ({
      id: `agent-${agent.id}`,
      label: `Select: ${agent.name}`,
      icon: <Bot className="h-4 w-4" />,
      category: "agent" as const,
      action: () => { onSelectAgent(agent.id); onOpenChange(false); },
    })),
  ], [agents, onCreateAgent, onOpenDashboard, onOpenSettings, onRunHeartbeats, onSelectAgent, onOpenChange]);

  const filteredCommands = useMemo(() => {
    if (!query) return commands;
    const q = query.toLowerCase();
    return commands.filter(cmd => 
      cmd.label.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q)
    );
  }, [commands, query]);

  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandAction[]> = {};
    filteredCommands.forEach(cmd => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filteredCommands[selectedIndex]?.action();
    } else if (e.key === "Escape") {
      onOpenChange(false);
    }
  }, [filteredCommands, selectedIndex, onOpenChange]);

  const categoryLabels: Record<string, string> = {
    action: "Actions",
    navigation: "Navigation",
    agent: "Agents",
    system: "System",
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    action: <Zap className="h-3 w-3" />,
    navigation: <LayoutDashboard className="h-3 w-3" />,
    agent: <Bot className="h-3 w-3" />,
    system: <Settings className="h-3 w-3" />,
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-xl -translate-x-1/2"
          >
            <div className="mx-4 overflow-hidden rounded-xl border border-border/80 bg-card shadow-2xl">
              <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search commands, agents..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <kbd className="hidden rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
                  ESC
                </kbd>
              </div>
              <div className="max-h-80 overflow-auto p-2">
                {filteredCommands.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No results found
                  </div>
                ) : (
                  Object.entries(groupedCommands).map(([category, cmds]) => (
                    <div key={category} className="mb-2">
                      <div className="flex items-center gap-2 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        {categoryIcons[category]}
                        {categoryLabels[category]}
                      </div>
                      {cmds.map((cmd, idx) => {
                        const globalIdx = filteredCommands.findIndex(c => c.id === cmd.id);
                        return (
                          <button
                            key={cmd.id}
                            onClick={cmd.action}
                            onMouseEnter={() => setSelectedIndex(globalIdx)}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition ${
                              selectedIndex === globalIdx
                                ? "bg-primary/10 text-primary"
                                : "text-foreground hover:bg-muted"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={selectedIndex === globalIdx ? "text-primary" : "text-muted-foreground"}>
                                {cmd.icon}
                              </span>
                              <span className="text-sm">{cmd.label}</span>
                            </div>
                            {cmd.shortcut && (
                              <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                {cmd.shortcut}
                              </kbd>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
              <div className="flex items-center justify-between border-t border-border/60 px-4 py-2 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded bg-muted px-1 py-0.5">↑↓</kbd> navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded bg-muted px-1 py-0.5">↵</kbd> select
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <Command className="h-3 w-3" /> K to open
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const useCommandPalette = (props: Omit<CommandPaletteProps, "open" | "onOpenChange">) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    isOpen,
    setIsOpen,
    CommandPalette: () => (
      <CommandPalette
        {...props}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    ),
  };
};
