'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { ScenarioListItem } from '@/types/scenario';

// Mock data - will be fetched from API
const mockScenarios: ScenarioListItem[] = [
  {
    id: 'scenario-flaming-001',
    name: 'Discussão Acalorada no Grupo de Trabalho',
    description: 'Simulação de conflito onde um participante se torna hostil',
    type: 'FLAMING',
    isActive: true,
    messageCount: 9,
    participantCount: 3,
    sessionCount: 12,
    createdAt: new Date(),
  },
  {
    id: 'scenario-exclusion-001',
    name: 'Exclusão do Grupo de Amigos',
    description: 'Simulação onde participantes excluem uma pessoa',
    type: 'SOCIAL_EXCLUSION',
    isActive: true,
    messageCount: 9,
    participantCount: 3,
    sessionCount: 8,
    createdAt: new Date(),
  },
  {
    id: 'scenario-denigration-001',
    name: 'Rumores Falsos no Grupo',
    description: 'Simulação onde participantes espalham informações falsas',
    type: 'DENIGRATION',
    isActive: true,
    messageCount: 9,
    participantCount: 3,
    sessionCount: 5,
    createdAt: new Date(),
  },
];

const mockStats = {
  totalSessions: 25,
  completedSessions: 20,
  tutorSessions: 15,
  bystanderSessions: 10,
};

export default function AdminDashboard() {
  const [scenarios] = useState(mockScenarios);

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
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Voltar ao Início
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card padding="sm">
            <div className="p-4 text-center">
              <p className="text-3xl font-bold text-gray-900">{mockStats.totalSessions}</p>
              <p className="text-sm text-gray-500">Total de Sessões</p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{mockStats.completedSessions}</p>
              <p className="text-sm text-gray-500">Sessões Completas</p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="p-4 text-center">
              <p className="text-3xl font-bold text-chat-header">{mockStats.tutorSessions}</p>
              <p className="text-sm text-gray-500">Sessões Tutor</p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="p-4 text-center">
              <p className="text-3xl font-bold text-action-info">{mockStats.bystanderSessions}</p>
              <p className="text-sm text-gray-500">Sessões Observador</p>
            </div>
          </Card>
        </div>

        {/* Scenarios */}
        <Card>
          <CardHeader
            title="Cenários"
            description="Gerencie os cenários de simulação"
            action={
              <Button size="sm">
                Novo Cenário
              </Button>
            }
          />
          <CardContent>
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
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {scenario.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          variant={
                            scenario.type === 'FLAMING'
                              ? 'danger'
                              : scenario.type === 'SOCIAL_EXCLUSION'
                              ? 'warning'
                              : 'info'
                          }
                        >
                          {scenario.type === 'FLAMING'
                            ? 'Flaming'
                            : scenario.type === 'SOCIAL_EXCLUSION'
                            ? 'Exclusão'
                            : 'Difamação'}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {scenario.messageCount}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {scenario.sessionCount}
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={scenario.isActive ? 'success' : 'default'}>
                          {scenario.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            Editar
                          </Button>
                          <Button size="sm" variant="ghost">
                            Relatório
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card className="mt-8">
          <CardHeader
            title="Sessões Recentes"
            description="Últimas participações registradas"
            action={
              <Button size="sm" variant="outline">
                Exportar CSV
              </Button>
            }
          />
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma sessão registrada ainda.</p>
              <p className="text-sm mt-1">
                As sessões aparecerão aqui quando participantes completarem as simulações.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
