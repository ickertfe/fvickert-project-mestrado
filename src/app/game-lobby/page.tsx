'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DisclaimerModal } from '@/components/shared/DisclaimerModal';
import type { ScenarioListItem } from '@/types/scenario';

function generateToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

type Role = 'TUTOR' | 'BYSTANDER';
type Step = 'role' | 'identify' | 'scenario' | 'disclaimer';

const SCENARIO_COLORS: Record<string, { glow: string; border: string; tag: string }> = {
  FLAMING:          { glow: 'rgba(220,38,38,0.15)',  border: 'rgba(220,38,38,0.35)',  tag: '#f87171' },
  SOCIAL_EXCLUSION: { glow: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.35)', tag: '#a78bfa' },
  DENIGRATION:      { glow: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.35)', tag: '#60a5fa' },
};

const TYPE_LABEL: Record<string, string> = {
  FLAMING: 'Flaming',
  SOCIAL_EXCLUSION: 'Exclusão',
  DENIGRATION: 'Difamação',
};

const BG = 'linear-gradient(135deg, #131428 0%, #1d1f40 100%)';

// ── Shared wrapper ────────────────────────────────────────────────────────────
function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: BG }}>
      {children}
    </div>
  );
}

export default function GameLobbyLanding() {
  const router = useRouter();
  const [step, setStep] = useState<Step | null>(null); // null = loading config
  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [identifyErrors, setIdentifyErrors] = useState<{ name?: string; email?: string }>({});
  const [scenarios, setScenarios] = useState<ScenarioListItem[]>([]);
  const [scenariosLoaded, setScenariosLoaded] = useState(false);
  const [selected, setSelected] = useState<ScenarioListItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requireId, setRequireId] = useState(false);
  const [showScenarioType, setShowScenarioType] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/scenarios?active=true').then((r) => r.json()),
      fetch('/api/config').then((r) => r.json()),
    ]).then(([scenariosData, configData]) => {
      setScenarios((scenariosData as ScenarioListItem[]).filter((s) => s.id.startsWith('game-')));
      setScenariosLoaded(true);
      const rid = configData.requireUserIdentification ?? false;
      setRequireId(rid);
      setShowScenarioType(configData.showScenarioType ?? false);
      setStep('role');
    });
  }, []);

  const handleSelectRole = (r: Role) => {
    setRole(r);
    setStep(requireId ? 'identify' : 'scenario');
  };

  const handleIdentifyNext = () => {
    const errors: { name?: string; email?: string } = {};
    if (!name.trim()) errors.name = 'Nome é obrigatório';
    if (!email.trim()) errors.email = 'Email é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Email inválido';
    setIdentifyErrors(errors);
    if (Object.keys(errors).length === 0) setStep('scenario');
  };

  const handleSelectScenario = (s: ScenarioListItem) => {
    setSelected(s);
    setStep('disclaimer');
  };

  const handleAccept = async () => {
    if (!selected || !role) return;
    setIsLoading(true);
    try {
      const token = generateToken();
      const participantName = requireId ? name : `${role === 'TUTOR' ? 'Mod' : 'Obs'}-${token}`;
      const participantEmail = requireId ? email : `${token.toLowerCase()}@anonymous.local`;

      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantName, participantEmail, role, scenarioId: selected.id }),
      });
      if (!res.ok) throw new Error();
      const session = await res.json();
      router.push(`/game-lobby/${session.id}`);
    } catch {
      setIsLoading(false);
    }
  };

  // ── Loading config ──────────────────────────────────────────────────────────
  if (!step) {
    return (
      <Screen>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </Screen>
    );
  }

  // ── Role selection ──────────────────────────────────────────────────────────
  if (step === 'role') {
    return (
      <Screen>
        {/* Starfield */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="absolute rounded-full" style={{
              width: Math.random() * 2 + 1, height: Math.random() * 2 + 1,
              left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
              backgroundColor: 'white', opacity: Math.random() * 0.5 + 0.1,
            }} />
          ))}
        </div>

        <div className="relative z-10 max-w-xl w-full text-center">
          <div className="inline-block mb-2 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest"
            style={{ backgroundColor: 'rgba(139,92,246,0.15)', color: 'rgba(167,139,250,0.8)', border: '1px solid rgba(139,92,246,0.25)' }}>
            BCRT — Modo Game Lobby
          </div>
          <h1 className="text-4xl font-black text-white mt-3 mb-1 tracking-tight">Escolha seu papel</h1>
          <p className="text-sm text-gray-400 mb-10">Você irá participar de uma simulação em um lobby de jogo online.</p>

          <div className="grid grid-cols-2 gap-4">
            {/* Moderador */}
            <button onClick={() => handleSelectRole('TUTOR')}
              className="group relative rounded-2xl p-6 text-left transition-all duration-200"
              style={{ backgroundColor: 'rgba(15,15,25,0.8)', border: '1px solid rgba(139,92,246,0.25)', backdropFilter: 'blur(8px)' }}
              onMouseEnter={(e) => { e.currentTarget.style.border = '1px solid rgba(139,92,246,0.6)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(139,92,246,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.border = '1px solid rgba(139,92,246,0.25)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div className="mb-4 h-12 w-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
                <svg className="h-6 w-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white mb-1">Moderador</h2>
              <p className="text-xs text-gray-400 leading-relaxed">Monitore o lobby e intervenha nas mensagens. Use as ações de moderação quando necessário.</p>
              <div className="mt-4 w-full py-2 rounded-lg text-xs font-bold text-center"
                style={{ backgroundColor: 'rgba(139,92,246,0.2)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}>
                Entrar como Moderador →
              </div>
            </button>

            {/* Observador */}
            <button onClick={() => handleSelectRole('BYSTANDER')}
              className="group relative rounded-2xl p-6 text-left transition-all duration-200"
              style={{ backgroundColor: 'rgba(15,15,25,0.8)', border: '1px solid rgba(59,130,246,0.25)', backdropFilter: 'blur(8px)' }}
              onMouseEnter={(e) => { e.currentTarget.style.border = '1px solid rgba(59,130,246,0.6)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(59,130,246,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.border = '1px solid rgba(59,130,246,0.25)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div className="mb-4 h-12 w-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
                <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white mb-1">Observador</h2>
              <p className="text-xs text-gray-400 leading-relaxed">Assista ao lobby sem intervir. Ao final, responda um questionário sobre o que observou.</p>
              <div className="mt-4 w-full py-2 rounded-lg text-xs font-bold text-center"
                style={{ backgroundColor: 'rgba(59,130,246,0.2)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }}>
                Entrar como Observador →
              </div>
            </button>
          </div>

          {/* Privacy info */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[
              { icon: '🔒', title: 'Dados Seguros', desc: 'Protegidos conforme a LGPD.' },
              { icon: '⏱', title: '5–10 minutos', desc: 'Tempo médio de participação.' },
              { icon: '✅', title: 'Ética Aprovada', desc: 'Aprovado pelo Comitê de Ética.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="rounded-xl p-3" style={{ backgroundColor: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.12)' }}>
                <div className="text-xl mb-1">{icon}</div>
                <p className="text-xs font-semibold text-gray-300">{title}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{desc}</p>
              </div>
            ))}
          </div>

          <button onClick={() => router.push('/')} className="mt-5 text-xs text-gray-600 hover:text-gray-400 transition-colors">
            ← Voltar ao início
          </button>
        </div>
      </Screen>
    );
  }

  // ── Identification ──────────────────────────────────────────────────────────
  if (step === 'identify') {
    return (
      <Screen>
        <div className="max-w-md w-full">
          <button onClick={() => setStep('role')} className="mb-6 text-xs text-gray-500 hover:text-gray-400 transition-colors flex items-center gap-1">
            ← Voltar
          </button>
          <div className="inline-block mb-2 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest"
            style={{ backgroundColor: 'rgba(139,92,246,0.15)', color: 'rgba(167,139,250,0.8)', border: '1px solid rgba(139,92,246,0.25)' }}>
            {role === 'TUTOR' ? 'Moderador' : 'Observador'}
          </div>
          <h1 className="text-3xl font-black text-white mt-2 mb-1 tracking-tight">Identificação</h1>
          <p className="text-sm text-gray-400 mb-8">Informe seus dados para participar da pesquisa.</p>

          <div className="rounded-xl p-6 space-y-4"
            style={{ backgroundColor: 'rgba(15,15,25,0.8)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Nome</label>
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: `1px solid ${identifyErrors.name ? 'rgba(239,68,68,0.5)' : 'rgba(139,92,246,0.25)'}` }}
                placeholder="Seu nome"
              />
              {identifyErrors.name && <p className="mt-1 text-xs text-red-400">{identifyErrors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleIdentifyNext()}
                className="w-full rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: `1px solid ${identifyErrors.email ? 'rgba(239,68,68,0.5)' : 'rgba(139,92,246,0.25)'}` }}
                placeholder="seu@email.com"
              />
              {identifyErrors.email && <p className="mt-1 text-xs text-red-400">{identifyErrors.email}</p>}
            </div>
            <button onClick={handleIdentifyNext}
              className="w-full py-2.5 rounded-lg text-sm font-bold transition-colors"
              style={{ backgroundColor: 'rgba(139,92,246,0.3)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.5)' }}>
              Continuar →
            </button>
          </div>
        </div>
      </Screen>
    );
  }

  // ── Scenario selection ──────────────────────────────────────────────────────
  if (step === 'scenario') {
    return (
      <Screen>
        <div className="relative z-10 max-w-2xl w-full">
          <button onClick={() => setStep(requireId ? 'identify' : 'role')}
            className="mb-6 text-xs text-gray-500 hover:text-gray-400 transition-colors flex items-center gap-1">
            ← Voltar
          </button>

          <div className="inline-block mb-2 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest"
            style={{ backgroundColor: 'rgba(139,92,246,0.15)', color: 'rgba(167,139,250,0.8)', border: '1px solid rgba(139,92,246,0.25)' }}>
            {role === 'TUTOR' ? 'Moderador' : 'Observador'}
          </div>
          <h1 className="text-3xl font-black text-white mt-2 mb-1 tracking-tight">Selecione um cenário</h1>
          <p className="text-sm text-gray-400 mb-8">Cada cenário simula uma situação diferente em um lobby de jogo.</p>

          {!scenariosLoaded ? (
            <div className="text-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent mx-auto mb-3" />
              <p className="text-sm text-gray-500">Carregando cenários...</p>
            </div>
          ) : scenarios.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500 mb-2">Nenhum cenário game encontrado.</p>
              <p className="text-xs text-gray-600">Execute <code className="text-violet-400">npm run db:seed</code> para adicionar os cenários.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scenarios.map((s) => {
                const colors = SCENARIO_COLORS[s.type] ?? SCENARIO_COLORS.FLAMING;
                // When showScenarioType is off, use neutral border and soft names
                const borderColor = showScenarioType ? colors.border : 'rgba(139,92,246,0.2)';
                const displayName = showScenarioType ? s.name : (s.softName ?? s.name);
                const displayDesc = showScenarioType ? s.description : (s.softDescription ?? s.description);
                return (
                  <button key={s.id} onClick={() => handleSelectScenario(s)}
                    className="w-full rounded-xl p-5 text-left transition-all duration-150 group"
                    style={{ backgroundColor: 'rgba(15,15,25,0.8)', border: `1px solid ${borderColor}`, backdropFilter: 'blur(8px)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 20px ${colors.glow}`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        {showScenarioType && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                              style={{ backgroundColor: colors.glow, color: colors.tag, border: `1px solid ${colors.border}` }}>
                              {TYPE_LABEL[s.type] ?? s.type}
                            </span>
                          </div>
                        )}
                        <h3 className="font-bold text-white text-base">{displayName}</h3>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">{displayDesc}</p>
                      </div>
                      <div className="shrink-0 mt-1 text-gray-500 group-hover:text-violet-400 transition-colors">→</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </Screen>
    );
  }

  // ── Disclaimer ──────────────────────────────────────────────────────────────
  if (step === 'disclaimer') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: BG }}>
        <DisclaimerModal
          isOpen={true}
          onAccept={handleAccept}
          onDecline={() => setStep('scenario')}
        />
        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
              <p className="text-sm text-violet-300/60 tracking-widest uppercase">Entrando no lobby...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
