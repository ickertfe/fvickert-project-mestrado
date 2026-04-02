import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SessionTimeline } from './SessionTimeline';

interface Props { params: { sessionId: string } }

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

const ACTION_LABEL: Record<string, string> = {
  DELETE_MESSAGE: 'Excluir',
  WARN_MESSAGE: 'Aviso',
  MARK_DANGER: 'Perigo',
  MARK_ATTENTION: 'Atenção',
  ADD_NOTE: 'Nota',
};

export default async function SessionDetailPage({ params }: Props) {
  const session = await prisma.session.findUnique({
    where: { id: params.sessionId },
    include: {
      scenario: true,
      metrics: true,
      actions: { orderBy: { timestamp: 'asc' } },
    },
  });

  if (!session) notFound();

  const isTutor = session.role === 'TUTOR';
  const duration = session.metrics?.totalDuration
    ?? (session.completedAt
      ? new Date(session.completedAt).getTime() - new Date(session.createdAt).getTime()
      : null);

  const decisions: Array<{ action: string; timestamp: number; messageId: string; undone: boolean }> =
    session.metrics
      ? JSON.parse(session.metrics.decisionSequence)
      : session.actions.map((a) => ({
          action: a.type,
          timestamp: new Date(a.timestamp).getTime(),
          messageId: a.messageId,
          undone: a.undone,
        }));

  const hesitations: Array<{ messageId: string; duration: number; timestamp: number; isFixation?: boolean }> =
    session.metrics ? JSON.parse(session.metrics.hesitationEvents) : [];

  const actionTimings: Array<{ fromAction: string; toAction: string; duration: number }> =
    session.metrics ? JSON.parse(session.metrics.actionTimings) : [];

  const startTime = decisions.length > 0
    ? Math.min(...decisions.map((d) => d.timestamp))
    : new Date(session.createdAt).getTime();

  const totalActions = session.metrics?.totalActions ?? session.actions.filter((a) => !a.undone).length;
  const totalUndos = session.metrics?.totalUndos ?? session.actions.filter((a) => a.undone).length;
  const fixations = hesitations.filter((h) => h.isFixation);
  const avgResponseTime = actionTimings.length > 0
    ? actionTimings.reduce((s, t) => s + t.duration, 0) / actionTimings.length
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-chat-header text-white">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Detalhes da Sessão</h1>
              <p className="text-white/80 text-sm font-mono mt-0.5">{session.id}</p>
            </div>
            <Link href="/admin">
              <Button variant="ghost" className="border border-white/40 text-white hover:bg-white/10 hover:text-white">
                Voltar ao Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Info geral */}
        <Card>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              <div>
                <p className="text-xs text-gray-500">Participante</p>
                <p className="font-medium text-gray-900 truncate">{session.participantName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Papel</p>
                <Badge variant={isTutor ? 'info' : 'warning'}>{isTutor ? 'Tutor' : 'Observador'}</Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500">Cenário</p>
                <p className="font-medium text-gray-900 truncate">{session.scenario.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <Badge variant={session.completedAt ? 'success' : 'default'}>
                  {session.completedAt ? 'Concluída' : 'Em andamento'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métricas — Observador: só tempo */}
        {!isTutor && (
          <Card>
            <CardHeader title="Tempo em Sessão" />
            <CardContent>
              <p className="text-4xl font-bold text-gray-900">{duration ? fmt(duration) : '—'}</p>
              <p className="text-sm text-gray-500 mt-1">Duração total da observação</p>
            </CardContent>
          </Card>
        )}

        {/* Métricas — Tutor */}
        {isTutor && (
          <>
            {/* Cards de métricas */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Duração', value: duration ? fmt(duration) : '—' },
                { label: 'Ações', value: totalActions },
                { label: 'Desfeitas', value: totalUndos },
                { label: 'Hesitações', value: hesitations.length },
                { label: 'Fixações', value: fixations.length },
                { label: 'T. médio resp.', value: avgResponseTime ? fmt(avgResponseTime) : '—' },
              ].map(({ label, value }) => (
                <Card key={label} padding="sm">
                  <div className="p-3 text-center">
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                  </div>
                </Card>
              ))}
            </div>

            {/* Timeline */}
            {(decisions.length > 0 || hesitations.length > 0) && duration && (
              <Card>
                <CardHeader
                  title="Timeline da Sessão"
                  description="Ações e fixações ao longo do tempo"
                />
                <CardContent>
                  <SessionTimeline
                    startTime={startTime}
                    totalDuration={duration}
                    decisions={decisions}
                    hesitations={hesitations}
                  />
                </CardContent>
              </Card>
            )}

            {/* Tabela de ações */}
            {decisions.length > 0 && (
              <Card>
                <CardHeader title="Sequência de Ações" description={`${totalActions} ações realizadas`} />
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">#</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Ação</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Tempo</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {decisions.map((d, i) => (
                          <tr key={i} className="border-b border-gray-100">
                            <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                            <td className="px-3 py-2 font-medium text-gray-900">
                              {ACTION_LABEL[d.action] ?? d.action}
                            </td>
                            <td className="px-3 py-2 text-gray-500">{fmt(d.timestamp - startTime)}</td>
                            <td className="px-3 py-2">
                              {d.undone
                                ? <Badge variant="default">Desfeita</Badge>
                                : <Badge variant="success">Aplicada</Badge>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Fixações e hesitações */}
            {hesitations.length > 0 && (
              <Card>
                <CardHeader
                  title="Hesitações e Fixações"
                  description={`${fixations.length} fixações (>1.5s) · ${hesitations.length - fixations.length} hesitações`}
                />
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Tipo</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Tempo</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Duração</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hesitations.map((h, i) => (
                          <tr key={i} className="border-b border-gray-100">
                            <td className="px-3 py-2">
                              {h.isFixation
                                ? <Badge variant="warning">📌 Fixação</Badge>
                                : <Badge variant="default">Hesitação</Badge>}
                            </td>
                            <td className="px-3 py-2 text-gray-500">{fmt(h.timestamp - startTime)}</td>
                            <td className="px-3 py-2 text-gray-500">{(h.duration / 1000).toFixed(1)}s</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
