import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Chrome } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { cn } from '../lib/utils';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Mock validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      if (email === 'demo@example.com' && password === 'password') {
        onLogin({
          id: '1',
          name: 'Demo User',
          email: 'demo@example.com',
          progress: {},
          weakTopics: [],
          mistakePatterns: [],
          learningSpeed: 0
        });
      } else {
        // For demo purposes, let's allow any login but show error for specific ones
        onLogin({
          id: Math.random().toString(36).substr(2, 9),
          name: email.split('@')[0],
          email: email,
          progress: {},
          weakTopics: [],
          mistakePatterns: [],
          learningSpeed: 0
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      onLogin({
        id: 'google-123',
        name: 'Google User',
        email: 'google@gmail.com',
        progress: {},
        weakTopics: [],
        mistakePatterns: [],
        learningSpeed: 0
      });
      setIsLoading(false);
    }, 1000);
  };

  const handleDemoMode = () => {
    const demoUser: User = {
      id: 'demo-mode-user',
      name: 'Hackathon Demo',
      email: 'demo@smartonboard.ai',
      role: 'student',
      professionalRole: 'frontend',
      domain: 'frontend',
      techStack: ['React', 'TypeScript', 'Tailwind CSS'],
      experienceLevel: 'beginner',
      language: 'en',
      assessmentResult: {
        score: 46,
        totalPoints: 20,
        evaluatedLevel: 'intermediate',
        answers: {},
        strengths: ['HTML fundamentals', 'Basic component structure'],
        weaknesses: ['State management', 'API integration', 'Testing'],
      },
      progress: {
        1: { day: 1, unlocked: true, completed: true, quizPassed: true, score: 72, attempts: 1, weakTopics: ['React state'] },
        2: { day: 2, unlocked: true, completed: true, quizPassed: true, score: 78, attempts: 1, weakTopics: ['Props drilling'] },
        3: { day: 3, unlocked: true, completed: false, quizPassed: false, score: 62, attempts: 2, weakTopics: ['API error handling'] },
        4: { day: 4, unlocked: true, completed: false, quizPassed: false, score: 0, attempts: 0, weakTopics: [] },
        5: { day: 5, unlocked: false, completed: false, quizPassed: false, score: 0, attempts: 0, weakTopics: [] },
        6: { day: 6, unlocked: false, completed: false, quizPassed: false, score: 0, attempts: 0, weakTopics: [] },
        7: { day: 7, unlocked: false, completed: false, quizPassed: false, score: 0, attempts: 0, weakTopics: [] },
      },
      weakTopics: ['API error handling', 'State management', 'Testing'],
      mistakePatterns: ['Skipping edge-case checks', 'Incorrect async flow'],
      learningSpeed: 48,
      voiceEnabled: true,
      skills: ['HTML', 'CSS', 'JavaScript'],
    };

    onLogin(demoUser);
    navigate('/dashboard', { replace: true });
  };

  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Enter your credentials to access your account"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 ml-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="name@company.com"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between ml-1">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <a href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">Forgot password?</a>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 group",
            isLoading && "opacity-70 cursor-not-allowed"
          )}
        >
          {isLoading ? "Signing in..." : "Sign in"}
          {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
        </button>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-50 px-2 text-slate-500">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-3 px-4 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
        >
          <Chrome className="w-5 h-5 text-slate-600" />
          Sign in with Google
        </button>

        <button
          type="button"
          onClick={handleDemoMode}
          className="w-full py-3 px-4 bg-amber-50 border border-amber-200 text-amber-800 font-semibold rounded-xl hover:bg-amber-100 transition-all"
        >
          One-Click Demo Mode
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Don't have an account?{' '}
        <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
