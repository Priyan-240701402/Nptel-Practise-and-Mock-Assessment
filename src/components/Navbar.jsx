import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Award, CheckCircle2, Home } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm group-hover:bg-blue-700 transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">NPTEL</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                  MCQ Practice & Mock Tests
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Syllabus-Aligned Question Bank for Exam Preparation</p>
            </div>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <div className="h-4 w-px bg-slate-200"></div>
            <span className="text-xs text-slate-500 font-medium hidden md:inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Offline Ready • 200 Questions
            </span>
          </nav>
        </div>
      </div>
    </header>
  );
}
