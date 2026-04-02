'use client';

import type React from 'react';
import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({ children, className, style, padding = 'md', onClick }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-white shadow-sm',
        paddingClasses[padding],
        onClick && 'cursor-pointer',
        className
      )}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, description, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between', className)}>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn('mt-4', className)}>{children}</div>;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div
      className={cn(
        'mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4',
        className
      )}
    >
      {children}
    </div>
  );
}
