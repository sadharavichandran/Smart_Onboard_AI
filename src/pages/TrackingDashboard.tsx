import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  AlertCircle, 
  Zap, 
  Target, 
  ArrowLeft,
  Calendar,
  Download,
  BrainCircuit,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { cn } from '../lib/utils';
import { TrackerAgent } from '../lib/aiAgents';

interface TrackingDashboardProps {
  user: User;
}

const STORAGE_KEY = 'smartonboard_user';

function readLiveUserFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

const COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'];

export default function TrackingDashboard({ user }: TrackingDashboardProps) {
  const navigate = useNavigate();
  const [liveUser, setLiveUser] = useState<User>(user);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    setLiveUser(user);
  }, [user]);

  useEffect(() => {
    const syncFromStorage = () => {
      const latest = readLiveUserFromStorage();
      if (!latest) return;
      setLiveUser((prev) => {
        const prevText = JSON.stringify(prev);
        const latestText = JSON.stringify(latest);
        if (prevText === latestText) return prev;
        return latest;
      });
      setIsLive(true);
      window.setTimeout(() => setIsLive(false), 1200);
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        syncFromStorage();
      }
    };

    const poller = window.setInterval(syncFromStorage, 2000);
    window.addEventListener('storage', onStorage);
    return () => {
      window.clearInterval(poller);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const analytics = useMemo(() => TrackerAgent.buildAnalytics(liveUser), [liveUser]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-slate-900 transition-all shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Learning Analytics</h1>
              <p className="text-slate-500 flex items-center gap-2">
                <span>Real-time insights into your onboarding performance.</span>
                <span className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  isLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                )} />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
              <Calendar className="w-4 h-4" />
              Last 30 Days
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Overall Mastery', value: `${analytics.mastery}%`, trend: `${analytics.completedDays}/${analytics.trackedDays} done`, icon: Target, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Avg. Speed', value: analytics.avgSpeed, trend: `${analytics.totalAttempts} attempts`, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Mistake Rate', value: analytics.mistakeRate, trend: analytics.mistakeRate.startsWith('0') ? 'Great' : 'Monitor', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
            { label: 'Active Streak', value: analytics.activeStreak, trend: isLive ? 'Live' : 'Synced', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg)}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <span className={cn(
                  "text-xs font-bold px-2 py-1 rounded-lg",
                  stat.trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" :
                  stat.trend.startsWith('-') ? "bg-rose-50 text-rose-600" :
                  "bg-slate-50 text-slate-500"
                )}>
                  {stat.trend}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Learning Speed Trend */}
          <div className="lg:col-span-8 bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Learning Speed Trend
              </h3>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-indigo-600" />
                  <span className="text-xs text-slate-500 font-medium">Speed Index</span>
                </div>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.speedData}>
                  <defs>
                    <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="speed" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorSpeed)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mistake Patterns */}
          <div className="lg:col-span-4 bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-8 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              Mistake Patterns
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analytics.mistakePatterns}>
                  <PolarGrid stroke="#f1f5f9" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Radar
                    name="Errors"
                    dataKey="A"
                    stroke="#f43f5e"
                    fill="#f43f5e"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weak Topics */}
          <div className="lg:col-span-6 bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-8 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-amber-600" />
              Frequently Weak Topics
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.weakTopics} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
                    width={120}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={24}>
                    {analytics.weakTopics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Improvement Trends */}
          <div className="lg:col-span-6 bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-8 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Mastery Improvement
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.improvementTrends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="stepAfter" 
                    dataKey="mastery" 
                    stroke="#10b981" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
