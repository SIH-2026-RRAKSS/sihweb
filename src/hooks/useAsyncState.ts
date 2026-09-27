import { useState, useCallback } from 'react';

export enum AsyncStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  TIMEOUT = 'TIMEOUT',
}

export function useAsyncState<T>(timeoutMs: number = 8000, minDisplayMs: number = 2000) {
  const [status, setStatus] = useState<AsyncStatus>(AsyncStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const run = useCallback(
    async (asyncFn: () => Promise<T>) => {
      setStatus(AsyncStatus.LOADING);
      setError(null);

      const startTime = Date.now();

      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs);
        });

        const result = await Promise.race([asyncFn(), timeoutPromise]);

        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < minDisplayMs) {
          await new Promise((resolve) => setTimeout(resolve, minDisplayMs - elapsedTime));
        }

        setData(result);
        setStatus(AsyncStatus.SUCCESS);
        return result;
      } catch (err: any) {
        if (err.message === 'TIMEOUT') {
          setStatus(AsyncStatus.TIMEOUT);
          setError('The request timed out.');
        } else {
          setStatus(AsyncStatus.ERROR);
          setError(err.message || 'An error occurred.');
        }
        throw err;
      }
    },
    [timeoutMs]
  );

  return { status, error, data, run };
}
