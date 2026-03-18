export type UserRole = 'student' | 'admin' | 'employee' | 'guest';

export type ProfessionalRole = 
  | 'student' | 'intern' | 'fresher' | 'trainee'
  | 'sysadmin' | 'it_manager' | 'ops_manager' | 'project_manager'
  | 'frontend' | 'backend' | 'fullstack' | 'qa'
  | 'consultant' | 'freelancer' | 'external' | 'support'
  | 'other';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export interface AssessmentQuestion {
  id: string;
  type: 'mcq' | 'coding' | 'conceptual';
  question: string;
  options?: string[];
  correctAnswer: string;
  points: number;
  explanation?: string;
}

export interface AssessmentResult {
  score: number;
  totalPoints: number;
  evaluatedLevel: ExperienceLevel;
  answers: Record<string, string>;
  strengths?: string[];
  weaknesses?: string[];
}

export interface LearningResource {
  type: 'video' | 'audio' | 'doc';
  title: string;
  url: string;
  duration?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface DailyTopic {
  day: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  content: string;
  examples: string[];
  resources: LearningResource[];
  quiz: QuizQuestion[];
}

export type LearningDomain = 
  | 'frontend' 
  | 'backend' 
  | 'fullstack' 
  | 'data_science' 
  | 'ui_ux' 
  | 'devops_cloud';

export interface DayProgress {
  day: number;
  unlocked: boolean;
  completed: boolean;
  quizPassed: boolean;
  score: number;
  attempts: number;
  lastAttemptAt?: string;
  weakTopics?: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
  professionalRole?: ProfessionalRole;
  domain?: LearningDomain;
  interest?: string;
  skills?: string[];
  techStack?: string[];
  experienceLevel?: ExperienceLevel;
  yearsOfExperience?: number;
  assessmentResult?: AssessmentResult;
  progress: Record<number, DayProgress>;
  weakTopics: string[];
  mistakePatterns: string[];
  learningSpeed: number;
  language?: string;
  voiceEnabled?: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: ExperienceLevel;
  category: string;
  tasks: string[];
  estimatedTime: string;
  technologies: string[];
}

export interface ProjectSubmission {
  projectId: string;
  submissionUrl: string;
  feedback?: string;
  status: 'pending' | 'reviewed';
  submittedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
