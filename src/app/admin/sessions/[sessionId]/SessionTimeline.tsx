'use client';

import { useState } from 'react';

interface DecisionEvent {
  action: string;
  timestamp: number;
  messageId: string;
  undone: boolean;
}

interface HesitationEvent {
  messageId: string;
  duration: number;
  timestamp: number;
  isFixation?: boolean;
}

interface SessionTimelineProps {
  startTime: number;
  totalDuration: number;
  decisions: DecisionEvent[];
  hesitations: HesitationEvent[];
}

const ACTION_STYLE: Record<string, { color: string; label: string }> = {
  DELETE_MESSAGE: { color: '#dc2626', label: 'Excluir' },
  WARN_MESSAGE:   { color: '#d97706', label: 'Aviso' },
  MARK_DANGER:    { color: '#b91c1c', label: 'Perigo' },
  MARK_ATTENTION: { color: '#92400e', label: 'Atenção' },
  ADD_NOTE:       { color: '#1d4ed8', label: 'Nota' },
};

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

export function SessionTimeline({ startTime, totalDuration, decisions, hesitations }: SessionTimelineProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);
  const duration = totalDuration || 1;

  const pct = (ts: number) =>
    Math.min(100, Math.max(0, ((ts - startTime) / duration) * 100));

  return (
    <div className="space-y-3">
      {/* Timeline bar */}
      <div className="relative h-3 rounded-full bg-gray-200" style={{ minWidth: 0 }}>
        {/* Hesitation markers — below the bar */}
        {hesitations.map((h, i) => (
          <button
            key={`h-${i}`}
            className="absolute -bottom-2 w-2 h-2 rounded-sm focus:outline-none"
            style={{
              left: `${pct(h.timestamp)}%`,
              transform: 'translateX(-50%)',
              backgroundColor: h.isFixation ? '#7c3aed' : '#9ca3af',
              opacity: 0.7,
            }}
            onMouseEnter={(e) => {
              const rect = (e.target as HTMLElement).getBoundingClientRect();
              setTooltip({
                x: rect.left,
                y: rect.top,
                content: `${h.isFixation ? '📌 Fixação' : '⏸ Hesitação'} — ${fmt(h.timestamp - startTime)} — ${(h.duration / 1000).toFixed(1)}s`,
              });
            }}
            onMouseLeave={() => setTooltip(null)}
          />
        ))}

        {/* Action dots — on the bar */}
        {decisions.map((d, i) => {
          const style = ACTION_STYLE[d.action] ?? { color: '#6b7280', label: d.action };
          return (
            <button
              key={`d-${i}`}
              className="absolute focus:outline-none"
              style={{
                left: `${pct(d.timestamp)}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 14,
                height: 14,
                borderRadius: '50%',
                backgroundColor: d.undone ? '#d1d5db' : style.color,
                border: d.undone ? `2px solid ${style.color}` : 'none',
                opacity: d.undone ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                const rect = (e.target as HTMLElement).getBoundingClientRect();
                setTooltip({
                  x: rect.left,
                  y: rect.top,
                  content: `${d.undone ? '↩ ' : ''}${style.label} — ${fmt(d.timestamp - startTime)}${d.undone ? ' (desfeita)' : ''}`,
                });
              }}
              onMouseLeave={() => setTooltip(null)}
            />
          );
        })}
      </div>

      {/* Time labels */}
      <div className="flex justify-between text-xs text-gray-400 mt-4">
        <span>0s</span>
        <span>{fmt(duration / 2)}</span>
        <span>{fmt(duration)}</span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 pt-1">
        {Object.entries(ACTION_STYLE).map(([, { color, label }]) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full inline-block" style={{ backgroundColor: color }} />
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full inline-block bg-gray-300 border border-gray-400" />
          <span className="text-xs text-gray-500">Desfeita</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm inline-block" style={{ backgroundColor: '#7c3aed' }} />
          <span className="text-xs text-gray-500">Fixação (&gt;1.5s)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm inline-block bg-gray-400" />
          <span className="text-xs text-gray-500">Hesitação</span>
        </div>
      </div>

      {/* Floating tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none rounded bg-gray-900 px-2 py-1 text-xs text-white shadow-lg"
          style={{ left: tooltip.x, top: tooltip.y - 30 }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}
