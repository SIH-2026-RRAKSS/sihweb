import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
}) => {
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
