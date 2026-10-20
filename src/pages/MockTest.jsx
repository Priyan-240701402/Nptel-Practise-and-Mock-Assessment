import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  COURSES,
  SYLLABUS,
  selectQuestions,
  selectFullCourseQuestions,
  selectMixedModuleQuestions,
  saveToStorage,
  loadFromStorage,
  formatTime
} from '../utils/quizUtils';
import QuestionCard from '../components/QuestionCard';
import Timer from '../components/Timer';
import {
  Clock,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Send,
  ArrowLeft,
  Layers,
  ShieldAlert,
  CalendarDays,
  Target,
  Filter
} from 'lucide-react';

const TEST_CONFIGS = [
  {
    id: 'short',
    name: 'Short Practice Test',
    questionsCount: 16,
    durationMinutes: 20,
    description: 'Quick check of core concepts under timed exam conditions.'
  },
  {
    id: 'standard',
    name: 'Standard Practice Test',
    questionsCount: 32,
    durationMinutes: 40,
    description: 'Balanced full-spectrum test across multiple syllabus modules.'
  },
  {
    id: 'full',
    name: 'Full Practice Mock Exam',
    questionsCount: 48,
    durationMinutes: 60,
    description: 'Comprehensive practice examination evenly covering all syllabus modules.'
  }
];

export default function MockTest() {
  const { courseId: paramCourseId } = useParams();
  const navigate = useNavigate();

  const [currentCourseId, setCurrentCourseId] = useState(
    paramCourseId && COURSES[paramCourseId] ? paramCourseId : 'entrepreneurship'
  );

  const course = COURSES[currentCourseId] || COURSES.entrepreneurship;
  const availableCount = course.data?.questions?.length || 180;

  // Configuration state
  const [selectedConfigId, setSelectedConfigId] = useState('short');
  const [isTestActive, setIsTestActive] = useState(false);

  // Entrepreneurship Mock Test Scopes:
  // 'full' | 'mixed' | 'module' | 'weekly'
  const [mockScope, setMockScope] = useState('full');
  const [selectedModule, setSelectedModule] = useState(1);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedMixedModules, setSelectedMixedModules] = useState([1, 2, 3, 4]);

  // Active Test State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [qId]: optionId }
  const [markedForReview, setMarkedForReview] = useState({}); // { [qId]: boolean }
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(0);
  const [totalTimeSeconds, setTotalTimeSeconds] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Auto-submit guard to prevent multiple submissions
  const isSubmittedRef = useRef(false);

  // Selected config details
  const activeConfig = TEST_CONFIGS.find(c => c.id === selectedConfigId) || TEST_CONFIGS[0];

  // Start Test
  const handleStartTest = () => {
    let selected = [];

    if (currentCourseId === 'entrepreneurship') {
      if (mockScope === 'full') {
        selected = selectFullCourseQuestions({
          count: activeConfig.questionsCount,
          shuffle: true,
          shuffleOptions: true
        });
      } else if (mockScope === 'mixed') {
        selected = selectMixedModuleQuestions({
          moduleIds: selectedMixedModules,
          count: activeConfig.questionsCount,
          shuffle: true,
          shuffleOptions: true
        });
      } else if (mockScope === 'module') {
        selected = selectQuestions({
          courseId: 'entrepreneurship',
          moduleId: Number(selectedModule),
          count: activeConfig.questionsCount,
          shuffle: true,
          shuffleOptions: true
        });
      } else if (mockScope === 'weekly') {
        selected = selectQuestions({
          courseId: 'entrepreneurship',
          week: Number(selectedWeek),
          count: activeConfig.questionsCount,
          shuffle: true,
          shuffleOptions: true
        });
      }
    } else {
      // LLM Course
      selected = selectQuestions({
        courseId: 'llm',
        count: activeConfig.questionsCount,
        shuffle: true,
        shuffleOptions: true
      });
    }

    if (selected.length === 0) {
      alert('Unable to load questions for this test configuration.');
      return;
    }

    const testDurationSecs = activeConfig.durationMinutes * 60;
    setQuestions(selected);
    setCurrentIndex(0);
    setAnswers({});
    setMarkedForReview({});
    setTotalTimeSeconds(testDurationSecs);
    setTimeRemainingSeconds(testDurationSecs);
    isSubmittedRef.current = false;
    setIsTestActive(true);
  };

  // Option select
  const handleSelectOption = (optionId) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: optionId
    }));
  };

  // Toggle mark for review
  const handleToggleMark = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setMarkedForReview(prev => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id]
    }));
  };

  // Submit Test Function
  const handleSubmitTest = (wasAutoSubmit = false) => {
    if (isSubmittedRef.current) return;
    isSubmittedRef.current = true;

    // Time spent
    const timeSpent = totalTimeSeconds - timeRemainingSeconds;

    // Calculate score
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    const topicStats = {};
    const moduleStats = {};

    questions.forEach(q => {
      const chosen = answers[q.id];
      if (q.topic) {
        if (!topicStats[q.topic]) {
          topicStats[q.topic] = { total: 0, correct: 0 };
        }
        topicStats[q.topic].total += 1;
      }
      const modName = q.moduleName || (q.moduleId ? `Module ${q.moduleId}` : null);
      if (modName) {
        if (!moduleStats[modName]) {
          moduleStats[modName] = { total: 0, correct: 0 };
        }
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

    const topicPerformance = Object.keys(topicStats).map(tName => ({
      topic: tName,
      correct: topicStats[tName].correct,
      total: topicStats[tName].total
    }));

    const modulePerformance = Object.keys(moduleStats).map(mName => ({
      name: mName,
      correct: moduleStats[mName].correct,
      total: moduleStats[mName].total
    }));

    // Save incorrect questions for targeted practice
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

    let configDisplayName = activeConfig.name;
    if (currentCourseId === 'entrepreneurship') {
      if (mockScope === 'full') configDisplayName = `Full-Course Practice Mock (${activeConfig.questionsCount} Qs)`;
      else if (mockScope === 'mixed') configDisplayName = `Mixed-Module Practice Mock (${selectedMixedModules.length} Modules)`;
      else if (mockScope === 'module') configDisplayName = `Module ${selectedModule} Practice Mock`;
      else if (mockScope === 'weekly') configDisplayName = `Week ${selectedWeek} Assessment Practice Mock`;
    }

    const resultPayload = {
      courseId: currentCourseId,
      courseTitle: course.title,
      configName: configDisplayName,
      questions,
      answers,
      markedForReview,
      totalQuestions,
      correctCount,
      incorrectCount,
      unansweredCount,
      score,
      maxScore,
      percentage,
      timeTakenSeconds: timeSpent,
      wasAutoSubmit,
      topicPerformance,
      modulePerformance,
      submittedAt: new Date().toISOString()
    };

    // Save to local storage for persistence
    saveToStorage('latest_mock_result', resultPayload);

    // Save best score
    const bestScoreKey = `best_score_${currentCourseId}`;
    const previousBest = Number(localStorage.getItem(bestScoreKey) || 0);
    if (percentage > previousBest) {
      saveToStorage(bestScoreKey, percentage);
    }

    // Navigate to results view with payload in session/router
    navigate(`/results/${currentCourseId}`, { state: { results: resultPayload } });
  };

  // Auto-submit when time expires
  const handleTimeUp = () => {
    if (!isSubmittedRef.current) {
      handleSubmitTest(true);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;
  const markedCount = Object.values(markedForReview).filter(Boolean).length;
  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 1. SETUP / CONFIGURATION VIEW */}
      {!isTestActive && (
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Link
              to="/"
              className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Timed Examination
              </span>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Mock Examination Setup
              </h1>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
            {/* Course Selector Tabs */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Course
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentCourseId('entrepreneurship')}
                  className={`p-4 rounded-xl text-left border transition-all ${
                    currentCourseId === 'entrepreneurship'
                      ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-bold text-sm text-slate-900">Foundations of Entrepreneurship</p>
                  <p className="text-xs text-slate-500 mt-1">180 Official Assignment Questions • 12 Weeks • 8 Modules</p>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentCourseId('llm')}
                  className={`p-4 rounded-xl text-left border transition-all ${
                    currentCourseId === 'llm'
                      ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-bold text-sm text-slate-900">Intro to Large Language Models</p>
                  <p className="text-xs text-slate-500 mt-1">200 Verified MCQs • 12 Weeks • All Concepts</p>
                </button>
              </div>
            </div>

            {/* Scope Selection for Entrepreneurship */}
            {currentCourseId === 'entrepreneurship' && (
              <div className="mb-8 pb-8 border-b border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  Mock Examination Scope
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                  {[
                    {
                      id: 'full',
                      title: 'Full-Course Mock Test',
                      desc: 'Even distribution across all 8 modules',
                      icon: Target
                    },
                    {
                      id: 'mixed',
                      title: 'Mixed-Module Mock',
                      desc: 'Custom multi-module selection',
                      icon: Filter
                    },
                    {
                      id: 'module',
                      title: 'Module Mock Test',
                      desc: 'Deep focus on a single module',
                      icon: Layers
                    },
                    {
                      id: 'weekly',
                      title: 'Weekly Assessment',
                      desc: 'Timed practice for 1 selected week',
                      icon: CalendarDays
                    }
                  ].map(s => {
                    const Icon = s.icon;
                    const isSelected = mockScope === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setMockScope(s.id)}
                        className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600 shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                          <span className={`text-xs font-bold ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                            {s.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight">{s.desc}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Sub-selectors for Mixed, Module, or Weekly scope */}
                {mockScope === 'module' && (
                  <div className="mt-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Select Module for Mock Test:
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

                {mockScope === 'weekly' && (
                  <div className="mt-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Select Week for Timed Assessment Practice:
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
                            Week {wk} Assessment: {mod?.moduleName}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {mockScope === 'mixed' && (
                  <div className="mt-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Choose Modules to Include (Select at least 2):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {SYLLABUS.modules.map((m) => {
                        const isChecked = selectedMixedModules.includes(m.moduleId);
                        return (
                          <label
                            key={m.moduleId}
                            className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-blue-50/70 border-blue-300 text-blue-900 font-semibold'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedMixedModules((prev) => [...prev, m.moduleId]);
                                } else if (selectedMixedModules.length > 1) {
                                  setSelectedMixedModules((prev) => prev.filter((id) => id !== m.moduleId));
                                }
                              }}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span>M{m.moduleId}: {m.moduleName}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Test Length Options */}
            <div className="mb-8">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Test Configuration
              </label>
              <div className="space-y-3">
                {TEST_CONFIGS.map(config => {
                  const isDisabled = config.questionsCount > availableCount;
                  const isSelected = selectedConfigId === config.id;

                  return (
                    <button
                      key={config.id}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => setSelectedConfigId(config.id)}
                      className={`w-full p-4 rounded-xl border text-left transition-all flex items-start justify-between gap-4 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                          : isDisabled
                          ? 'opacity-40 bg-slate-50 cursor-not-allowed border-slate-200'
                          : 'border-slate-200 hover:bg-slate-50/70 bg-white'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm sm:text-base">{config.name}</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {config.questionsCount} Questions
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{config.description}</p>
                      </div>

                      <div className="flex items-center gap-1.5 text-blue-700 font-mono font-bold text-sm shrink-0 bg-blue-100/70 px-3 py-1.5 rounded-lg">
                        <Clock className="w-4 h-4" />
                        <span>{config.durationMinutes} Mins</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Exam rules note */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5 mb-8">
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                Examination Rules:
              </p>
              <p>• Correct answers and explanations are hidden until submission to simulate authentic test environments.</p>
              <p>• You can jump between questions and change your answers at any point using the navigation panel.</p>
              <p>• When the timer expires, the test will automatically submit your recorded answers.</p>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleStartTest}
                className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm inline-flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4" />
                <span>Begin Timed Mock Test</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. ACTIVE MOCK TEST INTERFACE */}
      {isTestActive && currentQuestion && (
        <div>
          {/* Top Bar: Title & Timer */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                {course.title} • {activeConfig.name}
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Question {currentIndex + 1} of {questions.length}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <Timer
                initialSeconds={totalTimeSeconds}
                onTimeUp={handleTimeUp}
                isActive={isTestActive}
              />
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
              >
                Submit Test
              </button>
            </div>
          </div>

          {/* Main 2-Column Layout: Question Card on Left, Navigation Grid on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Left 3 Columns: Active Question */}
            <div className="lg:col-span-3 space-y-5">
              <QuestionCard
                question={currentQuestion}
                questionNumber={currentIndex + 1}
                totalQuestions={questions.length}
                selectedOptionId={answers[currentQuestion.id]}
                onSelectOption={handleSelectOption}
                isMarkedForReview={!!markedForReview[currentQuestion.id]}
                onToggleMarkForReview={handleToggleMark}
                showFeedback={false} // Strictly hide answers during test!
                showExplanation={false}
              />

              {/* Prev / Next controls */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between shadow-xs">
                <button
                  type="button"
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                    currentIndex === 0
                      ? 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed opacity-60'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-3">
                  {currentIndex < questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowConfirmModal(true)}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                    >
                      <span>Review &amp; Submit</span>
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Question Navigation Grid */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs sticky top-20">
              <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Question Palette</span>
                <span className="text-xs font-medium text-slate-500">
                  {answeredCount}/{questions.length} answered
                </span>
              </h3>

              {/* Status Legend */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-slate-200 border border-slate-300"></span>
                  <span>Unanswered ({unansweredCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                  <span>Review ({markedCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full border-2 border-blue-600 bg-white"></span>
                  <span>Current</span>
                </div>
              </div>

              {/* Number Badges Grid */}
              <div className="grid grid-cols-5 gap-2 max-h-[380px] overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isAnswered = answers[q.id] !== undefined;
                  const isMarked = !!markedForReview[q.id];

                  let btnStyle = 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200';
                  if (isMarked) {
                    btnStyle = 'bg-amber-100 text-amber-900 border-amber-400 font-bold';
                  } else if (isAnswered) {
                    btnStyle = 'bg-blue-600 text-white border-blue-600 font-bold';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-9 rounded-lg text-xs font-medium border flex items-center justify-center transition-all relative ${btnStyle} ${
                        isCurrent ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                      }`}
                    >
                      <span>{idx + 1}</span>
                      {isMarked && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  Submit Mock Test
                </button>
              </div>
            </div>
          </div>

          {/* Submission Confirmation Modal */}
          {showConfirmModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center gap-3 mb-4 text-slate-900">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg leading-tight">Submit Examination?</h4>
                    <p className="text-xs text-slate-500">Are you sure you want to finish your test?</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-xs text-slate-600 mb-6 border border-slate-200">
                  <div className="flex justify-between">
                    <span>Total Questions:</span>
                    <strong className="text-slate-900">{questions.length}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Answered Questions:</span>
                    <strong className="text-blue-700">{answeredCount}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Unanswered Questions:</span>
                    <strong className="text-rose-700">{unansweredCount}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Marked for Review:</span>
                    <strong className="text-amber-700">{markedCount}</strong>
                  </div>
                </div>

                {unansweredCount > 0 && (
                  <p className="text-xs text-amber-700 mb-6 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    Warning: You still have <strong>{unansweredCount}</strong> unanswered questions. Unanswered questions receive zero marks.
                  </p>
                )}

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Resume Test
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmModal(false);
                      handleSubmitTest(false);
                    }}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    Confirm &amp; Submit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
