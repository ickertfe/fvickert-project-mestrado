import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createMetricsTracker,
  startHover,
  endHover,
  recordAction,
  recordUndo,
  finalizeMetrics,
  calculateActionTimings,
} from '@/lib/metrics';

describe('createMetricsTracker', () => {
  it('should create a new tracker with correct initial state', () => {
    const tracker = createMetricsTracker('session-1');

    expect(tracker.sessionId).toBe('session-1');
    expect(tracker.actions).toEqual([]);
    expect(tracker.hesitations).toEqual([]);
    expect(tracker.currentHover).toBeNull();
    expect(tracker.lastActionTime).toBeNull();
    expect(typeof tracker.startTime).toBe('number');
  });
});

describe('startHover', () => {
  it('should set current hover', () => {
    const tracker = createMetricsTracker('session-1');
    const updated = startHover(tracker, 'msg-1', 'DELETE_MESSAGE');

    expect(updated.currentHover).not.toBeNull();
    expect(updated.currentHover?.messageId).toBe('msg-1');
    expect(updated.currentHover?.actionType).toBe('DELETE_MESSAGE');
  });
});

describe('endHover', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should record hesitation if hover duration >= 500ms', () => {
    let tracker = createMetricsTracker('session-1');
    tracker = startHover(tracker, 'msg-1', 'DELETE_MESSAGE');

    vi.advanceTimersByTime(600);

    const updated = endHover(tracker);

    expect(updated.currentHover).toBeNull();
    expect(updated.hesitations).toHaveLength(1);
    expect(updated.hesitations[0].messageId).toBe('msg-1');
    expect(updated.hesitations[0].duration).toBeGreaterThanOrEqual(500);
  });

  it('should not record hesitation if hover duration < 500ms', () => {
    let tracker = createMetricsTracker('session-1');
    tracker = startHover(tracker, 'msg-1', 'DELETE_MESSAGE');

    vi.advanceTimersByTime(200);

    const updated = endHover(tracker);

    expect(updated.currentHover).toBeNull();
    expect(updated.hesitations).toHaveLength(0);
  });

  it('should return unchanged tracker if no current hover', () => {
    const tracker = createMetricsTracker('session-1');
    const updated = endHover(tracker);

    expect(updated).toEqual(tracker);
  });
});

describe('recordAction', () => {
  it('should add action to tracker', () => {
    const tracker = createMetricsTracker('session-1');
    const updated = recordAction(tracker, 'DELETE_MESSAGE', 'msg-1');

    expect(updated.actions).toHaveLength(1);
    expect(updated.actions[0].action).toBe('DELETE_MESSAGE');
    expect(updated.actions[0].messageId).toBe('msg-1');
    expect(updated.actions[0].undone).toBe(false);
  });

  it('should update lastActionTime', () => {
    const tracker = createMetricsTracker('session-1');
    const updated = recordAction(tracker, 'DELETE_MESSAGE', 'msg-1');

    expect(updated.lastActionTime).not.toBeNull();
  });

  it('should clear current hover', () => {
    let tracker = createMetricsTracker('session-1');
    tracker = startHover(tracker, 'msg-1', 'DELETE_MESSAGE');
    const updated = recordAction(tracker, 'DELETE_MESSAGE', 'msg-1');

    expect(updated.currentHover).toBeNull();
  });
});

describe('recordUndo', () => {
  it('should mark action as undone', () => {
    let tracker = createMetricsTracker('session-1');
    tracker = recordAction(tracker, 'DELETE_MESSAGE', 'msg-1');
    const updated = recordUndo(tracker, 0);

    expect(updated.actions[0].undone).toBe(true);
  });
});

describe('calculateActionTimings', () => {
  it('should calculate timings between actions', () => {
    const actions = [
      { action: 'DELETE_MESSAGE' as const, timestamp: 1000, messageId: 'msg-1', undone: false },
      { action: 'WARN_MESSAGE' as const, timestamp: 2000, messageId: 'msg-2', undone: false },
    ];

    const timings = calculateActionTimings(actions);

    expect(timings).toHaveLength(2);
    expect(timings[0].fromAction).toBe('START');
    expect(timings[0].toAction).toBe('DELETE_MESSAGE');
    expect(timings[1].fromAction).toBe('DELETE_MESSAGE');
    expect(timings[1].toAction).toBe('WARN_MESSAGE');
    expect(timings[1].duration).toBe(1000);
  });
});

describe('finalizeMetrics', () => {
  it('should calculate final metrics', () => {
    let tracker = createMetricsTracker('session-1');
    tracker = recordAction(tracker, 'DELETE_MESSAGE', 'msg-1');
    tracker = recordAction(tracker, 'WARN_MESSAGE', 'msg-2');
    tracker = recordUndo(tracker, 1);

    const metrics = finalizeMetrics(tracker);

    expect(metrics.sessionId).toBe('session-1');
    expect(metrics.totalActions).toBe(2);
    expect(metrics.totalUndos).toBe(1);
    expect(typeof metrics.totalDuration).toBe('number');
    expect(typeof metrics.firstActionTime).toBe('number');
  });

  it('should set firstActionTime to null if no actions', () => {
    const tracker = createMetricsTracker('session-1');
    const metrics = finalizeMetrics(tracker);

    expect(metrics.firstActionTime).toBeNull();
  });
});
