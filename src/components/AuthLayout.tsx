import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Left Side: Decorative/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-indigo-600">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 opacity-90" />
        
        {/* Abstract shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white/10 blur-3xl animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-20 text-white">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">SmartOnboard AI</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl font-bold leading-[1.1] mb-6 tracking-tight"
          >
            The future of <br />
            <span className="text-indigo-200">workplace onboarding</span> <br />
            is here.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-indigo-100/80 max-w-md font-light leading-relaxed"
          >
            Empower your new hires with AI-driven personalized learning paths, automated documentation, and instant support.
          </motion.p>
          
          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <img 
                  key={i}
                  src={`https://picsum.photos/seed/user${i}/100/100`}
                  alt="User"
                  className="w-10 h-10 rounded-full border-2 border-indigo-600 object-cover"
                  referrerPolicy="no-referrer"
                />
              ))}
            </div>
            <p className="text-sm text-indigo-100/60">
              Joined by <span className="text-white font-medium">2,000+</span> teams worldwide
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-20">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="mb-10 lg:hidden flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            <span className="text-xl font-bold text-slate-900">SmartOnboard AI</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">{title}</h2>
            <p className="text-slate-500">{subtitle}</p>
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  );
}
