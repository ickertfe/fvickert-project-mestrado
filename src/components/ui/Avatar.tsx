'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn, getInitials, getAvatarColor } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showOnline?: boolean;
  isOnline?: boolean;
}

const sizeClasses = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

// Same dimensions as sizeClasses but for the outer wrapper
const wrapperSizeClasses = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

const onlineSizeClasses = {
  xs: 'h-1.5 w-1.5',
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
  xl: 'h-4 w-4',
};

export function Avatar({
  src,
  name,
  size = 'md',
  className,
  showOnline = false,
  isOnline = false,
}: AvatarProps) {
  const initials = getInitials(name);
  const bgColor = getAvatarColor(name);
  const [imgError, setImgError] = useState(false);

  const showImage = src && !imgError;

  return (
    <div className={cn('relative flex-shrink-0 rounded-full', wrapperSizeClasses[size], className)}>
      {showImage ? (
        <div className={cn('relative overflow-hidden rounded-full', sizeClasses[size])}>
          <Image
            src={src}
            alt={name}
            fill
            className="object-cover"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <div
          className={cn(
            'flex items-center justify-center rounded-full font-medium text-white',
            sizeClasses[size]
          )}
          style={{ backgroundColor: bgColor }}
        >
          {initials}
        </div>
      )}
      {showOnline && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full ring-2 ring-white',
            onlineSizeClasses[size],
            isOnline ? 'bg-green-400' : 'bg-gray-300'
          )}
        />
      )}
    </div>
  );
}

interface AvatarGroupProps {
  avatars: Array<{ src?: string | null; name: string }>;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function AvatarGroup({
  avatars,
  max = 4,
  size = 'sm',
  className,
}: AvatarGroupProps) {
  const visibleAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          name={avatar.name}
          size={size}
          className="ring-2 ring-white"
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-gray-100 text-gray-600 ring-2 ring-white',
            sizeClasses[size]
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
