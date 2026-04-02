'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { ScenarioListItem, ScenarioType } from '@/types/scenario';
import { cn } from '@/lib/utils';

interface ScenarioSelectorProps {
  scenarios: ScenarioListItem[];
  selectedId?: string;
  onSelect: (scenario: ScenarioListItem) => void;
  showType?: boolean;
  className?: string;
}

const scenarioTypeLabels: Record<ScenarioType, string> = {
  FLAMING: 'Flaming',
  SOCIAL_EXCLUSION: 'Exclusão Social',
  DENIGRATION: 'Difamação',
};

const scenarioTypeBadgeVariant: Record<ScenarioType, 'danger' | 'warning' | 'info'> = {
  FLAMING: 'danger',
  SOCIAL_EXCLUSION: 'warning',
  DENIGRATION: 'info',
};

const scenarioTypePastel: Record<ScenarioType, { bg: string; accent: string }> = {
  FLAMING:          { bg: '#fff4f6', accent: '#f9a8c9' },
  SOCIAL_EXCLUSION: { bg: '#f5f3ff', accent: '#c4b5fd' },
  DENIGRATION:      { bg: '#f0faf5', accent: '#6ee7b7' },
};

export function ScenarioSelector({
  scenarios,
  selectedId,
  onSelect,
  showType = true,
  className,
}: ScenarioSelectorProps) {
  if (scenarios.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-gray-500">Nenhum cenário disponível no momento.</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {scenarios.map((scenario) => (
        <Card
          key={scenario.id}
          padding="sm"
          className={cn(
            'cursor-pointer transition-all hover:shadow-md border-l-4',
            selectedId === scenario.id
              ? 'ring-2 ring-chat-header'
              : 'hover:border-chat-header/50'
          )}
          style={{
            backgroundColor: selectedId === scenario.id
              ? scenarioTypePastel[scenario.type].bg
              : scenarioTypePastel[scenario.type].bg,
            borderLeftColor: scenarioTypePastel[scenario.type].accent,
          }}
          onClick={() => onSelect(scenario)}
        >
          <div className="flex items-start justify-between gap-4 p-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-gray-900 truncate">
                  {showType ? scenario.name : (scenario.softName ?? scenario.name)}
                </h3>
                {showType && (
                  <Badge variant={scenarioTypeBadgeVariant[scenario.type]}>
                    {scenarioTypeLabels[scenario.type]}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500 line-clamp-2">
                {showType ? scenario.description : (scenario.softDescription ?? scenario.description)}
              </p>
              <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                <span>{scenario.messageCount} mensagens</span>
                <span>{scenario.participantCount} participantes</span>
              </div>
            </div>

            <div
              className={cn(
                'flex-shrink-0 h-5 w-5 rounded-full border-2 transition-colors',
                selectedId === scenario.id
                  ? 'border-chat-header bg-chat-header'
                  : 'border-gray-300'
              )}
            >
              {selectedId === scenario.id && (
                <svg
                  className="h-full w-full text-white"
                  fill="currentColor"
                  viewBox="0 0 12 12"
                >
                  <path d="M3.707 5.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L5 6.586 3.707 5.293z" />
                </svg>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
