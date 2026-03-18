import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Timer, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Trophy, 
  Award, 
  Target,
  Clock,
  ChevronRight,
  AlertCircle,
  RotateCcw,
  LayoutDashboard,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { User } from '../types';
import { cn } from '../lib/utils';

interface FinalTestProps {
  user: User;
}

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  explanation: string;
  category: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Which React hook is used to perform side effects in a functional component?",
    options: ["useState", "useEffect", "useContext", "useReducer"],
    correctAnswer: 1,
    difficulty: "Easy",
    explanation: "useEffect is the standard hook for side effects like data fetching, subscriptions, or manually changing the DOM.",
    category: "React Hooks"
  },
  {
    id: 2,
    text: "What is the primary purpose of the 'key' prop in React lists?",
    options: [
      "To style individual elements",
      "To provide a unique identifier for reconciliation",
      "To bind data to the component",
      "To improve accessibility"
    ],
    correctAnswer: 1,
    difficulty: "Medium",
    explanation: "Keys help React identify which items have changed, are added, or are removed, which is crucial for efficient DOM updates.",
    category: "React Fundamentals"
  },
  {
    id: 3,
    text: "In TypeScript, what is the difference between 'unknown' and 'any'?",
    options: [
      "There is no difference",
      "'any' is safer than 'unknown'",
      "'unknown' requires type checking before use, 'any' does not",
      "'unknown' can only be assigned to 'any'"
    ],
    correctAnswer: 2,
    difficulty: "Hard",
    explanation: "'unknown' is the type-safe counterpart of 'any'. Anything is assignable to 'unknown', but 'unknown' isn't assignable to anything but itself and 'any' without a type assertion or a control flow based narrowing.",
    category: "TypeScript"
  },
  {
    id: 4,
    text: "What does 'Concurrent Mode' in React 18 primarily enable?",
    options: [
      "Running multiple apps in one tab",
      "Rendering components in parallel threads",
      "Interruptible rendering for better responsiveness",
      "Automatic code splitting"
    ],
    correctAnswer: 2,
    difficulty: "Hard",
    explanation: "Concurrent rendering allows React to interrupt a long-running render to handle a high-priority event like a user click.",
    category: "Advanced React"
  },
  {
    id: 5,
    text: "Which of the following is NOT a valid way to optimize a React component?",
    options: [
      "React.memo",
      "useMemo",
      "useCallback",
      "Always using inline functions in props"
    ],
    correctAnswer: 3,
    difficulty: "Medium",
    explanation: "Always using inline functions in props can cause unnecessary re-renders because a new function reference is created on every render.",
    category: "Performance"
  }
];

export default function FinalTest({ user }: FinalTestProps) {
  const navigate = useNavigate();
  const requiredDays = 7;
  const completedDays = Object.values(user.progress || {}).filter((day) => day.completed).length;
  const isUnlocked = completedDays >= requiredDays;
  const [currentStep, setCurrentStep] = useState<'intro' | 'test' | 'results'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentStep === 'test' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && currentStep === 'test') {
      handleFinishTest();
    }
    return () => clearInterval(timer);
  }, [currentStep, timeLeft]);

  const handleStartTest = () => {
    setCurrentStep('test');
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setTimeLeft(300);
  };

  const handleAnswerSelect = (optionIndex: number) => {
    if (showExplanation) return;
    
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    setShowExplanation(false);
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleFinishTest();
    }
  };

  const handleFinishTest = () => {
    let correctCount = 0;
    answers.forEach((answer, index) => {
      if (answer === QUESTIONS[index].correctAnswer) {
        correctCount++;
      }
    });
    setScore(Math.round((correctCount / QUESTIONS.length) * 100));
    setCurrentStep('results');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white rounded-[40px] p-10 shadow-xl border border-slate-100 text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center text-amber-600 mx-auto mb-8">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Final Exam Locked</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Complete all required learning days before attempting the final exam.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase">Completed</p>
              <p className="text-lg font-bold text-slate-900">{completedDays}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase">Required</p>
              <p className="text-lg font-bold text-slate-900">{requiredDays}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/learning-plan')}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-3"
          >
            Continue Learning
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 'intro') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-xl w-full mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-slate-900 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full bg-white rounded-[40px] p-10 shadow-xl border border-slate-100 text-center"
        >
          <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 mx-auto mb-8">
            <Award className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Final Certification Exam</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Ready to verify your skills? This exam covers everything you've learned during your onboarding. You have 5 minutes to complete 5 mixed-difficulty questions.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <Clock className="w-5 h-5 text-indigo-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-400 uppercase">Time Limit</p>
              <p className="text-lg font-bold text-slate-900">5 Minutes</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <Target className="w-5 h-5 text-indigo-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-400 uppercase">Passing Score</p>
              <p className="text-lg font-bold text-slate-900">80%</p>
            </div>
          </div>

          <button 
            onClick={handleStartTest}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-3 group"
          >
            Start Exam
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    );
  }

  if (currentStep === 'test') {
    const question = QUESTIONS[currentQuestionIndex];
    const selectedAnswer = answers[currentQuestionIndex];

    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-slate-900 transition-all shadow-sm"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                <span className="font-bold text-indigo-600">{currentQuestionIndex + 1}/{QUESTIONS.length}</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Final Exam</h2>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md",
                    question.difficulty === 'Easy' ? "bg-emerald-100 text-emerald-600" :
                    question.difficulty === 'Medium' ? "bg-amber-100 text-amber-600" :
                    "bg-rose-100 text-rose-600"
                  )}>
                    {question.difficulty}
                  </span>
                </div>
              </div>
            </div>

            <div className={cn(
              "flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border shadow-sm font-mono font-bold",
              timeLeft < 60 ? "text-rose-600 border-rose-100 animate-pulse" : "text-slate-600 border-slate-100"
            )}>
              <Timer className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-200 rounded-full mb-12 overflow-hidden">
            <motion.div 
              className="h-full bg-indigo-600"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / QUESTIONS.length) * 100}%` }}
            />
          </div>

          {/* Question Card */}
          <motion.div 
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[40px] p-10 shadow-xl border border-slate-100"
          >
            <h3 className="text-2xl font-bold text-slate-900 mb-8 leading-tight">
              {question.text}
            </h3>

            <div className="space-y-4">
              {question.options.map((option, i) => {
                const isSelected = selectedAnswer === i;
                const isCorrect = i === question.correctAnswer;
                const showResult = showExplanation;

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswerSelect(i)}
                    disabled={showResult}
                    className={cn(
                      "w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between group",
                      !showResult && "hover:border-indigo-600 hover:bg-indigo-50/50 border-slate-100",
                      showResult && isCorrect && "border-emerald-500 bg-emerald-50 text-emerald-700",
                      showResult && isSelected && !isCorrect && "border-rose-500 bg-rose-50 text-rose-700",
                      showResult && !isSelected && !isCorrect && "border-slate-100 opacity-50",
                      !showResult && isSelected && "border-indigo-600 bg-indigo-50"
                    )}
                  >
                    <span className="font-medium">{option}</span>
                    {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                    {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-600" />}
                  </button>
                );
              })}
            </div>

            <AnimatePresence>
              {showExplanation && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-8 pt-8 border-t border-slate-100"
                >
                  <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl">
                    <AlertCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-slate-900 mb-1">Explanation</p>
                      <p className="text-sm text-slate-600 leading-relaxed">{question.explanation}</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleNextQuestion}
                    className="w-full mt-6 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    {currentQuestionIndex === QUESTIONS.length - 1 ? 'Finish Exam' : 'Next Question'}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    );
  }

  if (currentStep === 'results') {
    const passed = score >= 80;
    
    // Calculate insights
    const strongAreas = Array.from(new Set(QUESTIONS
      .filter((q, i) => answers[i] === q.correctAnswer)
      .map(q => q.category)));
    const weakAreas = Array.from(new Set(QUESTIONS
      .filter((q, i) => answers[i] !== q.correctAnswer)
      .map(q => q.category)));
      
    const suggestions = [
      ...weakAreas.map(area => `Master the nuances of ${area} through hands-on practice and documentation.`),
      passed ? "Mentor a junior developer to solidify your advanced knowledge." : "Schedule a 1-on-1 review session with your technical lead.",
      passed ? "Explore our internal architecture guidelines for production-scale apps." : "Complete the 'Foundations' module in the learning center."
    ].slice(0, 3);

    const handleDownloadCertificate = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 900;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 1200, 900);
        
        // Border
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 30;
        ctx.strokeRect(60, 60, 1080, 780);
        
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.strokeRect(80, 80, 1040, 740);
        
        // Header
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 60px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CERTIFICATE OF COMPLETION', 600, 220);
        
        // Subheader
        ctx.font = '32px sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('This is to certify that', 600, 320);
        
        // Name
        ctx.font = 'bold 72px serif';
        ctx.fillStyle = '#6366f1';
        ctx.fillText(user.name.toUpperCase(), 600, 420);
        
        // Achievement
        ctx.font = '32px sans-serif';
        ctx.fillStyle = '#1e293b';
        ctx.fillText(`has successfully completed the ${user.professionalRole} Onboarding`, 600, 520);
        ctx.fillText(`with a final score of ${score}%`, 600, 570);
        
        // Date
        ctx.font = 'italic 24px serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText(`Awarded on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, 600, 700);
        
        // Seal
        ctx.beginPath();
        ctx.arc(1000, 700, 60, 0, Math.PI * 2);
        ctx.fillStyle = '#6366f1';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('VERIFIED', 1000, 705);
        
        const link = document.createElement('a');
        link.download = `certification-${user.name.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    };

    return (
      <div className="min-h-screen bg-slate-50 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[48px] p-12 shadow-2xl border border-slate-100"
          >
            {/* Header */}
            <div className="text-center mb-12">
              <div className={cn(
                "w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3",
                passed ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
              )}>
                {passed ? <Trophy className="w-12 h-12" /> : <AlertCircle className="w-12 h-12" />}
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-3">
                {passed ? 'Certification Achieved!' : 'Exam Results'}
              </h1>
              <p className="text-slate-500 text-lg max-w-lg mx-auto">
                {passed 
                  ? `Outstanding work! You've demonstrated mastery in ${user.professionalRole} core competencies.` 
                  : `You're close! A bit more focus on the weak areas and you'll be ready for certification.`}
              </p>
            </div>

            {/* Score & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Final Score</p>
                <p className={cn("text-5xl font-black", passed ? "text-emerald-600" : "text-rose-600")}>{score}%</p>
              </div>
              <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Accuracy</p>
                <p className="text-5xl font-black text-slate-900">{Math.round((score / 100) * QUESTIONS.length)}/5</p>
              </div>
              <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Status</p>
                <div className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold mt-2",
                  passed ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                )}>
                  {passed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {passed ? 'CERTIFIED' : 'RETRY NEEDED'}
                </div>
              </div>
            </div>

            {/* Insights Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Strong & Weak Areas */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Strong Areas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {strongAreas.length > 0 ? strongAreas.map((area, i) => (
                      <span key={i} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold border border-emerald-100">
                        {area}
                      </span>
                    )) : <span className="text-slate-400 italic text-sm">No areas mastered yet.</span>}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    Areas for Growth
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {weakAreas.length > 0 ? weakAreas.map((area, i) => (
                      <span key={i} className="px-4 py-2 bg-rose-50 text-rose-700 rounded-xl text-sm font-bold border border-rose-100">
                        {area}
                      </span>
                    )) : <span className="text-slate-400 italic text-sm">Perfect score! No weak areas.</span>}
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div className="bg-indigo-50/50 rounded-[32px] p-8 border border-indigo-100">
                <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Improvement Roadmap
                </h3>
                <ul className="space-y-4">
                  {suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                        <span className="text-xs font-bold text-indigo-600">{i + 1}</span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{s}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-slate-100">
              {passed && (
                <button 
                  onClick={handleDownloadCertificate}
                  className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl flex items-center justify-center gap-3 group"
                >
                  <Award className="w-5 h-5 text-indigo-400" />
                  Download Certificate
                </button>
              )}
              {!passed && (
                <button 
                  onClick={handleStartTest}
                  className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Retake Exam
                </button>
              )}
              <button 
                onClick={() => navigate('/dashboard')}
                className={cn(
                  "flex-1 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2",
                  passed ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                <LayoutDashboard className="w-5 h-5" />
                Back to Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
}
