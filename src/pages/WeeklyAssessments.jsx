import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  SYLLABUS,
  getWeekMetadata,
  selectQuestions,
  shuffleArray,
  formatTime,
  saveToStorage
} from "../utils/quizUtils";
import QuestionCard from "../components/QuestionCard";
import QuizControls from "../components/QuizControls";
import ResultSummary from "../components/ResultSummary";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  Info,
  ListOrdered,
  RotateCcw,
  Layers,
  AlertCircle,
  XCircle,
  Home
} from "lucide-react";

// ── Utility: compute results ────────────────────────────────────────────────
function computeResults(questions, answers, elapsedSeconds) {
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;
  const topicStats = {};
  const moduleStats = {};

  questions.forEach((q) => {
    const chosen = answers[q.id];
    if (!topicStats[q.topic]) topicStats[q.topic] = { total: 0, correct: 0 };
    topicStats[q.topic].total += 1;
    const modName = q.moduleName || "";
    if (!moduleStats[modName]) moduleStats[modName] = { total: 0, correct: 0 };
    moduleStats[modName].total += 1;

    if (chosen === undefined || chosen === null) {
      unansweredCount += 1;
    } else if (chosen === q.correctOptionId) {
      correctCount += 1;
      topicStats[q.topic].correct += 1;
      moduleStats[modName].correct += 1;
    } else {
      incorrectCount += 1;
    }
  });

  const totalQuestions = questions.length;
  const score = correctCount;
  const maxScore = totalQuestions;
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const topicPerformance = Object.keys(topicStats).map((t) => ({
    topic: t,
    correct: topicStats[t].correct,
    total: topicStats[t].total
  }));

  const modulePerformance = Object.keys(moduleStats).map((m) => ({
    topic: m,
    correct: moduleStats[m].correct,
    total: moduleStats[m].total
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
}

// ── WeekCard ────────────────────────────────────────────────────────────────
function WeekCard({ weekMeta, onStart }) {
  const { week, moduleName, moduleId, questionCount, assessmentTitle, sourceNote } = weekMeta;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0">
            W{week}
          </div>
          <div>
            <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
              Module {moduleId}
            </p>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">{assessmentTitle}</h3>
          </div>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
            questionCount > 0
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-slate-50 text-slate-500 border-slate-200"
          }`}
        >
          {questionCount} Qs
        </span>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{moduleName}</p>

      {questionCount === 0 ? (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-600" />
          <span>Assessment questions not yet imported. Official questions require NPTEL login.</span>
        </div>
      ) : (
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
          <Info className="w-3 h-3 mt-0.5 shrink-0" />
          <span className="line-clamp-2">{sourceNote}</span>
        </div>
      )}

      <button
        type="button"
        disabled={questionCount === 0}
        onClick={() => onStart(week)}
        className={`w-full py-2.5 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 transition-colors ${
          questionCount > 0
            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
        }`}
      >
        <BookOpen className="w-3.5 h-3.5" />
        {questionCount > 0 ? "Start Practice" : "Not Available"}
      </button>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function WeeklyAssessments() {
  const navigate = useNavigate();

  // View states: 'browse' | 'active' | 'finished' | 'review'
  const [view, setView] = useState("browse");
  const [activeWeek, setActiveWeek] = useState(null);

  // Session state
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerRef, setTimerRef] = useState(null);
  const [feedbackMode, setFeedbackMode] = useState("immediate");
  const [reviewFilter, setReviewFilter] = useState("all");
  const [isReviewMode, setIsReviewMode] = useState(false);

  // All week metadata
  const allWeeks = useMemo(
    () => Array.from({ length: 12 }, (_, i) => getWeekMetadata(i + 1)),
    []
  );

  const activeWeekMeta = activeWeek ? getWeekMetadata(activeWeek) : null;

  // Timer management
  function startTimer() {
    const id = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    setTimerRef(id);
  }
  function stopTimer() {
    if (timerRef) clearInterval(timerRef);
    setTimerRef(null);
  }

  // Start practice session for a week
  function handleStartWeek(weekNum) {
    const qs = selectQuestions({
      courseId: "entrepreneurship",
      week: weekNum,
      count: "all",
      shuffle: true,
      shuffleOptions: true
    });
    if (!qs.length) return;
    stopTimer();
    setActiveWeek(weekNum);
    setQuestions(qs);
    setCurrentIndex(0);
    setAnswers({});
    setElapsedSeconds(0);
    setIsReviewMode(false);
    setView("active");
    startTimer();
  }

  // Handle answer selection
  function handleSelect(optionId) {
    const q = questions[currentIndex];
    if (!q) return;
    setAnswers((prev) => ({ ...prev, [q.id]: optionId }));
  }

  // Finish session
  function handleFinish() {
    stopTimer();
    setView("finished");
    setIsReviewMode(false);
  }

  // Go back to browse
  function handleBackToBrowse() {
    stopTimer();
    setView("browse");
    setActiveWeek(null);
  }

  // Computed results
  const results = useMemo(() => {
    if (!questions.length) return null;
    return computeResults(questions, answers, elapsedSeconds);
  }, [questions, answers, elapsedSeconds]);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null;

  // Filtered review questions
  const filteredReview = useMemo(() => {
    if (!questions.length) return [];
    if (reviewFilter === "incorrect") {
      return questions.filter((q) => {
        const chosen = answers[q.id];
        return chosen !== undefined && chosen !== q.correctOptionId;
      });
    }
    return questions;
  }, [questions, answers, reviewFilter]);

  // ── BROWSE VIEW ─────────────────────────────────────────────────────────
  if (view === "browse") {
    const totalAvail = allWeeks.reduce((s, w) => s + w.questionCount, 0);
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
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
                Foundations of Entrepreneurship
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Weekly Assessments Practice
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 font-semibold flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" />
              12 Weeks • 8 Modules
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {totalAvail} Questions Available
            </div>
          </div>
        </div>

        {/* Info banner */}
        <div className="mb-8 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-900 flex gap-3">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold mb-1">About these questions</p>
            <p className="text-xs leading-relaxed">
              The official NPTEL weekly assessments for noc26_mg80 require login at{" "}
              <a
                href="https://onlinecourses.nptel.ac.in/e-learning/course/noc26_mg80"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-amber-700"
              >
                onlinecourses.nptel.ac.in
              </a>{" "}
              and cannot be retrieved automatically. The questions below are{" "}
              <strong>original practice questions</strong> covering each week&apos;s syllabus topics.
              They are clearly labelled as practice questions — not official NPTEL assessment questions.
            </p>
          </div>
        </div>

        {/* Module sections */}
        {SYLLABUS.modules.map((mod) => {
          const modWeeks = allWeeks.filter((w) => mod.weeks.includes(w.week));
          return (
            <div key={mod.moduleId} className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black shrink-0">
                  {mod.moduleId}
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">{mod.moduleName}</h2>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  Week{mod.weeks.length > 1 ? "s" : ""} {mod.weeks.join(" & ")}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {modWeeks.map((wm) => (
                  <WeekCard key={wm.week} weekMeta={wm} onStart={handleStartWeek} />
                ))}
              </div>
            </div>
          );
        })}

        {/* Quick links */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap gap-3">
          <Link
            to="/practice/entrepreneurship"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Layers className="w-4 h-4 text-blue-600" />
            Topic-wise Practice
          </Link>
          <Link
            to="/mock-test/entrepreneurship"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Clock className="w-4 h-4" />
            Mock Examination
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // ── ACTIVE PRACTICE VIEW ─────────────────────────────────────────────────
  if (view === "active" && currentQuestion) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBackToBrowse}
              className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Week {activeWeek} Assessment Practice
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                {activeWeekMeta?.moduleName}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-mono font-bold">
              <Clock className="w-3.5 h-3.5" />
              {formatTime(elapsedSeconds)}
            </div>
            <button
              type="button"
              onClick={handleFinish}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
            >
              End Session
            </button>
          </div>
        </div>

        <QuestionCard
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          selectedOptionId={currentAnswer}
          onSelectOption={handleSelect}
          showFeedback={feedbackMode === "immediate" && currentAnswer !== null}
          showExplanation={feedbackMode === "immediate" && currentAnswer !== null}
        />

        <QuizControls
          currentIndex={currentIndex}
          totalQuestions={questions.length}
          onPrevious={() => setCurrentIndex((p) => Math.max(0, p - 1))}
          onNext={() => setCurrentIndex((p) => Math.min(questions.length - 1, p + 1))}
          onSubmit={handleFinish}
          submitLabel="Finish Practice"
          isSubmitVisible={currentIndex === questions.length - 1}
        />
      </div>
    );
  }

  // ── FINISHED / RESULTS VIEW ─────────────────────────────────────────────
  if ((view === "finished") && results) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Back / header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
          <button
            type="button"
            onClick={handleBackToBrowse}
            className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Week {activeWeek} Results
            </span>
            <h1 className="text-xl font-bold text-slate-900">{activeWeekMeta?.moduleName}</h1>
          </div>
        </div>

        <ResultSummary
          results={results}
          courseId="entrepreneurship"
          isMockTest={false}
          onRetake={() => handleStartWeek(activeWeek)}
          onReviewFilter={(f) => {
            setIsReviewMode(true);
            setReviewFilter(f);
          }}
        />

        {/* Review button */}
        {!isReviewMode && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsReviewMode(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Eye className="w-4 h-4 text-blue-600" />
              Review All Questions & Explanations
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleStartWeek(activeWeek)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            <RotateCcw className="w-4 h-4" />
            Retry This Week
          </button>
          <button
            type="button"
            onClick={handleBackToBrowse}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <CalendarDays className="w-4 h-4" />
            All Weeks
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors ml-auto"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>

        {/* Review panel */}
        {isReviewMode && (
          <div className="space-y-6 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-blue-600" />
                Question Review ({filteredReview.length})
              </h3>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setReviewFilter("all")}
                  className={`px-3 py-1.5 rounded-lg border transition-colors ${
                    reviewFilter === "all"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  All ({questions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setReviewFilter("incorrect")}
                  className={`px-3 py-1.5 rounded-lg border transition-colors ${
                    reviewFilter === "incorrect"
                      ? "bg-rose-600 text-white border-rose-600"
                      : "bg-white text-rose-700 border-rose-200 hover:bg-rose-50"
                  }`}
                >
                  Incorrect ({results.incorrectCount})
                </button>
              </div>
            </div>

            {filteredReview.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
                No questions match this review filter.
              </div>
            ) : (
              filteredReview.map((q, idx) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  questionNumber={idx + 1}
                  totalQuestions={filteredReview.length}
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
    );
  }

  // Fallback
  return null;
}
