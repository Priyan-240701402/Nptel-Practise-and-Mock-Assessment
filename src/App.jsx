import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CourseDetail from './pages/CourseDetail';
import Practice from './pages/Practice';
import MockTest from './pages/MockTest';
import Results from './pages/Results';
import WeeklyAssessments from './pages/WeeklyAssessments';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
        <Navbar />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/course/:courseId" element={<CourseDetail />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/practice/:courseId" element={<Practice />} />
            <Route path="/mock-test" element={<MockTest />} />
            <Route path="/mock-test/:courseId" element={<MockTest />} />
            <Route path="/weekly-assessments" element={<WeeklyAssessments />} />
            <Route path="/results" element={<Results />} />
            <Route path="/results/:courseId" element={<Results />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <p className="font-semibold text-slate-700">NPTEL MCQ Practice &amp; Timed Mock Test Application</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Educational mock tool for Foundations of Entrepreneurship (noc26_mg80) &amp; Intro to LLMs (noc26_cs171).
              </p>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span>Client-side Storage</span>
              <span>•</span>
              <span>200 Verified MCQs</span>
              <span>•</span>
              <a
                href="https://onlinecourses.nptel.ac.in"
                target="_blank"
                rel="noreferrer"
                className="hover:text-blue-600 transition-colors"
              >
                NPTEL Portal
              </a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
