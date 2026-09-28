import React, { Component, ErrorInfo, ReactNode } from 'react';
import { LottieLoader } from './LottieLoader';
import { AsyncStatus } from '../../hooks/useAsyncState';
import { RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-white/50 backdrop-blur-sm rounded-2xl border border-red-100 shadow-sm mx-auto max-w-lg mt-12">
          <LottieLoader
            status={AsyncStatus.ERROR}
            error={this.state.error?.message || 'An unexpected runtime error occurred.'}
          />
          <button
            onClick={this.handleReload}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
