import React from 'react';

interface LoadingSkeletonProps {
  variant?: 'text' | 'card' | 'chart' | 'table-row';
  count?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'text',
  count = 1,
  className = '',
}) => {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === 'card') {
    return (
      <div className={`space-y-4 ${className}`}>
        {items.map((i) => (
          <div key={i} className="glass-panel-static p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="skeleton w-10 h-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            </div>
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-5/6" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className={`glass-panel-static p-5 ${className}`}>
        <div className="skeleton h-4 w-40 mb-4" />
        <div className="flex items-end gap-2 h-40">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="skeleton flex-1 rounded-t" style={{ height: `${30 + Math.random() * 70}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'table-row') {
    return (
      <div className={`space-y-2 ${className}`}>
        {items.map((i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <div className="skeleton w-20 h-4" />
            <div className="skeleton flex-1 h-4" />
            <div className="skeleton w-16 h-4" />
            <div className="skeleton w-24 h-6 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  // Text variant
  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((i) => (
        <div key={i} className="skeleton h-4" style={{ width: `${60 + Math.random() * 40}%` }} />
      ))}
    </div>
  );
};
