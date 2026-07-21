import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
  BookOpen, 
  FileText, 
  Award, 
  FolderOpen, 
  Sparkles, 
  HelpCircle,
  FileCheck,
  TrendingUp
} from 'lucide-react';
import Toast from '../components/Toast';

const StudentDashboard = ({ kidsMode }) => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [papers, setPapers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!user) return;
        const [qData, pData, nData, rData] = await Promise.all([
          api.get('/quizzes'),
          api.get('/papers'),
          api.get('/notes'),
          api.get(`/results/student/${user.id}`)
        ]);

        setQuizzes(qData);
        setPapers(pData);
        setNotes(nData);
        setResults(rData);
      } catch (err) {
        setToast({ message: err.message, type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  // Calculate statistics
  const pendingQuizzes = quizzes.filter(q => !results.some(r => r.assessmentId === q.id && r.assessmentType === 'quiz')).length;
  const pendingPapers = papers.filter(p => {
    const studentSub = p.submissions?.find(s => s.studentId === user.id);
    return !studentSub || studentSub.status === 'submitted';
  }).length;
  
  // Calculate average score
  const quizResults = results.filter(r => r.assessmentType === 'quiz' && r.score !== null);
  const avgScore = quizResults.length > 0 
    ? Math.round(quizResults.reduce((acc, curr) => acc + curr.score, 0) / quizResults.length) 
    : 0;

  // Group scores by subject for the graph
  const subjectsList = ['Math', 'Science', 'English', 'Social Studies'];
  const subjectScores = subjectsList.map(subj => {
    const subjResults = results.filter(r => r.subject === subj && r.score !== null);
    const scoreVal = subjResults.length > 0 
      ? Math.round(subjResults.reduce((acc, curr) => acc + curr.score, 0) / subjResults.length)
      : 0; // Default if no results yet
    return { name: subj, score: scoreVal };
  });

  return (
    <div className={`p-6 space-y-8 ${kidsMode ? 'theme-kids bg-pink-50/10' : ''}`}>
      {/* Welcome Banner */}
      <div className={`relative overflow-hidden rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl ${
        kidsMode 
          ? 'bg-gradient-to-r from-amber-400 via-pink-400 to-rose-400 text-slate-900 border-4 border-amber-300' 
          : 'bg-gradient-to-r from-brand-600 via-indigo-600 to-indigo-700 text-white'
      }`}>
        <div className="space-y-3 text-center md:text-left z-10">
          {kidsMode ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/40 text-amber-950 font-black rounded-full text-xs">
              <Sparkles className="h-4 w-4 text-amber-900" /> Great to see you, superstar!
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-brand-100 font-bold rounded-full text-xs">
              Welcome back to your study planner
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Hi, {user.name}! 👋
          </h1>
          <p className={`${kidsMode ? 'text-slate-800' : 'text-slate-200'} text-sm max-w-xl`}>
            {kidsMode 
              ? `You are in ${user.class}. Let's play some quizzes and learn something fun today!`
              : `Access your learning resources for ${user.class} below. Keep up the high score momentum!`}
          </p>
        </div>
        
        <div className="relative z-10 shrink-0">
          <img 
            src={user.profilePhoto || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`} 
            alt="Avatar" 
            className={`h-24 w-24 rounded-full border-4 shadow-lg ${kidsMode ? 'border-amber-300 bg-white' : 'border-white/20 bg-slate-50/10'}`} 
          />
        </div>
        
        {/* Background circle blobs */}
        <div className="absolute top-0 right-0 h-44 w-44 rounded-full bg-white/5 dark:bg-black/5 -mr-10 -mt-10" />
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Link 
          to="/quizzes" 
          className={`glass-premium p-6 rounded-3xl text-left border hover:scale-[1.03] transition-all flex flex-col justify-between ${
            kidsMode ? 'kids-card border-amber-300 hover:border-amber-400' : 'hover:border-brand-500'
          }`}
        >
          <div className="space-y-4">
            <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shadow-md ${
              kidsMode ? 'bg-amber-100 text-amber-700' : 'bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400'
            }`}>
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Available Quizzes</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">{quizzes.length}</h3>
            </div>
          </div>
          <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 mt-4 block hover:underline">
            {pendingQuizzes} Pending attempt →
          </span>
        </Link>

        <Link 
          to="/papers" 
          className={`glass-premium p-6 rounded-3xl text-left border hover:scale-[1.03] transition-all flex flex-col justify-between ${
            kidsMode ? 'kids-card border-rose-300 hover:border-rose-400' : 'hover:border-indigo-500'
          }`}
        >
          <div className="space-y-4">
            <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shadow-md ${
              kidsMode ? 'bg-rose-100 text-rose-700' : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
            }`}>
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Question Papers</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">{papers.length}</h3>
            </div>
          </div>
          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mt-4 block hover:underline">
            {pendingPapers} Action items →
          </span>
        </Link>

        <Link 
          to="/notes" 
          className={`glass-premium p-6 rounded-3xl text-left border hover:scale-[1.03] transition-all flex flex-col justify-between ${
            kidsMode ? 'kids-card border-emerald-300 hover:border-emerald-400' : 'hover:border-emerald-500'
          }`}
        >
          <div className="space-y-4">
            <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shadow-md ${
              kidsMode ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
            }`}>
              <FolderOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Class Notes</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">{notes.length}</h3>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-4 block hover:underline">
            Browse files →
          </span>
        </Link>

        <Link 
          to="/results" 
          className={`glass-premium p-6 rounded-3xl text-left border hover:scale-[1.03] transition-all flex flex-col justify-between ${
            kidsMode ? 'kids-card border-violet-300 hover:border-violet-400' : 'hover:border-violet-500'
          }`}
        >
          <div className="space-y-4">
            <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shadow-md ${
              kidsMode ? 'bg-violet-100 text-violet-700' : 'bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400'
            }`}>
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Average Grade</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">
                {avgScore}%
              </h3>
            </div>
          </div>
          <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 mt-4 block hover:underline">
            View full report card →
          </span>
        </Link>
      </div>

      {/* Progress Chart & Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* SVG Performance Chart */}
        <div className="glass-premium p-6 rounded-3xl border lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-slate-800/40 pb-4">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="h-5 w-5 text-brand-500" />
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100">Subject-wise Analytics</h3>
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Average Scores</span>
          </div>
          
          {/* Custom SVG Bar Chart */}
          <div className="w-full">
            <svg viewBox="0 0 400 220" className="w-full overflow-visible">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="380" y2="20" stroke="rgba(148, 163, 184, 0.1)" strokeDasharray="4 4" />
              <line x1="40" y1="60" x2="380" y2="60" stroke="rgba(148, 163, 184, 0.1)" strokeDasharray="4 4" />
              <line x1="40" y1="100" x2="380" y2="100" stroke="rgba(148, 163, 184, 0.1)" strokeDasharray="4 4" />
              <line x1="40" y1="140" x2="380" y2="140" stroke="rgba(148, 163, 184, 0.1)" strokeDasharray="4 4" />
              
              {/* Baseline */}
              <line x1="40" y1="170" x2="380" y2="170" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="2" />
              
              {/* Y Axis Labels */}
              <text x="30" y="24" className="text-[10px] font-bold text-slate-400" textAnchor="end">100%</text>
              <text x="30" y="64" className="text-[10px] font-bold text-slate-400" textAnchor="end">75%</text>
              <text x="30" y="104" className="text-[10px] font-bold text-slate-400" textAnchor="end">50%</text>
              <text x="30" y="144" className="text-[10px] font-bold text-slate-400" textAnchor="end">25%</text>
              <text x="30" y="174" className="text-[10px] font-bold text-slate-400" textAnchor="end">0%</text>

              {/* Render Bars */}
              {subjectScores.map((bar, idx) => {
                const barWidth = 40;
                const spacing = 80;
                const x = 60 + idx * spacing;
                
                // Calculate height of bar (max score is 100, maps to 150px height from y=170 to y=20)
                const maxBarHeight = 150;
                const barHeight = (bar.score / 100) * maxBarHeight;
                const y = 170 - barHeight;

                const colors = [
                  'from-brand-500 to-indigo-500',
                  'from-emerald-500 to-teal-500',
                  'from-amber-500 to-orange-500',
                  'from-violet-500 to-purple-500'
                ];

                return (
                  <g key={bar.name} className="group cursor-pointer">
                    {/* Hover tooltip trigger card */}
                    <rect 
                      x={x - 10} 
                      y="10" 
                      width={barWidth + 20} 
                      height="170" 
                      fill="transparent" 
                    />
                    
                    {/* Bar background path */}
                    <rect 
                      x={x} 
                      y="20" 
                      width={barWidth} 
                      height="150" 
                      rx="6"
                      fill="currentColor"
                      className="text-slate-100 dark:text-slate-900/40"
                    />

                    {/* Active dynamic filled bar */}
                    {barHeight > 0 && (
                      <rect 
                        x={x} 
                        y={y} 
                        width={barWidth} 
                        height={barHeight} 
                        rx="6"
                        className={`fill-brand-500 dark:fill-brand-400 transition-all duration-500`}
                        // A simple gradient mapping hack using Tailwind or simple styling
                      />
                    )}

                    {/* Tooltip value */}
                    <text 
                      x={x + barWidth / 2} 
                      y={y - 8} 
                      className="text-[11px] font-black text-slate-700 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      textAnchor="middle"
                    >
                      {bar.score}%
                    </text>
                    
                    {/* X Axis Labels */}
                    <text 
                      x={x + barWidth / 2} 
                      y="190" 
                      className="text-[11px] font-bold text-slate-500 dark:text-slate-400"
                      textAnchor="middle"
                    >
                      {bar.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Pending Question Papers & Activities */}
        <div className="glass-premium p-6 rounded-3xl border space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-200/40 dark:border-slate-800/40 pb-4">
            <FileCheck className="h-5 w-5 text-indigo-500" />
            <h3 className="font-extrabold text-slate-800 dark:text-slate-100">Tasks Checklist</h3>
          </div>

          <div className="space-y-4">
            {papers.slice(0, 3).map((paper) => {
              const studentSub = paper.submissions?.find(s => s.studentId === user.id);
              const isSubmitted = !!studentSub;
              const isEvaluated = studentSub?.status === 'evaluated';

              return (
                <div key={paper.id} className="p-3 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800/30 flex items-center justify-between gap-3 text-left">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {paper.title}
                    </p>
                    <span className="text-[10px] text-slate-500">
                      Subject: {paper.subject} | Due: {paper.dueDate}
                    </span>
                  </div>
                  <div>
                    {isEvaluated ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        Graded: {studentSub.score}/100
                      </span>
                    ) : isSubmitted ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                        Submitted
                      </span>
                    ) : (
                      <Link 
                        to="/papers"
                        className="px-2 py-1 rounded-xl text-[9px] font-bold bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm block text-center"
                      >
                        Attempt
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
            
            {papers.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-xs">
                No active worksheets assigned!
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
};

export default StudentDashboard;
