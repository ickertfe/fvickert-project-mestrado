export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { prisma } from '@/lib/db';
import { ConfigToggle } from './_components/ConfigToggle';
import { CloseSessionButton } from './_components/CloseSessionButton';
import { CloseAllSessionsButton } from './_components/CloseAllSessionsButton';
import { ResetDatabaseButton } from './_components/ResetDatabaseButton';

async function getAdminData() {
  const [totalSessions, completedSessions, openSessions, tutorSessions, bystanderSessions, scenarios, recentSessions, config] =
    await Promise.all([
      prisma.session.count(),
      prisma.session.count({ where: { completedAt: { not: null } } }),
      prisma.session.count({ where: { completedAt: null } }),
      prisma.session.count({ where: { role: 'TUTOR' } }),
      prisma.session.count({ where: { role: 'BYSTANDER' } }),
      prisma.scenario.findMany({
        include: { _count: { select: { messages: true, participants: true, sessions: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.session.findMany({
        take: 10,
        include: { scenario: true, _count: { select: { actions: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.adminConfig.upsert({
        where: { id: 'default' },
        update: {},
        create: { id: 'default', requireUserIdentification: false, showRoleToParticipants: false },
      }),
    ]);

  return { totalSessions, completedSessions, openSessions, tutorSessions, bystanderSessions, scenarios, recentSessions, config };
}

export default async function AdminDashboard() {
  const { totalSessions, completedSessions, openSessions, tutorSessions, bystanderSessions, scenarios, recentSessions, config } =
    await getAdminData();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-chat-header text-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Painel Administrativo</h1>
              <p className="text-white/80">BCRT - Behavioral Cyberbullying Response Task</p>
            </div>
            <Link href="/">
              <Button variant="ghost" className="border border-white/40 text-white hover:bg-white/10 hover:text-white">
                Voltar ao Início
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card padding="sm">
            <div className="p-4 text-center">
              <p className="text-3xl font-bold text-gray-900">{totalSessions}</p>
              <p className="text-sm text-gray-500">Total de Sessões</p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{completedSessions}</p>
              <p className="text-sm text-gray-500">Sessões Completas</p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="p-4 text-center">
              <p className="text-3xl font-bold text-chat-header">{tutorSessions}</p>
              <p className="text-sm text-gray-500">Sessões Tutor</p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="p-4 text-center">
              <p className="text-3xl font-bold text-action-info">{bystanderSessions}</p>
              <p className="text-sm text-gray-500">Sessões Observador</p>
            </div>
          </Card>
        </div>

        {/* Settings */}
        <Card>
          <CardHeader
            title="Configurações Gerais"
            description="Controle o comportamento do sistema para participantes"
          />
          <CardContent>
            <div className="divide-y divide-gray-100">
              <ConfigToggle
                field="requireUserIdentification"
                value={config.requireUserIdentification}
                label="Exigir identificação do usuário"
                description="Quando ativo, participantes precisam informar nome e e-mail antes de iniciar. Quando inativo, um token anônimo de 8 dígitos é gerado automaticamente."
              />
              <ConfigToggle
                field="showRoleToParticipants"
                value={config.showRoleToParticipants}
                label="Mostrar papel dos personagens aos participantes"
                description="Quando ativo, exibe os badges de papel (Agressor, Vítima, Neutro) nas mensagens durante a simulação."
              />
              <ConfigToggle
                field="showScenarioType"
                value={config.showScenarioType}
                label="Mostrar tipo do cenário aos participantes"
                description="Quando ativo, exibe o tipo (Flaming, Exclusão Social, Difamação) na seleção de cenário. Quando inativo, usa o nome e descrição genéricos."
              />
            </div>
          </CardContent>
        </Card>

        {/* Scenarios */}
        <Card>
          <CardHeader
            title="Cenários"
            description="Gerencie os cenários de simulação"
            action={
              <Link href="/admin/scenarios/new">
                <Button size="sm">Novo Cenário</Button>
              </Link>
            }
          />
          <CardContent>
            {scenarios.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum cenário cadastrado ainda.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Nome</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tipo</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Mensagens</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Sessões</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenarios.map((scenario) => (
                      <tr key={scenario.id} className="border-b border-gray-100">
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{scenario.name}</p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">{scenario.description}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge
                            variant={
                              scenario.type === 'FLAMING' ? 'danger'
                              : scenario.type === 'SOCIAL_EXCLUSION' ? 'warning'
                              : 'info'
                            }
                          >
                            {scenario.type === 'FLAMING' ? 'Flaming'
                              : scenario.type === 'SOCIAL_EXCLUSION' ? 'Exclusão'
                              : 'Difamação'}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">{scenario._count.messages}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{scenario._count.sessions}</td>
                        <td className="px-4 py-4">
                          <Badge variant={scenario.isActive ? 'success' : 'default'}>
                            {scenario.isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            <Link href={`/admin/scenarios/${scenario.id}/edit`}>
                              <Button size="sm" variant="ghost">Editar</Button>
                            </Link>
                            <Link href={`/admin/scenarios/${scenario.id}/report`}>
                              <Button size="sm" variant="ghost">Relatório</Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card>
          <CardHeader
            title="Sessões Recentes"
            description="Últimas participações registradas"
            action={
              <div className="flex gap-2">
                <CloseAllSessionsButton openCount={openSessions} />
                <ResetDatabaseButton />
                <Button size="sm" variant="outline">
                  Exportar CSV
                </Button>
              </div>
            }
          />
          <CardContent>
            {recentSessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhuma sessão registrada ainda.</p>
                <p className="text-sm mt-1">
                  As sessões aparecerão aqui quando participantes completarem as simulações.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Participante</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Papel</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Cenário</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Ações</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Data</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSessions.map((session) => (
                      <tr key={session.id} className="border-b border-gray-100">
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{session.participantName}</p>
                            <p className="text-sm text-gray-500">{session.participantEmail}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant={session.role === 'TUTOR' ? 'info' : 'warning'}>
                            {session.role === 'TUTOR' ? 'Tutor' : 'Observador'}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 max-w-xs truncate">
                          {session.scenario.name}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">{session._count.actions}</td>
                        <td className="px-4 py-4">
                          <Badge variant={session.completedAt ? 'success' : 'default'}>
                            {session.completedAt ? 'Completa' : 'Em andamento'}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {new Date(session.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2 items-center">
                            <Link href={`/admin/sessions/${session.id}`}>
                              <Button size="sm" variant="ghost">Ver Detalhes</Button>
                            </Link>
                            {!session.completedAt && (
                              <CloseSessionButton sessionId={session.id} />
                            )}
                          </div>
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
