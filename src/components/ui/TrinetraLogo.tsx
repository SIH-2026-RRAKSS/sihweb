import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  theme?: 'light' | 'dark';
}

export const TrinetraLogo: React.FC<TrinetraLogoProps> = ({
  size = 'md',
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

  // Footer Expanded Layout
  if (size === 'footer') {
    return (
      <div
        className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 select-none cursor-pointer group ${className}`}
        onClick={interactive ? () => setLangIdx((prev) => (prev + 1) % REGIONAL_TRI_LANGUAGES.length) : undefined}
        title="Team Trinetra — Click to switch regional script"
      >
        {showIcon && (
          <div className="relative rounded-2xl p-1.5 bg-white border border-slate-200 shadow-sm group-hover:border-orange-500 transition-all flex-shrink-0 w-14 h-14 flex items-center justify-center">
            <img
              src="/trinetra_logo.png"
              alt="Team Trinetra Emblem"
              className="w-10 h-10 max-w-full max-h-full object-contain drop-shadow-sm"
              style={{ width: '40px', height: '40px' }}
            />
          </div>
        )}

        <div className="space-y-1 text-left">
          <div className="flex items-baseline font-sans font-bold tracking-tight text-slate-900 text-xl sm:text-2xl">
            <div className="relative inline-block overflow-hidden min-w-[1.2em] text-right">
              <AnimatePresence mode="wait">
                <motion.span
                  key={current.script}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="inline-block text-[#FF5500]"
                >
                  {current.prefix}
                </motion.span>
              </AnimatePresence>
            </div>
            {showSuffix && (
              <span className="tracking-[0.08em] text-slate-900 ml-1 font-bold">
                NETRAA
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-500 font-sans leading-relaxed max-w-sm">
            National Cybercrime AML & Mule-Chain Predictive Intelligence Platform.
          </p>

          <div className="flex items-center gap-2 pt-0.5">
            <span className="px-2 py-0.5 rounded bg-orange-50 border border-orange-200 text-orange-700 font-sans text-[9px] font-semibold">
              Script: {current.lang} ({current.code})
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Sizing matrix for inline layouts
  const sizeConfig = {
    sm: {
      boxClass: 'w-7 h-7 p-1',
      imgPx: 20,
      imgClass: 'w-5 h-5',
      textSize: 'text-sm sm:text-base',
      prefixSize: 'text-sm sm:text-base font-bold',
      badgeSize: 'text-[9px] px-1.5 py-0.2',
      gap: 'gap-2',
    },
    md: {
      boxClass: 'w-9 h-9 p-1.5',
      imgPx: 24,
      imgClass: 'w-6 h-6',
      textSize: 'text-lg sm:text-xl',
      prefixSize: 'text-lg sm:text-xl font-bold',
      badgeSize: 'text-[10px] px-2 py-0.5',
      gap: 'gap-2.5',
    },
    lg: {
      boxClass: 'w-11 h-11 p-1.5',
      imgPx: 32,
      imgClass: 'w-8 h-8',
      textSize: 'text-2xl sm:text-3xl',
      prefixSize: 'text-2xl sm:text-3xl font-bold',
      badgeSize: 'text-[11px] px-2.5 py-0.5',
      gap: 'gap-3',
    },
    hero: {
      boxClass: 'w-14 h-14 p-2',
      imgPx: 42,
      imgClass: 'w-10 h-10',
      textSize: 'text-3xl sm:text-4xl',
      prefixSize: 'text-3xl sm:text-4xl font-bold',
      badgeSize: 'text-xs px-3 py-1',
      gap: 'gap-3.5',
    },
  }[size as 'sm' | 'md' | 'lg' | 'hero'] || {
    boxClass: 'w-9 h-9 p-1.5',
    imgPx: 24,
    imgClass: 'w-6 h-6',
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
      {/* Fixed-Dimension Emblem Container */}
      {showIcon && (
        <div className="relative flex-shrink-0 flex items-center justify-center">
          <div className={`relative rounded-xl overflow-hidden bg-white border border-slate-200 hover:border-orange-500/50 transition-colors shadow-sm flex items-center justify-center ${sizeConfig.boxClass}`}>
            <img
              src="/trinetra_logo.png"
              alt="Team Trinetra Logo"
              className={`${sizeConfig.imgClass} max-w-full max-h-full object-contain drop-shadow-sm`}
              style={{
                width: `${sizeConfig.imgPx}px`,
                height: `${sizeConfig.imgPx}px`,
                maxWidth: `${sizeConfig.imgPx}px`,
                maxHeight: `${sizeConfig.imgPx}px`,
              }}
            />
          </div>
        </div>
      )}

      {/* Dynamic Wordmark */}
      <div className="flex flex-col text-left leading-none">
        <div className={`flex items-baseline font-sans font-bold tracking-tight text-slate-900 ${sizeConfig.textSize}`}>
          <div className="relative inline-block overflow-hidden min-w-[1.2em] text-right">
            <AnimatePresence mode="wait">
              <motion.span
                key={current.script}
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className={`inline-block text-[#FF5500] ${sizeConfig.prefixSize}`}
              >
                {current.prefix}
              </motion.span>
            </AnimatePresence>
          </div>

          {showSuffix && (
            <span className="tracking-[0.08em] text-slate-900 ml-0.5 font-bold">
              NETRAA
            </span>
          )}
        </div>

        {showLangBadge && (
          <div className="mt-1 flex items-center gap-1.5">
            <AnimatePresence mode="wait">
              <motion.span
                key={current.script}
                initial={{ opacity: 0, x: -3 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 3 }}
                transition={{ duration: 0.2 }}
                className={`rounded bg-orange-50 border border-orange-200 text-orange-700 font-sans font-semibold ${sizeConfig.badgeSize}`}
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
