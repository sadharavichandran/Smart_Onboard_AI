import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code2, 
  Terminal, 
  Globe, 
  Cpu, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ArrowLeft,
  ExternalLink, 
  Send, 
  Sparkles,
  MessageSquare,
  ChevronRight,
  Github,
  Layers,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { User, Project, ProjectSubmission } from '../types';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import {
  GEMINI_API_KEY_MISSING_MESSAGE,
  getGeminiClient,
  isGeminiConfigurationError,
} from '../lib/gemini';

interface ProjectsProps {
  user: User;
}

const PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'Modern Portfolio with React',
    description: 'Build a high-performance personal portfolio using React, Tailwind CSS, and Framer Motion.',
    difficulty: 'beginner',
    category: 'Frontend',
    estimatedTime: '4-6 hours',
    technologies: ['React', 'Tailwind CSS', 'Framer Motion'],
    tasks: [
      'Implement a responsive navigation bar with smooth scroll',
      'Create a dynamic project gallery with hover animations',
      'Build a contact form with validation',
      'Optimize for mobile devices and performance'
    ]
  },
  {
    id: 'p2',
    title: 'RESTful API Integration',
    description: 'Create a dashboard that consumes a public API (like GitHub or Weather API) with robust error handling.',
    difficulty: 'intermediate',
    category: 'Fullstack',
    estimatedTime: '6-8 hours',
    technologies: ['React', 'Axios', 'React Query', 'Chart.js'],
    tasks: [
      'Set up API client with base configuration and interceptors',
      'Implement data fetching with loading and error states',
      'Visualize data using a charting library',
      'Add search and filtering capabilities'
    ]
  },
  {
    id: 'p3',
    title: 'Real-time Chat Application',
    description: 'Develop a real-time messaging interface with presence indicators and message persistence.',
    difficulty: 'advanced',
    category: 'Backend/Real-time',
    estimatedTime: '10-12 hours',
    technologies: ['React', 'Firebase/Supabase', 'WebSockets'],
    tasks: [
      'Implement user authentication and session management',
      'Set up real-time database listeners for messages',
      'Add "user typing" and "online status" indicators',
      'Implement image upload and message history'
    ]
  },
  {
    id: 'p4',
    title: 'E-commerce Product Grid',
    description: 'Build a complex product listing page with advanced filtering, sorting, and cart functionality.',
    difficulty: 'intermediate',
    category: 'Frontend',
    estimatedTime: '5-7 hours',
    technologies: ['React', 'Redux/Zustand', 'Styled Components'],
    tasks: [
      'Create a reusable product card component',
      'Implement a multi-criteria filtering system',
      'Build a persistent shopping cart with state management',
      'Add "Quick View" modal for product details'
    ]
  }
];

export default function Projects({ user }: ProjectsProps) {
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submission, setSubmission] = useState<ProjectSubmission | null>(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

  const filteredProjects = useMemo(() => {
    // Filter projects based on user's evaluated level if available
    const userLevel = user.assessmentResult?.evaluatedLevel || 'beginner';
    return PROJECTS.sort((a, b) => {
      if (a.difficulty === userLevel) return -1;
      if (b.difficulty === userLevel) return 1;
      return 0;
    });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !submissionUrl) return;

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newSubmission: ProjectSubmission = {
        projectId: selectedProject.id,
        submissionUrl,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };
      setSubmission(newSubmission);
      setIsSubmitting(false);
      generateFeedback(newSubmission);
    }, 1500);
  };

  const generateFeedback = async (sub: ProjectSubmission, retryCount = 0) => {
    setIsGeneratingFeedback(true);
    try {
      const ai = getGeminiClient();
      const project = PROJECTS.find(p => p.id === sub.projectId);
      
      const prompt = `
        As a senior technical mentor, provide constructive feedback for a project submission.
        Project: ${project?.title}
        Difficulty: ${project?.difficulty}
        Submission URL: ${sub.submissionUrl}
        
        The user has submitted their work. Since I cannot actually visit the URL, 
        provide a high-quality, encouraging, and professional "simulated" review 
        based on the project requirements. Mention specific technologies like ${project?.technologies.join(', ')}.
        
        Format the response in Markdown. Include:
        1. A brief praise for completing the task.
        2. 2-3 specific technical points they likely did well.
        3. 1-2 areas for potential improvement or "pro-tips".
        4. A final encouraging closing statement.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setSubmission(prev => prev ? { ...prev, feedback: response.text, status: 'reviewed' } : null);
    } catch (error: any) {
      console.error('Error generating feedback:', error);
      if (isGeminiConfigurationError(error)) {
        setSubmission(prev => prev ? {
          ...prev,
          feedback: GEMINI_API_KEY_MISSING_MESSAGE,
          status: 'reviewed'
        } : null);
      } else if (retryCount < 2) {
        console.log(`Retrying feedback generation... Attempt ${retryCount + 1}`);
        setTimeout(() => generateFeedback(sub, retryCount + 1), 1000 * (retryCount + 1));
      } else {
        setSubmission(prev => prev ? { 
          ...prev, 
          feedback: "Great job on the submission! Your implementation shows a solid understanding of the core concepts. Keep practicing to refine your skills further. (Note: We encountered a temporary issue generating detailed AI feedback, but your submission is recorded!)", 
          status: 'reviewed' 
        } : null);
      }
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-slate-900 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-4">
              <Zap className="w-3 h-3" />
              Hands-on Experience
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-2">Real-World Projects</h1>
            <p className="text-slate-500 max-w-2xl">
              Apply your skills to practical scenarios. Choose a project that matches your level and get AI-powered code review feedback.
            </p>
          </div>
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Current Level</p>
                <p className="font-bold text-slate-900 capitalize">{user.assessmentResult?.evaluatedLevel || 'Beginner'}</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Project List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Available Projects</h2>
            {filteredProjects.map((project) => (
              <motion.button
                key={project.id}
                whileHover={{ x: 4 }}
                onClick={() => {
                  setSelectedProject(project);
                  setSubmission(null);
                  setSubmissionUrl('');
                }}
                className={cn(
                  "w-full text-left p-6 rounded-3xl border transition-all group",
                  selectedProject?.id === project.id
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100"
                    : "bg-white border-slate-100 text-slate-900 hover:border-indigo-200 hover:shadow-md"
                )}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className={cn(
                    "p-2 rounded-xl",
                    selectedProject?.id === project.id ? "bg-white/20" : "bg-indigo-50"
                  )}>
                    {project.category === 'Frontend' ? <Globe className="w-5 h-5" /> :
                     project.category === 'Fullstack' ? <Layers className="w-5 h-5" /> :
                     <Cpu className="w-5 h-5" />}
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-tighter px-2 py-1 rounded-lg",
                    selectedProject?.id === project.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  )}>
                    {project.difficulty}
                  </span>
                </div>
                <h3 className="font-bold mb-1">{project.title}</h3>
                <p className={cn(
                  "text-xs line-clamp-2",
                  selectedProject?.id === project.id ? "text-indigo-100" : "text-slate-500"
                )}>
                  {project.description}
                </p>
              </motion.button>
            ))}
          </div>

          {/* Project Details & Submission */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selectedProject ? (
                <motion.div
                  key={selectedProject.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-100 shadow-sm"
                >
                  <div className="flex flex-wrap items-center gap-4 mb-8">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-600">
                      <Clock className="w-4 h-4" />
                      {selectedProject.estimatedTime}
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-600">
                      <Code2 className="w-4 h-4" />
                      {selectedProject.technologies.join(', ')}
                    </div>
                  </div>

                  <h2 className="text-3xl font-black text-slate-900 mb-6">{selectedProject.title}</h2>
                  
                  <div className="prose prose-slate max-w-none mb-12">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Task Instructions</h3>
                    <ul className="space-y-4 list-none p-0">
                      {selectedProject.tasks.map((task, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-600">
                          <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-xs font-bold">{i + 1}</span>
                          </div>
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Submission Form */}
                  {!submission ? (
                    <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Send className="w-5 h-5 text-indigo-600" />
                        Submit Your Work
                      </h3>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                            GitHub Repository or Live Demo URL
                          </label>
                          <div className="relative">
                            <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input 
                              type="url"
                              required
                              placeholder="https://github.com/username/project"
                              value={submissionUrl}
                              onChange={(e) => setSubmissionUrl(e.target.value)}
                              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                          </div>
                        </div>
                        <button 
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              Submit for Review
                              <ArrowRight className="w-5 h-5" />
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-8"
                    >
                      <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white">
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-bold text-emerald-900">Project Submitted</p>
                            <p className="text-sm text-emerald-600 truncate max-w-[200px] md:max-w-md">
                              {submission.submissionUrl}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setSubmission(null)}
                          className="text-xs font-bold text-emerald-700 hover:underline"
                        >
                          Resubmit
                        </button>
                      </div>

                      {/* AI Feedback */}
                      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4">
                          <Sparkles className="w-6 h-6 text-indigo-200" />
                        </div>
                        
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-indigo-600" />
                          Mentor Feedback
                        </h3>

                        {isGeneratingFeedback ? (
                          <div className="space-y-4 animate-pulse">
                            <div className="h-4 bg-slate-100 rounded w-3/4" />
                            <div className="h-4 bg-slate-100 rounded w-1/2" />
                            <div className="h-4 bg-slate-100 rounded w-5/6" />
                          </div>
                        ) : (
                          <div className="prose prose-indigo max-w-none text-slate-600">
                            {submission.feedback?.split('\n').map((line, i) => (
                              <p key={i} className="mb-2">{line}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-[40px] border border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mb-6">
                    <Terminal className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Select a Project</h2>
                  <p className="text-slate-500 max-w-xs">
                    Choose a project from the list to view instructions and start building.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }
