import React from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Send } from 'lucide-react';

export default function QuizControls({
  currentIndex,
  totalQuestions,
  onPrevious,
  onNext,
  onSubmit,
  submitLabel = 'Submit Test',
  isSubmitVisible = true,
  canGoNext = true,
  canGoPrevious = true
}) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 mt-5">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center text-xs font-medium text-slate-500 mb-1.5">
          <span>Progress: Question {currentIndex + 1} of {totalQuestions}</span>
          <span className="font-semibold text-blue-700">{progressPercent}% Completed</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isFirst || !canGoPrevious}
          className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-medium text-sm border transition-colors ${
            isFirst || !canGoPrevious
              ? 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed opacity-60'
              : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-2.5">
          {!isLast && (
            <button
              type="button"
              onClick={onNext}
              disabled={!canGoNext}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-xs"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {(isLast || isSubmitVisible) && (
            <button
              type="button"
              onClick={onSubmit}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-semibold text-sm bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-xs"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{submitLabel}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
