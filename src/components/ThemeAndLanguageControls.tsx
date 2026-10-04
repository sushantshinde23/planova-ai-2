import React, { useState, useRef, useEffect } from 'react';
import { useMission } from '../store/missionContext';
import { Sun, Moon, Globe, ChevronDown, Check } from 'lucide-react';
import { Language } from '../i18n/translations';

export const ThemeToggle: React.FC<{ showLabel?: boolean }> = ({ showLabel = false }) => {
  const { theme, setTheme, t } = useMission();

  const handleToggle = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  const isDark = theme === 'dark';

  return (
    <button
      onClick={handleToggle}
      type="button"
      className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 cursor-pointer shadow-2xs select-none ${
        isDark
          ? 'bg-[#0f172a] hover:bg-slate-800 border-slate-700 text-slate-200'
          : 'bg-white hover:bg-slate-50 border-[#e2e8f0] text-[#0f172a]'
      }`}
      title={isDark ? t.common.lightMode : t.common.darkMode}
      aria-label="Toggle visual theme"
    >
      <div className="relative flex items-center justify-center w-4 h-4">
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-blue-400" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        )}
      </div>
      {showLabel ? (
        <span className="font-mono text-[11px] font-semibold">
          {isDark ? t.common.darkMode : t.common.lightMode}
        </span>
      ) : (
        <span className="font-mono text-[10px] uppercase font-bold tracking-wider hidden sm:inline text-[#64748b] dark:text-slate-400">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
};

export const LanguageSelector: React.FC<{ variant?: 'dropdown' | 'segmented' }> = ({
  variant = 'dropdown',
}) => {
  const { language, setLanguage } = useMission();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const languages: { code: Language; label: string; nativeName: string; flag: string }[] = [
    { code: 'en', label: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'hi', label: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
    { code: 'mr', label: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  ];

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'segmented') {
    return (
      <div className="inline-flex items-center p-0.5 rounded-lg border bg-[#f8fafc] dark:bg-[#0f172a] border-[#e2e8f0] dark:border-slate-800 text-xs font-mono shadow-2xs">
        {languages.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => setLanguage(lang.code)}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              language === lang.code
                ? 'bg-white dark:bg-slate-800 text-[#2563eb] dark:text-blue-400 shadow-2xs font-bold'
                : 'text-[#64748b] dark:text-slate-400 hover:text-[#0f172a] dark:hover:text-white'
            }`}
          >
            <span className="mr-1">{lang.flag}</span>
            <span>{lang.nativeName}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all duration-150 cursor-pointer shadow-2xs
          bg-white dark:bg-[#0f172a] 
          hover:bg-slate-50 dark:hover:bg-slate-800 
          border-[#e2e8f0] dark:border-slate-700 
          text-[#0f172a] dark:text-slate-200"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-[#2563eb] dark:text-blue-400" />
        <span className="font-bold flex items-center gap-1">
          <span>{currentLang.flag}</span>
          <span>{currentLang.nativeName}</span>
        </span>
        <ChevronDown className={`w-3 h-3 text-[#64748b] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-slate-800 rounded-xl shadow-xl py-1.5 text-xs z-layer-popover animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#64748b] font-semibold border-b border-[#e2e8f0] dark:border-slate-800 mb-1">
            Language / भाषा / भाषा
          </div>
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer ${
                language === lang.code
                  ? 'font-bold text-[#2563eb] dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/40'
                  : 'text-[#0f172a] dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{lang.flag}</span>
                <div className="flex flex-col">
                  <span className="font-medium text-xs">{lang.nativeName}</span>
                  <span className="text-[10px] text-[#64748b] font-mono">({lang.label})</span>
                </div>
              </div>
              {language === lang.code && <Check className="w-4 h-4 text-[#2563eb] dark:text-blue-400 stroke-[2.5]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
