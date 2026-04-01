import type { Scenario } from './scenario';
import type { MessageAction } from './action';
import type { SessionMetrics } from './metrics';

export type SessionRole = 'TUTOR' | 'BYSTANDER';

export interface Session {
  id: string;
  participantName: string;
  participantEmail: string;
  role: SessionRole;
  scenarioId: string;
  scenario?: Scenario;
  disclaimerAccepted: boolean;
  disclaimerAcceptedAt?: Date | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  actions?: MessageAction[];
  metrics?: SessionMetrics | null;
  notes?: Note[];
  bystanderAnswers?: BystanderAnswer[];
  createdAt: Date;
}

export interface SessionListItem {
  id: string;
  participantName: string;
  participantEmail: string;
  role: SessionRole;
  scenarioName: string;
  scenarioType: string;
  startedAt?: Date | null;
  completedAt?: Date | null;
  totalActions: number;
  createdAt: Date;
}

export interface CreateSessionInput {
  participantName: string;
  participantEmail: string;
  role: SessionRole;
  scenarioId: string;
}

export interface UpdateSessionInput {
  disclaimerAccepted?: boolean;
  disclaimerAcceptedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface Note {
  id: string;
  sessionId: string;
  content: string;
  timestamp: Date;
}

export interface CreateNoteInput {
  sessionId: string;
  content: string;
}

export interface BystanderAnswer {
  id: string;
  sessionId: string;
  questionId: string;
  answer: string;
  timestamp: Date;
}

export interface CreateBystanderAnswerInput {
  sessionId: string;
  questionId: string;
  answer: string;
}

export type QuestionType = 'MULTIPLE_CHOICE' | 'SCALE' | 'OPEN_TEXT';

export interface BystanderQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[] | null;
  order: number;
  isActive: boolean;
}

// Session state for the simulation
export interface SessionState {
  session: Session;
  currentMessageIndex: number;
  isPlaying: boolean;
  isPaused: boolean;
  isComplete: boolean;
  startTime: number | null;
  elapsedTime: number;
}
