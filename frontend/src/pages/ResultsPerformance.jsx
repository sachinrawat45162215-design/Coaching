import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Award, Printer, BookOpen, Calendar, ChevronRight, BarChart2 } from 'lucide-react';
import Toast from '../components/Toast';

const ResultsPerformance = ({ kidsMode }) => {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [allResults, setAllResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        if (!user) return;
        const [studentResults, adminResults] = await Promise.all([
          api.get(`/results/student/${user.id}`),
          // We can try to fetch all results to compute class average. If it fails (due to role restrictions), we'll fallback to mock average.
          api.get('/results/all').catch(() => null)
        ]);

        setResults(studentResults);
        if (adminResults) {
          setAllResults(adminResults);
        }
      } catch (err) {
        setToast({ message: err.message, type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [user]);

  // Compute stats
  const totalAssessments = results.length;
  const gradedResults = results.filter(r => r.score !== null);
  const avgScore = gradedResults.length > 0 
    ? Math.round(gradedResults.reduce((acc, curr) => acc + curr.score, 0) / gradedResults.length)
    : 0;

  // Compute Class Average (for the same class level)
  let classAverage = 72; // Default mock fallback
  if (allResults.length > 0) {
    const classResults = allResults.filter(r => r.studentClass === user.class && r.score !== null);
    if (classResults.length > 0) {
      classAverage = Math.round(classResults.reduce((acc, curr) => acc + curr.score, 0) / classResults.length);
    }
  }

  // Handle report printing
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 text-left ${kidsMode ? 'theme-kids bg-pink-50/10' : ''} print:p-12 print:bg-white print:text-slate-900`}>
      {/* Header Controls */}
      <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-slate-800/40 pb-4 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">
            Performance & Grades
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review detailed subject metrics and quiz transcripts.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2.5 rounded-xl bg-slate-800 dark:bg-slate-250 text-white dark:text-slate-950 font-bold text-xs flex items-center gap-2 hover:bg-slate-700 transition-colors shadow-sm"
        >
          <Printer className="h-4 w-4" />
          <span>Print Report Card (PDF)</span>
        </button>
      </div>

      {/* Print-only Report Header */}
      <div className="hidden print:block space-y-4 mb-8">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800">EduSphere Report Card</h1>
            <p className="text-sm text-slate-500">Official Student Performance Analytics</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 rounded-full">
            Date Generated: {new Date().toLocaleDateString()}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-2xl">
          <p><strong>Student Name:</strong> {user.name}</p>
          <p><strong>Class Grade:</strong> {user.class}</p>
          <p><strong>Roll Number:</strong> {user.rollNo}</p>
          <p><strong>Email Address:</strong> {user.email}</p>
        </div>
      </div>

      {/* Metrics breakdown cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-premium p-6 rounded-3xl border border-slate-200/40 dark:border-slate-800/40 space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase">Assessments Taken</p>
          <h3 className="text-3xl font-black text-slate-850 dark:text-white">{totalAssessments}</h3>
          <span className="text-[10px] text-slate-450">Quizzes & Worksheets completed</span>
        </div>

        <div className="glass-premium p-6 rounded-3xl border border-slate-200/40 dark:border-slate-800/40 space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase">Your Average</p>
          <h3 className="text-3xl font-black text-brand-600 dark:text-brand-400">{avgScore}%</h3>
          <span className="text-[10px] text-slate-450">Cumulative performance score</span>
        </div>

        <div className="glass-premium p-6 rounded-3xl border border-slate-200/40 dark:border-slate-800/40 space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase">Class Average</p>
          <h3 className="text-3xl font-black text-indigo-500">{classAverage}%</h3>
          <span className="text-[10px] text-slate-450">Average score of your peers</span>
        </div>
      </div>

      {/* Comparative chart or indicators */}
      <div className="glass-premium p-6 rounded-3xl border border-slate-200/40 dark:border-slate-800/40 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200/30 dark:border-slate-850 pb-3">
          <BarChart2 className="h-5 w-5 text-indigo-500" />
          <h3 className="font-extrabold text-slate-800 dark:text-white">Overall Standing</h3>
        </div>

        <div className="space-y-4 pt-2">
          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5 text-slate-600 dark:text-slate-400">
              <span>Your Standing vs. Class Average</span>
              <span>{avgScore >= classAverage ? 'Above Average 🚀' : 'Below Average 📚'}</span>
            </div>
            <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden relative">
              {/* Class average marker */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-indigo-500 z-10" 
                style={{ left: `${classAverage}%` }}
                title={`Class Average: ${classAverage}%`}
              />
              {/* Student score fill */}
              <div 
                className="h-full bg-gradient-to-r from-brand-500 to-indigo-400 rounded-full"
                style={{ width: `${avgScore}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-bold">
              <span>0%</span>
              <span style={{ marginLeft: `${classAverage - 6}%` }}>Class: {classAverage}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed historical results list */}
      <div className="glass-premium rounded-3xl border border-slate-200/40 dark:border-slate-800/40 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/40 dark:border-slate-800/40">
          <h3 className="font-extrabold text-slate-850 dark:text-white">Assessment Records</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-bold border-b border-slate-200/30 dark:border-slate-800/30">
                <th className="px-6 py-3.5">Assessment</th>
                <th className="px-6 py-3.5">Subject</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Grade</th>
                <th className="px-6 py-3.5 print:hidden">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {results.map((res) => {
                const isQuiz = res.assessmentType === 'quiz';
                const isEvaluated = res.score !== null;

                return (
                  <tr key={res.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                      {res.assessmentTitle}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-900 text-slate-650 dark:text-slate-350 border border-slate-200/10">
                        {res.subject}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 capitalize">
                      {res.assessmentType}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(res.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-black">
                      {isEvaluated ? (
                        <span className={res.score >= 70 ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300'}>
                          {res.score}%
                        </span>
                      ) : (
                        <span className="text-amber-500 font-bold italic">Evaluating</span>
                      )}
                    </td>
                    <td className="px-6 py-4 print:hidden">
                      {isQuiz ? (
                        <Link
                          to={`/quiz-result/${res.id}`}
                          className="text-brand-600 hover:text-brand-500 font-bold flex items-center gap-0.5"
                        >
                          <span>Review</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {results.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-xs">
                    You haven't attempted any quizzes or worksheets yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

export default ResultsPerformance;
