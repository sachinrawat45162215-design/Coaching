import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, Award, Brain, Compass, Users } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-[calc(100vh-76px)] bg-gradient-to-tr from-slate-50 via-indigo-50/20 to-violet-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/25 flex flex-col justify-center px-6 py-12">
      <div className="max-w-6xl mx-auto w-full text-center space-y-12">
        {/* Hero Header */}
        <div className="space-y-4 max-w-3xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 text-xs font-extrabold tracking-wider uppercase">
            <GraduationCap className="h-4 w-4" />
            Class 1 to 12 Smart Learning
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white">
            Elevate Your Study with{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-indigo-500 dark:from-brand-400 dark:to-indigo-300">
              EduSphere
            </span>
          </h1>
          <p className="text-base md:text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            An all-in-one assessment & learning ecosystem designed for students and educators. Get access to smart quizzes, downloadable worksheets, customized study notes, and detail-rich progress graphs.
          </p>
        </div>

        {/* Portals Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto animate-slide-up">
          {/* Student Card */}
          <div className="glass-premium p-8 rounded-3xl text-left flex flex-col justify-between hover:border-brand-500 hover:scale-[1.02] transition-all duration-300 group">
            <div className="space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-brand-500 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-brand-500/10">
                <Brain className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                Student Portal
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Take timed quizzes, submit homework answers, review score metrics, and fetch textbook summaries tailor-fit for your grade level.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <Link
                to="/login"
                className="px-6 py-3 rounded-2xl bg-brand-600 text-white font-bold hover:bg-brand-500 shadow-lg shadow-brand-500/15 hover:shadow-brand-500/25 transition-all duration-300"
              >
                Sign In / Sign Up
              </Link>
            </div>
          </div>

          {/* Admin Card */}
          <div className="glass-premium p-8 rounded-3xl text-left flex flex-col justify-between hover:border-indigo-500 hover:scale-[1.02] transition-all duration-300 group">
            <div className="space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/10">
                <Users className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Admin Console
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Publish exams, design custom MCQ papers with timers, upload downloadable notes, evaluate submitted answers, and track class analytics.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <Link
                to="/admin-login"
                className="px-6 py-3 rounded-2xl bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 font-bold hover:bg-slate-700 dark:hover:bg-slate-100 shadow-lg transition-all duration-300"
              >
                Admin Login
              </Link>
            </div>
          </div>
        </div>

        {/* Short Features List */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-slate-200/50 dark:border-slate-800/50">
          <div className="flex flex-col items-center p-4">
            <BookOpen className="h-6 w-6 text-brand-500 mb-2" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Rich Syllabus</h3>
            <p className="text-xs text-slate-500">Classes 1 to 12</p>
          </div>
          <div className="flex flex-col items-center p-4">
            <Award className="h-6 w-6 text-emerald-500 mb-2" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Timed Quizzes</h3>
            <p className="text-xs text-slate-500">Auto grading MCQs</p>
          </div>
          <div className="flex flex-col items-center p-4">
            <Compass className="h-6 w-6 text-cyan-500 mb-2" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Worksheets</h3>
            <p className="text-xs text-slate-500">Submit online / PDF download</p>
          </div>
          <div className="flex flex-col items-center p-4">
            <Brain className="h-6 w-6 text-violet-500 mb-2" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Progress Analytics</h3>
            <p className="text-xs text-slate-500">Visual performance charts</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
