import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code2, 
  Database, 
  Layers, 
  LineChart, 
  Palette, 
  Cloud,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  Timer,
  Brain,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { User, LearningDomain, ExperienceLevel, DayProgress } from '../types';
import { cn } from '../lib/utils';

interface OnboardingProps {
  user: User;
  onUpdateUser: (updates: Partial<User>) => void;
}

type Step = 'domain' | 'tech' | 'level' | 'experience';

const domains: { id: LearningDomain; title: string; icon: any; description: string }[] = [
  { id: 'frontend', title: 'Frontend Development', icon: Code2, description: 'Build beautiful, interactive user interfaces.' },
  { id: 'backend', title: 'Backend Development', icon: Database, description: 'Design robust APIs and server-side logic.' },
  { id: 'fullstack', title: 'Full Stack Development', icon: Layers, description: 'Master both client and server-side engineering.' },
  { id: 'data_science', title: 'Data Science', icon: LineChart, description: 'Analyze data and build intelligent models.' },
  { id: 'ui_ux', title: 'UI/UX Design', icon: Palette, description: 'Create intuitive and engaging user experiences.' },
  { id: 'devops_cloud', title: 'DevOps / Cloud', icon: Cloud, description: 'Automate deployments and manage infrastructure.' },
];

const techStacks: Record<LearningDomain, string[]> = {
  frontend: ['HTML', 'CSS', 'JavaScript', 'React', 'Next.js', 'Tailwind CSS'],
  backend: ['Node.js', 'Express.js', 'Java (Spring Boot)', 'Python (Django / Flask)', 'MongoDB', 'MySQL'],
  fullstack: ['MERN Stack', 'MEAN Stack', 'Java Full Stack', 'Python Full Stack'],
  data_science: ['Python', 'Pandas', 'NumPy', 'Machine Learning', 'Data Visualization'],
  ui_ux: ['Figma', 'Adobe XD', 'Wireframing', 'Prototyping'],
  devops_cloud: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'],
};

const experienceLevels: { id: ExperienceLevel; label: string; icon: any; desc: string }[] = [
  { id: 'beginner', label: 'Beginner', icon: Zap, desc: 'New to this field' },
  { id: 'intermediate', label: 'Intermediate', icon: Brain, desc: 'Have some experience' },
  { id: 'advanced', label: 'Advanced', icon: Sparkles, desc: 'Experienced professional' },
];

export default function Onboarding({ user, onUpdateUser }: OnboardingProps) {
  const [step, setStep] = useState<Step>('domain');
  const [selectedDomain, setSelectedDomain] = useState<LearningDomain | null>(user.domain || null);
  const [selectedTech, setSelectedTech] = useState<string[]>(user.techStack || []);
  const [selectedLevel, setSelectedLevel] = useState<ExperienceLevel | null>(user.experienceLevel || null);
  const [experience, setExperience] = useState<string>(user.yearsOfExperience?.toString() || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleNext = () => {
    if (step === 'domain') setStep('tech');
    else if (step === 'tech') setStep('level');
    else if (step === 'level') setStep('experience');
    else handleFinish();
  };

  const handleBack = () => {
    if (step === 'tech') setStep('domain');
    else if (step === 'level') setStep('tech');
    else if (step === 'experience') setStep('level');
    else navigate('/role-selection');
  };

  const toggleTech = (tech: string) => {
    setSelectedTech(prev => 
      prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]
    );
  };

  const handleFinish = () => {
    setIsSubmitting(true);
    
    // Initialize progress for 7 days
    const initialProgress: Record<number, DayProgress> = {};
    for (let i = 1; i <= 7; i++) {
      initialProgress[i] = {
        day: i,
        unlocked: i === 1,
        completed: false,
        quizPassed: false,
        score: 0,
        attempts: 0
      };
    }

    const updates: Partial<User> = {
      domain: selectedDomain!,
      techStack: selectedTech,
      experienceLevel: selectedLevel!,
      yearsOfExperience: experience ? parseInt(experience) : undefined,
      interest: selectedTech.join(', '), // Fallback for interest field used in assessment
      progress: initialProgress,
      weakTopics: [],
      mistakePatterns: [],
      learningSpeed: 0
    };
    onUpdateUser(updates);
    
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/skill-assessment');
    }, 1000);
  };

  const steps: Step[] = ['domain', 'tech', 'level', 'experience'];
  const currentStepIndex = steps.indexOf(step);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const isNextDisabled = () => {
    if (step === 'domain') return !selectedDomain;
    if (step === 'tech') return selectedTech.length === 0;
    if (step === 'level') return !selectedLevel;
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={handleBack}
              className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
              Step {currentStepIndex + 1} of {steps.length}
            </div>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-indigo-600 rounded-full"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'domain' && (
            <motion.div
              key="domain"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h1 className="text-4xl font-bold text-slate-900 mb-4">What domain do you want to learn?</h1>
                <p className="text-lg text-slate-600">Choose your area of specialization to get started.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {domains.map((domain) => (
                  <button
                    key={domain.id}
                    onClick={() => setSelectedDomain(domain.id)}
                    className={cn(
                      "flex flex-col items-start p-6 rounded-3xl border-2 transition-all text-left group",
                      selectedDomain === domain.id
                        ? "border-indigo-600 bg-white shadow-xl shadow-indigo-100/50"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg"
                    )}
                  >
                    <div className={cn(
                      "p-3 rounded-2xl mb-4 transition-transform group-hover:scale-110",
                      selectedDomain === domain.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                    )}>
                      <domain.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">{domain.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{domain.description}</p>
                    {selectedDomain === domain.id && (
                      <div className="mt-4 flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase">
                        <CheckCircle2 className="w-4 h-4" />
                        Selected
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'tech' && (
            <motion.div
              key="tech"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h1 className="text-4xl font-bold text-slate-900 mb-4">Select your tech stack</h1>
                <p className="text-lg text-slate-600">Choose the technologies you want to master in {selectedDomain?.replace('_', ' ')}.</p>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                {selectedDomain && techStacks[selectedDomain].map((tech) => (
                  <button
                    key={tech}
                    onClick={() => toggleTech(tech)}
                    className={cn(
                      "px-8 py-4 rounded-2xl border-2 font-bold transition-all flex items-center gap-3",
                      selectedTech.includes(tech)
                        ? "border-indigo-600 bg-indigo-50 text-indigo-600 shadow-md"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    )}
                  >
                    {tech}
                    {selectedTech.includes(tech) && <CheckCircle2 className="w-5 h-5" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'level' && (
            <motion.div
              key="level"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h1 className="text-4xl font-bold text-slate-900 mb-4">What is your current skill level?</h1>
                <p className="text-lg text-slate-600">This helps us tailor the assessment difficulty for you.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {experienceLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setSelectedLevel(level.id)}
                    className={cn(
                      "flex flex-col items-center p-8 rounded-3xl border-2 transition-all group",
                      selectedLevel === level.id
                        ? "border-indigo-600 bg-white shadow-xl shadow-indigo-100/50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    )}
                  >
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110",
                      selectedLevel === level.id ? "bg-indigo-600 text-white shadow-lg" : "bg-slate-100 text-slate-400"
                    )}>
                      <level.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{level.label}</h3>
                    <p className="text-sm text-slate-500 text-center">{level.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'experience' && (
            <motion.div
              key="experience"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h1 className="text-4xl font-bold text-slate-900 mb-4">How many years of experience do you have?</h1>
                <p className="text-lg text-slate-600">This step is optional but helps in better personalization.</p>
              </div>

              <div className="max-w-sm mx-auto">
                <div className="relative">
                  <Timer className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                  <input
                    type="number"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g. 3"
                    min="0"
                    max="50"
                    className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-200 rounded-3xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all text-xl font-bold"
                  />
                </div>
                <p className="mt-4 text-sm text-slate-400 text-center">Leave blank if you're just starting out.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-16 flex flex-col items-center">
          <button
            disabled={isNextDisabled() || isSubmitting}
            onClick={handleNext}
            className={cn(
              "px-16 py-5 rounded-2xl font-bold text-xl transition-all shadow-xl flex items-center gap-3",
              !isNextDisabled() && !isSubmitting
                ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1 shadow-indigo-200"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            )}
          >
            {isSubmitting ? "Saving..." : step === 'experience' ? "Start AI Assessment" : "Continue"}
            {!isSubmitting && <ArrowRight className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </div>
  );
}
