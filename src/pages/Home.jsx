import React, { useEffect, useState } from 'react';
import { COURSES, loadFromStorage } from '../utils/quizUtils';
import CourseCard from '../components/CourseCard';
import { BookOpen, CheckCircle, Clock, Award, ShieldCheck, Sparkles, HelpCircle } from 'lucide-react';

export default function Home() {
  const [recentMockScore, setRecentMockScore] = useState(null);

  useEffect(() => {
    const saved = loadFromStorage('latest_mock_result');
    if (saved) {
      setRecentMockScore(saved);
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>NPTEL Online Certification Preparation Portal</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          NPTEL MCQ Practice &amp; Mock Test Platform
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
          Comprehensive, syllabus-aligned question banks for continuous practice and timed mock examinations. No login or accounts required.
        </p>

        {/* Recent Score Banner if exists in localStorage */}
        {recentMockScore && (
          <div className="mt-6 inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs sm:text-sm text-blue-900 shadow-xs">
            <Award className="w-4 h-4 text-blue-700" />
            <span>
              Recent Mock Test ({recentMockScore.courseTitle}):{' '}
              <strong className="text-blue-950 font-bold">{recentMockScore.score} / {recentMockScore.maxScore} ({recentMockScore.percentage}%)</strong>
            </span>
          </div>
        )}
      </div>

      {/* Course Cards Grid */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Available Courses</h2>
            <p className="text-xs sm:text-sm text-slate-500">Select a course to start topic-wise practice or launch a timed mock test</p>
          </div>
          <span className="text-xs font-medium text-slate-400 hidden sm:inline-block">2 Enrolled Courses</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <CourseCard course={COURSES.entrepreneurship} />
          <CourseCard course={COURSES.llm} />
        </div>
      </div>

      {/* Brief Instructions Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <span>Instructions &amp; Examination Guidelines</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-600">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-semibold">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">1</div>
              <span>Topic-Wise Practice Mode</span>
            </div>
            <p className="leading-relaxed text-xs sm:text-sm">
              Filter questions by specific syllabus topics or difficulty level. Choose between <strong>immediate feedback</strong> for quick learning or <strong>end-of-session review</strong> to test memory retention.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-semibold">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">2</div>
              <span>Timed Mock Examination</span>
            </div>
            <p className="leading-relaxed text-xs sm:text-sm">
              Experience simulated NPTEL exam pressure with countdown timers (20, 40, or 50 minutes). Answers and explanations are locked until final submission or automated timer completion.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-semibold">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">3</div>
              <span>Marking &amp; Review</span>
            </div>
            <p className="leading-relaxed text-xs sm:text-sm">
              Scoring assigns <strong>1 mark</strong> per correct answer, with 0 marks for incorrect or unanswered questions. Use the Question Navigation Panel to mark doubtful questions for quick review.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Privacy-First: All progress is stored strictly in your browser. No registration required.
          </span>
          <span>Aligned with NPTEL 2025/2026 course outlines</span>
        </div>
      </div>
    </div>
  );
}
