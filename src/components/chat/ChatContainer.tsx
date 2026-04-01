'use client';

import { useRef, useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ChatContainerProps {
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  footer?: ReactNode;
}

export function ChatContainer({
  children,
  className,
  header,
  footer,
}: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [children]);

  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-lg bg-chat-bg shadow-lg',
        className
      )}
    >
      {header && (
        <div className="flex-shrink-0">
          {header}
        </div>
      )}

      <div
        className="flex-1 overflow-y-auto px-4 py-3"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        <div className="mx-auto max-w-2xl space-y-2">
          {children}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {footer && (
        <div className="flex-shrink-0">
          {footer}
        </div>
      )}
    </div>
  );
}
