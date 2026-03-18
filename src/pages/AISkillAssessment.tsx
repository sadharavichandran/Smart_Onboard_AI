import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Brain, 
  CheckCircle2, 
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Code,
  Lightbulb,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { User, AssessmentQuestion, AssessmentResult, ExperienceLevel } from '../types';
import { cn } from '../lib/utils';
import { Type } from '@google/genai';
import {
  GEMINI_API_KEY_MISSING_MESSAGE,
  getGeminiClient,
  isGeminiConfigurationError,
} from '../lib/gemini';

interface AISkillAssessmentProps {
  user: User;
  onUpdateUser: (updates: Partial<User>) => void;
}

export default function AISkillAssessment({ user, onUpdateUser }: AISkillAssessmentProps) {
  const [isStarted, setIsStarted] = useState(false);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDifficulty, setCurrentDifficulty] = useState<ExperienceLevel>(user.experienceLevel || 'beginner');
  const navigate = useNavigate();

  const generateQuestions = async (difficulty: ExperienceLevel, count: number = 20, retryCount = 0) => {
    setIsLoading(true);
    setError(null);
    try {
      const ai = getGeminiClient();
      const prompt = `Generate ${count} multiple-choice questions for an assessment on the domain: "${user.domain}" and tech stack: "${user.techStack?.join(', ')}". 
      The user's self-selected experience level is "${difficulty}". 
      
      Requirements:
      - Questions must be strictly related to ${user.domain}.
      - Difficulty should match "${difficulty}" (Beginner: basic concepts, Intermediate: practical usage, Advanced: real-world scenarios).
      - Each question should have 4 options, a correct answer, and a brief explanation.
      
      Return as a JSON array of objects with fields: id, type (always 'mcq'), question, options (array of 4 strings), correctAnswer, and explanation.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING },
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ['id', 'type', 'question', 'options', 'correctAnswer', 'explanation']
            }
          }
        }
      });

      const newQuestions = JSON.parse(response.text);
      setQuestions(newQuestions);
    } catch (err: any) {
      console.error("Error generating questions:", err);
      if (isGeminiConfigurationError(err)) {
        setError(GEMINI_API_KEY_MISSING_MESSAGE);
      } else if (retryCount < 2) {
        console.log(`Retrying... Attempt ${retryCount + 1}`);
        setTimeout(() => generateQuestions(difficulty, count, retryCount + 1), 1000 * (retryCount + 1));
      } else {
        setError("We encountered a temporary issue generating your assessment. This can happen due to high traffic. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isStarted && questions.length === 0) {
      generateQuestions(currentDifficulty);
    }
  }, [isStarted]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleNext = useCallback(async (selectedAnswer?: string) => {
    if (!currentQuestion) return;

    if (selectedAnswer) {
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: selectedAnswer }));
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  }, [currentQuestion, currentQuestionIndex, questions.length]);

  const calculateResults = async () => {
    let score = 0;
    const totalQuestions = questions.length;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        score += 1;
      }
    });

    const percentage = (score / totalQuestions) * 100;
    let evaluatedLevel: ExperienceLevel = 'beginner';
    if (percentage > 70) evaluatedLevel = 'advanced';
    else if (percentage > 40) evaluatedLevel = 'intermediate';

    // Use AI to identify strengths and weaknesses based on answers
    let strengths: string[] = [];
    let weaknesses: string[] = [];
    
    try {
      const ai = getGeminiClient();
      const analysisPrompt = `Analyze these assessment results for a user in the "${user.domain}" domain.
      Questions and User Answers: ${JSON.stringify(questions.map(q => ({ 
        question: q.question, 
        correct: answers[q.id] === q.correctAnswer 
      })))}
      
      Identify 3 strengths and 3 weaknesses. Return as JSON: { "strengths": ["..."], "weaknesses": ["..."] }`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: analysisPrompt,
        config: { responseMimeType: "application/json" }
      });
      
      const analysis = JSON.parse(response.text);
      strengths = analysis.strengths;
      weaknesses = analysis.weaknesses;
    } catch (e) {
      console.error("Analysis error:", e);
      strengths = isGeminiConfigurationError(e)
        ? ['Assessment completed without AI analysis']
        : ['General knowledge'];
      weaknesses = isGeminiConfigurationError(e)
        ? ['Connect a Gemini API key to unlock strengths and weaknesses analysis']
        : ['Specific advanced topics'];
    }

    return { score, totalQuestions, evaluatedLevel, strengths, weaknesses };
  };

  const handleFinish = async () => {
    setIsLoading(true);
    const { score, totalQuestions, evaluatedLevel, strengths, weaknesses } = await calculateResults();
    const result: AssessmentResult = {
      score,
      totalPoints: totalQuestions,
      evaluatedLevel,
      answers,
      strengths,
      weaknesses
    };

    onUpdateUser({ assessmentResult: result });
    setIsLoading(false);
    navigate('/learning-plan');
  };

  if (isFinished) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans py-16 px-6 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl text-center border border-slate-100"
        >
          {isLoading ? (
            <div className="py-12">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
              <p className="text-slate-600 font-medium tracking-tight">AI is analyzing your performance...</p>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Assessment Complete!</h2>
              <p className="text-slate-500 mb-8">Your skills have been analyzed by our AI.</p>
              
              <button
                onClick={handleFinish}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
              >
                View My Personalized Roadmap
                <ArrowRight className="w-5 h-5" />
              </button>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-slate-900 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
        <AnimatePresence mode="wait">
          {!isStarted ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-6">
                <Brain className="w-3 h-3" />
                AI-Powered Assessment
              </div>
              
              <h1 className="text-5xl font-bold text-slate-900 tracking-tight mb-6">
                Ready to verify your <span className="text-indigo-600">expertise</span>?
              </h1>
              
              <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed">
                Hello {user.name}! Based on your domain in <span className="font-bold text-slate-900">{user.domain}</span>, 
                our AI is generating a custom assessment to validate your strengths.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {[
                  { icon: ShieldCheck, title: "Verified", desc: "Get a skill badge" },
                  { icon: Zap, title: "Adaptive", desc: "Questions adjust to you" }
                ].map((item, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={() => setIsStarted(true)}
                  className="px-12 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 hover:-translate-y-1 flex items-center gap-2"
                >
                  Start Assessment
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => navigate('/role-selection')}
                  className="text-slate-400 hover:text-slate-600 font-medium transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </motion.div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-6">
                <Brain className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Assessment Generation Failed</h3>
              <p className="text-slate-500 mb-8 max-w-md">{error}</p>
              <button
                onClick={() => generateQuestions(currentDifficulty)}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
              >
                Try Again
              </button>
            </div>
          ) : isLoading && questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
              <p className="text-slate-600 font-medium">AI is crafting your assessment...</p>
            </div>
          ) : (
            <motion.div
              key="test"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 lg:p-12 shadow-2xl shadow-indigo-100/50 border border-slate-100"
            >
              {currentQuestion ? (
                <>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="font-bold text-slate-900">
                          {currentDifficulty.toUpperCase()} Level
                        </h2>
                        <p className="text-xs text-slate-500">Domain: {user.domain?.toUpperCase()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-10">
                    <div className="flex justify-between text-sm font-medium text-slate-400 mb-2">
                      <span>Question {currentQuestionIndex + 1}</span>
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />}
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQuestionIndex + 1) / 20) * 100}%` }}
                        className="h-full bg-indigo-600 rounded-full" 
                      />
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                      {currentQuestion.question}
                    </h3>

                    <div className="grid grid-cols-1 gap-4">
                      {currentQuestion.options?.map((option, i) => (
                        <button
                          key={i}
                          onClick={() => handleNext(option)}
                          className="group flex items-center justify-between p-5 rounded-2xl border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50/50 transition-all text-left"
                        >
                          <span className="text-slate-700 font-medium group-hover:text-indigo-900">{option}</span>
                          <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-indigo-600 flex items-center justify-center transition-colors">
                            <div className="w-3 h-3 rounded-full bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-slate-100 flex items-center gap-4">
                    <AlertCircle className="w-5 h-5 text-slate-300" />
                    <p className="text-sm text-slate-400">
                      Select an answer to proceed. Take your time to answer each question carefully.
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                  <p className="text-slate-600 font-medium">Loading next question...</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
