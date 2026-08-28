import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  hover?: boolean;
  glow?: 'cyan' | 'red' | 'amber' | 'green' | 'none';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  brackets?: boolean;
  alert?: boolean;
}

const paddingMap = {
  none: '',
  sm: 'p-2.5',
  md: 'p-4',
  lg: 'p-6',
};

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  hover = true,
  glow = 'cyan',
  padding = 'md',
  brackets = true,
  alert = false,
  className = '',
  ...motionProps
}) => {
  let borderClass = 'cyber-panel';
  if (alert || glow === 'red') borderClass = 'cyber-panel-alert';
  else if (glow === 'amber') borderClass = 'cyber-panel-warn';
  else if (glow === 'green') borderClass = 'cyber-panel-safe';

  return (
    <motion.div
      className={`${borderClass} ${brackets ? (alert || glow === 'red' ? 'hud-bracket hud-bracket-red' : 'hud-bracket') : ''} ${paddingMap[padding]} ${className}`}
      whileHover={hover ? { y: -2, transition: { duration: 0.15 } } : undefined}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};
