import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Trophy, 
  Target, 
  Clock, 
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Bell,
  Search,
  Settings,
  LogOut,
  Sparkles,
  BarChart3,
  Award,
  ArrowRight,
  Code2,
  Languages
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from '../types';
import { cn } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const totalDays = 7;
  const completedDaysCount = Object.values(user.progress || {}).filter(p => p.completed).length;
  const progressPercentage = Math.round((completedDaysCount / totalDays) * 100);
  const assessmentScore = user.assessmentResult?.score ?? 0;
  const hasAssessment = typeof user.assessmentResult?.score === 'number';
  const domainLabel = (user.domain || 'general').replace(/_/g, ' ');
  const focusTopic = user.weakTopics?.[0] || user.assessmentResult?.weaknesses?.[0];
  const initialScore = user.assessmentResult?.score ?? 0;
  const attemptedDays = Object.values(user.progress || {}).filter((p) => p.attempts > 0);
  const currentAverageScore = attemptedDays.length
    ? Math.round(attemptedDays.reduce((sum, p) => sum + p.score, 0) / attemptedDays.length)
    : 0;
  const weakTopicsBefore = user.assessmentResult?.weaknesses?.length ?? 0;
  const weakTopicsNow = new Set(user.weakTopics || []).size;
  const weakTopicsReduced = Math.max(0, weakTopicsBefore - weakTopicsNow);
  const scoreDelta = currentAverageScore - initialScore;

  const domainToRoleLabel: Record<string, string> = {
    frontend: 'Frontend',
    backend: 'Backend',
    fullstack: 'Fullstack',
    data_science: 'Data Science',
    ui_ux: 'UI/UX',
    devops_cloud: 'DevOps/Cloud',
  };

  const roleLabel = domainToRoleLabel[user.domain || ''] || 'General Tech';
  const expectedSkillsByDomain: Record<string, string[]> = {
    frontend: ['html', 'css', 'javascript', 'react', 'typescript', 'api integration', 'testing'],
    backend: ['node.js', 'api design', 'database', 'authentication', 'testing', 'deployment'],
    fullstack: ['react', 'node.js', 'database', 'api design', 'testing', 'deployment'],
    data_science: ['python', 'statistics', 'data visualization', 'machine learning', 'sql'],
    ui_ux: ['wireframing', 'user research', 'figma', 'prototyping', 'design systems'],
    devops_cloud: ['linux', 'docker', 'ci/cd', 'cloud', 'monitoring', 'infrastructure as code'],
  };

  const knownSkills = [...(user.skills || []), ...(user.techStack || [])].map((skill) => skill.toLowerCase());
  const expectedSkills = expectedSkillsByDomain[user.domain || ''] || ['communication', 'problem solving', 'testing'];
  const missingSkills = expectedSkills.filter(
    (skill) => !knownSkills.some((known) => known.includes(skill) || skill.includes(known))
  );

  const completionWeight = progressPercentage * 0.35;
  const scoreWeight = Math.max(initialScore, currentAverageScore) * 0.45;
  const skillWeight = ((expectedSkills.length - missingSkills.length) / expectedSkills.length) * 20;
  const roleReadinessScore = Math.max(0, Math.min(100, Math.round(completionWeight + scoreWeight + skillWeight)));

  const suggestedProjects = [
    {
      title: `${roleLabel} Portfolio Project`,
      reason: `Showcase your ${roleLabel.toLowerCase()} strengths with production-like structure and documentation.`,
    },
    {
      title: `Fix-${(missingSkills[0] || 'Core Skill').replace(/\b\w/g, (c) => c.toUpperCase())} Challenge`,
      reason: `Target your current gap: ${missingSkills[0] || 'core execution quality'} with a focused mini build.`,
    },
    {
      title: `${roleLabel} Team Simulation`,
      reason: 'Build with milestones, reviews, and testing to mirror real-world team delivery.',
    },
  ];

  const getInsightMessage = () => {
    if (!hasAssessment) {
      return `Start your skill assessment to unlock a personalized plan for ${domainLabel}.`;
    }

    if (assessmentScore >= 80) {
      return `You're excelling at ${domainLabel} fundamentals. Next modules now focus on real project depth and advanced patterns.`;
    }

    if (assessmentScore >= 50) {
      return `You're progressing well in ${domainLabel}. We've prioritized practice modules to strengthen consistency and speed.`;
    }

    if (focusTopic) {
      return `We've identified ${focusTopic} as a focus area. Your next modules include simpler examples and targeted drills.`;
    }

    return `We've tailored your next modules to strengthen your ${domainLabel} basics step by step.`;
  };

  const insightMessage = getInsightMessage();

  const handleInsightCta = () => {
    if (!hasAssessment) {
      navigate('/skill-assessment');
      return;
    }
    navigate('/learning-plan');
  };

  const stats = [
    { label: 'Progress', value: `${progressPercentage}%`, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Skills Verified', value: user.skills?.length || '0', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Learning Speed', value: `${user.learningSpeed || 0} pts`, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Assessment Score', value: user.assessmentResult?.score || 'N/A', icon: Trophy, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
            {t.welcome}, {user.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-500">Here's what's happening with your onboarding journey today.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-64 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -4 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Before vs After Impact */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Before vs After Impact</h3>
            <p className="text-sm text-slate-500">Quick evidence of learner improvement for your final demo.</p>
          </div>
          <div className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold",
            scoreDelta >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
          )}>
            <TrendingUp className="w-4 h-4" />
            {scoreDelta >= 0 ? `+${scoreDelta}` : `${scoreDelta}`} score trend
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Initial Assessment</p>
            <p className="text-2xl font-black text-slate-900">{hasAssessment ? `${initialScore}%` : 'N/A'}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Current Average</p>
            <p className="text-2xl font-black text-slate-900">{attemptedDays.length ? `${currentAverageScore}%` : 'N/A'}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Weak Topics Reduced</p>
            <p className="text-2xl font-black text-slate-900">{weakTopicsReduced}</p>
          </div>
        </div>
      </div>

      {/* Career Mode Output */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Career Mode Output</h3>
            <p className="text-sm text-slate-500">Learning progress translated into role readiness and real project direction.</p>
          </div>
          <div className={cn(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold',
            roleReadinessScore >= 70 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
          )}>
            <BarChart3 className="w-4 h-4" />
            {roleLabel} readiness: {roleReadinessScore}%
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Role Readiness Score</p>
            <p className="text-3xl font-black text-slate-900 mb-1">{roleReadinessScore}%</p>
            <p className="text-sm text-slate-500">Aligned for <span className="font-semibold text-slate-700">{roleLabel}</span> pathways</p>
          </div>

          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Missing Skills</p>
            <div className="space-y-2">
              {missingSkills.slice(0, 4).map((skill) => (
                <div key={skill} className="text-sm text-slate-700 font-medium">
                  • {skill.replace(/\b\w/g, (c) => c.toUpperCase())}
                </div>
              ))}
              {missingSkills.length === 0 && (
                <div className="text-sm text-emerald-700 font-medium">No critical gaps detected right now.</div>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Suggested Projects</p>
            <div className="space-y-3">
              {suggestedProjects.map((project) => (
                <div key={project.title}>
                  <p className="text-sm font-semibold text-slate-900">{project.title}</p>
                  <p className="text-xs text-slate-500">{project.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Final Exam CTA */}
        <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
              <Award className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2">{t.readyForCert}</h3>
            <p className="text-slate-400 mb-8 max-w-md">
              Complete all learning days to unlock the final assessment and receive your certification.
            </p>
            <button 
              onClick={() => navigate('/final-test')}
              disabled={completedDaysCount < totalDays}
              className={cn(
                "px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 group/btn",
                completedDaysCount === totalDays 
                  ? "bg-white text-slate-900 hover:bg-indigo-50" 
                  : "bg-white/10 text-white/40 cursor-not-allowed"
              )}
            >
              {completedDaysCount === totalDays ? t.takeFinalExam : "Locked 🔒"}
              {completedDaysCount === totalDays && <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />}
            </button>
          </div>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl group-hover:bg-indigo-600/30 transition-all" />
        </div>

        {/* Real-World Projects CTA */}
        <div className="bg-indigo-600 rounded-[32px] p-8 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">{t.buildRealProjects}</h3>
            <p className="text-indigo-100 mb-8 max-w-md">
              Apply your learning to real-world scenarios. Build apps, solve tasks, and get expert feedback.
            </p>
            <button 
              onClick={() => navigate('/projects')}
              className="px-8 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all flex items-center gap-2 group/btn"
            >
              {t.exploreProjects}
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-indigo-600" />
            Learning Journey
          </h3>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
            {completedDaysCount} / {totalDays} Days Completed
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: totalDays }).map((_, i) => {
            const dayNum = i + 1;
            const progress = user.progress?.[dayNum];
            const isUnlocked = progress?.unlocked;
            const isCompleted = progress?.completed;
            const isCurrent = isUnlocked && !isCompleted;

            return (
              <motion.div
                key={dayNum}
                whileHover={isUnlocked ? { y: -4 } : {}}
                onClick={() => isUnlocked && navigate(`/learning/${dayNum}`)}
                className={cn(
                  "p-6 rounded-[32px] border transition-all relative overflow-hidden cursor-pointer",
                  isUnlocked 
                    ? isCompleted 
                      ? "bg-emerald-50 border-emerald-100" 
                      : isCurrent 
                        ? "bg-white border-indigo-200 shadow-xl shadow-indigo-50" 
                        : "bg-white border-slate-100"
                    : "bg-slate-50 border-slate-100 opacity-60 grayscale cursor-not-allowed"
                )}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-bold",
                    isCompleted ? "bg-emerald-500 text-white" : isUnlocked ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-400"
                  )}>
                    {dayNum}
                  </div>
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : !isUnlocked ? (
                    <Clock className="w-5 h-5 text-slate-400" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                  )}
                </div>
                <h4 className="font-bold text-slate-900 mb-1">Day {dayNum}</h4>
                <p className="text-xs text-slate-500">
                  {isCompleted ? "Completed" : isUnlocked ? "In Progress" : "Locked"}
                </p>
                
                {isUnlocked && !isCompleted && (
                  <div className="mt-4 flex items-center gap-1 text-indigo-600 text-[10px] font-bold uppercase tracking-wider">
                    Start Learning <ChevronRight className="w-3 h-3" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-100">
            <Sparkles className="w-8 h-8 mb-4 opacity-80" />
            <h3 className="text-xl font-bold mb-2">{t.aiInsight}</h3>
            <p className="text-indigo-100 text-sm leading-relaxed mb-6">
              {insightMessage}
            </p>
            <button
              onClick={handleInsightCta}
              className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors"
            >
              {hasAssessment ? 'Check New Modules' : 'Start Skill Assessment'}
            </button>
          </div>

          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" />
              {t.recentActivity}
            </h3>
            <div className="space-y-6">
              {[
                { text: 'Completed Onboarding', time: 'Just now' },
                { text: 'Started Day 1', time: 'Just now' },
              ].map((activity, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">{activity.text}</p>
                    <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
