import entrepreneurshipData from '../data/entrepreneurshipQuestions.json';
import llmData from '../data/llmQuestions.json';
import syllabusData from '../data/entrepreneurship/syllabus.json';

// ── Weekly data imports ────────────────────────────────────────────────────
import week01 from '../data/entrepreneurship/week01.json';
import week02 from '../data/entrepreneurship/week02.json';
import week03 from '../data/entrepreneurship/week03.json';
import week04 from '../data/entrepreneurship/week04.json';
import week05 from '../data/entrepreneurship/week05.json';
import week06 from '../data/entrepreneurship/week06.json';
import week07 from '../data/entrepreneurship/week07.json';
import week08 from '../data/entrepreneurship/week08.json';
import week09 from '../data/entrepreneurship/week09.json';
import week10 from '../data/entrepreneurship/week10.json';
import week11 from '../data/entrepreneurship/week11.json';
import week12 from '../data/entrepreneurship/week12.json';

// Keyed lookup for weekly data
export const WEEKLY_DATA = {
  1: week01, 2: week02, 3: week03, 4: week04,
  5: week05, 6: week06, 7: week07, 8: week08,
  9: week09, 10: week10, 11: week11, 12: week12
};

export const SYLLABUS = syllabusData;

export const COURSES = {
  entrepreneurship: {
    id: 'entrepreneurship',
    title: 'Foundations of Entrepreneurship',
    code: 'noc26_mg80',
    url: 'https://onlinecourses.nptel.ac.in/e-learning/preview/noc26_mg80',
    description: 'Master core concepts of entrepreneurial mindset, opportunity evaluation, lean startup methodology, venture financing, IP, and growth scaling.',
    instructor: 'NPTEL Management Studies',
    data: {
      get questions() {
        return getAllWeeklyQuestions();
      }
    },
    supplementaryData: entrepreneurshipData,
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    hasWeeklyAssessments: true,
    totalWeeks: 12,
    totalModules: 8
  },
  llm: {
    id: 'llm',
    title: 'Introduction to Large Language Models',
    code: 'noc26_cs171',
    url: 'https://onlinecourses.nptel.ac.in/e-learning/course/noc26_cs171',
    description: 'Updated 12-week NPTEL curriculum covering statistical NLP, neural LMs, PyTorch deep learning, Transformers, pre-training (BERT/ELMo), instruction tuning & RLHF, open-book QA & RAG, Knowledge Graphs, PEFT/LoRA, modern foundation models (GPT-4, Llama 3, Gemini), and ethical NLP.',
    instructor: 'NPTEL Computer Science',
    data: llmData,
    syllabus: llmData.syllabus,
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    hasWeeklyAssessments: false,
    totalQuestions: 200,
    totalWeeks: 12
  }
};

/**
 * Normalizes question structure so both array options and object options work seamlessly.
 */
export function normalizeQuestion(q) {
  if (!q) return q;
  let optionsList = [];
  if (Array.isArray(q.options)) {
    optionsList = q.options.map(opt => ({ ...opt }));
  } else if (q.options && typeof q.options === 'object') {
    optionsList = ['A', 'B', 'C', 'D'].map(letter => ({
      id: letter,
      text: q.options[letter] || ''
    }));
  }
  const correct = q.correctOptionId || q.correctAnswer || 'A';
  return {
    ...q,
    options: optionsList,
    correctOptionId: correct,
    correctAnswer: correct
  };
}

/**
 * Safely shuffles options for a question while guaranteeing correctOptionId mapping is updated.
 */
export function applyOptionShuffle(q, shuffleOptions = false) {
  const normalized = normalizeQuestion(q);
  if (!shuffleOptions || !normalized.options || normalized.options.length < 2) {
    return normalized;
  }
  const originalCorrectId = normalized.correctOptionId || normalized.correctAnswer;
  const correctItem = normalized.options.find(o => o.id === originalCorrectId);
  const correctText = correctItem ? correctItem.text : normalized.options[0].text;
  
  const shuffledTexts = shuffleArray(normalized.options.map(o => o.text));
  const letters = ['A', 'B', 'C', 'D'];
  const newOptions = letters.map((letter, idx) => ({
    id: letter,
    text: shuffledTexts[idx] !== undefined ? shuffledTexts[idx] : ''
  }));
  const newCorrectIndex = shuffledTexts.indexOf(correctText);
  const newCorrectLetter = newCorrectIndex >= 0 ? letters[newCorrectIndex] : originalCorrectId;

  return {
    ...normalized,
    options: newOptions,
    correctOptionId: newCorrectLetter,
    correctAnswer: newCorrectLetter
  };
}

/**
 * Get all questions for a specific course (main question bank)
 */
export function getCourseQuestions(courseId) {
  if (courseId === 'entrepreneurship') {
    return getAllWeeklyQuestions().map(normalizeQuestion);
  }
  const course = COURSES[courseId];
  const questions = course && course.data ? course.data.questions : [];
  return questions.map(normalizeQuestion);
}

/**
 * Get questions for a specific week (entrepreneurship only)
 */
export function getWeekQuestions(weekNumber) {
  const weekData = WEEKLY_DATA[weekNumber];
  return weekData ? weekData.questions : [];
}

/**
 * Get all questions for a specific module (across all its weeks, deduplicated)
 */
export function getModuleQuestions(moduleId) {
  const module = SYLLABUS.modules.find(m => m.moduleId === moduleId);
  if (!module) return [];
  const allQs = [];
  const seen = new Set();
  module.weeks.forEach(wk => {
    const qs = getWeekQuestions(wk);
    qs.forEach(q => {
      if (!seen.has(q.id)) {
        seen.add(q.id);
        allQs.push(q);
      }
    });
  });
  return allQs;
}

/**
 * Get all weekly questions across all 12 weeks (deduplicated)
 */
export function getAllWeeklyQuestions() {
  const all = [];
  const seen = new Set();
  for (let w = 1; w <= 12; w++) {
    const qs = getWeekQuestions(w);
    qs.forEach(q => {
      if (!seen.has(q.id)) {
        seen.add(q.id);
        all.push(q);
      }
    });
  }
  return all;
}

/**
 * Get distinct topics for a course (main bank)
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
 * Get module list with question counts for the entrepreneurship course
 */
export function getEntrepreneurshipModules() {
  return SYLLABUS.modules.map(m => ({
    moduleId: m.moduleId,
    moduleName: m.moduleName,
    weeks: m.weeks,
    questionCount: getModuleQuestions(m.moduleId).length
  }));
}

/**
 * Get metadata for a specific week
 */
export function getWeekMetadata(weekNumber) {
  const weekData = WEEKLY_DATA[weekNumber];
  const moduleInfo = SYLLABUS.weekToModule[String(weekNumber)];
  const syllabusModule = SYLLABUS.modules.find(m => m.moduleId === moduleInfo?.moduleId);
  return {
    week: weekNumber,
    moduleId: moduleInfo?.moduleId || 0,
    moduleName: moduleInfo?.moduleName || '',
    topics: syllabusModule?.topics || [],
    questionCount: weekData?.questions?.length || 0,
    sourceNote: weekData?.sourceNote || '',
    assessmentTitle: weekData?.assessmentTitle || `Week ${weekNumber} Assessment`
  };
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
 * Select questions based on topic, difficulty, count, week, or module.
 * Shuffles options for each question without altering correctOptionId mapping.
 */
export function selectQuestions({
  courseId,
  topic = 'all',
  difficulty = 'all',
  count = 20,
  week = null,
  moduleId = null,
  useWeeklyBank = false,
  shuffle = true,
  shuffleOptions = false
}) {
  let pool;

  if (week !== null && courseId === 'entrepreneurship') {
    pool = getWeekQuestions(week);
  } else if (moduleId !== null && courseId === 'entrepreneurship') {
    pool = getModuleQuestions(moduleId);
  } else if (useWeeklyBank && courseId === 'entrepreneurship') {
    pool = getAllWeeklyQuestions();
  } else {
    pool = getCourseQuestions(courseId);
  }

  if (topic && topic !== 'all') {
    pool = pool.filter(q => q.topic?.toLowerCase() === topic.toLowerCase());
  }

  if (difficulty && difficulty !== 'all') {
    pool = pool.filter(q => q.difficulty?.toLowerCase() === difficulty.toLowerCase());
  }

  if (shuffle) {
    pool = shuffleArray(pool);
  }

  const actualCount = count === 'all' ? pool.length : Math.min(Number(count), pool.length);
  const selected = pool.slice(0, actualCount);

  return selected.map(q => applyOptionShuffle(q, shuffleOptions));
}

/**
 * Select questions spread evenly across all 8 modules for a full course mock test
 */
export function selectFullCourseQuestions({ count = 48, shuffle = true, shuffleOptions = false }) {
  if (count === 'all' || count >= 180) {
    const all = getAllWeeklyQuestions();
    const res = shuffle ? shuffleArray(all) : all;
    return res.map(q => applyOptionShuffle(q, shuffleOptions));
  }

  const modules = SYLLABUS.modules;
  const perModule = Math.ceil(count / modules.length);
  const selected = [];
  const seen = new Set();

  modules.forEach(mod => {
    const pool = shuffleArray(getModuleQuestions(mod.moduleId));
    let added = 0;
    for (const q of pool) {
      if (added >= perModule) break;
      if (!seen.has(q.id)) {
        seen.add(q.id);
        selected.push(applyOptionShuffle(q, shuffleOptions));
        added++;
      }
    }
  });

  if (selected.length < count) {
    const allQs = shuffleArray(getAllWeeklyQuestions());
    for (const q of allQs) {
      if (selected.length >= count) break;
      if (!seen.has(q.id)) {
        seen.add(q.id);
        selected.push(applyOptionShuffle(q, shuffleOptions));
      }
    }
  }

  const res = shuffle ? shuffleArray(selected) : selected;
  return res.slice(0, Math.min(Number(count), res.length));
}

/**
 * Select questions from a subset of modules (Mixed-Module)
 */
export function selectMixedModuleQuestions({
  moduleIds = [],
  count = 24,
  shuffle = true,
  shuffleOptions = false
}) {
  const allQs = [];
  const seen = new Set();
  moduleIds.forEach((mId) => {
    const qs = getModuleQuestions(Number(mId));
    qs.forEach((q) => {
      if (!seen.has(q.id)) {
        seen.add(q.id);
        allQs.push(q);
      }
    });
  });

  const pool = shuffle ? shuffleArray(allQs) : allQs;
  const actualCount = count === 'all' ? pool.length : Math.min(Number(count), pool.length);
  return pool.slice(0, actualCount).map((q) => applyOptionShuffle(q, shuffleOptions));
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
