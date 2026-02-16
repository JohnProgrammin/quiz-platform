import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'yo', name: 'Pidgin', flag: '🇳🇬' },
];

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('language', code);
    document.documentElement.lang = code;
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
    setIsOpen(false);
  };

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title="Change language"
      >
        <Globe className="w-5 h-5 text-gray-700" />
      </button>
      {isOpen && (
        <div className="fixed md:absolute top-1/2 left-1/2 md:left-auto md:top-full md:mt-1 -translate-x-1/2 md:translate-x-0 md:right-0 bg-white border border-gray-200 rounded-lg p-2 min-w-[180px] md:min-w-[160px] z-50 shadow-lg md:shadow-none" style={{ right: '0' }}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`flex items-center gap-2 px-3 py-2 w-full text-left text-sm rounded hover:bg-brand-50 transition-colors ${
                i18n.language === lang.code ? 'bg-brand-100 font-semibold text-brand-700' : ''
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;
