import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-chat-header/10 px-4 py-1.5">
            <span className="text-sm font-medium text-chat-header">
              Pesquisa Acadêmica
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            BCRT
          </h1>
          <p className="mt-2 text-xl text-gray-600">
            Behavioral Cyberbullying Response Task
          </p>
        </header>

        {/* Main Content */}
        <main className="mt-16">
          <div className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-900/5">
            <h2 className="text-2xl font-semibold text-gray-900">
              Pesquisa sobre Respostas ao Cyberbullying
            </h2>
            <p className="mt-4 text-gray-600">
              Este estudo investiga como as pessoas respondem a situações de cyberbullying
              em ambientes de comunicação online. Sua participação é voluntária e todos
              os dados são coletados de forma anônima.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {/* Tutor Card */}
              <div className="rounded-xl border border-gray-200 p-6 transition-shadow hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-chat-header/10">
                  <svg
                    className="h-6 w-6 text-chat-header"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Tutor</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Observe a simulação e tome decisões de moderação quando necessário.
                  Você terá acesso a ferramentas para intervir nas conversas.
                </p>
                <Link href="/tutor" className="mt-4 block">
                  <Button className="w-full">Participar como Tutor</Button>
                </Link>
              </div>

              {/* Bystander Card */}
              <div className="rounded-xl border border-gray-200 p-6 transition-shadow hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-action-info/10">
                  <svg
                    className="h-6 w-6 text-action-info"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Observador</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Observe a simulação como um espectador. Ao final, responda a um
                  breve questionário sobre sua experiência.
                </p>
                <Link href="/bystander" className="mt-4 block">
                  <Button variant="outline" className="w-full">
                    Participar como Observador
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">Dados Seguros</h3>
              <p className="mt-2 text-sm text-gray-600">
                Seus dados são protegidos e processados de acordo com a LGPD.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">10-15 minutos</h3>
              <p className="mt-2 text-sm text-gray-600">
                A participação completa leva em média 10 a 15 minutos.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <svg
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">Ética Aprovada</h3>
              <p className="mt-2 text-sm text-gray-600">
                Pesquisa aprovada pelo Comitê de Ética em Pesquisa.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16 border-t border-gray-100 pt-8 text-center">
          <p className="text-sm text-gray-500">
            Pesquisa acadêmica para fins científicos.
          </p>
          <p className="mt-2 text-sm text-gray-400">
            <Link href="/admin" className="hover:text-chat-header">
              Acesso Administrativo
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
