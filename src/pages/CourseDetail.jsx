import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { COURSES } from '../utils/quizUtils';
import {
  BookOpen,
  Clock,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Layers,
  ArrowLeft,
  CheckCircle2,
  CalendarDays,
  Target,
  Sparkles,
  Award
} from 'lucide-react';

export default function CourseDetail() {
  const { courseId } = useParams();
  const currentCourseId = courseId || 'llm';
  const course = COURSES[currentCourseId];

  // If invalid courseId, fallback
  if (!course) {
    return <Navigate to="/" replace />;
  }

  const isLLM = currentCourseId === 'llm';
  const totalQuestions = isLLM ? 200 : (course.data?.questions?.length || 180);
  const syllabus = isLLM ? course.data?.syllabus || [] : [];

  // Expandable syllabus state (by default, first 2 open, or all toggleable)
  const [openWeeks, setOpenWeeks] = useState({ 1: true, 2: true });

  const toggleWeek = (weekNum) => {
    setOpenWeeks(prev => ({
      ...prev,
      [weekNum]: !prev[weekNum]
    }));
  };

  const expandAll = () => {
    const all = {};
    for (let w = 1; w <= 12; w++) all[w] = true;
    setOpenWeeks(all);
  };

  const collapseAll = () => {
    setOpenWeeks({});
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back to Home Link */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Courses</span>
        </Link>
      </div>

      {/* Course Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              NPTEL Course Code: {course.code}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {totalQuestions} MCQs Available
            </span>
          </div>
          {course.url && (
            <a
              href={course.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
            >
              <span>Official NPTEL Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
          {course.title}
        </h1>

        <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 max-w-3xl">
          {course.description}
        </p>

        {/* Highlight Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-100">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-500 font-medium">Question Bank</p>
            <p className="text-lg font-bold text-slate-900">{totalQuestions} MCQs</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-500 font-medium">Curriculum</p>
            <p className="text-lg font-bold text-slate-900">12 Full Weeks</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-500 font-medium">Format</p>
            <p className="text-lg font-bold text-slate-900">4-Option MCQs</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-500 font-medium">Feedback</p>
            <p className="text-lg font-bold text-slate-900">With Explanations</p>
          </div>
        </div>
      </div>

      {/* Two Main Action Cards: Practice Mode and Mock Test Mode */}
      <div className="mb-12">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">Choose Mode</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Practice Mode Card */}
          <div className="bg-white rounded-3xl border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-md transition-all p-6 sm:p-7 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
                Practice Mode
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Practise questions one-by-one at your own pace. Select answers, check detailed explanations, and review your final score and percentage.
              </p>
              <ul className="space-y-2 text-xs text-slate-500 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>One question at a time with 4 options (A, B, C, D)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Immediate feedback or end-of-session review</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Track progress: Question X of {totalQuestions}</span>
                </li>
              </ul>
            </div>

            <Link
              to={`/practice/${course.id}`}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm"
            >
              <BookOpen className="w-4 h-4" />
              <span>Start Practice Mode</span>
            </Link>
          </div>

          {/* Mock Test Mode Card */}
          <div className="bg-white rounded-3xl border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all p-6 sm:p-7 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-700 transition-colors">
                Mock Test Mode
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Experience simulated examination conditions with a real countdown timer, question palette navigation, automated submission, and comprehensive scoring.
              </p>
              <ul className="space-y-2 text-xs text-slate-500 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Timed exam simulation with countdown timer</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Auto-submit on timer expiry &amp; submission confirmation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Full score breakdown, percentage &amp; question review</span>
                </li>
              </ul>
            </div>

            <Link
              to={`/mock-test/${course.id}`}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm"
            >
              <Clock className="w-4 h-4" />
              <span>Start Mock Test Mode</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 12-Week Syllabus Section (Specifically for LLM as requested) */}
      {isLLM && syllabus.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <span>Updated 12-Week Syllabus</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                All 200 MCQs strictly cover these 12 weekly modules and core concepts.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={expandAll}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Expand All
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Collapse All
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {syllabus.map((item) => {
              const isOpen = !!openWeeks[item.week];
              return (
                <div
                  key={item.week}
                  className="rounded-2xl border border-slate-200/90 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleWeek(item.week)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left bg-slate-50/60 hover:bg-slate-100/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                        W{item.week}
                      </span>
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900">
                          {item.title}
                        </h4>
                        <span className="text-xs text-slate-500 font-medium">
                          {item.topics.length} core topic{item.topics.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="p-1 rounded-lg text-slate-400">
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 py-4 bg-white border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                        Weekly Topics:
                      </p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700">
                        {item.topics.map((topic, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                            <span className="leading-snug">{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
