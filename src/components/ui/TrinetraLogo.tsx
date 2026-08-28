import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Sparkles, Flame } from 'lucide-react';

export interface RegionalLanguageOption {
  script: string;
  prefix: string;
  lang: string;
  code: string;
  nativeName: string;
}

export const REGIONAL_TRI_LANGUAGES: RegionalLanguageOption[] = [
  { script: 'devanagari', prefix: 'त्रि', lang: 'Hindi / Sanskrit', code: 'HI', nativeName: 'हिन्दी / संस्कृत' },
  { script: 'bengali', prefix: 'ত্রি', lang: 'Bengali / Bangla', code: 'BN', nativeName: 'বাংলা' },
  { script: 'tamil', prefix: 'த்ரி', lang: 'Tamil', code: 'TA', nativeName: 'தமிழ்' },
  { script: 'telugu', prefix: 'త్రి', lang: 'Telugu', code: 'TE', nativeName: 'తెలుగు' },
  { script: 'kannada', prefix: 'ತ್ರಿ', lang: 'Kannada', code: 'KN', nativeName: 'ಕನ್ನಡ' },
  { script: 'malayalam', prefix: 'ത്രി', lang: 'Malayalam', code: 'ML', nativeName: 'മലയാളം' },
  { script: 'gujarati', prefix: 'ત્રિ', lang: 'Gujarati', code: 'GU', nativeName: 'ગુજરાતી' },
  { script: 'odia', prefix: 'ତ୍ରି', lang: 'Odia', code: 'OR', nativeName: 'ଓଡ଼ିଆ' },
  { script: 'gurmukhi', prefix: 'ਤ੍ਰਿ', lang: 'Punjabi', code: 'PA', nativeName: 'ਪੰਜਾਬੀ' },
  { script: 'latin', prefix: 'TRI', lang: 'English', code: 'EN', nativeName: 'English' },
];

interface TrinetraLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero' | 'footer';
  layout?: 'inline' | 'stacked';
  showIcon?: boolean;
  showSuffix?: boolean;
  showLangBadge?: boolean;
  className?: string;
  intervalMs?: number;
  interactive?: boolean;
}

export const TrinetraLogo: React.FC<TrinetraLogoProps> = ({
  size = 'md',
  layout = 'inline',
  showIcon = true,
  showSuffix = true,
  showLangBadge = false,
  className = '',
  intervalMs = 2600,
  interactive = true,
}) => {
  const [langIdx, setLangIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setLangIdx((prev) => (prev + 1) % REGIONAL_TRI_LANGUAGES.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  const current = REGIONAL_TRI_LANGUAGES[langIdx];

  // Hero Stacked Layout (Centerpiece Grand Display)
  if (size === 'hero' || layout === 'stacked') {
    return (
      <div
        className={`flex flex-col items-center justify-center text-center select-none cursor-pointer group ${className}`}
        onClick={interactive ? () => setLangIdx((prev) => (prev + 1) % REGIONAL_TRI_LANGUAGES.length) : undefined}
        title="Team Trinetra — Click to switch regional script"
      >
        {/* Grand Glowing Emblem Halo */}
        {showIcon && (
          <div className="relative mb-3 flex items-center justify-center">
            {/* Radial Flame Aura */}
            <div className="absolute inset-0 bg-radial-gradient from-[#FF5500]/30 via-[#FF7A1A]/10 to-transparent blur-2xl rounded-full transform scale-150 animate-pulse pointer-events-none" />
            
            {/* Glass Emblem Vessel */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="relative rounded-2xl p-2.5 bg-[#0C0E14]/90 border border-[#FF5500]/40 shadow-[0_0_35px_rgba(255,85,0,0.35)] group-hover:border-[#FF5500] group-hover:shadow-[0_0_45px_rgba(255,85,0,0.55)] transition-all backdrop-blur-xl"
            >
              <img
                src="/trinetra_logo.png"
                alt="Team Trinetra Emblem"
                className="w-24 h-24 sm:w-32 sm:h-32 object-contain filter invert drop-shadow-[0_0_15px_rgba(255,85,0,0.6)]"
              />
            </motion.div>
          </div>
        )}

        {/* Morphing Wordmark */}
        <div className="flex items-baseline justify-center font-sans font-bold tracking-tight text-white text-4xl sm:text-6xl lg:text-7xl leading-none">
          <div className="relative inline-block overflow-hidden text-right min-w-[1.2em]">
            <AnimatePresence mode="wait">
              <motion.span
                key={current.script}
                initial={{ opacity: 0, y: 18, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -18, scale: 0.9 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A1A] via-[#FF5500] to-[#E8402C] drop-shadow-[0_0_20px_rgba(255,85,0,0.4)]"
              >
                {current.prefix}
              </motion.span>
            </AnimatePresence>
          </div>

          {showSuffix && (
            <span className="tracking-[0.14em] text-white ml-1 font-bold">
              NETRAA
            </span>
          )}
        </div>

        {/* Regional Language Live Pill */}
        {showLangBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-[#121620]/90 border border-white/15 rounded-full font-mono text-xs text-zinc-300 shadow-md backdrop-blur-md"
          >
            <Globe className="w-3.5 h-3.5 text-[#FF5500]" />
            <AnimatePresence mode="wait">
              <motion.span
                key={current.script}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                transition={{ duration: 0.25 }}
                className="font-bold text-white"
              >
                {current.lang} ({current.nativeName})
              </motion.span>
            </AnimatePresence>
            <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline-block">· CLICK TO CYCLE</span>
          </motion.div>
        )}
      </div>
    );
  }

  // Footer Expanded Layout
  if (size === 'footer') {
    return (
      <div
        className={`flex flex-col sm:flex-row items-start sm:items-center gap-5 select-none cursor-pointer group ${className}`}
        onClick={interactive ? () => setLangIdx((prev) => (prev + 1) % REGIONAL_TRI_LANGUAGES.length) : undefined}
        title="Team Trinetra — Click to switch regional script"
      >
        {showIcon && (
          <div className="relative rounded-2xl p-2 bg-[#0C0E14] border border-[#FF5500]/40 shadow-[0_0_25px_rgba(255,85,0,0.3)] group-hover:border-[#FF5500] group-hover:shadow-[0_0_35px_rgba(255,85,0,0.5)] transition-all flex-shrink-0">
            <img
              src="/trinetra_logo.png"
              alt="Team Trinetra Emblem"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain filter invert drop-shadow-[0_0_10px_rgba(255,85,0,0.5)]"
            />
          </div>
        )}

        <div className="space-y-1.5 text-left">
          <div className="flex items-baseline font-sans font-bold tracking-tight text-white text-2xl sm:text-3xl">
            <div className="relative inline-block overflow-hidden min-w-[1.2em] text-right">
              <AnimatePresence mode="wait">
                <motion.span
                  key={current.script}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="inline-block text-[#FF5500]"
                >
                  {current.prefix}
                </motion.span>
              </AnimatePresence>
            </div>
            {showSuffix && (
              <span className="tracking-[0.1em] text-white ml-1 font-bold">
                NETRAA
              </span>
            )}
          </div>

          <p className="text-xs text-zinc-400 font-sans leading-relaxed max-w-sm">
            National Cybercrime AML & Mule-Chain Predictive Intelligence Platform · Frontline Defense System.
          </p>

          <div className="flex items-center gap-2 pt-0.5">
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300 font-mono text-[10px]">
              Active Script: {current.lang} ({current.code})
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Inline Standard Layout (sm, md, lg)
  const sizeConfig = {
    sm: {
      imgSize: 'w-7 h-7',
      textSize: 'text-sm sm:text-base',
      prefixSize: 'text-sm sm:text-base font-bold',
      badgeSize: 'text-[9px] px-1.5 py-0.2',
      gap: 'gap-2',
    },
    md: {
      imgSize: 'w-10 h-10',
      textSize: 'text-lg sm:text-xl',
      prefixSize: 'text-lg sm:text-xl font-bold',
      badgeSize: 'text-[10px] px-2 py-0.5',
      gap: 'gap-2.5',
    },
    lg: {
      imgSize: 'w-14 h-14',
      textSize: 'text-2xl sm:text-3xl',
      prefixSize: 'text-2xl sm:text-3xl font-bold',
      badgeSize: 'text-xs px-2.5 py-1',
      gap: 'gap-3',
    },
  }[size as 'sm' | 'md' | 'lg'] || {
    imgSize: 'w-10 h-10',
    textSize: 'text-lg sm:text-xl',
    prefixSize: 'text-lg sm:text-xl font-bold',
    badgeSize: 'text-[10px] px-2 py-0.5',
    gap: 'gap-2.5',
  };

  return (
    <div
      className={`inline-flex items-center ${sizeConfig.gap} select-none ${className}`}
      onClick={interactive ? () => setLangIdx((prev) => (prev + 1) % REGIONAL_TRI_LANGUAGES.length) : undefined}
      title={interactive ? `Team Trinetra (Active: ${current.lang}) - Click to switch script` : undefined}
      style={{ cursor: interactive ? 'pointer' : 'default' }}
    >
      {/* Emblem */}
      {showIcon && (
        <div className="relative flex-shrink-0 flex items-center justify-center">
          <div className="relative rounded-xl overflow-hidden p-1.5 bg-[#0C0E14] border border-white/10 hover:border-[#FF5500]/50 transition-colors shadow-sm">
            <img
              src="/trinetra_logo.png"
              alt="Team Trinetra Logo"
              className={`${sizeConfig.imgSize} object-contain filter invert drop-shadow-[0_0_8px_rgba(255,85,0,0.5)]`}
            />
          </div>
        </div>
      )}

      {/* Dynamic Wordmark */}
      <div className="flex flex-col text-left leading-none">
        <div className={`flex items-baseline font-sans font-bold tracking-tight text-white ${sizeConfig.textSize}`}>
          <div className="relative inline-block overflow-hidden min-w-[1.2em] text-right">
            <AnimatePresence mode="wait">
              <motion.span
                key={current.script}
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className={`inline-block text-[#FF5500] ${sizeConfig.prefixSize}`}
              >
                {current.prefix}
              </motion.span>
            </AnimatePresence>
          </div>

          {showSuffix && (
            <span className="tracking-[0.1em] text-white ml-0.5 font-bold">
              NETRAA
            </span>
          )}
        </div>

        {showLangBadge && (
          <div className="mt-1 flex items-center gap-1.5">
            <AnimatePresence mode="wait">
              <motion.span
                key={current.script}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 4 }}
                transition={{ duration: 0.25 }}
                className={`rounded bg-white/5 border border-white/10 text-zinc-400 font-mono ${sizeConfig.badgeSize}`}
              >
                {current.lang} ({current.code})
              </motion.span>
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
