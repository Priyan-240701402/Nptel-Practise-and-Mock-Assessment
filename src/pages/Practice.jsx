import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  COURSES,
  SYLLABUS,
  getCourseTopics,
  selectQuestions,
  saveToStorage,
  loadFromStorage,
  formatTime,
  shuffleArray,
  getModuleQuestions,
  getWeekQuestions
} from '../utils/quizUtils';
import QuestionCard from '../components/QuestionCard';
import QuizControls from '../components/QuizControls';
import ResultSummary from '../components/ResultSummary';
import {
  BookOpen,
  Settings2,
  Clock,
  RotateCcw,
  Home,
  CheckCircle2,
  Filter,
  Layers,
  ArrowLeft,
  ChevronDown,
  Eye,
  ListOrdered,
  CalendarDays,
  Target,
  AlertCircle
} from 'lucide-react';

export default function Practice() {
  const { courseId: paramCourseId } = useParams();
  const navigate = useNavigate();

  // Selected Course
  const [currentCourseId, setCurrentCourseId] = useState(
    paramCourseId && COURSES[paramCourseId] ? paramCourseId : 'entrepreneurship'
  );

  const course = COURSES[currentCourseId] || COURSES.entrepreneurship;
  const availableTopics = useMemo(() => getCourseTopics(currentCourseId), [currentCourseId]);

  // Practice Modes for Entrepreneurship:
  // 'topic' | 'module' | 'weekly' | 'all-course' | 'mixed' | 'incorrect'
  const [practiceMode, setPracticeMode] = useState('topic');
  const [selectedModule, setSelectedModule] = useState(1);
  const [selectedWeek, setSelectedWeek] = useState(1);

  // Practice Configuration State
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [questionCount, setQuestionCount] = useState(10);
  const [feedbackMode, setFeedbackMode] = useState('immediate'); // 'immediate' or 'end'

  // Session State
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isSessionFinished, setIsSessionFinished] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);

  // Active Questions & Answers
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: selectedOptionId }
  const [startTime, setStartTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Filter for review mode (all, incorrect)
  const [reviewFilter, setReviewFilter] = useState('all');

  // Handle course URL param updates
  useEffect(() => {
    if (paramCourseId && COURSES[paramCourseId] && paramCourseId !== currentCourseId) {
      setCurrentCourseId(paramCourseId);
      setSelectedTopic('all');
      setIsSessionActive(false);
      setIsSessionFinished(false);
      setIsReviewMode(false);
    }
  }, [paramCourseId, currentCourseId]);

  // Timer during active session
  useEffect(() => {
    let interval = null;
    if (isSessionActive && !isSessionFinished) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive, isSessionFinished]);

  // Start Practice Session
  const handleStartPractice = () => {
    let selected = [];

    if (currentCourseId === 'entrepreneurship') {
      if (practiceMode === 'weekly') {
        selected = selectQuestions({
          courseId: 'entrepreneurship',
          week: Number(selectedWeek),
          difficulty: selectedDifficulty,
          count: questionCount,
          shuffle: true,
          shuffleOptions: true
        });
      } else if (practiceMode === 'module') {
        selected = selectQuestions({
          courseId: 'entrepreneurship',
          moduleId: Number(selectedModule),
          difficulty: selectedDifficulty,
          count: questionCount,
          shuffle: true,
          shuffleOptions: true
        });
      } else if (practiceMode === 'incorrect') {
        const storedMissed = loadFromStorage(`incorrect_questions_${currentCourseId}`) || [];
        if (!storedMissed.length) {
          alert('No incorrect questions recorded yet! Practise other modes first to generate a missed question set.');
          return;
        }
        let pool = [...storedMissed];
        if (selectedDifficulty !== 'all') {
          pool = pool.filter(q => q.difficulty?.toLowerCase() === selectedDifficulty.toLowerCase());
        }
        if (!pool.length) {
          alert('No incorrect questions matching the selected difficulty level.');
          return;
        }
        const actualCount = questionCount === 'all' ? pool.length : Math.min(Number(questionCount), pool.length);
        selected = shuffleArray(pool).slice(0, actualCount).map(q => ({
          ...q,
          options: shuffleArray([...q.options])
        }));
      } else if (practiceMode === 'all-course') {
        selected = selectQuestions({
          courseId: 'entrepreneurship',
          difficulty: selectedDifficulty,
          count: questionCount,
          shuffle: true,
          shuffleOptions: true
        });
      } else if (practiceMode === 'mixed') {
        selected = selectQuestions({
          courseId: 'entrepreneurship',
          difficulty: selectedDifficulty,
          count: questionCount,
          shuffle: true,
          shuffleOptions: true
        });
      } else {
        // topic-wise
        selected = selectQuestions({
          courseId: 'entrepreneurship',
          topic: selectedTopic,
          difficulty: selectedDifficulty,
          count: questionCount,
          shuffle: true,
          shuffleOptions: true
        });
      }
    } else {
      // LLM Course
      selected = selectQuestions({
        courseId: 'llm',
        topic: selectedTopic,
        difficulty: selectedDifficulty,
        count: questionCount,
        shuffle: true,
        shuffleOptions: true
      });
    }

    if (selected.length === 0) {
      alert('No questions match your selected filters. Please adjust your criteria.');
      return;
    }

    setQuestions(selected);
    setCurrentIndex(0);
    setAnswers({});
    setElapsedSeconds(0);
    setStartTime(Date.now());
    setIsSessionActive(true);
    setIsSessionFinished(false);
    setIsReviewMode(false);
  };

  // Select Option
  const handleSelectOption = (optionId) => {
    if (isSessionFinished && !isReviewMode) return;
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: optionId
    }));
  };

  // Finish Practice Session
  const handleFinishPractice = () => {
    setIsSessionActive(false);
    setIsSessionFinished(true);
    setIsReviewMode(false);

    // Save incorrect questions for "Incorrect-answer practice"
    const missed = questions.filter(q => {
      const chosen = answers[q.id];
      return chosen !== undefined && chosen !== q.correctOptionId;
    });
    if (missed.length > 0) {
      const existing = loadFromStorage(`incorrect_questions_${currentCourseId}`) || [];
      const combined = [...existing];
      missed.forEach(m => {
        if (!combined.some(x => x.id === m.id)) combined.push(m);
      });
      saveToStorage(`incorrect_questions_${currentCourseId}`, combined);
    }
  };

  // Calculate Results
  const results = useMemo(() => {
    if (!questions.length) return null;

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    const topicStats = {};
    const moduleStats = {};

    questions.forEach(q => {
      const chosen = answers[q.id];
      if (q.topic) {
        if (!topicStats[q.topic]) topicStats[q.topic] = { total: 0, correct: 0 };
        topicStats[q.topic].total += 1;
      }
      const modName = q.moduleName || (q.moduleId ? `Module ${q.moduleId}` : null);
      if (modName) {
        if (!moduleStats[modName]) moduleStats[modName] = { total: 0, correct: 0 };
        moduleStats[modName].total += 1;
      }

      if (chosen === undefined || chosen === null) {
        unansweredCount += 1;
      } else if (chosen === q.correctOptionId) {
        correctCount += 1;
        if (q.topic) topicStats[q.topic].correct += 1;
        if (modName) moduleStats[modName].correct += 1;
      } else {
        incorrectCount += 1;
      }
    });

    const totalQuestions = questions.length;
    const score = correctCount;
    const maxScore = totalQuestions;
    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    const topicPerformance = Object.keys(topicStats).map(topName => ({
      topic: topName,
      correct: topicStats[topName].correct,
      total: topicStats[topName].total
    }));

    const modulePerformance = Object.keys(moduleStats).map(mName => ({
      name: mName,
      correct: moduleStats[mName].correct,
      total: moduleStats[mName].total
    }));

    return {
      totalQuestions,
      correctCount,
      incorrectCount,
      unansweredCount,
      score,
      maxScore,
      percentage,
      timeTakenSeconds: elapsedSeconds,
      topicPerformance,
      modulePerformance
    };
  }, [questions, answers, elapsedSeconds]);

  // Review List filtered
  const filteredReviewQuestions = useMemo(() => {
    if (!questions.length) return [];
    if (reviewFilter === 'incorrect') {
      return questions.filter(q => {
        const chosen = answers[q.id];
        return chosen !== undefined && chosen !== q.correctOptionId;
      });
    }
    return questions;
  }, [questions, answers, reviewFilter]);

  // Current Question
  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null;

  // Stored missed questions count
  const missedCount = useMemo(() => {
    const list = loadFromStorage(`incorrect_questions_${currentCourseId}`) || [];
    return list.length;
  }, [currentCourseId, isSessionFinished]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Back button & Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors shadow-xs"
            title="Return to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Practice Mode
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {course.title}
            </h1>
          </div>
        </div>

        {/* Course Switcher */}
        {!isSessionActive && !isSessionFinished && (
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setCurrentCourseId('entrepreneurship');
                setSelectedTopic('all');
                navigate('/practice/entrepreneurship');
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                currentCourseId === 'entrepreneurship'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Entrepreneurship
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentCourseId('llm');
                setSelectedTopic('all');
                navigate('/practice/llm');
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                currentCourseId === 'llm'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              LLMs
            </button>
          </div>
        )}

        {isSessionActive && (
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-mono font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(elapsedSeconds)}</span>
            </div>
            <button
              type="button"
              onClick={handleFinishPractice}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
            >
              End Session
            </button>
          </div>
        )}
      </div>

      {/* 1. CONFIGURATION VIEW */}
      {!isSessionActive && !isSessionFinished && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
            <Settings2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Configure Practice Session</h2>
          </div>

          {/* Practice Mode Selector for Entrepreneurship */}
          {currentCourseId === 'entrepreneurship' && (
            <div className="mb-6 pb-6 border-b border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Practice Mode
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {[
                  { id: 'weekly', label: 'Weekly Assessment', icon: CalendarDays },
                  { id: 'topic', label: 'Topic-Wise', icon: BookOpen },
                  { id: 'module', label: 'Module-Wise', icon: Layers },
                  { id: 'all-course', label: 'All-Course', icon: Target },
                  { id: 'mixed', label: 'Mixed Practice', icon: Filter },
                  { id: 'incorrect', label: `Incorrect (${missedCount})`, icon: AlertCircle }
                ].map((mode) => {
                  const Icon = mode.icon;
                  const isActive = practiceMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setPracticeMode(mode.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                        isActive
                          ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50 bg-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                      <span className={`text-xs font-bold ${isActive ? 'text-blue-900' : 'text-slate-700'}`}>
                        {mode.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contextual Selector based on Practice Mode */}
            {currentCourseId === 'entrepreneurship' && practiceMode === 'weekly' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Week (Weeks 1 – 12)
                </label>
                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((wk) => {
                    const mod = SYLLABUS.weekToModule[String(wk)];
                    return (
                      <option key={wk} value={wk}>
                        Week {wk}: {mod?.moduleName}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {currentCourseId === 'entrepreneurship' && practiceMode === 'module' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Module (Modules 1 – 8)
                </label>
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {SYLLABUS.modules.map((m) => (
                    <option key={m.moduleId} value={m.moduleId}>
                      Module {m.moduleId}: {m.moduleName} (Weeks {m.weeks.join(' & ')})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Topic Select: Shown for LLM or when Entrepreneurship is in topic mode */}
            {(currentCourseId === 'llm' || practiceMode === 'topic') && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Syllabus Topic
                </label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="all">All Syllabus Topics ({course.data?.questions?.length || 100} Questions)</option>
                  {availableTopics.map((topic, i) => (
                    <option key={i} value={topic}>{topic}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Banner for All-Course or Mixed Practice */}
            {currentCourseId === 'entrepreneurship' && (practiceMode === 'all-course' || practiceMode === 'mixed') && (
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900">
                <Target className="w-5 h-5 text-blue-600 shrink-0" />
                <span>
                  {practiceMode === 'all-course'
                    ? 'All-course practice pulls questions systematically across all 8 modules and 12 weekly assessments.'
                    : 'Mixed-question practice draws randomized questions across all verified course modules and difficulty tiers.'}
                </span>
              </div>
            )}

            {/* Banner for Incorrect Answers */}
            {currentCourseId === 'entrepreneurship' && practiceMode === 'incorrect' && (
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  {missedCount > 0
                    ? `You have ${missedCount} recorded incorrect question(s) available to drill.`
                    : 'No incorrect questions saved yet. Complete a practice session or mock test to record missed items.'}
                </span>
              </div>
            )}

            {/* Difficulty Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Question Difficulty
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="all">Mixed (All Difficulties)</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Question Count */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Number of Questions
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 20, 30, 'all'].map((countVal) => (
                  <button
                    key={countVal}
                    type="button"
                    onClick={() => setQuestionCount(countVal)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      questionCount === countVal
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {countVal === 'all' ? 'All' : `${countVal} Qs`}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Mode */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Answer Feedback Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFeedbackMode('immediate')}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    feedbackMode === 'immediate'
                      ? 'bg-blue-50/80 border-blue-500 ring-1 ring-blue-500'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900">Immediate Feedback</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Show answer &amp; explanation right after picking</p>
                </button>

                <button
                  type="button"
                  onClick={() => setFeedbackMode('end')}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    feedbackMode === 'end'
                      ? 'bg-blue-50/80 border-blue-500 ring-1 ring-blue-500'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900">End of Session</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Test yourself first, review all answers at end</p>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-500">
              Questions are shuffled randomly with answers validated against syllabus concepts.
            </span>
            <button
              type="button"
              onClick={handleStartPractice}
              className="w-full sm:w-auto px-7 py-3 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm inline-flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Start Practice Session</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. ACTIVE PRACTICE VIEW */}
      {isSessionActive && currentQuestion && (
        <div>
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            selectedOptionId={currentAnswer}
            onSelectOption={handleSelectOption}
            showFeedback={feedbackMode === 'immediate' && currentAnswer !== null}
            showExplanation={feedbackMode === 'immediate' && currentAnswer !== null}
          />

          <QuizControls
            currentIndex={currentIndex}
            totalQuestions={questions.length}
            onPrevious={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            onNext={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
            onSubmit={handleFinishPractice}
            submitLabel="Finish Practice"
            isSubmitVisible={currentIndex === questions.length - 1}
          />
        </div>
      )}

      {/* 3. SESSION RESULTS / REVIEW VIEW */}
      {isSessionFinished && results && (
        <div className="space-y-8">
          <ResultSummary
            results={results}
            courseId={currentCourseId}
            isMockTest={false}
            onRetake={handleStartPractice}
            onReviewFilter={(filterType) => {
              setIsReviewMode(true);
              setReviewFilter(filterType);
            }}
          />

          {/* Toggle Full Review Button */}
          {!isReviewMode && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsReviewMode(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 transition-colors shadow-xs"
              >
                <Eye className="w-4 h-4 text-blue-600" />
                <span>Review All Questions &amp; Detailed Explanations</span>
              </button>
            </div>
          )}

          {/* Full Question-by-Question Review List */}
          {isReviewMode && (
            <div className="space-y-6 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <ListOrdered className="w-5 h-5 text-blue-600" />
                  <span>Question Review ({filteredReviewQuestions.length})</span>
                </h3>

                <div className="flex items-center gap-2 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setReviewFilter('all')}
                    className={`px-3 py-1.5 rounded-lg border transition-colors ${
                      reviewFilter === 'all'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    All Questions ({questions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewFilter('incorrect')}
                    className={`px-3 py-1.5 rounded-lg border transition-colors ${
                      reviewFilter === 'incorrect'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
                    }`}
                  >
                    Incorrect Only ({results.incorrectCount})
                  </button>
                </div>
              </div>

              {filteredReviewQuestions.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
                  No questions match this review filter.
                </div>
              ) : (
                filteredReviewQuestions.map((q, idx) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    questionNumber={idx + 1}
                    totalQuestions={filteredReviewQuestions.length}
                    selectedOptionId={answers[q.id]}
                    showFeedback={true}
                    showExplanation={true}
                    isReadOnly={true}
                  />
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
