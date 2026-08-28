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
  glow = 'cyan', // Keeping prop for compatibility, but ignoring visual glow
  padding = 'md',
  brackets = false, // Disabling brackets for SaaS aesthetic
  alert = false,
  className = '',
  ...motionProps
}) => {
  return (
    <motion.div
      className={`bg-tactical-surface border border-tactical-border rounded-2xl shadow-saas-card ${paddingMap[padding]} ${className}`}
      whileHover={hover ? { y: -2, transition: { duration: 0.15 }, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.25), 0 4px 6px -4px rgba(0, 0, 0, 0.1)' } : undefined}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};
