import { DayProgress, LearningResource, QuizQuestion, User } from '../types';

export type PlanDuration = 30 | 60 | 90;
export type PlanDifficulty = 'easy' | 'medium' | 'hard';

export interface PlanTopic {
  day: number;
  title: string;
  description: string;
  difficulty: PlanDifficulty;
  resources: LearningResource[];
}

const DEFAULT_RESOURCE: LearningResource = {
  type: 'doc',
  title: 'Official Documentation',
  url: 'https://developer.mozilla.org/',
};

function extractJsonArrayText(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return '[]';

  const start = trimmed.indexOf('[');
  const end = trimmed.lastIndexOf(']');
  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  return '[]';
}

function parseAiPlanResponse(text: string): unknown[] {
  const parsed = JSON.parse(extractJsonArrayText(text));
  return Array.isArray(parsed) ? parsed : [];
}

function normalizeDifficulty(value: unknown): PlanDifficulty {
  if (value === 'easy' || value === 'medium' || value === 'hard') return value;
  return 'easy';
}

function normalizeResources(value: unknown, domain: string): LearningResource[] {
  if (!Array.isArray(value)) {
    return [{ ...DEFAULT_RESOURCE, title: `${domain} docs` }];
  }

  const items = value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const candidate = item as Record<string, unknown>;
      const type =
        candidate.type === 'video' || candidate.type === 'audio' || candidate.type === 'doc'
          ? candidate.type
          : 'doc';
      const title = typeof candidate.title === 'string' ? candidate.title.trim() : '';
      const url = typeof candidate.url === 'string' ? candidate.url.trim() : '';
      if (!title || !url) return null;
      return { type, title, url } as LearningResource;
    })
    .filter(Boolean) as LearningResource[];

  return items.length > 0 ? items : [{ ...DEFAULT_RESOURCE, title: `${domain} docs` }];
}

function normalizePlan(rawPlan: unknown[], duration: PlanDuration, domain: string): PlanTopic[] {
  return rawPlan
    .slice(0, duration)
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const value = item as Record<string, unknown>;
      const day = typeof value.day === 'number' ? value.day : index + 1;
      const title =
        typeof value.title === 'string' && value.title.trim()
          ? value.title.trim()
          : `Day ${index + 1}: ${domain} practice`;
      const description =
        typeof value.description === 'string' && value.description.trim()
          ? value.description.trim()
          : `Learn one focused ${domain} concept and apply it with a small exercise.`;

      return {
        day,
        title,
        description,
        difficulty: normalizeDifficulty(value.difficulty),
        resources: normalizeResources(value.resources, domain),
      } as PlanTopic;
    })
    .filter(Boolean) as PlanTopic[];
}

function buildFallbackPlan(duration: PlanDuration, domain: string): PlanTopic[] {
  const difficulties: PlanDifficulty[] = ['easy', 'easy', 'medium', 'medium', 'hard'];
  return Array.from({ length: duration }, (_, i) => ({
    day: i + 1,
    title: `Day ${i + 1}: ${domain} core practice`,
    description: `Focus on one ${domain} concept, do a short hands-on task, and note one key takeaway.`,
    difficulty: difficulties[i % difficulties.length],
    resources: [{ ...DEFAULT_RESOURCE, title: `${domain} official docs` }],
  }));
}

interface PlannerInput {
  user: User;
  duration: PlanDuration;
}

interface PlannerGenerateInput {
  prompt: string;
}

interface PlannerResult {
  plan: PlanTopic[];
  source: 'ai' | 'fallback';
}

export const PlannerAgent = {
  buildPrompt({ user, duration }: PlannerInput) {
    const domainName = user.domain || 'technology';

    return `Generate a personalized ${duration}-day learning plan for a user in the "${domainName}" domain.

User Context:
- Tech Stack: ${user.techStack?.join(', ')}
- Evaluated Level: ${user.assessmentResult?.evaluatedLevel || 'beginner'}
- Score: ${user.assessmentResult?.score || 0}/${user.assessmentResult?.totalPoints || 20}
- Strengths: ${user.assessmentResult?.strengths?.join(', ')}
- Weaknesses: ${user.assessmentResult?.weaknesses?.join(', ')}
- Professional Role: ${user.role}

Plan Structure (Weekly):
- Week 1: Basics (concept learning)
- Week 2: Intermediate concepts + practice
- Week 3: Advanced topics + mini projects
- Week 4: Real-world project + revision

For each day, provide:
- day: number (1 to ${duration})
- title: Topic name
- description: Simple breakdown of complex topics (notes)
- difficulty: easy, medium, or hard
- resources: Array of 3 objects with:
  - type: 'video', 'audio', or 'doc'
  - title: Resource title
  - url: A relevant educational URL

Return a JSON array of ${duration} objects.`;
  },

  parsePlan(text: string, duration: PlanDuration, domain: string) {
    const parsed = parseAiPlanResponse(text || '[]');
    return normalizePlan(parsed, duration, domain);
  },

  fallbackPlan(duration: PlanDuration, domain: string) {
    return buildFallbackPlan(duration, domain);
  },

  async generate(
    input: PlannerInput,
    generateWithAI: (request: PlannerGenerateInput) => Promise<string>
  ): Promise<PlannerResult> {
    const domain = input.user.domain || 'technology';
    try {
      const prompt = this.buildPrompt(input);
      const responseText = await generateWithAI({ prompt });
      const plan = this.parsePlan(responseText, input.duration, domain);
      if (!plan.length) throw new Error('Plan generation returned no valid items');
      return { plan, source: 'ai' };
    } catch {
      return { plan: this.fallbackPlan(input.duration, domain), source: 'fallback' };
    }
  },
};

interface TutorExplainInput {
  question: string;
  topicTitle: string;
  professionalRole?: string;
  level?: string;
  preferredLanguage?: string;
  difficultyMode: 'Normal' | 'Simplified' | 'Advanced';
}

interface TutorWeakAreasInput {
  topicTitle: string;
  weakAreas: string[];
  preferredLanguage?: string;
}

const MENTOR_SYSTEM_INSTRUCTION = `You are a clean and beginner-friendly teaching assistant.

Strict response format (always follow):
1. Topic Name
2. Simple Definition
3. Developed By (only for tools/frameworks/libraries)
4. Key Concepts
  - Use numbered points
  - Add a one-line explanation for each
  - Add short examples where useful
5. Why Use It?
  - 3 to 5 bullet points
6. Real-world Example
7. Basic Example
  - Include a small code block only when relevant
8. In One Line

Quality rules:
- Use simple words and short sentences.
- Keep explanation clean and visually structured.
- Avoid unnecessary jargon. If needed, define it briefly.
- Do not add filler text or unnecessary apologies.
- Match the user's preferred language exactly.
- Add appropriate emojis in section titles (for example: 📘, 💡, ⚙️, ✅, 🌍).
- Bold important words and key terms using markdown (**term**).
- Do not overuse emojis; keep it professional and readable.
`;

const REEXPLANATION_SYSTEM_INSTRUCTION = `You are a supportive tutor helping a learner who just failed a quiz.

Rules:
- Use very simple words.
- Keep response under 120 words.
- Use exactly one analogy and one tiny example.
- End with one encouraging line.
`;

export const TutorAgent = {
  systemInstruction: MENTOR_SYSTEM_INSTRUCTION,
  weakAreaSystemInstruction: REEXPLANATION_SYSTEM_INSTRUCTION,

  buildExplainPrompt(input: TutorExplainInput) {
    return `Learner profile:
- Professional role: ${input.professionalRole || 'learner'}
- Topic: ${input.topicTitle}
- Level: ${input.level || 'beginner'}
- Preferred language: ${input.preferredLanguage || 'English'}
- Difficulty mode: ${input.difficultyMode}

User question: ${input.question}

Important output rule:
- Reply in ${input.preferredLanguage || 'English'}.

Please follow the required response structure exactly.`;
  },

  buildWeakAreaPrompt(input: TutorWeakAreasInput) {
    return `The learner struggled with this topic: ${input.topicTitle}.
Weak areas: ${input.weakAreas.join(', ')}.

Preferred language: ${input.preferredLanguage || 'English'}.

Important output rule:
- Reply in ${input.preferredLanguage || 'English'}.

Re-explain these in simple language for a beginner.`;
  },

  fallbackExplanation(question: string) {
    return `### Topic Name
${question}

### Simple Definition
This concept is easier to learn when you break it into small parts and understand one part at a time.

### Developed By
Depends on the technology, but this is usually created and maintained by a company or open-source community.

### Key Concepts
1. Learn the basic idea first.
2. Understand how inputs and outputs work.
3. Practice with a small example.

### Why It Is Useful
- Helps you build stronger fundamentals.
- Makes advanced topics easier later.

### Real-World Example
Like learning to ride a bike: first balance, then pedaling, then turning.

### In One Line
Learn it step by step, then apply it with practice.`;
  },
};

interface EvaluatorInput {
  quiz: QuizQuestion[];
  answers: Record<string, string>;
  dayNum: number;
  user: User;
  passingScore?: number;
  totalDays?: number;
}

interface EvaluatorResult {
  score: number;
  passed: boolean;
  weakTopics: string[];
  updatedProgress: Record<number, DayProgress>;
  learningSpeedDelta: number;
}

export const EvaluatorAgent = {
  evaluateQuiz({
    quiz,
    answers,
    dayNum,
    user,
    passingScore = 70,
    totalDays = 7,
  }: EvaluatorInput): EvaluatorResult {
    let correctCount = 0;
    const weakTopics: string[] = [];

    for (const question of quiz) {
      if (answers[question.id] === question.correctAnswer) {
        correctCount += 1;
      } else {
        weakTopics.push(question.question);
      }
    }

    const score = Math.round((correctCount / Math.max(1, quiz.length)) * 100);
    const passed = score >= passingScore;

    const updatedProgress = { ...user.progress };
    updatedProgress[dayNum] = {
      ...updatedProgress[dayNum],
      day: dayNum,
      completed: passed,
      quizPassed: passed,
      score,
      attempts: (updatedProgress[dayNum]?.attempts || 0) + 1,
      lastAttemptAt: new Date().toISOString(),
      weakTopics,
      unlocked: true,
    };

    if (passed && dayNum < totalDays) {
      updatedProgress[dayNum + 1] = {
        ...updatedProgress[dayNum + 1],
        day: dayNum + 1,
        unlocked: true,
      } as DayProgress;
    }

    return {
      score,
      passed,
      weakTopics,
      updatedProgress,
      learningSpeedDelta: passed ? 10 : 2,
    };
  },
};

function normalizeKeyword(raw: string) {
  return raw.toLowerCase().replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function topicBucket(topic: string) {
  const value = normalizeKeyword(topic);
  if (/(syntax|semicolon|parse|token|operator|type|types)/.test(value)) return 'Syntax';
  if (/(logic|condition|loop|algorithm|flow|state)/.test(value)) return 'Logic';
  if (/(architect|design|pattern|module|structure|component)/.test(value)) return 'Architecture';
  if (/(security|auth|token|session|csrf|xss|injection)/.test(value)) return 'Security';
  if (/(perform|optimi|memo|cache|render|speed)/.test(value)) return 'Performance';
  if (/(test|jest|unit|integration|coverage)/.test(value)) return 'Testing';
  return 'Logic';
}

function calculateActiveStreak(progressEntries: Array<[number, DayProgress]>) {
  const completedDays = progressEntries
    .filter(([, value]) => value.completed)
    .map(([day]) => day)
    .sort((a, b) => a - b);

  let streak = 0;
  for (const day of completedDays) {
    if (day === streak + 1) streak += 1;
  }

  return streak;
}

export const TrackerAgent = {
  buildAnalytics(user: User) {
    const progressEntries = Object.entries(user.progress || {})
      .map(([key, value]) => [Number(key), value] as [number, DayProgress])
      .filter(([day]) => Number.isFinite(day))
      .sort((a, b) => a[0] - b[0]);

    const defaultDays = 7;
    const trackedDays = Math.max(defaultDays, progressEntries.length || defaultDays);
    const completedDays = progressEntries.filter(([, value]) => value.completed).length;
    const attempted = progressEntries.filter(([, value]) => value.attempts > 0);
    const totalAttempts = attempted.reduce((sum, [, value]) => sum + (value.attempts || 0), 0);
    const avgScore = attempted.length
      ? attempted.reduce((sum, [, value]) => sum + (value.score || 0), 0) / attempted.length
      : 0;

    const mastery = Math.round((completedDays / trackedDays) * 100);
    const mistakeRate = Math.max(0, Math.round((100 - avgScore) * 10) / 10);
    const activeStreak = calculateActiveStreak(progressEntries);

    const speedData = progressEntries.length
      ? progressEntries.map(([day, value]) => ({
          day: `D${day}`,
          speed: Math.min(100, Math.max(20, (value.score || 0) + (value.attempts || 0) * 4)),
        }))
      : [
          { day: 'D1', speed: 28 },
          { day: 'D2', speed: 35 },
          { day: 'D3', speed: 45 },
        ];

    const weakTopicCounts = new Map<string, number>();
    for (const topic of user.weakTopics || []) {
      weakTopicCounts.set(topic, (weakTopicCounts.get(topic) || 0) + 1);
    }

    for (const [, value] of progressEntries) {
      for (const topic of value.weakTopics || []) {
        weakTopicCounts.set(topic, (weakTopicCounts.get(topic) || 0) + 1);
      }
    }

    const weakTopics = Array.from(weakTopicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name: name.length > 22 ? `${name.slice(0, 19)}...` : name,
        score: Math.min(100, 35 + count * 15),
      }));

    if (!weakTopics.length) {
      weakTopics.push(
        { name: 'No weak topics yet', score: 20 },
        { name: 'Keep practicing daily', score: 30 }
      );
    }

    const buckets = ['Syntax', 'Logic', 'Architecture', 'Security', 'Performance', 'Testing'];
    const bucketCounts = new Map<string, number>(buckets.map((key) => [key, 0]));

    for (const [topic, count] of weakTopicCounts.entries()) {
      const key = topicBucket(topic);
      bucketCounts.set(key, (bucketCounts.get(key) || 0) + count);
    }

    const maxCount = Math.max(1, ...Array.from(bucketCounts.values()));
    const mistakePatterns = buckets.map((subject) => ({
      subject,
      A: Math.round(((bucketCounts.get(subject) || 0) / maxCount) * 140 + 10),
      fullMark: 150,
    }));

    const improvementTrends = progressEntries.length
      ? progressEntries.map(([day], index) => {
          const subset = progressEntries.slice(0, index + 1);
          const subsetCompleted = subset.filter(([, value]) => value.completed).length;
          return {
            month: `Week ${Math.max(1, Math.ceil(day / 7))}`,
            mastery: Math.round((subsetCompleted / subset.length) * 100),
          };
        })
      : [
          { month: 'Week 1', mastery: 10 },
          { month: 'Week 2', mastery: 20 },
        ];

    const improvementMap = new Map<string, number>();
    for (const item of improvementTrends) {
      const prev = improvementMap.get(item.month) || 0;
      improvementMap.set(item.month, Math.max(prev, item.mastery));
    }

    return {
      mastery,
      avgSpeed: `${(user.learningSpeed / 100 + 1).toFixed(1)}x`,
      mistakeRate: `${mistakeRate}%`,
      activeStreak: `${activeStreak} Days`,
      completedDays,
      trackedDays,
      totalAttempts,
      speedData,
      weakTopics,
      mistakePatterns,
      improvementTrends: Array.from(improvementMap.entries()).map(([month, value]) => ({
        month,
        mastery: value,
      })),
    };
  },
};
