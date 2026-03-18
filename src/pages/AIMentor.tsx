import React, { useMemo, useState } from 'react';
import { Bot, ImagePlus, Send, Sparkles, User as UserIcon, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { User } from '../types';
import { cn } from '../lib/utils';
import {
  getGeminiFriendlyErrorMessage,
  getGeminiClient,
} from '../lib/gemini';

interface AIMentorProps {
  user: User;
}

interface Message {
  role: 'user' | 'model';
  text: string;
  imagePreview?: string;
}

const MAX_IMAGE_SIZE_MB = 8;

function toBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Failed to read image file'));
        return;
      }
      const base64 = result.split(',')[1];
      if (!base64) {
        reject(new Error('Invalid image format'));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Could not read image'));
    reader.readAsDataURL(file);
  });
}

export default function AIMentor({ user }: AIMentorProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [mentorMemory, setMentorMemory] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const preferredLanguage = useMemo(() => {
    if (user.language === 'ta') return 'Tamil';
    if (user.language === 'hi') return 'Hindi';
    return 'English';
  }, [user.language]);

  const historyStorageKey = useMemo(
    () => `smartonboard_ai_mentor_history_${user.id || user.email}`,
    [user.id, user.email]
  );

  const memoryStorageKey = useMemo(
    () => `smartonboard_ai_mentor_memory_${user.id || user.email}`,
    [user.id, user.email]
  );

  React.useEffect(() => {
    const raw = localStorage.getItem(historyStorageKey);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as Message[];
      if (Array.isArray(parsed)) {
        setMessages(
          parsed
            .filter((msg) => msg && (msg.role === 'user' || msg.role === 'model') && typeof msg.text === 'string')
            .map((msg) => ({ role: msg.role, text: msg.text }))
        );
      }
    } catch {
      // Ignore invalid stored history.
    }
  }, [historyStorageKey]);

  React.useEffect(() => {
    const raw = localStorage.getItem(memoryStorageKey);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed)) {
        setMentorMemory(parsed.filter((d) => typeof d === 'string').slice(-5));
      }
    } catch {
      // Ignore invalid memory payload.
    }
  }, [memoryStorageKey]);

  React.useEffect(() => {
    if (!messages.length) return;

    const persistable = messages.map((msg) => ({ role: msg.role, text: msg.text }));
    localStorage.setItem(historyStorageKey, JSON.stringify(persistable));
  }, [messages, historyStorageKey]);

  React.useEffect(() => {
    const lastDoubts = messages
      .filter((msg) => msg.role === 'user')
      .map((msg) => msg.text.trim())
      .filter(Boolean)
      .slice(-5);

    if (!lastDoubts.length) return;
    setMentorMemory(lastDoubts);
  }, [messages]);

  React.useEffect(() => {
    if (!mentorMemory.length) return;
    localStorage.setItem(memoryStorageKey, JSON.stringify(mentorMemory.slice(-5)));
  }, [mentorMemory, memoryStorageKey]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_IMAGE_SIZE_MB}MB.`);
      return;
    }

    const preview = URL.createObjectURL(file);
    setSelectedImage(file);
    setSelectedPreview(preview);
  };

  const clearImage = () => {
    if (selectedPreview) {
      URL.revokeObjectURL(selectedPreview);
    }
    setSelectedImage(null);
    setSelectedPreview(null);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text && !selectedImage) return;

    const userMessage: Message = {
      role: 'user',
      text: text || 'Please explain this image.',
      imagePreview: selectedPreview || undefined,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setError(null);
    setIsTyping(true);

    try {
      const ai = getGeminiClient();
      const recentTurns = messages.slice(-6);
      const recentConversation = recentTurns.length
        ? recentTurns
            .map((msg) => `${msg.role === 'user' ? 'Learner' : 'Mentor'}: ${msg.text}`)
            .join('\n')
        : 'No previous turns yet.';
      const recentDoubts = mentorMemory.length
        ? mentorMemory.slice(-5).map((doubt, idx) => `${idx + 1}. ${doubt}`).join('\n')
        : 'No stored doubts yet.';

      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [
        {
          text: `You are an AI Mentor.

User profile:
- Level: ${user.assessmentResult?.evaluatedLevel || 'beginner'}
- Preferred language: ${preferredLanguage}

Mentor memory (last 3-5 learner doubts):
${recentDoubts}

Recent conversation context:
${recentConversation}

User request:
${text || 'Please explain the uploaded image clearly.'}

Strict output format (must follow):
Use this markdown template exactly:

## 📘 Topic Name
<name>

## 💡 Simple Definition
<2-3 short lines>

## 🏗️ Developed By
<if not applicable, write: Not applicable>

## ⚙️ Key Concepts
1. <concept> - <one-line meaning>
2. <concept> - <one-line meaning>
3. <concept> - <one-line meaning>

## ✅ Why Use It?
- <point>
- <point>
- <point>

## 🌍 Real-world Example
<short practical analogy/example>

## 🧪 Basic Example
<use a code block only if needed>

## 🧠 In One Line
<single sentence summary>

Rules:
- Reply only in ${preferredLanguage}.
- Keep explanation clean, clear, and easy.
- Avoid filler text and unnecessary long paragraphs.
- If image is provided, use it as context in the explanation.
- Continue contextually from recent doubts/conversation if relevant.
- Bold important terms and key words using markdown (**term**).
- Use emojis in section headings as shown above.
- Keep emoji usage balanced and professional.`,
        },
      ];

      if (selectedImage) {
        const imageData = await toBase64(selectedImage);
        parts.push({
          inlineData: {
            mimeType: selectedImage.type,
            data: imageData,
          },
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts }],
      });

      setMessages((prev) => [
        ...prev,
        { role: 'model', text: response.text || "I couldn't generate a response right now." },
      ]);
      clearImage();
    } catch (e) {
      const message = getGeminiFriendlyErrorMessage(e);
      setMessages((prev) => [...prev, { role: 'model', text: message }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-140px)]">
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm h-full flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">AI Mentor</h1>
              <p className="text-xs text-slate-500">Text + image support, personalized by your level and language</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700">
              Memory: {mentorMemory.length}/5
            </span>
            <button
              onClick={() => {
                setMessages([]);
                setMentorMemory([]);
                localStorage.removeItem(historyStorageKey);
                localStorage.removeItem(memoryStorageKey);
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-white/70 transition-colors"
            >
              Clear chat
            </button>
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              Ask any doubt, request examples, or upload an image for explanation.
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn('flex gap-3 max-w-[85%]', msg.role === 'user' ? 'ml-auto flex-row-reverse' : '')}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                  msg.role === 'user' ? 'bg-slate-200 text-slate-700' : 'bg-indigo-100 text-indigo-700'
                )}
              >
                {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={cn(
                  'p-4 rounded-2xl text-sm leading-relaxed',
                  msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-700'
                )}
              >
                {msg.imagePreview && (
                  <img
                    src={msg.imagePreview}
                    alt="Uploaded context"
                    className="mb-3 rounded-xl max-h-52 w-auto border border-white/20"
                  />
                )}
                {msg.role === 'model' ? (
                  <div className="prose prose-sm max-w-none prose-headings:my-2 prose-p:my-1 prose-ul:my-1 prose-ol:my-1">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                ) : (
                  <span className="whitespace-pre-wrap">{msg.text}</span>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="text-sm text-slate-400">AI Mentor is thinking...</div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 space-y-3">
          {selectedPreview && (
            <div className="relative inline-block">
              <img src={selectedPreview} alt="Selected" className="h-20 rounded-xl border border-slate-200" />
              <button
                onClick={clearImage}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center"
                aria-label="Remove selected image"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <div className="flex items-center gap-3">
            <label className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center cursor-pointer shrink-0">
              <ImagePlus className="w-5 h-5 text-slate-600" />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a doubt, request an example, or upload an image..."
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />

            <button
              onClick={handleSend}
              disabled={isTyping || (!input.trim() && !selectedImage)}
              className="w-12 h-12 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}