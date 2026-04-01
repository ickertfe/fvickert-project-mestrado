import { describe, it, expect } from 'vitest';
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
  getTotalDuration,
} from '@/lib/timeline';
import type { Message } from '@/types/message';

const mockMessages: Message[] = [
  {
    id: 'msg-1',
    scenarioId: 'scenario-1',
    participantId: 'part-1',
    content: 'Hello',
    type: 'TEXT',
    appearDelay: 0,
    typingDuration: 1000,
    order: 1,
  },
  {
    id: 'msg-2',
    scenarioId: 'scenario-1',
    participantId: 'part-2',
    content: 'Hi there',
    type: 'TEXT',
    appearDelay: 500,
    typingDuration: 800,
    order: 2,
  },
];

describe('initializeTimeline', () => {
  it('should initialize timeline with correct state', () => {
    const state = initializeTimeline(mockMessages);

    expect(state.messages).toHaveLength(2);
    expect(state.currentIndex).toBe(0);
    expect(state.isPlaying).toBe(false);
    expect(state.isPaused).toBe(false);
    expect(state.isComplete).toBe(false);
    expect(state.typingParticipantId).toBeNull();
  });

  it('should set all messages as not visible', () => {
    const state = initializeTimeline(mockMessages);

    state.messages.forEach((msg) => {
      expect(msg.isVisible).toBe(false);
    });
  });

  it('should sort messages by order', () => {
    const unorderedMessages = [...mockMessages].reverse();
    const state = initializeTimeline(unorderedMessages);

    expect(state.messages[0].order).toBe(1);
    expect(state.messages[1].order).toBe(2);
  });
});

describe('startTimeline', () => {
  it('should set isPlaying to true', () => {
    const state = initializeTimeline(mockMessages);
    const updated = startTimeline(state);

    expect(updated.isPlaying).toBe(true);
    expect(updated.isPaused).toBe(false);
    expect(updated.startTime).not.toBeNull();
  });
});

describe('pauseTimeline', () => {
  it('should set isPaused to true', () => {
    let state = initializeTimeline(mockMessages);
    state = startTimeline(state);
    const updated = pauseTimeline(state);

    expect(updated.isPlaying).toBe(false);
    expect(updated.isPaused).toBe(true);
  });
});

describe('resumeTimeline', () => {
  it('should set isPlaying to true', () => {
    let state = initializeTimeline(mockMessages);
    state = startTimeline(state);
    state = pauseTimeline(state);
    const updated = resumeTimeline(state);

    expect(updated.isPlaying).toBe(true);
    expect(updated.isPaused).toBe(false);
  });
});

describe('showTypingIndicator', () => {
  it('should set typing participant', () => {
    const state = initializeTimeline(mockMessages);
    const updated = showTypingIndicator(state, 'part-1');

    expect(updated.typingParticipantId).toBe('part-1');
    expect(updated.messages[0].isTyping).toBe(true);
  });
});

describe('hideTypingIndicator', () => {
  it('should clear typing indicator', () => {
    let state = initializeTimeline(mockMessages);
    state = showTypingIndicator(state, 'part-1');
    const updated = hideTypingIndicator(state);

    expect(updated.typingParticipantId).toBeNull();
    updated.messages.forEach((msg) => {
      expect(msg.isTyping).toBe(false);
    });
  });
});

describe('showMessage', () => {
  it('should make message visible', () => {
    const state = initializeTimeline(mockMessages);
    const updated = showMessage(state, 0);

    expect(updated.messages[0].isVisible).toBe(true);
    expect(updated.currentIndex).toBe(1);
  });

  it('should set isComplete when last message shown', () => {
    let state = initializeTimeline(mockMessages);
    state = showMessage(state, 0);
    const updated = showMessage(state, 1);

    expect(updated.isComplete).toBe(true);
    expect(updated.isPlaying).toBe(false);
  });
});

describe('applyAction', () => {
  it('should apply DELETE_MESSAGE action', () => {
    let state = initializeTimeline(mockMessages);
    state = showMessage(state, 0);
    const updated = applyAction(state, 'msg-1', 'DELETE_MESSAGE');

    expect(updated.messages[0].isDeleted).toBe(true);
    expect(updated.messages[0].appliedActions).toContain('DELETE_MESSAGE');
  });

  it('should apply WARN_MESSAGE action', () => {
    let state = initializeTimeline(mockMessages);
    state = showMessage(state, 0);
    const updated = applyAction(state, 'msg-1', 'WARN_MESSAGE');

    expect(updated.messages[0].hasWarning).toBe(true);
  });

  it('should apply MARK_DANGER action', () => {
    let state = initializeTimeline(mockMessages);
    state = showMessage(state, 0);
    const updated = applyAction(state, 'msg-1', 'MARK_DANGER');

    expect(updated.messages[0].hasDangerMark).toBe(true);
  });

  it('should apply MARK_ATTENTION action', () => {
    let state = initializeTimeline(mockMessages);
    state = showMessage(state, 0);
    const updated = applyAction(state, 'msg-1', 'MARK_ATTENTION');

    expect(updated.messages[0].hasAttentionMark).toBe(true);
  });
});

describe('undoAction', () => {
  it('should undo DELETE_MESSAGE action', () => {
    let state = initializeTimeline(mockMessages);
    state = showMessage(state, 0);
    state = applyAction(state, 'msg-1', 'DELETE_MESSAGE');
    const updated = undoAction(state, 'msg-1', 'DELETE_MESSAGE');

    expect(updated.messages[0].isDeleted).toBe(false);
    expect(updated.messages[0].appliedActions).not.toContain('DELETE_MESSAGE');
  });
});

describe('getVisibleMessages', () => {
  it('should return only visible messages', () => {
    let state = initializeTimeline(mockMessages);
    state = showMessage(state, 0);
    const visible = getVisibleMessages(state);

    expect(visible).toHaveLength(1);
    expect(visible[0].id).toBe('msg-1');
  });
});

describe('getTotalDuration', () => {
  it('should calculate total duration', () => {
    const duration = getTotalDuration(mockMessages);

    // msg-1: 0 + 1000 = 1000
    // msg-2: 500 + 800 = 1300
    // Total: 2300
    expect(duration).toBe(2300);
  });
});
