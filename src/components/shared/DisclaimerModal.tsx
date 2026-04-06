'use client';

import { useState } from 'react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { cn } from '@/lib/utils';

interface DisclaimerModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
  showIdentification?: boolean;
}

export function DisclaimerModal({
  isOpen,
  onAccept,
  onDecline,
  showIdentification = true,
}: DisclaimerModalProps) {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    if (accepted) {
      onAccept();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onDecline}
      title="Termo de Consentimento Livre e Esclarecido"
      description="Leia atentamente antes de continuar"
      size="full"
      showCloseButton={false}
      closeOnOverlayClick={false}
    >
      <div className="max-h-[60vh] overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
        <div className="prose prose-sm max-w-none">
          <h3>1. Identificação do Pesquisador Responsável</h3>
          <p>
            Esta pesquisa é conduzida por pesquisadores da área de Ciência da Computação
            e Psicologia, com aprovação do Comitê de Ética em Pesquisa.
          </p>

          <h3>2. Objetivo da Pesquisa</h3>
          <p>
            Esta pesquisa tem como objetivo investigar as respostas comportamentais
            de indivíduos diante de situações simuladas de cyberbullying em ambiente
            controlado.
          </p>

          <h3>3. Procedimentos da Participação</h3>
          <p>Ao participar desta pesquisa, você irá:</p>
          <ul>
            {showIdentification && (
              <li>Fornecer informações básicas (nome e email) para identificação da sessão</li>
            )}
            <li>Observar uma simulação de chat contendo diálogos fictícios</li>
            <li>Interagir com o sistema de acordo com seu papel atribuído</li>
          </ul>
          <p><strong>Duração estimada:</strong> 10-15 minutos</p>
          <p>
            <strong>Importante:</strong> Todas as mensagens exibidas são FICTÍCIAS e foram
            criadas exclusivamente para fins de pesquisa.
          </p>

          <h3>4. Riscos e Benefícios</h3>
          <p>
            <strong>Riscos:</strong> A observação de conteúdo relacionado a cyberbullying
            pode causar desconforto em alguns participantes. Você pode interromper a
            participação a qualquer momento sem necessidade de justificativa.
          </p>
          <p>
            <strong>Benefícios:</strong> Contribuição para o avanço do conhecimento
            científico sobre cyberbullying e desenvolvimento de ferramentas de prevenção.
          </p>

          <h3>5. Confidencialidade e Anonimato</h3>
          <ul>
            {showIdentification && (
              <li>Seus dados pessoais serão utilizados apenas para controle interno</li>
            )}
            <li>Os resultados serão apresentados de forma agregada e anônima</li>
            <li>Nenhuma informação que permita sua identificação será divulgada</li>
          </ul>

          <h3>6. Direito de Desistência</h3>
          <p>
            Sua participação é <strong>totalmente voluntária</strong>. Você pode recusar-se
            a participar, desistir a qualquer momento, ou solicitar a exclusão de seus
            dados após a participação, sem nenhum prejuízo.
          </p>

          <h3>7. Armazenamento de Dados (LGPD)</h3>
          <p>
            Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018):
          </p>
          <ul>
            <li><strong>Base Legal:</strong> Consentimento do titular (Art. 7º, I)</li>
            <li><strong>Finalidade:</strong> Exclusivamente para fins de pesquisa acadêmica</li>
            <li><strong>Armazenamento:</strong> Dados serão armazenados por 5 anos após a conclusão</li>
            <li>
              <strong>Seus Direitos:</strong> Acesso, correção, anonimização, bloqueio,
              eliminação, portabilidade e revogação do consentimento
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
        <Checkbox
          label="Li e compreendi todas as informações acima"
          description="Declaro que concordo em participar desta pesquisa e autorizo o uso dos meus dados conforme descrito neste termo."
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
        />
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={onDecline}>
          Não Aceitar
        </Button>
        <Button onClick={handleAccept} disabled={!accepted}>
          Aceitar e Continuar
        </Button>
      </ModalFooter>
    </Modal>
  );
}
