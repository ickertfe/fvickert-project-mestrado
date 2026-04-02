import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TutorAggregateChart, TutorDurationChart, BystanderDurationChart, BystanderQuestionnaireCharts } from './ReportCharts';

interface ReportPageProps {
  params: { id: string };
}

export default async function ScenarioReportPage({ params }: ReportPageProps) {
  const scenario = await prisma.scenario.findUnique({
    where: { id: params.id },
    include: {
      sessions: {
        include: {
          _count: { select: { actions: true } },
          metrics: true,
          actions: { where: { undone: false } },
          bystanderAnswers: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!scenario) notFound();

  const total = scenario.sessions.length;
  const completed = scenario.sessions.filter((s) => s.completedAt).length;
  const tutorSessions = scenario.sessions.filter((s) => s.role === 'TUTOR');
  const bystanderSessions = scenario.sessions.filter((s) => s.role === 'BYSTANDER');

  // Build chart data for tutors
  const tutorChartData = tutorSessions.map((s) => {
    const hesitationEvents: Array<{ isFixation?: boolean }> = s.metrics
      ? JSON.parse(s.metrics.hesitationEvents)
      : [];
    const decisionSequence: Array<{ action: string; undone: boolean }> = s.metrics
      ? JSON.parse(s.metrics.decisionSequence)
      : s.actions.map((a) => ({ action: a.type, undone: false }));
    const duration =
      s.metrics?.totalDuration ??
      (s.completedAt
        ? new Date(s.completedAt).getTime() - new Date(s.createdAt).getTime()
        : null);
    const applied = decisionSequence.filter((d) => !d.undone);
    return {
      deleteCount: applied.filter((d) => d.action === 'DELETE_MESSAGE').length,
      warnCount:   applied.filter((d) => d.action === 'WARN_MESSAGE').length,
      totalUndos:  s.metrics?.totalUndos ?? decisionSequence.filter((d) => d.undone).length,
      hesitations: hesitationEvents.filter((h) => !h.isFixation).length,
      fixations:   hesitationEvents.filter((h) => h.isFixation).length,
      duration,
    };
  });

  // Build chart data for bystanders
  const bystanderChartData = bystanderSessions.map((s) => ({
    participantName: s.participantName,
    duration: s.completedAt
      ? new Date(s.completedAt).getTime() - new Date(s.createdAt).getTime()
      : null,
  }));

  // Aggregate questionnaire answers across all bystander sessions
  const allAnswers = bystanderSessions.flatMap((s) => s.bystanderAnswers);
  const answersByQuestion = allAnswers.reduce<Record<string, string[]>>((acc, a) => {
    if (!acc[a.questionId]) acc[a.questionId] = [];
    acc[a.questionId].push(a.answer);
    return acc;
  }, {});

  const QUESTION_LABELS: Record<string, string> = {
    q1: 'Intensidade do cyberbullying (1–5)',
    q2: 'Como se sentiu',
    q3: 'O que faria',
    q4: 'Consequência sugerida',
  };

  const questionnaireData = Object.entries(answersByQuestion).map(([qId, answers]) => {
    const counts = answers.reduce<Record<string, number>>((acc, a) => {
      acc[a] = (acc[a] ?? 0) + 1;
      return acc;
    }, {});
    return {
      questionId: qId,
      label: QUESTION_LABELS[qId] ?? qId,
      data: Object.entries(counts).map(([name, value]) => ({ name, value })),
    };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-chat-header text-white">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Relatório do Cenário</h1>
              <p className="text-white/80">{scenario.name}</p>
            </div>
            <Link href="/admin">
              <Button variant="ghost" className="border border-white/40 text-white hover:bg-white/10 hover:text-white">
                Voltar ao Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card padding="sm">
            <div className="p-4 text-center">
              <p className="text-3xl font-bold text-gray-900">{total}</p>
              <p className="text-sm text-gray-500">Total de Sessões</p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{completed}</p>
              <p className="text-sm text-gray-500">Concluídas</p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="p-4 text-center">
              <p className="text-3xl font-bold text-chat-header">{tutorSessions.length}</p>
              <p className="text-sm text-gray-500">Tutores</p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="p-4 text-center">
              <p className="text-3xl font-bold text-action-info">{bystanderSessions.length}</p>
              <p className="text-sm text-gray-500">Observadores</p>
            </div>
          </Card>
        </div>

        {/* Charts — Tutor */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader
              title="Tutores — Ações & Hesitações"
              description={`Totais agregados de ${tutorSessions.length} sessão(ões)`}
            />
            <CardContent>
              <TutorAggregateChart sessions={tutorChartData} />
              <div className="flex flex-wrap gap-3 mt-3 justify-center">
                {[
                  { color: '#dc2626', label: 'Excluir' },
                  { color: '#d97706', label: 'Aviso' },
                  { color: '#9ca3af', label: 'Desfeitas' },
                  { color: '#6b7280', label: 'Hesitações' },
                  { color: '#7c3aed', label: 'Fixações' },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm inline-block" style={{ backgroundColor: color }} />
                    <span className="text-xs text-gray-500">{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title="Tutores — Duração por Sessão"
              description="Tempo total de cada sessão de tutor"
            />
            <CardContent>
              <TutorDurationChart sessions={tutorChartData} />
            </CardContent>
          </Card>
        </div>

        {/* Charts — Bystander */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader
              title="Observadores — Duração por Sessão"
              description="Tempo total de cada sessão de observador"
            />
            <CardContent>
              <BystanderDurationChart sessions={bystanderChartData} />
            </CardContent>
          </Card>

          {questionnaireData.length > 0 && (
            <Card>
              <CardHeader
                title="Observadores — Respostas do Questionário"
                description={`${allAnswers.length / (questionnaireData.length || 1) | 0} respondente(s)`}
              />
              <CardContent>
                <BystanderQuestionnaireCharts questions={questionnaireData} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sessions table */}
        <Card>
          <CardHeader
            title="Sessões"
            description="Todas as participações registradas neste cenário"
          />
          <CardContent>
            {scenario.sessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhuma sessão registrada para este cenário ainda.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Participante</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Papel</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Ações</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Início</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Conclusão</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenario.sessions.map((session) => (
                      <tr key={session.id} className="border-b border-gray-100">
                        <td className="px-4 py-4">
                          <p className="font-medium text-gray-900">{session.participantName}</p>
                          <p className="text-sm text-gray-500">{session.participantEmail}</p>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant={session.role === 'TUTOR' ? 'info' : 'warning'}>
                            {session.role === 'TUTOR' ? 'Tutor' : 'Observador'}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">{session._count.actions}</td>
                        <td className="px-4 py-4">
                          <Badge variant={session.completedAt ? 'success' : 'default'}>
                            {session.completedAt ? 'Concluída' : 'Em andamento'}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {new Date(session.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {session.completedAt
                            ? new Date(session.completedAt).toLocaleDateString('pt-BR', {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                              })
                            : '—'}
                        </td>
                        <td className="px-4 py-4">
                          <Link href={`/admin/sessions/${session.id}`}>
                            <Button size="sm" variant="ghost">Ver Detalhes</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
