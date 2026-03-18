import React, { useState } from 'react';
import { NavLink, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Brain, 
  Bot,
  BarChart3, 
  Briefcase, 
  Award, 
  Globe, 
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { User } from '../types';
import { cn } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';
import TourGuideBot from './TourGuideBot';

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
}

export default function DashboardLayout({ user, onLogout }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();
  const requiredDays = 7;
  const completedDays = Object.values(user.progress || {}).filter((day) => day.completed).length;
  const finalExamUnlocked = completedDays >= requiredDays;

  const menuItems = [
    { icon: LayoutDashboard, label: t.dashboard, path: '/dashboard' },
    { icon: BookOpen, label: t.learningPlan, path: '/learning-plan' },
    { icon: Brain, label: t.assessments, path: '/skill-assessment' },
    { icon: Bot, label: 'AI Mentor', path: '/ai-mentor' },
    { icon: BarChart3, label: t.tracking, path: '/tracking' },
    { icon: Briefcase, label: t.projects, path: '/projects' },
    { icon: Award, label: t.finalExam, path: '/final-test', disabled: !finalExamUnlocked },
    { icon: Globe, label: t.selectLanguage, path: '/language' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 sticky top-0 h-screen">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              SmartOnboard
            </span>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const isDisabled = Boolean(item.disabled);
              return (
                <NavLink
                  key={item.path}
                  to={isDisabled ? '#' : item.path}
                  onClick={(event) => {
                    if (isDisabled) {
                      event.preventDefault();
                    }
                  }}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                    isDisabled && "opacity-50 cursor-not-allowed",
                    isActive 
                      ? "bg-indigo-50 text-indigo-600 shadow-sm" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                  )} />
                  {item.label}
                  {isDisabled && <span className="ml-auto text-[10px] font-bold uppercase">Locked</span>}
                  {isActive && (
                    <motion.div 
                      layoutId="active-pill"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600"
                    />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
              {user.name?.[0] || 'U'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-900 truncate">{user.name}</span>
              <span className="text-xs text-slate-500 truncate">{user.email}</span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-900">SmartOnboard</span>
        </div>
        <button 
          onClick={toggleMobileMenu}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobileMenu}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden flex flex-col"
            >
              <div className="p-8">
                <div className="flex items-center gap-3 mb-12">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <span className="text-xl font-bold text-slate-900">SmartOnboard</span>
                </div>

                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const isDisabled = Boolean(item.disabled);
                    return (
                      <NavLink
                        key={item.path}
                        to={isDisabled ? '#' : item.path}
                        onClick={(event) => {
                          if (isDisabled) {
                            event.preventDefault();
                            return;
                          }
                          toggleMobileMenu();
                        }}
                        className={({ isActive }) => cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                          isDisabled && "opacity-50 cursor-not-allowed",
                          isActive 
                            ? "bg-indigo-50 text-indigo-600" 
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                        {isDisabled && <span className="ml-auto text-[10px] font-bold uppercase">Locked</span>}
                      </NavLink>
                    );
                  })}
                </nav>
              </div>

              <div className="mt-auto p-8 border-t border-slate-100">
                <button
                  onClick={() => {
                    onLogout();
                    toggleMobileMenu();
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 w-full lg:pl-0 pt-16 lg:pt-0 min-h-screen overflow-x-hidden">
        <div className="max-w-7xl mx-auto p-6 lg:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <TourGuideBot />
    </div>
  );
}
