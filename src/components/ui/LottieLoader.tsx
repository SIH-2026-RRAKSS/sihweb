import React, { useState, useEffect } from 'react';
import { Lottie } from 'lottie-react';
import { AsyncStatus } from '../../hooks/useAsyncState';
import { AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import loadingAnimation from '../../assets/animations/loading.json';
import errorAnimation from '../../assets/animations/error.json';
import successAnimation from '../../assets/animations/success.json';

interface LottieLoaderProps {
  status: AsyncStatus;
  error?: string | null;
  onRetry?: () => void;
  autoHideMs?: number;
  size?: number;
  className?: string;
  label?: string;
}

export const LottieLoader: React.FC<LottieLoaderProps> = ({
  status,
  error,
  onRetry,
  autoHideMs,
  size = 110,
  className = '',
  label,
}) => {
  const [hidden, setHidden] = useState<boolean>(false);

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

  const getAnimationSource = () => {
    if (status === AsyncStatus.LOADING) return loadingAnimation;
    if (status === AsyncStatus.ERROR || status === AsyncStatus.TIMEOUT) return errorAnimation;
    if (status === AsyncStatus.SUCCESS) return successAnimation;
    return null;
  };

  const animSource = getAnimationSource();

  if (status === AsyncStatus.ERROR || status === AsyncStatus.TIMEOUT) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 text-center ${className}`}>
        {animSource ? (
          <div style={{ width: size, height: size }} className="flex items-center justify-center">
            <Lottie
              src={animSource}
              autoplay
              loop={false}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        ) : (
          <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
        )}
        <h4 className="text-red-600 font-bold text-xs mt-2">
          {status === AsyncStatus.TIMEOUT ? 'Request Timed Out' : 'Failed to Load Data'}
        </h4>
        {error && <p className="text-slate-500 text-[11px] max-w-xs mt-1">{error}</p>}
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (status === AsyncStatus.SUCCESS) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
        {animSource ? (
          <div style={{ width: size, height: size }} className="flex items-center justify-center">
            <Lottie
              src={animSource}
              autoplay
              loop={false}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        ) : (
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        )}
        {label && <p className="text-emerald-700 font-medium text-xs mt-2">{label}</p>}
      </div>
    );
  }

  // LOADING
  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
      <div style={{ width: size, height: size }} className="flex items-center justify-center">
        <Lottie
          src={loadingAnimation}
          autoplay
          loop
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      {label && <p className="text-slate-400 text-xs font-medium mt-2">{label}</p>}
    </div>
  );
};
