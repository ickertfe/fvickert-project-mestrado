'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Message, DisplayMessage } from '@/types/message';
import type { ActionType } from '@/types/action';
import {
  initializeTimeline,
  startTimeline,
  pauseTimeline,
  resumeTimeline,
  showTypingIndicator,
  hideTypingIndicator,
  showMessage,
  applyAction,
  undoAction,
  getVisibleMessages,
  type TimelineState,
} from '@/lib/timeline';

interface UseTimelineOptions {
  onMessageAppear?: (message: DisplayMessage) => void;
  onTypingStart?: (participantId: string) => void;
  onTypingEnd?: () => void;
  onComplete?: () => void;
}

export function useTimeline(messages: Message[], options: UseTimelineOptions = {}) {
  const [state, setState] = useState<TimelineState>(() => initializeTimeline(messages));
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRunningRef = useRef(false);

  const clearTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const scheduleNextMessage = useCallback(() => {
    if (!isRunningRef.current) return;

    setState((currentState) => {
      if (currentState.isComplete || currentState.isPaused) return currentState;

      const nextMessage = currentState.messages[currentState.currentIndex];
      if (!nextMessage) {
        options.onComplete?.();
        return { ...currentState, isComplete: true, isPlaying: false };
      }

      // Schedule typing indicator if present
      const typingDuration = nextMessage.typingDuration;
      if (typingDuration && typingDuration > 0) {
        timeoutRef.current = setTimeout(() => {
          setState((s) => {
            options.onTypingStart?.(nextMessage.participantId);
            return showTypingIndicator(s, nextMessage.participantId);
          });

          // Schedule message appearance after typing
          timeoutRef.current = setTimeout(() => {
            setState((s) => {
              const newState = hideTypingIndicator(s);
              options.onTypingEnd?.();
              const finalState = showMessage(newState, currentState.currentIndex);
              options.onMessageAppear?.(finalState.messages[currentState.currentIndex]);
              return finalState;
            });

            scheduleNextMessage();
          }, typingDuration);
        }, nextMessage.appearDelay);
      } else {
        // No typing, just show message after delay
        timeoutRef.current = setTimeout(() => {
          setState((s) => {
            const newState = showMessage(s, currentState.currentIndex);
            options.onMessageAppear?.(newState.messages[currentState.currentIndex]);
            return newState;
          });

          scheduleNextMessage();
        }, nextMessage.appearDelay);
      }

      return currentState;
    });
  }, [options]);

  const start = useCallback(() => {
    isRunningRef.current = true;
    setState((s) => startTimeline(s));
    scheduleNextMessage();
  }, [scheduleNextMessage]);

  const pause = useCallback(() => {
    isRunningRef.current = false;
    clearTimeouts();
    setState((s) => pauseTimeline(s));
  }, [clearTimeouts]);

  const resume = useCallback(() => {
    isRunningRef.current = true;
    setState((s) => resumeTimeline(s));
    scheduleNextMessage();
  }, [scheduleNextMessage]);

  const reset = useCallback(() => {
    isRunningRef.current = false;
    clearTimeouts();
    setState(initializeTimeline(messages));
  }, [messages, clearTimeouts]);

  const executeAction = useCallback((messageId: string, action: ActionType) => {
    setState((s) => applyAction(s, messageId, action));
  }, []);

  const executeUndo = useCallback((messageId: string, action: ActionType) => {
    setState((s) => undoAction(s, messageId, action));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeouts();
      isRunningRef.current = false;
    };
  }, [clearTimeouts]);

  return {
    // State
    messages: state.messages,
    visibleMessages: getVisibleMessages(state),
    currentIndex: state.currentIndex,
    isPlaying: state.isPlaying,
    isPaused: state.isPaused,
    isComplete: state.isComplete,
    typingParticipantId: state.typingParticipantId,

    // Actions
    start,
    pause,
    resume,
    reset,
    executeAction,
    executeUndo,
  };
}
