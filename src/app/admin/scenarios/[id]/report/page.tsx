import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface ReportPageProps {
  params: { id: string };
}

export default async function ScenarioReportPage({ params }: ReportPageProps) {
  const scenario = await prisma.scenario.findUnique({
    where: { id: params.id },
    include: {
      sessions: {
        include: { _count: { select: { actions: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!scenario) notFound();

  const total = scenario.sessions.length;
  const completed = scenario.sessions.filter((s) => s.completedAt).length;
  const tutors = scenario.sessions.filter((s) => s.role === 'TUTOR').length;
  const bystanders = scenario.sessions.filter((s) => s.role === 'BYSTANDER').length;

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
              <p className="text-3xl font-bold text-chat-header">{tutors}</p>
              <p className="text-sm text-gray-500">Tutores</p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="p-4 text-center">
              <p className="text-3xl font-bold text-action-info">{bystanders}</p>
              <p className="text-sm text-gray-500">Observadores</p>
            </div>
          </Card>
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
