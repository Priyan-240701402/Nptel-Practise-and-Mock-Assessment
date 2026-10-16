import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate, Link } from 'react-router-dom';
import { COURSES, loadFromStorage, formatTime } from '../utils/quizUtils';
import ResultSummary from '../components/ResultSummary';
import QuestionCard from '../components/QuestionCard';
import {
  Award,
  RotateCcw,
  BookOpen,
  Home,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Filter,
  Eye,
  ListFilter
} from 'lucide-react';

export default function Results() {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Try reading results from router location state, fallback to localStorage
  const [results, setResults] = useState(() => {
    if (location.state?.results) {
      return location.state.results;
    }
    const saved = loadFromStorage('latest_mock_result');
    if (saved && (!courseId || saved.courseId === courseId)) {
      return saved;
    }
    return null;
  });

  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'incorrect', 'marked'

  useEffect(() => {
    if (!results) {
      const saved = loadFromStorage('latest_mock_result');
      if (saved) {
        setResults(saved);
      }
    }
  }, [results]);

  if (!results) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
          <Award className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">No Test Results Found</h2>
        <p className="text-slate-600 text-sm mb-6">
          You haven't submitted any mock tests yet in this session. Take a mock test or start practising questions!
        </p>
        <div className="flex justify-center gap-3">
          <Link
            to="/"
            className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            Go to Course Home
          </Link>
        </div>
      </div>
    );
  }

  const course = COURSES[results.courseId] || COURSES.entrepreneurship;

  // Filter questions for review
  const filteredQuestions = (results.questions || []).filter((q) => {
    const studentAnswer = results.answers?.[q.id];
    const isCorrect = studentAnswer === q.correctOptionId;
    const isMarked = !!results.markedForReview?.[q.id];

    if (activeFilter === 'incorrect') {
      return !isCorrect;
    }
    if (activeFilter === 'marked') {
      return isMarked;
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Top Breadcrumb & Course Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {results.configName || 'Mock Examination'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            {results.courseTitle || course.title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/mock-test/${results.courseId}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Test</span>
          </Link>
          <Link
            to={`/practice/${results.courseId}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white text-blue-700 border border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span>Practise Topics</span>
          </Link>
        </div>
      </div>

      {/* Main Result Summary Metrics */}
      <ResultSummary
        results={results}
        courseId={results.courseId}
        isMockTest={true}
        onRetake={() => navigate(`/mock-test/${results.courseId}`)}
        onReviewFilter={(filter) => setActiveFilter(filter)}
      />

      {/* Detailed Answer Review Section */}
      <div className="pt-4 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <span>Comprehensive Answer Review</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review syllabus references, correct answer explanations, and your submitted selections.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                activeFilter === 'all'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Questions ({results.totalQuestions})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('incorrect')}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                activeFilter === 'incorrect'
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
              }`}
            >
              Incorrect / Missed ({results.incorrectCount + results.unansweredCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('marked')}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                activeFilter === 'marked'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50'
              }`}
            >
              Marked for Review ({Object.values(results.markedForReview || {}).filter(Boolean).length})
            </button>
          </div>
        </div>

        {/* Question Review Cards List */}
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
            No questions match this review category.
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const studentOptionId = results.answers?.[q.id];
            const isMarked = !!results.markedForReview?.[q.id];

            return (
              <div key={q.id} className="relative">
                <QuestionCard
                  question={q}
                  questionNumber={idx + 1}
                  totalQuestions={filteredQuestions.length}
                  selectedOptionId={studentOptionId}
                  isMarkedForReview={isMarked}
                  showFeedback={true}
                  showExplanation={true}
                  isReadOnly={true}
                />
              </div>
            );
          })
        )}
      </div>

      {/* Footer Navigation Buttons */}
      <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to={`/practice/${results.courseId}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span>Practise Weak Topics</span>
          </Link>
          <Link
            to={`/mock-test/${results.courseId}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Mock Test</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
