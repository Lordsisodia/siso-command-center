"use client";

import { useState, useCallback } from "react";

export type ModalState = {
  createAgentOpen: boolean;
  pipelineOpen: boolean;
  settingsOpen: boolean;
  connectionOpen: boolean;
  brainOpen: boolean;
};

export type UseModalStateResult = {
  modals: ModalState;
  openCreateAgent: () => void;
  closeCreateAgent: () => void;
  openPipeline: () => void;
  closePipeline: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  openConnection: () => void;
  closeConnection: () => void;
  openBrain: () => void;
  closeBrain: () => void;
};

export function useModalState(): UseModalStateResult {
  const [createAgentOpen, setCreateAgentOpen] = useState(false);
  const [pipelineOpen, setPipelineOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [connectionOpen, setConnectionOpen] = useState(false);
  const [brainOpen, setBrainOpen] = useState(false);

  return {
    modals: { createAgentOpen, pipelineOpen, settingsOpen, connectionOpen, brainOpen },
    openCreateAgent: useCallback(() => setCreateAgentOpen(true), []),
    closeCreateAgent: useCallback(() => setCreateAgentOpen(false), []),
    openPipeline: useCallback(() => setPipelineOpen(true), []),
    closePipeline: useCallback(() => setPipelineOpen(false), []),
    openSettings: useCallback(() => setSettingsOpen(true), []),
    closeSettings: useCallback(() => setSettingsOpen(false), []),
    openConnection: useCallback(() => setConnectionOpen(true), []),
    closeConnection: useCallback(() => setConnectionOpen(false), []),
    openBrain: useCallback(() => setBrainOpen(true), []),
    closeBrain: useCallback(() => setBrainOpen(false), []),
  };
}
