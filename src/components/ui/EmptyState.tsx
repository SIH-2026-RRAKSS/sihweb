import React, { useEffect, useRef } from 'react';
import { LucideIcon, Inbox, WifiOff, RefreshCw } from 'lucide-react';
import { useConnectivity } from '../../context/ConnectivityContext';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'empty' | 'offline';
  onRetry?: () => void | Promise<any>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title = 'No Data',
  description,
  message,
  action,
  actionLabel,
  onAction,
  variant = 'empty',
  onRetry,
}) => {
  const { isOnline } = useConnectivity();
  const wasOnlineRef = useRef<boolean>(isOnline);
  const resolvedDescription = description || message;
  const resolvedAction = action || (actionLabel && onAction ? { label: actionLabel, onClick: onAction } : undefined);

  useEffect(() => {
    // Only fire retry if connectivity transitioned from offline (false) to online (true)
    if (variant === 'offline' && !wasOnlineRef.current && isOnline) {
      if (onRetry) {
        onRetry();
      } else {
        window.location.reload();
      }
    }
    wasOnlineRef.current = isOnline;
  }, [variant, isOnline, onRetry]);

  if (variant === 'offline') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="bg-red-500/10 ring-1 ring-red-500/20 rounded-2xl p-4 mb-4">
          <WifiOff className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-sm font-semibold text-slate-700 mb-1">{title || 'Server Unreachable'}</h3>
        <p className="text-xs text-slate-500 max-w-xs mb-4">
          {resolvedDescription || 'Unable to connect to the backend. Please check your network connection.'}
        </p>
        <button
          onClick={onRetry || (() => window.location.reload())}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="bg-accent-500/10 ring-1 ring-accent-500/20 rounded-2xl p-4 mb-4">
        <Icon className="w-8 h-8 text-accent-400/60" />
      </div>
      <h3 className="text-sm font-semibold text-slate-700 mb-1">{title}</h3>
      {resolvedDescription && (
        <p className="text-xs text-slate-500 max-w-xs">{resolvedDescription}</p>
      )}
      {resolvedAction && (
        <button
          onClick={resolvedAction.onClick}
          className="mt-4 px-4 py-2 text-xs font-medium text-accent-400 bg-accent-500/10
                     ring-1 ring-accent-500/20 rounded-2xl hover:bg-accent-500/20 transition-colors"
        >
          {resolvedAction.label}
        </button>
      )}
    </div>
  );
};
