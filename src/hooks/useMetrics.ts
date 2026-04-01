'use client';

import { useState, useCallback, useRef } from 'react';
import type { ActionType } from '@/types/action';
import type { MetricsTracker, SessionMetrics } from '@/types/metrics';
import {
  createMetricsTracker,
  startHover,
  endHover,
  recordAction,
  recordUndo,
  finalizeMetrics,
} from '@/lib/metrics';

interface UseMetricsOptions {
  sessionId: string;
  onMetricsUpdate?: (metrics: Partial<SessionMetrics>) => void;
}

export function useMetrics({ sessionId, onMetricsUpdate }: UseMetricsOptions) {
  const [tracker, setTracker] = useState<MetricsTracker>(() =>
    createMetricsTracker(sessionId)
  );
  const lastActionIndexRef = useRef<number>(-1);

  const handleHoverStart = useCallback((messageId: string, actionType: ActionType) => {
    setTracker((t) => startHover(t, messageId, actionType));
  }, []);

  const handleHoverEnd = useCallback(() => {
    setTracker((t) => endHover(t));
  }, []);

  const handleAction = useCallback(
    (action: ActionType, messageId: string) => {
      setTracker((t) => {
        const newTracker = recordAction(t, action, messageId);
        lastActionIndexRef.current = newTracker.actions.length - 1;

        // Notify about metrics update
        onMetricsUpdate?.({
          totalActions: newTracker.actions.length,
          totalUndos: newTracker.actions.filter((a) => a.undone).length,
          firstActionTime:
            newTracker.actions.length === 1
              ? newTracker.actions[0].timestamp - newTracker.startTime
              : undefined,
        });

        return newTracker;
      });
    },
    [onMetricsUpdate]
  );

  const handleUndo = useCallback(() => {
    if (lastActionIndexRef.current < 0) return;

    setTracker((t) => {
      const newTracker = recordUndo(t, lastActionIndexRef.current);
      lastActionIndexRef.current--;

      onMetricsUpdate?.({
        totalUndos: newTracker.actions.filter((a) => a.undone).length,
      });

      return newTracker;
    });
  }, [onMetricsUpdate]);

  const getLastAction = useCallback(() => {
    if (tracker.actions.length === 0) return null;
    return tracker.actions[tracker.actions.length - 1];
  }, [tracker.actions]);

  const finalize = useCallback(() => {
    return finalizeMetrics(tracker);
  }, [tracker]);

  const getStats = useCallback(() => {
    return {
      totalActions: tracker.actions.length,
      totalUndos: tracker.actions.filter((a) => a.undone).length,
      totalHesitations: tracker.hesitations.length,
      elapsedTime: Date.now() - tracker.startTime,
    };
  }, [tracker]);

  return {
    // Hover tracking
    onHoverStart: handleHoverStart,
    onHoverEnd: handleHoverEnd,

    // Action tracking
    onAction: handleAction,
    onUndo: handleUndo,

    // Getters
    getLastAction,
    getStats,
    finalize,

    // Raw tracker (for debugging)
    tracker,
  };
}
