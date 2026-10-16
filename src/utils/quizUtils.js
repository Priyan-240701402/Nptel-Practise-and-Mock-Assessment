import entrepreneurshipData from '../data/entrepreneurshipQuestions.json';
import llmData from '../data/llmQuestions.json';

export const COURSES = {
  entrepreneurship: {
    id: 'entrepreneurship',
    title: 'Foundations of Entrepreneurship',
    code: 'noc26_mg80',
    url: 'https://onlinecourses.nptel.ac.in/e-learning/preview/noc26_mg80',
    description: 'Master core concepts of entrepreneurial mindset, opportunity evaluation, lean startup methodology, venture financing, IP, and growth scaling.',
    instructor: 'NPTEL Management Studies',
    data: entrepreneurshipData,
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  llm: {
    id: 'llm',
    title: 'Introduction to Large Language Models',
    code: 'noc26_cs171',
    url: 'https://onlinecourses.nptel.ac.in/e-learning/course/noc26_cs171',
    description: 'Explore statistical NLP, Transformer self-attention, pre-training, PEFT/LoRA fine-tuning, RLHF alignment, prompt engineering, RAG, and agentic workflows.',
    instructor: 'NPTEL Computer Science',
    data: llmData,
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  }
};

/**
 * Get all questions for a specific course
 */
export function getCourseQuestions(courseId) {
  const course = COURSES[courseId];
  return course ? course.data.questions : [];
}

/**
 * Get distinct topics for a course
 */
export function getCourseTopics(courseId) {
  const questions = getCourseQuestions(courseId);
  const topics = new Set();
  questions.forEach(q => {
    if (q.topic) topics.add(q.topic);
  });
  return Array.from(topics);
}

/**
 * Fisher-Yates array shuffle (returns a new array)
 */
export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Select questions based on topic, difficulty, and count.
 * Shuffles options for each question without altering correctOptionId mapping.
 */
export function selectQuestions({
  courseId,
  topic = 'all',
  difficulty = 'all',
  count = 20,
  shuffle = true,
  shuffleOptions = false
}) {
  let pool = getCourseQuestions(courseId);

  if (topic && topic !== 'all') {
    pool = pool.filter(q => q.topic.toLowerCase() === topic.toLowerCase());
  }

  if (difficulty && difficulty !== 'all') {
    pool = pool.filter(q => q.difficulty.toLowerCase() === difficulty.toLowerCase());
  }

  if (shuffle) {
    pool = shuffleArray(pool);
  }

  // Ensure we don't request more than available
  const actualCount = count === 'all' ? pool.length : Math.min(Number(count), pool.length);
  const selected = pool.slice(0, actualCount);

  // Clone and optionally shuffle options while preserving correctness by ID
  return selected.map(q => {
    const cloned = { ...q, options: [...q.options] };
    if (shuffleOptions) {
      cloned.options = shuffleArray(cloned.options);
    }
    return cloned;
  });
}

/**
 * Safe local storage wrappers with fail-safe fallbacks
 */
const STORAGE_PREFIX = 'nptel_mcq_';

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn('localStorage not available or quota exceeded:', e);
    return false;
  }
}

export function loadFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.warn('localStorage not accessible:', e);
    return defaultValue;
  }
}

export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
