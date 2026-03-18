import React, { useMemo, useState } from 'react';
import { Bot, X, ArrowRight, Sparkles, Send } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { cn } from '../lib/utils';
import { getGeminiClient } from '../lib/gemini';

type GuideLanguage = 'en' | 'ta' | 'hi';

interface GuideItem {
  path: string;
  title: string;
  description: string;
}

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
}

const GUIDE_CONTENT: Record<GuideLanguage, { title: string; subtitle: string; action: string; items: GuideItem[] }> = {
  en: {
    title: 'Tour Guide Bot',
    subtitle: 'I can help you explore this app step by step.',
    action: 'Open section',
    items: [
      { path: '/dashboard', title: 'Dashboard', description: 'See your progress summary and shortcuts.' },
      { path: '/learning-plan', title: 'My Learning', description: 'View your personalized roadmap.' },
      { path: '/skill-assessment', title: 'Skill Assessments', description: 'Evaluate your current level.' },
      { path: '/ai-mentor', title: 'AI Mentor', description: 'Ask doubts, examples, and upload images.' },
      { path: '/tracking', title: 'Tracking', description: 'Check real-time analytics and weak topics.' },
      { path: '/projects', title: 'Projects', description: 'Practice with guided project tasks.' },
      { path: '/settings', title: 'Settings', description: 'Update language and preferences in real time.' },
    ],
  },
  ta: {
    title: 'Tour Guide Bot',
    subtitle: 'Indha app-ai step by step explore panna help panren.',
    action: 'Section open pannu',
    items: [
      { path: '/dashboard', title: 'Dashboard', description: 'Ungal progress summary inga theriyum.' },
      { path: '/learning-plan', title: 'My Learning', description: 'Personalized learning roadmap paarkalam.' },
      { path: '/skill-assessment', title: 'Skill Assessments', description: 'Current skill level evaluate pannalam.' },
      { path: '/ai-mentor', title: 'AI Mentor', description: 'Doubts ketkalam, examples kidaikkum, image upload pannalam.' },
      { path: '/tracking', title: 'Tracking', description: 'Real-time analytics and weak topics paarkalam.' },
      { path: '/projects', title: 'Projects', description: 'Guided project tasks practice pannalam.' },
      { path: '/settings', title: 'Settings', description: 'Language and preferences real-time update pannalam.' },
    ],
  },
  hi: {
    title: 'Tour Guide Bot',
    subtitle: 'Main aapko app ko step by step samjhane me madad karunga.',
    action: 'Section kholo',
    items: [
      { path: '/dashboard', title: 'Dashboard', description: 'Yahan aapka progress summary dikhega.' },
      { path: '/learning-plan', title: 'My Learning', description: 'Personalized learning roadmap dekhiye.' },
      { path: '/skill-assessment', title: 'Skill Assessments', description: 'Apna current level evaluate kijiye.' },
      { path: '/ai-mentor', title: 'AI Mentor', description: 'Doubts poochiye, examples lijiye, image upload kijiye.' },
      { path: '/tracking', title: 'Tracking', description: 'Real-time analytics aur weak topics dekhiye.' },
      { path: '/projects', title: 'Projects', description: 'Guided project tasks ke saath practice kijiye.' },
      { path: '/settings', title: 'Settings', description: 'Language aur preferences real-time badaliye.' },
    ],
  },
};

function getFallbackReply(
  message: string,
  language: GuideLanguage,
  items: GuideItem[],
  activeItem?: GuideItem
) {
  const text = message.toLowerCase();
  const matched = items.find(
    (item) => text.includes(item.title.toLowerCase()) || text.includes(item.path.replace('/', ''))
  );

  if (matched) {
    if (language === 'ta') {
      return `${matched.title}: ${matched.description} இந்த section-ஐ திறக்க மேலுள்ள பட்டனில் click செய்யலாம்.`;
    }
    if (language === 'hi') {
      return `${matched.title}: ${matched.description} Is section ko kholne ke liye upar wale button par click kijiye.`;
    }
    return `${matched.title}: ${matched.description} You can open this section from the quick buttons above.`;
  }

  if (activeItem) {
    if (language === 'ta') {
      return `நீங்கள் இப்போது ${activeItem.title} page-ல் இருக்கிறீர்கள். உங்கள் doubt-ஐ சொல்லுங்கள், நான் step-by-step help பண்ணுகிறேன்.`;
    }
    if (language === 'hi') {
      return `Aap abhi ${activeItem.title} page par hain. Apna doubt batayein, main step-by-step help karunga.`;
    }
    return `You are currently on ${activeItem.title}. Ask your specific doubt and I will guide you step by step.`;
  }

  if (language === 'ta') {
    return 'உங்கள் doubt-ஐ கொஞ்சம் detail-ஆ சொல்லுங்கள். நான் சரியான section-க்கு வழிகாட்டி answer தருகிறேன்.';
  }
  if (language === 'hi') {
    return 'Apna doubt thoda detail me batayein. Main sahi section aur next steps suggest karunga.';
  }
  return 'Share your doubt with a little more detail. I can suggest the right section and next steps.';
}

export default function TourGuideBot() {
  const [open, setOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();

  const content = GUIDE_CONTENT[(language as GuideLanguage) || 'en'];

  const activeItem = useMemo(
    () => content.items.find((item) => item.path === location.pathname),
    [content.items, location.pathname]
  );

  const starterPrompts = useMemo(() => {
    if ((language as GuideLanguage) === 'ta') {
      return ['Dashboard எப்படி பயன்படுத்துவது?', 'Learning Plan explain பண்ணு', 'AI Mentor எதற்கு?'];
    }
    if ((language as GuideLanguage) === 'hi') {
      return ['Dashboard kaise use karein?', 'Learning Plan samjhao', 'AI Mentor kis kaam aata hai?'];
    }
    return ['How do I use Dashboard?', 'Explain Learning Plan', 'What can AI Mentor do?'];
  }, [language]);

  const handleAsk = async (value?: string) => {
    const message = (value || chatInput).trim();
    if (!message || isTyping) return;

    setMessages((prev) => [...prev, { role: 'user', text: message }]);
    setChatInput('');
    setIsTyping(true);

    const lang = (language as GuideLanguage) || 'en';
    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `You are a tour guide assistant for this app.
User language: ${lang}
Current page: ${activeItem?.title || location.pathname}
Available sections: ${content.items.map((item) => `${item.title} (${item.path})`).join(', ')}

Answer clearly in ${lang === 'ta' ? 'Tamil' : lang === 'hi' ? 'Hindi' : 'English'}.
Keep answer under 80 words.
User doubt: ${message}`,
              },
            ],
          },
        ],
      });

      const answer = response.text?.trim() || getFallbackReply(message, lang, content.items, activeItem);
      setMessages((prev) => [...prev, { role: 'bot', text: answer }]);
    } catch {
      const fallback = getFallbackReply(message, lang, content.items, activeItem);
      setMessages((prev) => [...prev, { role: 'bot', text: fallback }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
          <div className="px-5 py-4 bg-indigo-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <div>
                <p className="font-bold text-sm">{content.title}</p>
                <p className="text-[11px] text-indigo-100">{content.subtitle}</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/10">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-3 max-h-[460px] overflow-y-auto">
            {activeItem && (
              <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100">
                <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">Current</p>
                <p className="text-sm font-semibold text-slate-900">{activeItem.title}</p>
                <p className="text-xs text-slate-600 mt-1">{activeItem.description}</p>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick navigation</p>
              {content.items.map((item) => {
              const isActive = item.path === location.pathname;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    'w-full text-left p-3 rounded-2xl border transition-all',
                    isActive
                      ? 'border-indigo-200 bg-indigo-50'
                      : 'border-slate-100 bg-white hover:border-indigo-100 hover:bg-slate-50'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <span className="text-[11px] text-indigo-600 font-semibold inline-flex items-center gap-1">
                      {content.action}
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                </button>
              );
              })}
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ask doubts</p>
              <div className="flex flex-wrap gap-2">
                {starterPrompts.map((prompt, idx) => (
                  <button
                    key={`${prompt}-${idx}`}
                    onClick={() => handleAsk(prompt)}
                    className="px-2.5 py-1.5 text-[11px] rounded-lg bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {messages.map((msg, idx) => (
                  <div
                    key={`${msg.role}-${idx}`}
                    className={cn(
                      'text-xs rounded-xl px-3 py-2',
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white ml-8'
                        : 'bg-slate-100 text-slate-700 mr-8'
                    )}
                  >
                    {msg.text}
                  </div>
                ))}
                {isTyping && <div className="text-xs text-slate-400">Typing...</div>}
              </div>

              <div className="flex items-center gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                  placeholder={(language as GuideLanguage) === 'ta' ? 'உங்கள் doubt type செய்யவும்' : (language as GuideLanguage) === 'hi' ? 'Apna doubt type karein' : 'Type your doubt'}
                  className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <button
                  onClick={() => handleAsk()}
                  disabled={!chatInput.trim() || isTyping}
                  className="w-8 h-8 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center"
                  aria-label="Send message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-colors flex items-center justify-center"
        aria-label="Open tour guide bot"
      >
        <div className="relative">
          <Bot className="w-7 h-7" />
          <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-indigo-100" />
        </div>
      </button>
    </>
  );
}
