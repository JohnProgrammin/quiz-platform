import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', flag: 'EN' },
  { code: 'yo', name: 'Pidgin', flag: '🇳🇬' },
];

function LanguageSwitcher({ inSidebar = false }) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('language', code);
    document.documentElement.lang = code;
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
    setIsOpen(false);
  };

  const current = languages.find(l => l.code === i18n.language) || languages[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 transition-all rounded-xl font-bold text-sm ${inSidebar
          ? 'text-white/70 hover:text-white hover:bg-white/10 px-3 py-2 w-full'
          : 'text-slate hover:text-ink hover:bg-surface border border-border px-3 py-2'
          }`}
        title="Change language"
      >
        <Globe className="w-4 h-4 flex-shrink-0" />
        {inSidebar && <span className="truncate">{current.flag} {current.name}</span>}
        {!inSidebar && <span className={`font-black text-xs ${current.flag === 'EN' ? 'text-slate' : ''}`}>{current.flag}</span>}
      </button>

      {isOpen && (
        <div className={`absolute z-[200] bg-white border-2 border-border rounded-2xl p-1.5 min-w-[170px] shadow-xl ${inSidebar ? 'left-full ml-2 bottom-0' : 'bottom-full mb-2 right-0'
          }`}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`flex items-center gap-2.5 px-3 py-2 w-full text-left text-sm rounded-xl font-bold transition-all ${i18n.language === lang.code
                ? 'bg-brand-50 text-brand-600 border border-brand-200'
                : 'text-ink hover:bg-surface'
                }`}
            >
              <span className="text-base">{lang.flag}</span>
              <span>{lang.name}</span>
              {i18n.language === lang.code && (
                <span className="ml-auto w-2 h-2 rounded-full bg-brand-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;
