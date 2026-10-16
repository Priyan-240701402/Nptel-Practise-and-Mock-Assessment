import React from 'react';
import { CheckCircle2, XCircle, Bookmark, BookmarkCheck, HelpCircle, Info } from 'lucide-react';

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedOptionId,
  onSelectOption,
  isMarkedForReview,
  onToggleMarkForReview,
  showFeedback = false, // When true, highlights correct/incorrect answers
  showExplanation = false,
  isReadOnly = false
}) {
  if (!question) return null;

  const getDifficultyBadge = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'hard':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const isAnswered = selectedOptionId !== null && selectedOptionId !== undefined;
  const isCorrect = isAnswered && selectedOptionId === question.correctOptionId;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-7">
      {/* Question Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white tracking-wide">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            {question.topic}
          </span>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${getDifficultyBadge(question.difficulty)}`}>
            {question.difficulty}
          </span>
        </div>

        {onToggleMarkForReview && (
          <button
            type="button"
            onClick={onToggleMarkForReview}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              isMarkedForReview
                ? 'bg-amber-100 text-amber-800 border border-amber-300 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
            title="Mark this question to review later before submitting"
          >
            {isMarkedForReview ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 text-amber-700 fill-amber-700" />
                <span>Marked for Review</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                <span>Mark for Review</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Question Text */}
      <div className="mb-6">
        <h4 className="text-base sm:text-lg font-semibold text-slate-900 leading-snug">
          {question.question}
        </h4>
      </div>

      {/* Options List */}
      <div className="space-y-3 mb-6" role="radiogroup" aria-label="Answer options">
        {question.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const isOptionCorrect = option.id === question.correctOptionId;

          let optionStyle = 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-slate-800 bg-white';
          let badgeStyle = 'bg-slate-100 text-slate-600 border-slate-300';
          let statusIcon = null;

          if (showFeedback) {
            if (isOptionCorrect) {
              optionStyle = 'border-emerald-500 bg-emerald-50/80 text-emerald-950 ring-1 ring-emerald-500';
              badgeStyle = 'bg-emerald-600 text-white border-emerald-600 font-bold';
              statusIcon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 ml-auto" />;
            } else if (isSelected && !isOptionCorrect) {
              optionStyle = 'border-rose-400 bg-rose-50/80 text-rose-950 ring-1 ring-rose-400';
              badgeStyle = 'bg-rose-600 text-white border-rose-600 font-bold';
              statusIcon = <XCircle className="w-5 h-5 text-rose-600 shrink-0 ml-auto" />;
            } else {
              optionStyle = 'border-slate-200 bg-slate-50/50 text-slate-500 opacity-75';
            }
          } else if (isSelected) {
            optionStyle = 'border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-500/30';
            badgeStyle = 'bg-blue-600 text-white border-blue-600 font-bold';
          }

          return (
            <button
              key={option.id}
              type="button"
              disabled={isReadOnly}
              onClick={() => onSelectOption && onSelectOption(option.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 text-sm sm:text-base ${optionStyle} ${
                isReadOnly ? 'cursor-default' : 'cursor-pointer'
              }`}
            >
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 border ${badgeStyle}`}>
                {option.id}
              </span>
              <span className="flex-1 pt-0.5 leading-relaxed">{option.text}</span>
              {statusIcon}
            </button>
          );
        })}
      </div>

      {/* Explanation Section */}
      {showExplanation && (
        <div className="mt-5 p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 mb-2 text-slate-900 font-semibold text-sm">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Explanation & Syllabus Reference:</span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">
            {question.explanation}
          </p>
          <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <span>Verified Course Topic: <strong className="text-slate-700">{question.topic}</strong></span>
            <span>Source: <strong className="text-slate-700">{question.sourceType || 'Course Practice'}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
