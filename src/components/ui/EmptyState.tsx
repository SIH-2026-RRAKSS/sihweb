import React, { useEffect } from 'react';
import { LucideIcon, Inbox, WifiOff } from 'lucide-react';
import { useConnectivity } from '../../context/ConnectivityContext';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'empty' | 'offline';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  variant = 'empty',
}) => {
  const { isOnline } = useConnectivity();

  useEffect(() => {
    if (variant === 'offline' && isOnline) {
      window.location.reload();
    }
  }, [variant, isOnline]);

  if (variant === 'offline') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="bg-red-500/10 ring-1 ring-red-500/20 rounded-2xl p-4 mb-4">
          <WifiOff className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-sm font-semibold text-slate-700 mb-1">Server Unreachable</h3>
        <p className="text-xs text-slate-500 max-w-xs">
          Unable to connect to the backend. Please check your network connection.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="bg-accent-500/10 ring-1 ring-accent-500/20 rounded-2xl p-4 mb-4">
        <Icon className="w-8 h-8 text-accent-400/60" />
      </div>
      <h3 className="text-sm font-semibold text-slate-700 mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-slate-500 max-w-xs">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 text-xs font-medium text-accent-400 bg-accent-500/10
                     ring-1 ring-accent-500/20 rounded-2xl hover:bg-accent-500/20 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
