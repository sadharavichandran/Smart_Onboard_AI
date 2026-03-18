import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Users, Target, Zap, BarChart3, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Driven Learning Paths',
      description: 'Personalized roadmaps adapted to your role, skills, and pace.'
    },
    {
      icon: Users,
      title: '24/7 AI Mentor',
      description: 'Real-time support, doubt resolution, and contextual guidance.'
    },
    {
      icon: Target,
      title: 'Skill Assessment',
      description: 'Verify competencies and unlock role-ready certifications.'
    },
    {
      icon: Zap,
      title: 'Real-World Projects',
      description: 'Build portfolio-worthy projects with expert feedback.'
    },
    {
      icon: BarChart3,
      title: 'Career Insights',
      description: 'Track role readiness, identify skill gaps, and plan growth.'
    },
    {
      icon: BookOpen,
      title: 'Curated Content',
      description: 'Hand-picked resources, examples, and best practices.'
    }
  ];

  const stats = [
    { number: '2,000+', label: 'Teams Worldwide' },
    { number: '50K+', label: 'Learners Onboarded' },
    { number: '95%', label: 'Completion Rate' },
    { number: '7 Days', label: 'Avg. to Productivity' }
  ];

  return (
    <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 min-h-screen text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold">SmartOnboard AI</span>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 font-semibold transition-all"
        >
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 py-20 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">Powered by Gemini AI</span>
          </div>

          <h1 className="text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-tight">
            The future of
            <br />
            <span className="bg-gradient-to-r from-yellow-200 via-green-200 to-blue-200 bg-clip-text text-transparent">
              workplace onboarding
            </span>
            <br />
            is here.
          </h1>

          <p className="text-xl text-purple-100 max-w-3xl mb-12 leading-relaxed">
            Empower your new hires with AI-driven personalized learning paths, automated documentation, and instant support. Transform onboarding from days to hours.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg shadow-2xl shadow-white/20 hover:shadow-white/40 transition-all flex items-center justify-center gap-2 group"
            >
              Start Learning Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all"
            >
              Try Demo Mode
            </button>
          </div>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 flex items-center gap-4"
        >
          <div className="flex -space-x-2">
            {['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'].map((color, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full border-2 border-white/30"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className="text-purple-100 font-semibold">
            Joined by <span className="text-white font-bold">2,000+</span> teams worldwide
          </span>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto px-6 lg:px-12 py-16 border-y border-white/10">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="text-center"
          >
            <p className="text-4xl lg:text-5xl font-black mb-1">{stat.number}</p>
            <p className="text-purple-100 font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-4">Designed for Growth</h2>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto">
            Every feature built to accelerate onboarding and drive real skill development.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="p-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:border-white/40 hover:bg-white/20 transition-all group"
            >
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-purple-100 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 lg:px-12 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="p-12 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">Ready to transform onboarding?</h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Start your first personalized learning path in minutes. No setup required.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="px-10 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg shadow-2xl shadow-white/20 hover:shadow-white/40 transition-all flex items-center justify-center gap-2 group mx-auto"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-12 px-6 lg:px-12 text-center text-purple-100">
        <p>© 2026 SmartOnboard AI. Empowering workplace learning with AI.</p>
      </footer>
    </div>
  );
}
