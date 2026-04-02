'use client';

import { useState } from 'react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import type { BystanderQuestion, CreateBystanderAnswerInput } from '@/types/session';
import { cn } from '@/lib/utils';

interface QuestionnaireModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions?: BystanderQuestion[];
  onSubmit: (answers: Omit<CreateBystanderAnswerInput, 'sessionId'>[]) => Promise<void>;
  sessionId: string;
}

const defaultQuestions: BystanderQuestion[] = [
  {
    id: 'q1',
    question: 'Em uma escala de 1 a 5, o quanto você considera que as mensagens observadas representam uma situação de cyberbullying?',
    type: 'SCALE',
    options: ['1', '2', '3', '4', '5'],
    order: 1,
    isActive: true,
  },
  {
    id: 'q2',
    question: 'Como você se sentiu ao observar esta conversa?',
    type: 'MULTIPLE_CHOICE',
    options: ['Desconfortável', 'Com raiva', 'Triste', 'Indiferente', 'Ansioso', 'Outro'],
    order: 2,
    isActive: true,
  },
  {
    id: 'q3',
    question: 'Se você estivesse participando desta conversa na vida real, o que você faria?',
    type: 'MULTIPLE_CHOICE',
    options: [
      'Defenderia a vítima',
      'Denunciaria ao administrador',
      'Sairia do grupo',
      'Ignoraria',
      'Confrontaria o agressor',
      'Outro',
    ],
    order: 3,
    isActive: true,
  },
  {
    id: 'q4',
    question: 'Na sua opinião, qual deveria ser a consequência para o comportamento observado?',
    type: 'OPEN_TEXT',
    options: null,
    order: 4,
    isActive: true,
  },
];

export function QuestionnaireModal({
  isOpen,
  onClose,
  questions = defaultQuestions,
  onSubmit,
}: QuestionnaireModalProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [otherText, setOtherText] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeQuestions = questions.filter((q) => q.isActive).sort((a, b) => a.order - b.order);
  const currentQuestion = activeQuestions[currentIndex];
  const isLastQuestion = currentIndex === activeQuestions.length - 1;

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleOtherText = (questionId: string, text: string) => {
    setOtherText((prev) => ({ ...prev, [questionId]: text }));
  };

  const handleNext = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formattedAnswers = activeQuestions.map((q) => {
        let answer = answers[q.id] || '';
        if (answer === 'Outro' && otherText[q.id]) {
          answer = `Outro: ${otherText[q.id]}`;
        }
        return {
          questionId: q.id,
          answer,
        };
      });

      await onSubmit(formattedAnswers);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCurrentAnswered = () => {
    const answer = answers[currentQuestion?.id];
    if (!answer) return false;
    if (answer === 'Outro' && !otherText[currentQuestion?.id]) return false;
    return true;
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case 'SCALE':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{currentQuestion.question}</p>
            <div className="flex justify-between gap-2">
              {(currentQuestion.options || []).map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(currentQuestion.id, option)}
                  className={cn(
                    'flex-1 rounded-lg border-2 py-3 text-center font-medium transition-colors',
                    answers[currentQuestion.id] === option
                      ? 'border-chat-header bg-chat-header text-white'
                      : 'border-gray-200 hover:border-chat-header hover:bg-gray-50'
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Nada</span>
              <span>Extremamente</span>
            </div>
          </div>
        );

      case 'MULTIPLE_CHOICE':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{currentQuestion.question}</p>
            <div className="space-y-2">
              {(currentQuestion.options || []).map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(currentQuestion.id, option)}
                  className={cn(
                    'w-full rounded-lg border-2 px-4 py-3 text-left transition-colors',
                    answers[currentQuestion.id] === option
                      ? 'border-chat-header bg-chat-header/5'
                      : 'border-gray-200 hover:border-chat-header hover:bg-gray-50'
                  )}
                >
                  {option}
                </button>
              ))}
              {answers[currentQuestion.id] === 'Outro' && (
                <Textarea
                  value={otherText[currentQuestion.id] || ''}
                  onChange={(e) => handleOtherText(currentQuestion.id, e.target.value)}
                  placeholder="Descreva..."
                  className="mt-2"
                />
              )}
            </div>
          </div>
        );

      case 'OPEN_TEXT':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{currentQuestion.question}</p>
            <Textarea
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
              placeholder="Digite sua resposta..."
              className="min-h-[120px]"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      title="Questionário Final"
      description={`Pergunta ${currentIndex + 1} de ${activeQuestions.length}`}
      size="lg"
      showCloseButton={false}
      closeOnOverlayClick={false}
    >
      <div className="min-h-[300px] py-4">
        {renderQuestion()}
      </div>

      <ModalFooter>
        <div className="flex w-full items-center justify-between">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            Anterior
          </Button>

          <div className="flex gap-1">
            {activeQuestions.map((_, index) => (
              <div
                key={index}
                className={cn(
                  'h-2 w-2 rounded-full',
                  index === currentIndex
                    ? 'bg-chat-header'
                    : index < currentIndex
                    ? 'bg-chat-header/50'
                    : 'bg-gray-200'
                )}
              />
            ))}
          </div>

          {isLastQuestion ? (
            <Button
              onClick={handleSubmit}
              disabled={!isCurrentAnswered() || isSubmitting}
              isLoading={isSubmitting}
            >
              Enviar
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!isCurrentAnswered()}
            >
              Próxima
            </Button>
          )}
        </div>
      </ModalFooter>
    </Modal>
  );
}
