'use client';

import { useState, useCallback } from 'react';
import type { ActionType, MessageAction, CreateActionInput } from '@/types/action';

interface UseActionsOptions {
  sessionId: string;
  onActionCreated?: (action: MessageAction) => void;
  onActionUndone?: (actionId: string) => void;
  onError?: (error: Error) => void;
}

interface ActionState {
  actions: MessageAction[];
  isLoading: boolean;
  error: string | null;
}

export function useActions({
  sessionId,
  onActionCreated,
  onActionUndone,
  onError,
}: UseActionsOptions) {
  const [state, setState] = useState<ActionState>({
    actions: [],
    isLoading: false,
    error: null,
  });

  const createAction = useCallback(
    async (messageId: string, type: ActionType, metadata?: Record<string, unknown>) => {
      setState((s) => ({ ...s, isLoading: true, error: null }));

      try {
        const input: CreateActionInput = {
          sessionId,
          messageId,
          type,
          metadata,
        };

        const response = await fetch('/api/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          throw new Error('Failed to create action');
        }

        const action: MessageAction = await response.json();

        setState((s) => ({
          ...s,
          actions: [...s.actions, action],
          isLoading: false,
        }));

        onActionCreated?.(action);
        return action;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        setState((s) => ({ ...s, isLoading: false, error: err.message }));
        onError?.(err);
        throw err;
      }
    },
    [sessionId, onActionCreated, onError]
  );

  const undoLastAction = useCallback(async () => {
    const lastAction = state.actions[state.actions.length - 1];
    if (!lastAction || lastAction.undone) return null;

    setState((s) => ({ ...s, isLoading: true, error: null }));

    try {
      const response = await fetch(`/api/actions/${lastAction.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to undo action');
      }

      setState((s) => ({
        ...s,
        actions: s.actions.map((a) =>
          a.id === lastAction.id ? { ...a, undone: true, undoneAt: new Date() } : a
        ),
        isLoading: false,
      }));

      onActionUndone?.(lastAction.id);
      return lastAction;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      setState((s) => ({ ...s, isLoading: false, error: err.message }));
      onError?.(err);
      throw err;
    }
  }, [state.actions, onActionUndone, onError]);

  const getActionsForMessage = useCallback(
    (messageId: string) => {
      return state.actions.filter((a) => a.messageId === messageId && !a.undone);
    },
    [state.actions]
  );

  const hasAction = useCallback(
    (messageId: string, type: ActionType) => {
      return state.actions.some(
        (a) => a.messageId === messageId && a.type === type && !a.undone
      );
    },
    [state.actions]
  );

  const canUndo = state.actions.length > 0 && !state.actions[state.actions.length - 1]?.undone;

  return {
    // State
    actions: state.actions,
    isLoading: state.isLoading,
    error: state.error,
    canUndo,

    // Actions
    createAction,
    undoLastAction,
    getActionsForMessage,
    hasAction,

    // Action shortcuts
    deleteMessage: (messageId: string) => createAction(messageId, 'DELETE_MESSAGE'),
    warnMessage: (messageId: string) => createAction(messageId, 'WARN_MESSAGE'),
    kickParticipant: (messageId: string, participantId: string, participantName: string) =>
      createAction(messageId, 'KICK_PARTICIPANT', { participantId, participantName }),
    markDanger: (messageId: string) => createAction(messageId, 'MARK_DANGER'),
    markAttention: (messageId: string) => createAction(messageId, 'MARK_ATTENTION'),
    addNote: (messageId: string, content: string) =>
      createAction(messageId, 'ADD_NOTE', { noteContent: content }),
  };
}
