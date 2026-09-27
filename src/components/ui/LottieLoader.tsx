import React, { useState, useEffect } from 'react';
import { Lottie } from 'lottie-react';
import { AsyncStatus } from '../../hooks/useAsyncState';
import { LoadingSkeleton } from './LoadingSkeleton';
import { AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

interface LottieLoaderProps {
  status: AsyncStatus;
  error?: string | null;
  onRetry?: () => void;
  autoHideMs?: number;
  className?: string;
}

export const LottieLoader: React.FC<LottieLoaderProps> = ({
  status,
  error,
  onRetry,
  autoHideMs,
  className = '',
}) => {
  const [animationData, setAnimationData] = useState<any>(null);
  const [loadError, setLoadError] = useState<boolean>(false);
  const [hidden, setHidden] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    let url = '';

    if (status === AsyncStatus.LOADING) {
      url = '/animations/loading.json';
    } else if (status === AsyncStatus.ERROR || status === AsyncStatus.TIMEOUT) {
      url = '/animations/error.json';
    } else if (status === AsyncStatus.SUCCESS) {
      url = '/animations/success.json';
    } else {
      setAnimationData(null);
      setLoadError(false);
      return;
    }

    setLoadError(false);
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load animation');
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setAnimationData(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoadError(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [status]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (status === AsyncStatus.SUCCESS && autoHideMs) {
      timeout = setTimeout(() => {
        setHidden(true);
      }, autoHideMs);
    } else {
      setHidden(false);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [status, autoHideMs]);

  if (hidden || status === AsyncStatus.IDLE) {
    return null;
  }

  // Fallbacks
  if (loadError) {
    if (status === AsyncStatus.LOADING) {
      return <LoadingSkeleton variant="card" className={className} />;
    }
    
    if (status === AsyncStatus.ERROR || status === AsyncStatus.TIMEOUT) {
      return (
        <div className={`bg-red-50 border border-red-200 rounded-2xl p-6 text-center shadow-sm ${className}`}>
          <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-3" />
          <h3 className="text-red-700 font-bold mb-1">
            {status === AsyncStatus.TIMEOUT ? 'Request Timed Out' : 'Error Occurred'}
          </h3>
          <p className="text-red-600 text-sm mb-4">{error || 'Something went wrong.'}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
        </div>
      );
    }
    
    if (status === AsyncStatus.SUCCESS) {
      return (
        <div className={`bg-green-50 border border-green-200 rounded-2xl p-6 text-center shadow-sm flex flex-col items-center justify-center ${className}`}>
           <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
           <p className="text-green-700 font-medium">Success</p>
        </div>
      );
    }
  }

  // Render Lottie
  if (animationData) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-2xl shadow-saas-card ${className}`}>
        <div className="w-32 h-32 relative flex items-center justify-center">
          {/* @ts-ignore */}
          <Lottie animationData={animationData} loop={status === AsyncStatus.LOADING || status === AsyncStatus.ERROR || status === AsyncStatus.TIMEOUT} />
        </div>
        
        {(status === AsyncStatus.ERROR || status === AsyncStatus.TIMEOUT) && (
          <div className="mt-4 text-center">
            <h3 className="text-red-600 font-bold mb-1">
               {status === AsyncStatus.TIMEOUT ? 'Request Timed Out' : 'Error Occurred'}
            </h3>
            {error && <p className="text-slate-600 text-sm mb-4">{error}</p>}
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Pre-fetch fallback while loading JSON itself (rarely visible for long)
  return status === AsyncStatus.LOADING ? <LoadingSkeleton variant="card" className={className} /> : null;
};
