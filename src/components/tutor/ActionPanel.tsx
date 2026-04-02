'use client';

import { ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/utils/time';

interface ActionPanelProps {
  canUndo: boolean;
  onUndo: () => void;
  stats: {
    totalActions: number;
    totalUndos: number;
    totalHesitations: number;
    elapsedTime: number;
  };
  isLoading?: boolean;
  className?: string;
}

export function ActionPanel({
  canUndo,
  onUndo,
  stats,
  isLoading = false,
  className,
}: ActionPanelProps) {
  return (
    <Card className={cn('p-4', className)} padding="none">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Painel de Ações</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo || isLoading}
            className="gap-1"
          >
            <ArrowUturnLeftIcon className="h-4 w-4" />
            Desfazer
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatItem label="Tempo" value={formatDuration(stats.elapsedTime)} />
          <StatItem label="Ações" value={stats.totalActions.toString()} />
          <StatItem label="Desfeitas" value={stats.totalUndos.toString()} />
        </div>

        <div className="text-xs text-gray-500">
          Clique nas mensagens para ver as ações disponíveis
        </div>
      </div>
    </Card>
  );
}

interface StatItemProps {
  label: string;
  value: string;
}

function StatItem({ label, value }: StatItemProps) {
  return (
    <div className="rounded-lg bg-gray-50 p-2 text-center">
      <p className="text-lg font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
