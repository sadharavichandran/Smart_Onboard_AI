import React from 'react';
import { Globe, CheckCircle2, Languages } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../lib/translations';
import { cn } from '../lib/utils';

export default function LanguageSelection() {
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; name: string; nativeName: string; flag: string }[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10">
        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
          <Languages className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Select Language</h1>
        <p className="text-slate-500">Choose your preferred language for the entire platform.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={cn(
              "p-6 rounded-3xl border transition-all text-left flex flex-col gap-4 group relative",
              language === lang.code 
                ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200" 
                : "bg-white border-slate-100 text-slate-900 hover:border-indigo-100 hover:shadow-md"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl">{lang.flag}</span>
              {language === lang.code && (
                <CheckCircle2 className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h3 className={cn("font-bold text-lg mb-1", language === lang.code ? "text-white" : "text-slate-900")}>
                {lang.name}
              </h3>
              <p className={cn("text-sm", language === lang.code ? "text-indigo-100" : "text-slate-500")}>
                {lang.nativeName}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
