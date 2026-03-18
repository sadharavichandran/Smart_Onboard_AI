import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Users, 
  Briefcase, 
  User as UserIcon, 
  CheckCircle2, 
  LogOut,
  ArrowLeft,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import { User, UserRole } from '../types';
import { cn } from '../lib/utils';

import { useNavigate } from 'react-router-dom';

interface RoleSelectionProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (updates: Partial<User>) => void;
}

interface RoleOption {
  id: UserRole;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const roles: RoleOption[] = [
  {
    id: 'student',
    title: 'Student',
    description: 'Currently learning and exploring various career paths.',
    icon: GraduationCap,
    color: 'bg-blue-500',
  },
  {
    id: 'admin',
    title: 'Administrator',
    description: 'Full access to system settings, billing, and user management.',
    icon: ShieldCheck,
    color: 'bg-indigo-500',
  },
  {
    id: 'employee',
    title: 'New Hire',
    description: 'Access your personalized onboarding path and learning resources.',
    icon: Briefcase,
    color: 'bg-amber-500',
  },
  {
    id: 'guest',
    title: 'Guest / Contractor',
    description: 'Limited access to specific projects and documentation.',
    icon: UserIcon,
    color: 'bg-slate-500',
  },
];

export default function RoleSelection({ user, onLogout, onUpdateUser }: RoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(user.role || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!selectedRole) return;
    setIsSubmitting(true);
    onUpdateUser({ role: selectedRole });
    
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/onboarding');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            <span className="text-xl font-bold text-slate-900">SmartOnboard AI</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-slate-900">{user.name}</span>
              <span className="text-xs text-slate-500">{user.email}</span>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={onLogout}
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-slate-900 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider"
          >
            <Sparkles className="w-3 h-3" />
            Personalization
          </motion.div>
        </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Choose your role
          </h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            Select the role that best describes your position. We'll customize your experience based on your choice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role, index) => (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedRole(role.id)}
              className={cn(
                "relative flex items-start gap-4 p-6 rounded-2xl border-2 text-left transition-all group",
                selectedRole === role.id 
                  ? "border-indigo-600 bg-white shadow-xl shadow-indigo-100/50" 
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg hover:shadow-slate-100"
              )}
            >
              <div className={cn(
                "p-3 rounded-xl text-white transition-transform group-hover:scale-110",
                role.color
              )}>
                <role.icon className="w-6 h-6" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-slate-900">{role.title}</h3>
                  {selectedRole === role.id && (
                    <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                  )}
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {role.description}
                </p>
              </div>

              {selectedRole === role.id && (
                <motion.div 
                  layoutId="active-border"
                  className="absolute inset-0 rounded-2xl ring-2 ring-indigo-600 pointer-events-none"
                />
              )}
            </motion.button>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center">
          <button
            disabled={!selectedRole || isSubmitting}
            onClick={handleContinue}
            className={cn(
              "px-12 py-4 rounded-xl font-bold text-lg transition-all shadow-lg",
              selectedRole && !isSubmitting
                ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 hover:-translate-y-1"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            )}
          >
            {isSubmitting ? "Setting up..." : "Continue to Dashboard"}
          </button>
          <p className="mt-4 text-sm text-slate-400">
            You can change your role later in settings.
          </p>
        </div>
      </main>
    </div>
  );
}
