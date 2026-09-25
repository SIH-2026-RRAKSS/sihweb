import React, { useEffect, useState } from 'react';

interface NumberTickerProps {
  value: number;
  direction?: 'up' | 'down';
  className?: string;
  delay?: number; // in seconds
  decimalPlaces?: number;
  prefix?: string;
  suffix?: string;
  formatter?: (val: number) => string;
}

export const NumberTicker: React.FC<NumberTickerProps> = ({
  value,
  className = '',
  delay = 0,
  decimalPlaces = 0,
  prefix = '',
  suffix = '',
  formatter,
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1200; // ms
    const startVal = displayValue;
    const targetVal = value;
    let animationFrameId: number;

    const timeout = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        // Easing function: easeOutExpo
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = startVal + (targetVal - startVal) * easeProgress;
        
        setDisplayValue(current);

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step);
        }
      };

      animationFrameId = requestAnimationFrame(step);
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [value, delay]);

  const formatNumber = (num: number): string => {
    if (formatter) return formatter(num);
    return num.toLocaleString('en-IN', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });
  };

  return (
    <span className={`inline-block tabular-nums font-mono ${className}`}>
      {prefix}
      {formatNumber(displayValue)}
      {suffix}
    </span>
  );
};
