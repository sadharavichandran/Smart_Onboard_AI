import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Send, 
  Bot, 
  User as UserIcon, 
  BookOpen,
  CheckCircle2, 
  Sparkles, 
  Trophy,
  Lightbulb, 
  Code, 
  AlertCircle,
  ChevronRight,
  MessageSquare,
  Zap,
  Gauge,
  BrainCircuit,
  RefreshCcw,
  Clock,
  PlayCircle,
  FileText,
  HelpCircle,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { User } from '../types';
import { cn } from '../lib/utils';
import { TOPICS } from '../data/topics';
import ReactMarkdown from 'react-markdown';
import {
  GEMINI_API_KEY_MISSING_MESSAGE,
  getGeminiFriendlyErrorMessage,
  getGeminiClient,
  isGeminiConfigurationError,
} from '../lib/gemini';
import { EvaluatorAgent, TutorAgent } from '../lib/aiAgents';

interface DailyLearningProps {
  user: User;
  onUpdateUser: (updates: Partial<User>) => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface WrongAnswerDetail {
  id: string;
  question: string;
  selected: string;
  correct: string;
  fallbackExplanation: string;
}

export default function DailyLearning({ user, onUpdateUser }: DailyLearningProps) {
  const { day } = useParams<{ day: string }>();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isAdapting, setIsAdapting] = useState(false);
  const [difficulty, setDifficulty] = useState<'Normal' | 'Simplified' | 'Advanced'>('Normal');
  const [learningSpeed, setLearningSpeed] = useState<'Fast' | 'Steady' | 'Deep Dive'>('Steady');
  const [timeSpent, setTimeSpent] = useState(0);
  const [activeTab, setActiveTab] = useState<'learn' | 'quiz'>('learn');
  const [quizState, setQuizState] = useState<{
    currentQuestionIndex: number;
    answers: Record<string, string>;
    isSubmitted: boolean;
    score: number;
    showExplanation: boolean;
  }>({
    currentQuestionIndex: 0,
    answers: {},
    isSubmitted: false,
    score: 0,
    showExplanation: false
  });
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [mistakeInsights, setMistakeInsights] = useState<Record<string, string>>({});
  const [loadingMistakeId, setLoadingMistakeId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const dayNum = parseInt(day || '1');
  const topic = TOPICS[dayNum] || TOPICS[1];
  const progress = user.progress?.[dayNum];
  const isCompleted = progress?.completed;
  const preferredLanguage = user.language === 'ta'
    ? 'Tamil'
    : user.language === 'hi'
      ? 'Hindi'
      : 'English';
  const quickMentorPrompts = [
    'Explain APIs',
    `Give me one real-world example of ${topic.title}`,
    `Simplify ${topic.title} for me`,
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (customPrompt?: string, retryCount = 0) => {
    const messageText = customPrompt || input;
    if (!messageText.trim()) return;

    if (retryCount === 0) {
      const userMessage: Message = { role: 'user', text: messageText };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
    }
    setIsTyping(true);

    try {
      const ai = getGeminiClient();
      const prompt = TutorAgent.buildExplainPrompt({
        question: messageText,
        topicTitle: topic.title,
        professionalRole: user.professionalRole,
        level: user.assessmentResult?.evaluatedLevel,
        preferredLanguage,
        difficultyMode: difficulty,
      });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        config: {
          systemInstruction: TutorAgent.systemInstruction
        }
      });

      const aiMessage: Message = {
        role: 'model',
        text: response.text || TutorAgent.fallbackExplanation(messageText),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error("AI Error:", error);
      if (isGeminiConfigurationError(error)) {
        setMessages(prev => [...prev, { role: 'model', text: GEMINI_API_KEY_MISSING_MESSAGE }]);
      } else if (retryCount < 2) {
        setTimeout(() => handleSendMessage(messageText, retryCount + 1), 1000 * (retryCount + 1));
      } else {
        setMessages(prev => [...prev, { role: 'model', text: getGeminiFriendlyErrorMessage(error) }]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuizSubmit = async () => {
    const evaluation = EvaluatorAgent.evaluateQuiz({
      quiz: topic.quiz,
      answers: quizState.answers,
      dayNum,
      user,
      passingScore: 70,
      totalDays: 7,
    });

    setQuizState(prev => ({ ...prev, isSubmitted: true, score: evaluation.score }));

    onUpdateUser({ 
      progress: evaluation.updatedProgress,
      weakTopics: [...new Set([...user.weakTopics, ...evaluation.weakTopics])],
      learningSpeed: user.learningSpeed + evaluation.learningSpeedDelta
    });

    if (!evaluation.passed) {
      generateAiReExplanation(evaluation.weakTopics);
    }
  };

  const generateAiReExplanation = async (weakAreas: string[]) => {
    setIsTyping(true);
    try {
      const ai = getGeminiClient();
      const prompt = TutorAgent.buildWeakAreaPrompt({
        topicTitle: topic.title,
        weakAreas,
        preferredLanguage,
      });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        config: {
          systemInstruction: TutorAgent.weakAreaSystemInstruction
        }
      });
      setAiExplanation(response.text || null);
    } catch (error) {
      console.error("AI Re-explanation Error:", error);
      setAiExplanation(
        isGeminiConfigurationError(error)
          ? GEMINI_API_KEY_MISSING_MESSAGE
          : 'We could not generate an AI re-explanation right now. Please try again.'
      );
    } finally {
      setIsTyping(false);
    }
  };

  const generateMistakeInsight = async (item: WrongAnswerDetail) => {
    setLoadingMistakeId(item.id);
    try {
      const ai = getGeminiClient();
      const prompt = `The learner answered this quiz question incorrectly.

Question: ${item.question}
Learner answer: ${item.selected}
Correct answer: ${item.correct}
Learner level: ${user.assessmentResult?.evaluatedLevel || 'beginner'}
Preferred language: ${preferredLanguage}

Return a concise explanation in markdown with exactly:
1) Why this is incorrect
2) Correct concept in simple words
3) One tiny practical example

Reply only in ${preferredLanguage}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const text = response.text?.trim() || item.fallbackExplanation;
      setMistakeInsights((prev) => ({ ...prev, [item.id]: text }));
    } catch {
      setMistakeInsights((prev) => ({ ...prev, [item.id]: item.fallbackExplanation }));
    } finally {
      setLoadingMistakeId(null);
    }
  };

  const handleRetryQuiz = () => {
    setQuizState({
      currentQuestionIndex: 0,
      answers: {},
      isSubmitted: false,
      score: 0,
      showExplanation: false
    });
    setAiExplanation(null);
    setMistakeInsights({});
  };

  const simplifyExplanation = () => {
    setIsAdapting(true);
    setTimeout(() => {
      setDifficulty('Simplified');
      setIsAdapting(false);
      handleSendMessage("Can you explain this again but much simpler, using an analogy?");
    }, 1500);
  };

  const wrongAnswerDetails: WrongAnswerDetail[] = topic.quiz
    .filter((q) => quizState.answers[q.id] !== q.correctAnswer)
    .map((q) => ({
      id: q.id,
      question: q.question,
      selected: quizState.answers[q.id] || 'Not answered',
      correct: q.correctAnswer,
      fallbackExplanation: `1) Why incorrect: The selected answer does not match the concept tested in this question.\n\n2) Correct concept: ${q.explanation}\n\n3) Tiny example: If a question asks for a React state update, use the state setter like \`setCount(count + 1)\` instead of mutating variables directly.`,
    }));

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-slate-900 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Day {dayNum}</p>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{topic.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('learn')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                activeTab === 'learn' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <BookOpen className="w-4 h-4" />
              Learn
            </button>
            <button 
              onClick={() => setActiveTab('quiz')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                activeTab === 'quiz' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <HelpCircle className="w-4 h-4" />
              Quiz
            </button>
          </div>
          
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm",
            isCompleted ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
          )}>
            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            {isCompleted ? "Completed" : "In Progress"}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-7 space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === 'learn' ? (
              <motion.div
                key="learn"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                {/* Adaptive Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Gauge className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Difficulty</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{difficulty}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Zap className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Speed</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{learningSpeed}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Time</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{Math.floor(timeSpent / 60)}m {timeSpent % 60}s</p>
                  </div>
                </div>

                {/* Content Card */}
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                        <Lightbulb className="w-5 h-5" />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900">The Concept</h2>
                    </div>
                    <button 
                      onClick={simplifyExplanation}
                      className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <RefreshCcw className="w-3 h-3" />
                      Simplify
                    </button>
                  </div>
                  
                  <div className="prose prose-slate max-w-none mb-8">
                    <ReactMarkdown>{topic.content}</ReactMarkdown>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Code className="w-4 h-4 text-indigo-600" />
                      Key Examples
                    </h3>
                    <ul className="space-y-3">
                      {topic.examples.map((example, i) => (
                        <li key={i} className="flex items-center gap-3 text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button 
                      onClick={() => setActiveTab('quiz')}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                    >
                      Take Quiz to Unlock Next Day
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Resources */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {topic.resources.map((res, i) => (
                    <a 
                      key={i}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all flex items-center gap-4 group"
                    >
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        {res.type === 'video' ? <PlayCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{res.title}</h4>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">{res.type} • {res.duration || 'Read'}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {!quizState.isSubmitted ? (
                  <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-bold text-slate-900">Day {dayNum} Quiz</h2>
                      <div className="text-sm font-bold text-slate-400">
                        Question {quizState.currentQuestionIndex + 1} of {topic.quiz.length}
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-6">
                          {topic.quiz[quizState.currentQuestionIndex].question}
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                          {topic.quiz[quizState.currentQuestionIndex].options.map((option, i) => (
                            <button
                              key={i}
                              onClick={() => setQuizState(prev => ({
                                ...prev,
                                answers: { ...prev.answers, [topic.quiz[quizState.currentQuestionIndex].id]: option }
                              }))}
                              className={cn(
                                "p-4 rounded-2xl border-2 text-left transition-all font-medium",
                                quizState.answers[topic.quiz[quizState.currentQuestionIndex].id] === option
                                  ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                                  : "border-slate-100 hover:border-slate-200 text-slate-600"
                              )}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-8 border-t border-slate-50">
                        <button
                          disabled={quizState.currentQuestionIndex === 0}
                          onClick={() => setQuizState(prev => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex - 1 }))}
                          className="px-6 py-2 text-slate-500 font-bold hover:text-slate-900 disabled:opacity-30"
                        >
                          Previous
                        </button>
                        
                        {quizState.currentQuestionIndex === topic.quiz.length - 1 ? (
                          <button
                            disabled={Object.keys(quizState.answers).length < topic.quiz.length}
                            onClick={handleQuizSubmit}
                            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                          >
                            Submit Quiz
                          </button>
                        ) : (
                          <button
                            disabled={!quizState.answers[topic.quiz[quizState.currentQuestionIndex].id]}
                            onClick={() => setQuizState(prev => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 }))}
                            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                          >
                            Next Question
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className={cn(
                      "rounded-[32px] p-12 text-center shadow-xl",
                      quizState.score >= 70 ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                    )}>
                      <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        {quizState.score >= 70 ? <Trophy className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
                      </div>
                      <h2 className="text-4xl font-bold mb-2">
                        {quizState.score >= 70 ? "Congratulations!" : "Keep Pushing!"}
                      </h2>
                      <p className="text-white/80 text-lg mb-8">
                        You scored <span className="font-bold text-white">{quizState.score}%</span>
                      </p>
                      
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        {quizState.score >= 70 ? (
                          <>
                            <button 
                              onClick={() => navigate('/dashboard')}
                              className="px-8 py-3 bg-white text-emerald-600 rounded-xl font-bold hover:bg-emerald-50 transition-all"
                            >
                              Go to Dashboard
                            </button>
                            {dayNum < 7 && (
                              <button 
                                onClick={() => navigate(`/learning/${dayNum + 1}`)}
                                className="px-8 py-3 bg-emerald-500 text-white border border-white/20 rounded-xl font-bold hover:bg-emerald-400 transition-all"
                              >
                                Start Day {dayNum + 1}
                              </button>
                            )}
                          </>
                        ) : (
                          <button 
                            onClick={handleRetryQuiz}
                            className="px-8 py-3 bg-white text-rose-600 rounded-xl font-bold hover:bg-rose-50 transition-all flex items-center gap-2"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Retry Quiz
                          </button>
                        )}
                      </div>
                    </div>

                    {/* AI Re-explanation on failure */}
                    {quizState.score < 70 && aiExplanation && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[32px] p-8 border-2 border-indigo-100 shadow-xl shadow-indigo-50"
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                            <Bot className="w-6 h-6" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-900">AI Mentor: Let's Improve Your Understanding</h3>
                        </div>
                        <div className="prose prose-slate max-w-none text-slate-600">
                          <ReactMarkdown>{aiExplanation}</ReactMarkdown>
                        </div>
                        <div className="mt-8 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                          <p className="text-sm text-indigo-700 font-medium">
                            💡 Tip: Review the concepts above and try the quiz again. You've got this!
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {quizState.score < 70 && wrongAnswerDetails.length > 0 && (
                      <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-5">
                        <h3 className="text-xl font-bold text-slate-900">AI Explain My Mistakes (Per Question)</h3>
                        {wrongAnswerDetails.map((item) => (
                          <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                            <p className="text-sm font-semibold text-slate-900 mb-2">{item.question}</p>
                            <p className="text-xs text-rose-600 mb-1"><span className="font-bold">Your answer:</span> {item.selected}</p>
                            <p className="text-xs text-emerald-700 mb-3"><span className="font-bold">Correct answer:</span> {item.correct}</p>

                            <div className="prose prose-sm max-w-none text-slate-700 mb-3">
                              <ReactMarkdown>{mistakeInsights[item.id] || item.fallbackExplanation}</ReactMarkdown>
                            </div>

                            <button
                              onClick={() => generateMistakeInsight(item)}
                              disabled={loadingMistakeId === item.id}
                              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-50"
                            >
                              {loadingMistakeId === item.id ? 'Generating...' : 'AI Explain This Mistake'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AI Mentor Chat */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 flex flex-col h-[calc(100vh-160px)] sticky top-24">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-[32px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">AI Mentor</h3>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Online • Ready to help</p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">
                    Level: {user.assessmentResult?.evaluatedLevel || 'beginner'} • Language: {preferredLanguage}
                  </p>
                </div>
              </div>
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar"
            >
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-400 text-sm">Ask me anything about {topic.title}!</p>
                </div>
              )}
              
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex gap-3 max-w-[85%]",
                    msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    msg.role === 'user' ? "bg-slate-200 text-slate-600" : "bg-indigo-100 text-indigo-600"
                  )}>
                    {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user' ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-700"
                  )}>
                    {msg.role === 'model' ? (
                      <div className="prose prose-sm max-w-none prose-headings:my-2 prose-p:my-1 prose-ul:my-1 prose-ol:my-1">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    ) : (
                      <span className="whitespace-pre-wrap">{msg.text}</span>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl flex gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100">
              <div className="flex flex-wrap gap-2 mb-3">
                {quickMentorPrompts.map((prompt, index) => (
                  <button
                    key={`${prompt}-${index}`}
                    onClick={() => handleSendMessage(prompt)}
                    disabled={isTyping}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-indigo-50 hover:text-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask a question..."
                  className="w-full pl-4 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <button 
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
