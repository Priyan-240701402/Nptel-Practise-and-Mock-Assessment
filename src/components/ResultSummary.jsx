import React from 'react';
import { Award, CheckCircle2, XCircle, HelpCircle, Clock, RotateCcw, Home, Eye, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatTime } from '../utils/quizUtils';

export default function ResultSummary({
  results,
  courseId,
  isMockTest = false,
  onRetake,
  onReviewFilter
}) {
  const {
    totalQuestions,
    correctCount,
    incorrectCount,
    unansweredCount,
    score,
    maxScore,
    percentage,
    timeTakenSeconds,
    topicPerformance = []
  } = results;

  // Grade classification
  let gradeBadge = { text: 'Needs Improvement', color: 'bg-rose-100 text-rose-800 border-rose-200' };
  if (percentage >= 80) {
    gradeBadge = { text: 'Excellent! Ready for Exam', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  } else if (percentage >= 60) {
    gradeBadge = { text: 'Good Effort! Keep Practising', color: 'bg-blue-100 text-blue-800 border-blue-200' };
  } else if (percentage >= 40) {
    gradeBadge = { text: 'Average Score', color: 'bg-amber-100 text-amber-800 border-amber-200' };
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Score Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="text-center md:text-left">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 border ${gradeBadge.color}`}>
              <Award className="w-3.5 h-3.5" />
              <span>{gradeBadge.text}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isMockTest ? 'Mock Examination Result' : 'Practice Session Summary'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Performance analysis calculated using standard NPTEL single-mark scoring.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-blue-50/80 px-6 py-4 rounded-2xl border border-blue-100">
            <div className="text-center">
              <span className="text-xs uppercase font-bold text-blue-600 tracking-wider">Total Score</span>
              <div className="text-3xl sm:text-4xl font-black text-blue-900">
                {score} <span className="text-xl font-medium text-blue-600">/ {maxScore}</span>
              </div>
            </div>
            <div className="h-10 w-px bg-blue-200"></div>
            <div className="text-center">
              <span className="text-xs uppercase font-bold text-blue-600 tracking-wider">Percentage</span>
              <div className="text-3xl sm:text-4xl font-black text-blue-700">
                {percentage}%
              </div>
            </div>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Correct</p>
              <p className="text-xl font-extrabold text-emerald-800">{correctCount}</p>
            </div>
          </div>

          <div className="bg-rose-50/70 border border-rose-100 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Incorrect</p>
              <p className="text-xl font-extrabold text-rose-800">{incorrectCount}</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Unanswered</p>
              <p className="text-xl font-extrabold text-slate-800">{unansweredCount}</p>
            </div>
          </div>

          <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Time Taken</p>
              <p className="text-xl font-extrabold text-blue-900">{formatTime(timeTakenSeconds)}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 mt-8 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={onRetake}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-xs"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isMockTest ? 'Take Another Mock Test' : 'Practise Again'}</span>
          </button>

          {onReviewFilter && (
            <button
              type="button"
              onClick={() => onReviewFilter('all')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <Eye className="w-4 h-4 text-blue-600" />
              <span>Review Answers</span>
            </button>
          )}

          {incorrectCount > 0 && onReviewFilter && (
            <button
              type="button"
              onClick={() => onReviewFilter('incorrect')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              <span>Practise Incorrect Questions ({incorrectCount})</span>
            </button>
          )}

          <Link
            to={courseId ? `/practice/${courseId}` : '/'}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors ml-auto"
          >
            <Home className="w-4 h-4" />
            <span>Return to Course</span>
          </Link>
        </div>
      </div>

      {/* Module-Wise Performance Breakdown */}
      {results.modulePerformance && results.modulePerformance.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span>Module-wise Performance Breakdown</span>
          </h3>

          <div className="space-y-4">
            {results.modulePerformance.map((item, index) => {
              const pct = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
              let barColor = 'bg-blue-600';
              if (pct >= 75) barColor = 'bg-emerald-500';
              else if (pct < 50) barColor = 'bg-amber-500';

              return (
                <div key={index} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="font-semibold text-slate-800 truncate pr-2">{item.topic || item.name}</span>
                    <span className="text-slate-600 font-mono text-xs shrink-0">
                      {item.correct} / {item.total} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Topic-Wise Performance Breakdown */}
      {topicPerformance.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span>Topic-wise Performance Breakdown</span>
          </h3>

          <div className="space-y-4">
            {topicPerformance.map((topicItem, index) => {
              const topicPct = topicItem.total > 0 ? Math.round((topicItem.correct / topicItem.total) * 100) : 0;
              let barColor = 'bg-blue-600';
              if (topicPct >= 75) barColor = 'bg-emerald-500';
              else if (topicPct < 50) barColor = 'bg-amber-500';

              return (
                <div key={index} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="font-semibold text-slate-800 truncate pr-2">{topicItem.topic}</span>
                    <span className="text-slate-600 font-mono text-xs shrink-0">
                      {topicItem.correct} / {topicItem.total} ({topicPct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-300`}
                      style={{ width: `${topicPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
