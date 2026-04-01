import type {
  MetricsTracker,
  HesitationEvent,
  DecisionEvent,
  ActionTiming,
  SessionMetrics,
  AggregatedMetrics,
  MetricsExportRow,
} from '@/types/metrics';
import type { ActionType } from '@/types/action';
import type { Session } from '@/types/session';

const HESITATION_THRESHOLD = 500; // ms - minimum hover time to count as hesitation

export function createMetricsTracker(sessionId: string): MetricsTracker {
  return {
    sessionId,
    startTime: Date.now(),
    lastActionTime: null,
    actions: [],
    hesitations: [],
    currentHover: null,
  };
}

export function startHover(
  tracker: MetricsTracker,
  messageId: string,
  actionType: ActionType
): MetricsTracker {
  return {
    ...tracker,
    currentHover: {
      messageId,
      actionType,
      startTime: Date.now(),
    },
  };
}

export function endHover(tracker: MetricsTracker): MetricsTracker {
  if (!tracker.currentHover) return tracker;

  const duration = Date.now() - tracker.currentHover.startTime;

  // Only record as hesitation if above threshold
  if (duration >= HESITATION_THRESHOLD) {
    const hesitation: HesitationEvent = {
      messageId: tracker.currentHover.messageId,
      duration,
      timestamp: tracker.currentHover.startTime,
      actionType: tracker.currentHover.actionType,
    };

    return {
      ...tracker,
      hesitations: [...tracker.hesitations, hesitation],
      currentHover: null,
    };
  }

  return {
    ...tracker,
    currentHover: null,
  };
}

export function recordAction(
  tracker: MetricsTracker,
  action: ActionType,
  messageId: string
): MetricsTracker {
  const now = Date.now();
  const decision: DecisionEvent = {
    action,
    timestamp: now,
    messageId,
    undone: false,
  };

  return {
    ...tracker,
    lastActionTime: now,
    actions: [...tracker.actions, decision],
    currentHover: null, // Clear any active hover
  };
}

export function recordUndo(tracker: MetricsTracker, actionIndex: number): MetricsTracker {
  const updatedActions = tracker.actions.map((action, index) =>
    index === actionIndex ? { ...action, undone: true } : action
  );

  return {
    ...tracker,
    actions: updatedActions,
  };
}

export function calculateActionTimings(actions: DecisionEvent[]): ActionTiming[] {
  const timings: ActionTiming[] = [];

  for (let i = 0; i < actions.length; i++) {
    const current = actions[i];
    const previous = i > 0 ? actions[i - 1] : null;

    timings.push({
      fromAction: previous?.action || 'START',
      toAction: current.action,
      duration: previous ? current.timestamp - previous.timestamp : 0,
      messageId: current.messageId,
    });
  }

  return timings;
}

export function finalizeMetrics(tracker: MetricsTracker): Omit<SessionMetrics, 'id' | 'createdAt'> {
  const endTime = Date.now();
  const totalDuration = endTime - tracker.startTime;
  const firstAction = tracker.actions[0];
  const firstActionTime = firstAction ? firstAction.timestamp - tracker.startTime : null;
  const totalUndos = tracker.actions.filter((a) => a.undone).length;

  return {
    sessionId: tracker.sessionId,
    totalDuration,
    firstActionTime,
    totalActions: tracker.actions.length,
    totalUndos,
    hesitationEvents: tracker.hesitations,
    decisionSequence: tracker.actions,
    actionTimings: calculateActionTimings(tracker.actions),
  };
}

export function aggregateMetrics(sessions: Session[]): AggregatedMetrics {
  const completedSessions = sessions.filter((s) => s.completedAt);
  const metrics = completedSessions.map((s) => s.metrics).filter(Boolean) as SessionMetrics[];

  if (metrics.length === 0) {
    return {
      totalSessions: sessions.length,
      completedSessions: 0,
      averageDuration: 0,
      averageFirstActionTime: 0,
      averageActionsPerSession: 0,
      actionDistribution: {} as Record<ActionType, number>,
      averageHesitationTime: 0,
      undoRate: 0,
    };
  }

  const totalDuration = metrics.reduce((sum, m) => sum + m.totalDuration, 0);
  const totalFirstActionTimes = metrics
    .filter((m) => m.firstActionTime !== null)
    .reduce((sum, m) => sum + (m.firstActionTime || 0), 0);
  const sessionsWithFirstAction = metrics.filter((m) => m.firstActionTime !== null).length;
  const totalActions = metrics.reduce((sum, m) => sum + m.totalActions, 0);
  const totalUndos = metrics.reduce((sum, m) => sum + m.totalUndos, 0);

  // Calculate action distribution
  const actionDistribution: Record<ActionType, number> = {
    DELETE_MESSAGE: 0,
    WARN_MESSAGE: 0,
    KICK_PARTICIPANT: 0,
    MARK_DANGER: 0,
    MARK_ATTENTION: 0,
    ADD_NOTE: 0,
    UNDO: 0,
  };

  metrics.forEach((m) => {
    m.decisionSequence.forEach((d) => {
      actionDistribution[d.action]++;
    });
  });

  // Calculate average hesitation time
  const allHesitations = metrics.flatMap((m) => m.hesitationEvents);
  const totalHesitationTime = allHesitations.reduce((sum, h) => sum + h.duration, 0);

  return {
    totalSessions: sessions.length,
    completedSessions: completedSessions.length,
    averageDuration: totalDuration / metrics.length,
    averageFirstActionTime:
      sessionsWithFirstAction > 0 ? totalFirstActionTimes / sessionsWithFirstAction : 0,
    averageActionsPerSession: totalActions / metrics.length,
    actionDistribution,
    averageHesitationTime:
      allHesitations.length > 0 ? totalHesitationTime / allHesitations.length : 0,
    undoRate: totalActions > 0 ? totalUndos / totalActions : 0,
  };
}

export function formatMetricsForExport(session: Session): MetricsExportRow {
  return {
    sessionId: session.id,
    participantName: session.participantName,
    participantEmail: session.participantEmail,
    role: session.role,
    scenarioName: session.scenario?.name || '',
    scenarioType: session.scenario?.type || '',
    totalDuration: session.metrics?.totalDuration || 0,
    firstActionTime: session.metrics?.firstActionTime || null,
    totalActions: session.metrics?.totalActions || 0,
    totalUndos: session.metrics?.totalUndos || 0,
    hesitationCount: session.metrics?.hesitationEvents.length || 0,
    completedAt: session.completedAt?.toISOString() || '',
  };
}

export function exportToCSV(rows: MetricsExportRow[]): string {
  const headers = [
    'Session ID',
    'Participant Name',
    'Participant Email',
    'Role',
    'Scenario Name',
    'Scenario Type',
    'Total Duration (ms)',
    'First Action Time (ms)',
    'Total Actions',
    'Total Undos',
    'Hesitation Count',
    'Completed At',
  ];

  const csvRows = rows.map((row) =>
    [
      row.sessionId,
      `"${row.participantName}"`,
      row.participantEmail,
      row.role,
      `"${row.scenarioName}"`,
      row.scenarioType,
      row.totalDuration,
      row.firstActionTime ?? '',
      row.totalActions,
      row.totalUndos,
      row.hesitationCount,
      row.completedAt,
    ].join(',')
  );

  return [headers.join(','), ...csvRows].join('\n');
}
