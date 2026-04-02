import type { ActionType } from './action';

export interface SessionMetrics {
  id: string;
  sessionId: string;
  totalDuration: number; // ms
  firstActionTime: number | null; // ms until first action
  totalActions: number;
  totalUndos: number;
  hesitationEvents: HesitationEvent[];
  decisionSequence: DecisionEvent[];
  actionTimings: ActionTiming[];
  createdAt: Date;
}

export interface HesitationEvent {
  messageId: string;
  duration: number; // ms
  timestamp: number; // Unix timestamp
  actionType?: ActionType;
  isFixation?: boolean; // true when hover > 1500ms (sustained focus on message)
}

export interface DecisionEvent {
  action: ActionType;
  timestamp: number; // Unix timestamp
  messageId: string;
  undone: boolean;
}

export interface ActionTiming {
  fromAction: ActionType | 'START';
  toAction: ActionType;
  duration: number; // ms between actions
  messageId: string;
}

export interface CreateMetricsInput {
  sessionId: string;
  totalDuration: number;
  firstActionTime?: number | null;
  totalActions: number;
  totalUndos: number;
  hesitationEvents: HesitationEvent[];
  decisionSequence: DecisionEvent[];
  actionTimings: ActionTiming[];
}

// Real-time metrics tracking
export interface MetricsTracker {
  sessionId: string;
  startTime: number;
  lastActionTime: number | null;
  actions: DecisionEvent[];
  hesitations: HesitationEvent[];
  currentHover: {
    messageId: string;
    actionType: ActionType;
    startTime: number;
  } | null;
}

// Aggregated metrics for reports
export interface AggregatedMetrics {
  totalSessions: number;
  completedSessions: number;
  averageDuration: number;
  averageFirstActionTime: number;
  averageActionsPerSession: number;
  actionDistribution: Record<ActionType, number>;
  averageHesitationTime: number;
  undoRate: number;
}

// Export format for CSV
export interface MetricsExportRow {
  sessionId: string;
  participantName: string;
  participantEmail: string;
  role: string;
  scenarioName: string;
  scenarioType: string;
  totalDuration: number;
  firstActionTime: number | null;
  totalActions: number;
  totalUndos: number;
  hesitationCount: number;
  completedAt: string;
}
