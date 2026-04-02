export type ScenarioType = 'FLAMING' | 'SOCIAL_EXCLUSION' | 'DENIGRATION';

export type ParticipantRole = 'AGGRESSOR' | 'VICTIM' | 'NEUTRAL';

export interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  role: ParticipantRole;
  scenarioId?: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  type: ScenarioType;
  isActive: boolean;
  participants: ChatParticipant[];
  messages: Message[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ScenarioListItem {
  id: string;
  name: string;
  description: string;
  softName?: string | null;
  softDescription?: string | null;
  type: ScenarioType;
  isActive: boolean;
  messageCount: number;
  participantCount: number;
  sessionCount: number;
  createdAt: Date;
}

export interface CreateScenarioInput {
  name: string;
  description: string;
  type: ScenarioType;
  isActive?: boolean;
}

export interface UpdateScenarioInput {
  name?: string;
  description?: string;
  type?: ScenarioType;
  isActive?: boolean;
}

// Re-export Message type
import type { Message } from './message';
export type { Message };
