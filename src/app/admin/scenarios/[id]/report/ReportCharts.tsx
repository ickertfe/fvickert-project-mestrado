'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface TutorChartProps {
  sessions: Array<{
    deleteCount: number;
    warnCount: number;
    totalUndos: number;
    hesitations: number;
    fixations: number;
    duration: number | null;
  }>;
}

interface BystanderChartProps {
  sessions: Array<{
    participantName: string;
    duration: number | null;
  }>;
}

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

// ── Tutor chart ───────────────────────────────────────────────────────────────

const TUTOR_BARS: Array<{ key: string; label: string; color: string }> = [
  { key: 'excluir',    label: 'Excluir',    color: '#dc2626' },
  { key: 'aviso',      label: 'Aviso',      color: '#d97706' },
  { key: 'desfeitas',  label: 'Desfeitas',  color: '#9ca3af' },
  { key: 'hesitacoes', label: 'Hesitações', color: '#6b7280' },
  { key: 'fixacoes',   label: 'Fixações',   color: '#7c3aed' },
];

export function TutorAggregateChart({ sessions }: TutorChartProps) {
  if (sessions.length === 0) {
    return <p className="text-center text-sm text-gray-400 py-8">Nenhuma sessão de tutor concluída ainda.</p>;
  }

  const totals = sessions.reduce(
    (acc, s) => ({
      excluir:    acc.excluir    + s.deleteCount,
      aviso:      acc.aviso      + s.warnCount,
      desfeitas:  acc.desfeitas  + s.totalUndos,
      hesitacoes: acc.hesitacoes + s.hesitations,
      fixacoes:   acc.fixacoes   + s.fixations,
    }),
    { excluir: 0, aviso: 0, desfeitas: 0, hesitacoes: 0, fixacoes: 0 }
  );

  const data = TUTOR_BARS.map(({ key, label }) => ({
    name: label,
    value: totals[key as keyof typeof totals],
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e5e7eb' }}
          formatter={(value: unknown) => [value as number, 'Total (todas as sessões)']}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {TUTOR_BARS.map(({ color }, i) => (
            <Cell key={i} fill={color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TutorDurationChart({ sessions }: TutorChartProps) {
  const withDuration = sessions.filter((s) => s.duration !== null);
  if (withDuration.length === 0) {
    return <p className="text-center text-sm text-gray-400 py-8">Nenhuma duração registrada ainda.</p>;
  }

  const data = withDuration.map((s, i) => ({
    name: `S${i + 1}`,
    duracao: Math.round((s.duration ?? 0) / 1000),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
        <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(v) => `${v}s`} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e5e7eb' }}
          formatter={(value: unknown) => [fmt((value as number) * 1000), 'Duração']}
        />
        <Bar dataKey="duracao" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Bystander questionnaire chart ────────────────────────────────────────────

interface QuestionnaireChartProps {
  questions: Array<{
    questionId: string;
    label: string;
    data: Array<{ name: string; value: number }>;
  }>;
}

const Q_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#dc2626', '#7c3aed', '#6b7280'];

export function BystanderQuestionnaireCharts({ questions }: QuestionnaireChartProps) {
  if (questions.length === 0) {
    return <p className="text-center text-sm text-gray-400 py-8">Nenhuma resposta registrada ainda.</p>;
  }

  return (
    <div className="space-y-6">
      {questions.map(({ questionId, label, data }) => (
        <div key={questionId}>
          <p className="text-xs font-medium text-gray-500 mb-2">{label}</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, left: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: '#374151' }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e5e7eb' }}
                formatter={(value: unknown) => [value as number, 'Respostas']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill={Q_COLORS[i % Q_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
}

// ── Bystander duration chart ──────────────────────────────────────────────────

export function BystanderDurationChart({ sessions }: BystanderChartProps) {
  const withDuration = sessions.filter((s) => s.duration !== null);
  if (withDuration.length === 0) {
    return <p className="text-center text-sm text-gray-400 py-8">Nenhuma duração registrada ainda.</p>;
  }

  const data = withDuration.map((s, i) => ({
    name: `S${i + 1}`,
    duracao: Math.round((s.duration ?? 0) / 1000),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
        <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(v) => `${v}s`} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e5e7eb' }}
          formatter={(value: unknown) => [fmt((value as number) * 1000), 'Duração']}
        />
        <Bar dataKey="duracao" fill="#f59e0b" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
