import React, { useEffect, useState } from 'react';
import { CheckCircle2, Globe, Mic, Settings as SettingsIcon, User } from 'lucide-react';
import { User as UserType } from '../types';
import { Language } from '../lib/translations';
import { cn } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';

interface SettingsProps {
  user: UserType;
  onUpdateUser: (updates: Partial<UserType>) => void;
}

export default function Settings({ user, onUpdateUser }: SettingsProps) {
  const { language, setLanguage } = useLanguage();
  const [voiceEnabled, setVoiceEnabled] = useState(Boolean(user.voiceEnabled));
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    setVoiceEnabled(Boolean(user.voiceEnabled));
  }, [user.voiceEnabled]);

  const showSaved = (message: string) => {
    setSavedMessage(message);
    window.setTimeout(() => setSavedMessage(''), 1500);
  };

  const handleLanguageChange = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    showSaved('Language updated in real time');
  };

  const handleVoiceToggle = () => {
    const nextValue = !voiceEnabled;
    setVoiceEnabled(nextValue);
    onUpdateUser({ voiceEnabled: nextValue });
    showSaved('Voice preference saved');
  };

  const languageOptions: Array<{ code: Language; name: string; nativeName: string }> = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10 flex flex-col gap-3">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
        <p className="text-slate-500">Manage your account preferences and application settings in real time.</p>
        {savedMessage && (
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-semibold w-fit">
            <CheckCircle2 className="w-4 h-4" />
            {savedMessage}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-500">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Profile</h3>
              <p className="text-sm text-slate-500">Your account identity information.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-slate-400 mb-1">Name</p>
              <p className="font-semibold text-slate-900">{user.name}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-slate-400 mb-1">Email</p>
              <p className="font-semibold text-slate-900 break-all">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-500">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Language</h3>
              <p className="text-sm text-slate-500">Change app language instantly.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {languageOptions.map((option) => (
              <button
                key={option.code}
                onClick={() => handleLanguageChange(option.code)}
                className={cn(
                  'px-4 py-3 rounded-2xl border text-left transition-all',
                  language === option.code
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-100 bg-white text-slate-700 hover:border-indigo-200'
                )}
              >
                <p className="font-semibold">{option.name}</p>
                <p className="text-xs opacity-80">{option.nativeName}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-500">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Voice Interaction</h3>
              <p className="text-sm text-slate-500">Enable or disable voice features in real time.</p>
            </div>
          </div>
          <button
            onClick={handleVoiceToggle}
            className={cn(
              'w-full rounded-2xl px-4 py-3 font-semibold transition-all border',
              voiceEnabled
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            )}
          >
            {voiceEnabled ? 'Voice Enabled' : 'Voice Disabled'}
          </button>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-500">
              <SettingsIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Sync Status</h3>
              <p className="text-sm text-slate-500">Preference changes are saved and reflected live across pages.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
