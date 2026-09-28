import { useState, useCallback, useRef, useEffect } from 'react';

export enum AsyncStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  TIMEOUT = 'TIMEOUT',
}

function isNetworkError(err: any): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return true;
  }
  const msg = (err?.message || String(err)).toLowerCase();
  return (
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('network error') ||
    msg.includes('err_connection_refused') ||
    msg.includes('connection refused') ||
    msg.includes('network request failed') ||
    msg.includes('load failed')
  );
}

export interface AsyncStateOptions<T> {
  initialData?: T;
  timeoutMs?: number;
  minDisplayMs?: number;
}

export function useAsyncState<T>(
  timeoutOrOptions?: number | AsyncStateOptions<T>,
  minDisplayMsParam: number = 500
) {
  const options: AsyncStateOptions<T> =
    typeof timeoutOrOptions === 'object' && timeoutOrOptions !== null
      ? timeoutOrOptions
      : {
          timeoutMs: typeof timeoutOrOptions === 'number' ? timeoutOrOptions : 8000,
          minDisplayMs: minDisplayMsParam,
        };

  const timeoutMs = options.timeoutMs ?? 8000;
  const minDisplayMs = options.minDisplayMs ?? 500;
  const initialData = options.initialData !== undefined ? options.initialData : null;

  const [status, setStatus] = useState<AsyncStatus>(AsyncStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(initialData);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  const requestIdRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);
  const lastFnRef = useRef<(() => Promise<T>) | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const reset = useCallback(() => {
    setStatus(AsyncStatus.IDLE);
    setError(null);
    setIsOffline(false);
  }, []);

  const run = useCallback(
    async (asyncFn: () => Promise<T>): Promise<T | undefined> => {
      const currentRequestId = ++requestIdRef.current;
      lastFnRef.current = asyncFn;

      setStatus(AsyncStatus.LOADING);
      setError(null);
      setIsOffline(false);

      const startTime = Date.now();

      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs);
        });

        const result = await Promise.race([asyncFn(), timeoutPromise]);

        if (currentRequestId !== requestIdRef.current || !isMountedRef.current) {
          return undefined;
        }

        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < minDisplayMs) {
          await new Promise((resolve) => setTimeout(resolve, minDisplayMs - elapsedTime));
        }

        if (currentRequestId !== requestIdRef.current || !isMountedRef.current) {
          return undefined;
        }

        setData(result);
        setStatus(AsyncStatus.SUCCESS);
        return result;
      } catch (err: any) {
        if (currentRequestId !== requestIdRef.current || !isMountedRef.current) {
          return undefined;
        }

        const offline = isNetworkError(err);
        setIsOffline(offline);

        if (err.message === 'TIMEOUT') {
          setStatus(AsyncStatus.TIMEOUT);
          setError('The request timed out. Please try again.');
        } else {
          setStatus(AsyncStatus.ERROR);
          setError(
            offline
              ? 'Server unreachable. Please check your network connection.'
              : err.message || 'An error occurred while fetching data.'
          );
        }
        throw err;
      }
    },
    [timeoutMs, minDisplayMs]
  );

  const retry = useCallback(() => {
    if (lastFnRef.current) {
      return run(lastFnRef.current);
    }
  }, [run]);

  return { status, error, data, isOffline, run, retry, reset, setData, setStatus, setError };
}
