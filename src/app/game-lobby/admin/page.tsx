export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { CloseGameSessionButton } from './_components/CloseGameSessionButton';
import { CloseAllGameSessionsButton } from './_components/CloseAllGameSessionsButton';
import { ResetGameDatabaseButton } from './_components/ResetGameDatabaseButton';
import { GameConfigToggle } from './_components/GameConfigToggle';
import { AdminLogin } from './_components/AdminLogin';
import { isAdminAuthed, COOKIE_NAME } from './auth';

const TYPE_LABEL: Record<string, string> = {
  FLAMING: 'Flaming',
  SOCIAL_EXCLUSION: 'Exclusão',
  DENIGRATION: 'Difamação',
};

const TYPE_COLOR: Record<string, string> = {
  FLAMING: '#f87171',
  SOCIAL_EXCLUSION: '#a78bfa',
  DENIGRATION: '#60a5fa',
};

async function getData() {
  const [scenarios, sessions, config] = await Promise.all([
    prisma.scenario.findMany({
      where: { id: { startsWith: 'game-' } },
      include: { _count: { select: { messages: true, sessions: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.session.findMany({
      where: { scenario: { id: { startsWith: 'game-' } } },
      include: { scenario: true, _count: { select: { actions: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.adminConfig.upsert({
      where: { id: 'default' },
      update: {},
      create: { id: 'default', requireUserIdentification: false, showRoleToParticipants: false, showScenarioType: false },
    }),
  ]);
  return { scenarios, sessions, config };
}

export default async function GameLobbyAdmin() {
  const cookieStore = await cookies();
  if (!isAdminAuthed(cookieStore.get(COOKIE_NAME)?.value)) {
    return <AdminLogin />;
  }

  const { scenarios, sessions, config } = await getData();

  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((s) => s.completedAt).length;
  const openSessions = sessions.filter((s) => !s.completedAt).length;
  const tutorSessions = sessions.filter((s) => s.role === 'TUTOR').length;
  const bystanderSessions = sessions.filter((s) => s.role === 'BYSTANDER').length;

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #0b0c1a 0%, #10122a 100%)', fontFamily: "'Inter', sans-serif" }}
    >
      {/* Header */}
      <header style={{ backgroundColor: 'rgba(10,10,20,0.9)', borderBottom: '1px solid rgba(139,92,246,0.2)' }}>
        <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
          <div>
            <div
              className="inline-block mb-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest"
              style={{ backgroundColor: 'rgba(139,92,246,0.15)', color: 'rgba(167,139,250,0.8)', border: '1px solid rgba(139,92,246,0.25)' }}
            >
              Admin
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Game Lobby</h1>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
              style={{ color: 'rgba(156,163,175,0.7)', border: '1px solid rgba(75,85,99,0.3)' }}
            >
              Admin BCRT →
            </Link>
            <Link
              href="/game-lobby"
              className="px-3 py-1.5 rounded text-xs font-medium"
              style={{ backgroundColor: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}
            >
              ← Voltar ao Lobby
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total de Sessões', value: totalSessions, color: '#e2e8f0' },
            { label: 'Sessões Completas', value: completedSessions, color: '#86efac' },
            { label: 'Moderadores', value: tutorSessions, color: '#a78bfa' },
            { label: 'Observadores', value: bystanderSessions, color: '#60a5fa' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-xl p-5 text-center"
              style={{ backgroundColor: 'rgba(15,15,25,0.8)', border: '1px solid rgba(139,92,246,0.15)' }}
            >
              <p className="text-3xl font-black mb-1" style={{ color }}>{value}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>

        {/* Config */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: 'rgba(15,15,25,0.8)', border: '1px solid rgba(139,92,246,0.15)' }}
        >
          <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(139,92,246,0.1)' }}>
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Configurações Gerais</h2>
            <p className="text-xs text-gray-500 mt-0.5">Compartilhadas com o admin BCRT</p>
          </div>
          <div className="px-6">
            <GameConfigToggle
              field="requireUserIdentification"
              value={config.requireUserIdentification}
              label="Exigir identificação do usuário"
              description="Quando ativo, participantes precisam informar nome e e-mail antes de iniciar."
            />
            <GameConfigToggle
              field="showRoleToParticipants"
              value={config.showRoleToParticipants}
              label="Mostrar papel dos personagens"
              description="Quando ativo, exibe os badges de papel (Agressor, Vítima, Neutro) nas mensagens."
            />
            <GameConfigToggle
              field="showScenarioType"
              value={config.showScenarioType}
              label="Mostrar tipo do cenário"
              description="Quando ativo, exibe o tipo (Flaming, Exclusão Social, Difamação) na seleção de cenário."
            />
          </div>
        </div>

        {/* Scenarios */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: 'rgba(15,15,25,0.8)', border: '1px solid rgba(139,92,246,0.15)' }}
        >
          <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(139,92,246,0.1)' }}>
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Cenários</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(139,92,246,0.08)' }}>
                {['Nome', 'Tipo', 'Mensagens', 'Sessões', 'Status'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid rgba(139,92,246,0.06)' }}>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-white">{s.softName ?? s.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{s.softDescription ?? s.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: TYPE_COLOR[s.type] ?? '#9ca3af', backgroundColor: `${TYPE_COLOR[s.type] ?? '#9ca3af'}18` }}
                    >
                      {TYPE_LABEL[s.type] ?? s.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{s._count.messages}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{s._count.sessions}</td>
                  <td className="px-6 py-4">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                      style={s.isActive
                        ? { color: '#86efac', backgroundColor: 'rgba(134,239,172,0.1)' }
                        : { color: '#6b7280', backgroundColor: 'rgba(107,114,128,0.1)' }}
                    >
                      {s.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sessions */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: 'rgba(15,15,25,0.8)', border: '1px solid rgba(139,92,246,0.15)' }}
        >
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(139,92,246,0.1)' }}>
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Sessões</h2>
            <div className="flex gap-2">
              <CloseAllGameSessionsButton openCount={openSessions} />
              <ResetGameDatabaseButton />
            </div>
          </div>
          {sessions.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500 text-sm">
              Nenhuma sessão registrada ainda.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(139,92,246,0.08)' }}>
                  {['Participante', 'Papel', 'Cenário', 'Ações', 'Status', 'Data', ''].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid rgba(139,92,246,0.06)' }}>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-white">{s.participantName}</p>
                      <p className="text-xs text-gray-500 font-mono">{s.id.slice(0, 8)}…</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                        style={s.role === 'TUTOR'
                          ? { color: '#a78bfa', backgroundColor: 'rgba(167,139,250,0.1)' }
                          : { color: '#60a5fa', backgroundColor: 'rgba(96,165,250,0.1)' }}
                      >
                        {s.role === 'TUTOR' ? 'Moderador' : 'Observador'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 max-w-[160px] truncate">
                      {s.scenario.softName ?? s.scenario.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{s._count.actions}</td>
                    <td className="px-6 py-4">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                        style={s.completedAt
                          ? { color: '#86efac', backgroundColor: 'rgba(134,239,172,0.1)' }
                          : { color: '#fbbf24', backgroundColor: 'rgba(251,191,36,0.1)' }}
                      >
                        {s.completedAt ? 'Completa' : 'Em andamento'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(s.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: '2-digit', year: '2-digit',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/sessions/${s.id}`}
                          className="text-xs font-medium transition-colors"
                          style={{ color: 'rgba(167,139,250,0.7)' }}
                        >
                          Ver →
                        </Link>
                        {!s.completedAt && <CloseGameSessionButton sessionId={s.id} />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </main>
    </div>
  );
}
