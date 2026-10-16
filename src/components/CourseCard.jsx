import React from 'react';
import { ExternalLink, BookOpen, Clock, Target, CheckCircle2, ChevronRight, Layers, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CourseCard({ course }) {
  const totalQuestions = course.data?.questions?.length || 100;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span>Course Code: {course.code}</span>
          </div>
          <a
            href={course.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
            title="View official NPTEL course page"
          >
            <span>Official Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2.5 tracking-tight group-hover:text-blue-700 transition-colors">
          {course.title}
        </h3>

        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          {course.description}
        </p>

        <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 mb-6 bg-slate-50/60 rounded-xl px-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Question Bank</p>
              <p className="text-sm font-bold text-slate-900">{totalQuestions} Verified MCQs</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Format</p>
              <p className="text-sm font-bold text-slate-900">Topic-wise & Mocks</p>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Comprehensive explanations included for all questions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Timed examination simulation with automated scoring</span>
          </div>
        </div>
      </div>

      <div className="p-6 bg-slate-50/70 border-t border-slate-100 flex flex-col gap-3">
        {course.hasWeeklyAssessments && (
          <Link
            to="/weekly-assessments"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-xs"
          >
            <CalendarDays className="w-4 h-4" />
            <span>Weekly Assessments</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to={`/practice/${course.id}`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-white text-blue-700 border border-blue-300 hover:bg-blue-50 active:bg-blue-100 transition-colors shadow-xs"
          >
            <BookOpen className="w-4 h-4" />
            <span>Practise MCQs</span>
          </Link>

          <Link
            to={`/mock-test/${course.id}`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm"
          >
            <Clock className="w-4 h-4" />
            <span>Start Mock Test</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
