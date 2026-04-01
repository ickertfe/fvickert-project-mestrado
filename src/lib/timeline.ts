import type { Message, DisplayMessage } from '@/types/message';
import type { ActionType } from '@/types/action';

export interface TimelineState {
  messages: DisplayMessage[];
  currentIndex: number;
  isPlaying: boolean;
  isPaused: boolean;
  isComplete: boolean;
  typingParticipantId: string | null;
  startTime: number | null;
}

export interface TimelineEvent {
  type: 'TYPING_START' | 'TYPING_END' | 'MESSAGE_APPEAR' | 'TIMELINE_COMPLETE';
  messageId?: string;
  participantId?: string;
  timestamp: number;
}

export function initializeTimeline(messages: Message[]): TimelineState {
  const displayMessages: DisplayMessage[] = messages
    .sort((a, b) => a.order - b.order)
    .map((msg) => ({
      ...msg,
      isVisible: false,
      isTyping: false,
      appliedActions: [],
      isDeleted: false,
      hasWarning: false,
      hasDangerMark: false,
      hasAttentionMark: false,
    }));

  return {
    messages: displayMessages,
    currentIndex: 0,
    isPlaying: false,
    isPaused: false,
    isComplete: false,
    typingParticipantId: null,
    startTime: null,
  };
}

export function calculateMessageTimings(messages: Message[]): number[] {
  const timings: number[] = [];
  let cumulativeTime = 0;

  for (const message of messages.sort((a, b) => a.order - b.order)) {
    // Add appear delay
    cumulativeTime += message.appearDelay;

    // Add typing duration if present
    if (message.typingDuration) {
      timings.push(cumulativeTime); // Typing starts
      cumulativeTime += message.typingDuration;
    }

    timings.push(cumulativeTime); // Message appears
  }

  return timings;
}

export function getTotalDuration(messages: Message[]): number {
  return messages.reduce((total, msg) => {
    return total + msg.appearDelay + (msg.typingDuration || 0);
  }, 0);
}

export function startTimeline(state: TimelineState): TimelineState {
  return {
    ...state,
    isPlaying: true,
    isPaused: false,
    startTime: Date.now(),
  };
}

export function pauseTimeline(state: TimelineState): TimelineState {
  return {
    ...state,
    isPlaying: false,
    isPaused: true,
  };
}

export function resumeTimeline(state: TimelineState): TimelineState {
  return {
    ...state,
    isPlaying: true,
    isPaused: false,
  };
}

export function showTypingIndicator(
  state: TimelineState,
  participantId: string
): TimelineState {
  return {
    ...state,
    typingParticipantId: participantId,
    messages: state.messages.map((msg, index) =>
      index === state.currentIndex ? { ...msg, isTyping: true } : msg
    ),
  };
}

export function hideTypingIndicator(state: TimelineState): TimelineState {
  return {
    ...state,
    typingParticipantId: null,
    messages: state.messages.map((msg) => ({ ...msg, isTyping: false })),
  };
}

export function showMessage(state: TimelineState, messageIndex: number): TimelineState {
  const newMessages = state.messages.map((msg, index) =>
    index === messageIndex ? { ...msg, isVisible: true, isTyping: false } : msg
  );

  const isComplete = messageIndex >= state.messages.length - 1;

  return {
    ...state,
    messages: newMessages,
    currentIndex: messageIndex + 1,
    typingParticipantId: null,
    isComplete,
    isPlaying: !isComplete,
  };
}

export function applyAction(
  state: TimelineState,
  messageId: string,
  action: ActionType
): TimelineState {
  const newMessages = state.messages.map((msg) => {
    if (msg.id !== messageId) return msg;

    const updates: Partial<DisplayMessage> = {
      appliedActions: [...msg.appliedActions, action],
    };

    switch (action) {
      case 'DELETE_MESSAGE':
        updates.isDeleted = true;
        break;
      case 'WARN_MESSAGE':
        updates.hasWarning = true;
        break;
      case 'MARK_DANGER':
        updates.hasDangerMark = true;
        break;
      case 'MARK_ATTENTION':
        updates.hasAttentionMark = true;
        break;
    }

    return { ...msg, ...updates };
  });

  return {
    ...state,
    messages: newMessages,
  };
}

export function undoAction(
  state: TimelineState,
  messageId: string,
  action: ActionType
): TimelineState {
  const newMessages = state.messages.map((msg) => {
    if (msg.id !== messageId) return msg;

    const updatedActions = msg.appliedActions.filter((a) => a !== action);
    const updates: Partial<DisplayMessage> = {
      appliedActions: updatedActions,
    };

    switch (action) {
      case 'DELETE_MESSAGE':
        updates.isDeleted = false;
        break;
      case 'WARN_MESSAGE':
        updates.hasWarning = false;
        break;
      case 'MARK_DANGER':
        updates.hasDangerMark = false;
        break;
      case 'MARK_ATTENTION':
        updates.hasAttentionMark = false;
        break;
    }

    return { ...msg, ...updates };
  });

  return {
    ...state,
    messages: newMessages,
  };
}

export function getVisibleMessages(state: TimelineState): DisplayMessage[] {
  return state.messages.filter((msg) => msg.isVisible);
}

export function getNextMessageDelay(state: TimelineState): number | null {
  const nextMessage = state.messages[state.currentIndex];
  if (!nextMessage) return null;

  return nextMessage.appearDelay + (nextMessage.typingDuration || 0);
}

export function getTypingDuration(state: TimelineState): number | null {
  const nextMessage = state.messages[state.currentIndex];
  if (!nextMessage || !nextMessage.typingDuration) return null;

  return nextMessage.typingDuration;
}

export function getNextParticipantId(state: TimelineState): string | null {
  const nextMessage = state.messages[state.currentIndex];
  return nextMessage?.participantId || null;
}
