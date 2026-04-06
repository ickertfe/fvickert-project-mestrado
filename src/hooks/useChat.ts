'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Message, DisplayMessage } from '@/types/message';
import type { ChatParticipant } from '@/types/scenario';
import type { ActionType } from '@/types/action';
import { useTimeline } from './useTimeline';
import { useMetrics } from './useMetrics';
import { useActions } from './useActions';

interface UseChatOptions {
  sessionId: string;
  messages: Message[];
  participants: ChatParticipant[];
  role: 'TUTOR' | 'BYSTANDER';
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export interface ChatState {
  canTakeActions: boolean;
  participants: ChatParticipant[];
}

export function useChat({
  sessionId,
  messages,
  participants,
  role,
  onComplete,
  onError,
}: UseChatOptions) {
  const [chatState] = useState<ChatState>({
    canTakeActions: role === 'TUTOR',
    participants,
  });

  // Timeline hook for message display
  const timeline = useTimeline(messages, {
    onComplete: () => {
      onComplete?.();
    },
  });

  // Metrics hook for tracking behavior
  const metrics = useMetrics({
    sessionId,
    onMetricsUpdate: (update) => {
      // Could sync metrics to server here if needed
      console.log('Metrics update:', update);
    },
  });

  // Actions hook for tutor actions
  const actions = useActions({
    sessionId,
    onActionCreated: (action) => {
      timeline.executeAction(action.messageId, action.type);
    },
    onActionUndone: () => {
      const lastAction = metrics.getLastAction();
      if (lastAction) {
        timeline.executeUndo(lastAction.messageId, lastAction.action);
      }
    },
    onError,
  });

  // Start the chat simulation
  const startChat = useCallback(() => {
    timeline.start();
  }, [timeline]);

  // Pause the simulation
  const pauseChat = useCallback(() => {
    timeline.pause();
  }, [timeline]);

  // Resume the simulation
  const resumeChat = useCallback(() => {
    timeline.resume();
  }, [timeline]);

  // Reset the simulation
  const resetChat = useCallback(() => {
    timeline.reset();
  }, [timeline]);

  // Execute an action on a message (tutor only)
  const executeAction = useCallback(
    async (messageId: string, actionType: ActionType) => {
      if (role !== 'TUTOR') return;

      // Track the action in metrics
      metrics.onAction(actionType, messageId);

      // Create the action in the backend
      await actions.createAction(messageId, actionType);
    },
    [role, metrics, actions]
  );

  // Undo last action
  const undoLastAction = useCallback(async () => {
    if (role !== 'TUTOR' || !actions.canUndo) return;

    metrics.onUndo();
    await actions.undoLastAction();
  }, [role, actions, metrics]);

  // Get participant by ID
  const getParticipant = useCallback(
    (participantId: string) => {
      return participants.find((p) => p.id === participantId);
    },
    [participants]
  );

  // Get actions for a message
  const getMessageActions = useCallback(
    (messageId: string) => {
      return actions.getActionsForMessage(messageId);
    },
    [actions]
  );

  // Check if message has specific action
  const messageHasAction = useCallback(
    (messageId: string, actionType: ActionType) => {
      return actions.hasAction(messageId, actionType);
    },
    [actions]
  );

  // Finalize and get metrics
  const finalizeChat = useCallback(() => {
    return metrics.finalize();
  }, [metrics]);

  const typingParticipant = timeline.typingParticipantId
    ? participants.find((p) => p.id === timeline.typingParticipantId) ?? null
    : null;

  return {
    // Timeline state (exposed directly — no intermediate useEffect)
    visibleMessages: timeline.visibleMessages,
    isPlaying: timeline.isPlaying,
    isPaused: timeline.isPaused,
    isComplete: timeline.isComplete,
    typingParticipant,

    // Static state — derive canTakeActions from current role (not initial render)
    canTakeActions: role === 'TUTOR',
    participants: chatState.participants,

    stats: metrics.getStats(),
    canUndo: actions.canUndo,
    isLoading: actions.isLoading,

    // Timeline controls
    startChat,
    pauseChat,
    resumeChat,
    resetChat,

    // Action controls (tutor only)
    executeAction,
    undoLastAction,

    // Hover tracking for metrics
    onMessageHoverStart: metrics.onHoverStart,
    onMessageHoverEnd: metrics.onHoverEnd,

    // Helpers
    getParticipant,
    getMessageActions,
    messageHasAction,
    finalizeChat,
  };
}
