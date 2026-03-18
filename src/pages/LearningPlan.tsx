import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  BookOpen, 
  Target, 
  Award, 
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Clock,
  Video,
  Headphones,
  FileText,
  Calendar,
  BarChart3,
  ExternalLink,
  PlayCircle,
  Loader2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { cn } from '../lib/utils';
import {
  GEMINI_API_KEY_MISSING_MESSAGE,
  getGeminiClient,
  isGeminiConfigurationError,
} from '../lib/gemini';
import { PlannerAgent, PlanDuration, PlanTopic } from '../lib/aiAgents';

interface LearningPlanProps {
  user: User;
}

type Duration = 30 | 60 | 90;

export default function LearningPlan({ user }: LearningPlanProps) {
  const [duration, setDuration] = useState<Duration>(30);
  const [selectedDay, setSelectedDay] = useState(1);
  const [plan, setPlan] = useState<PlanTopic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const result = user.assessmentResult;

  useEffect(() => {
    if (!result) {
      navigate('/skill-assessment');
    }
  }, [result, navigate]);

  const generatePlan = useCallback(async (newDuration: Duration, retryCount = 0) => {
    setIsLoading(true);
    setError(null);
    const domainName = user.domain || 'technology';
    try {
      const ai = getGeminiClient();
      const prompt = PlannerAgent.buildPrompt({ user, duration: newDuration as PlanDuration });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const generatedPlan = PlannerAgent.parsePlan(
        response.text || '[]',
        newDuration as PlanDuration,
        domainName
      );
      if (generatedPlan.length === 0) {
        throw new Error('Plan generation returned no valid items');
      }
      setPlan(generatedPlan);
      setSelectedDay(1);
    } catch (err: any) {
      console.error("Error generating plan:", err);
      if (isGeminiConfigurationError(err)) {
        setError(GEMINI_API_KEY_MISSING_MESSAGE);
      } else if (retryCount < 2) {
        console.log(`Retrying... Attempt ${retryCount + 1}`);
        setTimeout(() => generatePlan(newDuration, retryCount + 1), 1000 * (retryCount + 1));
      } else {
        setPlan(PlannerAgent.fallbackPlan(newDuration as PlanDuration, domainName));
        setSelectedDay(1);
        setError('AI service is temporarily busy. Showing a starter learning plan you can use now.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [result, user.domain, user.role, user.techStack]);

  useEffect(() => {
    if (result && plan.length === 0) {
      generatePlan(duration);
    }
  }, [result, duration, generatePlan]);

  const currentTopic = plan.find(t => t.day === selectedDay) || plan[0];

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">No Assessment Found</h2>
          <button 
            onClick={() => navigate('/skill-assessment')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold"
          >
            Go to Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-slate-900 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-4"
            >
              <Sparkles className="w-3 h-3" />
              AI-Generated Roadmap
            </motion.div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              Your <span className="text-indigo-600">{duration}-Day</span> Learning Journey
            </h1>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
              {/* Top Section: Score & Level */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                {/* Score Card */}
                <div className="bg-gradient-to-br from-indigo-50 to-slate-50 p-8 border-r border-slate-100 md:border-r">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Your Score</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black text-indigo-600">{result.score}</span>
                        <span className="text-xl font-bold text-slate-400">/ {result.totalPoints}</span>
                      </div>
                      <p className="text-sm text-slate-600 mt-2">You're on track!</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center">
                      <span className="text-2xl">🎯</span>
                    </div>
                  </div>
                </div>

                {/* Level Card */}
                <div className={cn(
                  "p-8",
                  result.evaluatedLevel === 'advanced' 
                    ? "bg-gradient-to-br from-emerald-50 to-slate-50"
                    : result.evaluatedLevel === 'intermediate'
                    ? "bg-gradient-to-br from-amber-50 to-slate-50"
                    : "bg-gradient-to-br from-blue-50 to-slate-50"
                )}>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Your Level</span>
                      <span className={cn(
                        "text-4xl font-black uppercase",
                        result.evaluatedLevel === 'advanced' ? "text-emerald-600" :
                        result.evaluatedLevel === 'intermediate' ? "text-amber-600" :
                        "text-blue-600"
                      )}>
                        {result.evaluatedLevel}
                      </span>
                      <p className="text-sm text-slate-600 mt-2">
                        {result.evaluatedLevel === 'advanced' ? '🚀 Ready for advanced' :
                         result.evaluatedLevel === 'intermediate' ? '📈 Keep building' :
                         '🌱 Building foundations'}
                      </p>
                    </div>
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl",
                      result.evaluatedLevel === 'advanced' ? "bg-emerald-100" :
                      result.evaluatedLevel === 'intermediate' ? "bg-amber-100" :
                      "bg-blue-100"
                    )}>
                      {result.evaluatedLevel === 'advanced' ? '⭐' :
                       result.evaluatedLevel === 'intermediate' ? '📚' :
                       '🎓'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Section: Strengths & Focus Areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-slate-100">
                {/* Strengths */}
                <div className="p-8 bg-gradient-to-br from-emerald-50/50 to-transparent md:border-r border-slate-100">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">✅</span>
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Strengths</span>
                  </div>
                  <div className="space-y-3">
                    {result.strengths && result.strengths.length > 0 ? (
                      result.strengths.map((s, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                          <p className="text-sm font-medium text-slate-700 leading-snug">{s}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 italic">Strengths being analyzed...</p>
                    )}
                  </div>
                </div>

                {/* Focus Areas */}
                <div className="p-8 bg-gradient-to-br from-rose-50/50 to-transparent">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">🎯</span>
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Focus Areas</span>
                  </div>
                  <div className="space-y-3">
                    {result.weaknesses && result.weaknesses.length > 0 ? (
                      result.weaknesses.map((w, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 flex-shrink-0" />
                          <p className="text-sm font-medium text-slate-700 leading-snug">{w}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 italic">Focus areas being identified...</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm self-end">
              {[30, 60, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    const newDuration = d as Duration;
                    setDuration(newDuration);
                    setSelectedDay(1);
                    generatePlan(newDuration);
                  }}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                    duration === d 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {d} Days
                </button>
              ))}
            </div>
            <button 
              onClick={() => generatePlan(duration)}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              Regenerate Plan
            </button>
          </div>
        </div>
      </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <h3 className="text-xl font-bold text-slate-900">Crafting your personalized path...</h3>
            <p className="text-slate-500">Our AI is analyzing your assessment to build the perfect roadmap.</p>
          </div>
        ) : error && plan.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-6">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Generation Failed</h3>
            <p className="text-slate-500 mb-8 max-w-md">{error}</p>
            <button
              onClick={() => generatePlan(duration)}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
            >
              Try Again
            </button>
          </div>
        ) : plan.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {error && (
              <div className="lg:col-span-12 rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 text-sm font-medium">
                {error}
              </div>
            )}
            {/* Timeline Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    Timeline
                  </h3>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                    {Math.round((selectedDay / duration) * 100)}% Progress
                  </span>
                </div>
                <div className="max-h-[500px] overflow-y-auto p-4 space-y-2 custom-scrollbar">
                  {plan.map((day) => (
                    <button
                      key={day.day}
                      onClick={() => setSelectedDay(day.day)}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left group",
                        selectedDay === day.day 
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                          : "hover:bg-slate-50 text-slate-600"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0",
                        selectedDay === day.day ? "bg-white/20" : "bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                      )}>
                        {day.day}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("font-bold text-sm truncate", selectedDay === day.day ? "text-white" : "text-slate-900")}>
                          {day.title}
                        </p>
                        <p className={cn("text-xs truncate", selectedDay === day.day ? "text-indigo-100" : "text-slate-400")}>
                          {day.difficulty.toUpperCase()} • {day.resources.length} Resources
                        </p>
                      </div>
                      {selectedDay === day.day && <ChevronRight className="w-4 h-4 text-white/50" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-8 space-y-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedDay}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-[40px] p-8 lg:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-2xl">
                        {selectedDay}
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-slate-900 leading-tight">{currentTopic.title}</h2>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            currentTopic.difficulty === 'easy' ? "bg-emerald-100 text-emerald-700" :
                            currentTopic.difficulty === 'medium' ? "bg-amber-100 text-amber-700" :
                            "bg-rose-100 text-rose-700"
                          )}>
                            {currentTopic.difficulty} Level
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Estimated 2.5 hours
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="prose prose-slate max-w-none mb-12">
                    <p className="text-lg text-slate-600 leading-relaxed">
                      {currentTopic.description}
                    </p>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                      Learning Resources
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentTopic.resources.map((resource, i) => (
                        <a
                          key={i}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-4 p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-600 hover:bg-white hover:shadow-xl hover:shadow-indigo-100/50 transition-all"
                        >
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                            resource.type === 'video' ? "bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white" :
                            resource.type === 'audio' ? "bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white" :
                            "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                          )}>
                            {resource.type === 'video' ? <Video className="w-6 h-6" /> :
                             resource.type === 'audio' ? <Headphones className="w-6 h-6" /> :
                             <FileText className="w-6 h-6" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                              {resource.title}
                            </p>
                            <p className="text-xs text-slate-400 font-medium">
                              {resource.type.toUpperCase()} {resource.duration && `• ${resource.duration}`}
                            </p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
                        </a>
                      ))}
                    </div>
                  </div>

                    {/* Final Exam CTA */}
                    <div className="bg-indigo-50 rounded-3xl p-8 border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-6 mb-8 mt-12">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                          <Award className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">Ready for the final step?</h4>
                          <p className="text-sm text-slate-500">Take the certification exam once you've completed all days.</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => navigate('/final-test')}
                        className="px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-xl font-bold hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2"
                      >
                        Take Final Exam
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                  <div className="mt-12 pt-8 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        <span className="text-indigo-600 font-bold">1.2k+</span> others are learning this today
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => navigate('/learning/1')}
                      className="w-full sm:w-auto px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl flex items-center justify-center gap-3 group"
                    >
                      Confirm & Start Plan
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-500">Failed to generate plan. Please try again.</p>
            <button 
              onClick={() => generatePlan(duration)}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    );
  }
