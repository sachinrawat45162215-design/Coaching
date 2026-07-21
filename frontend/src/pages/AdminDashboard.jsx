import React, { useState, useEffect } from 'react';
import api, { getFileUrl } from '../utils/api';

import { 
  Users, 
  BookOpen, 
  FileText, 
  FolderOpen, 
  ClipboardCheck, 
  Star,
  CheckCircle,
  FileCheck2
} from 'lucide-react';
import Toast from '../components/Toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    studentsCount: 0,
    quizzesCount: 0,
    papersCount: 0,
    notesCount: 0
  });
  const [classBreakdown, setClassBreakdown] = useState({});
  const [pendingEvaluations, setPendingEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Evaluation modal state
  const [evaluatingSub, setEvaluatingSub] = useState(null); // { paperId, submission }
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submittingEval, setSubmittingEval] = useState(false);

  const fetchDashboardStats = async () => {
    try {
      const [students, quizzes, papers, notes] = await Promise.all([
        api.get('/students'),
        api.get('/quizzes'),
        api.get('/papers'),
        api.get('/notes')
      ]);

      // Calculate class breakdown
      const breakdown = {};
      students.forEach(s => {
        breakdown[s.class] = (breakdown[s.class] || 0) + 1;
      });

      setStats({
        studentsCount: students.length,
        quizzesCount: quizzes.length,
        papersCount: papers.length,
        notesCount: notes.length
      });
      setClassBreakdown(breakdown);

      // Collect all pending evaluations from papers
      const pending = [];
      papers.forEach(paper => {
        if (paper.submissions && paper.submissions.length > 0) {
          paper.submissions.forEach(sub => {
            if (sub.status === 'submitted') {
              pending.push({
                paperId: paper.id,
                paperTitle: paper.title,
                paperSubject: paper.subject,
                submission: sub
              });
            }
          });
        }
      });
      setPendingEvaluations(pending);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleEvaluationSubmit = async (e) => {
    e.preventDefault();
    if (score === '' || isNaN(score) || score < 0 || score > 100) {
      setToast({ message: "Please provide a valid score between 0 and 100.", type: 'error' });
      return;
    }

    setSubmittingEval(true);
    try {
      await api.post(`/papers/${evaluatingSub.paperId}/evaluate`, {
        studentId: evaluatingSub.submission.studentId,
        score: parseFloat(score),
        feedback
      });

      setToast({ message: "Grading and feedback submitted successfully!", type: 'success' });
      
      // Close modal & reset fields
      setScore('');
      setFeedback('');
      setEvaluatingSub(null);

      // Reload
      fetchDashboardStats();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSubmittingEval(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 text-left">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white">
          Admin Control Center
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review system-wide student listings, class enrollments, and evaluate answer sheets.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-premium p-6 rounded-3xl border border-slate-200/40 dark:border-slate-800/40 space-y-4">
          <div className="h-11 w-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">Total Students</p>
            <h3 className="text-2xl font-black text-slate-850 dark:text-white">{stats.studentsCount}</h3>
          </div>
        </div>

        <div className="glass-premium p-6 rounded-3xl border border-slate-200/40 dark:border-slate-800/40 space-y-4">
          <div className="h-11 w-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm shrink-0">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">MCQ Quizzes</p>
            <h3 className="text-2xl font-black text-slate-850 dark:text-white">{stats.quizzesCount}</h3>
          </div>
        </div>

        <div className="glass-premium p-6 rounded-3xl border border-slate-200/40 dark:border-slate-800/40 space-y-4">
          <div className="h-11 w-11 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-sm shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">Question Papers</p>
            <h3 className="text-2xl font-black text-slate-850 dark:text-white">{stats.papersCount}</h3>
          </div>
        </div>

        <div className="glass-premium p-6 rounded-3xl border border-slate-200/40 dark:border-slate-800/40 space-y-4">
          <div className="h-11 w-11 rounded-2xl bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center shadow-sm shrink-0">
            <FolderOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">Study Notes</p>
            <h3 className="text-2xl font-black text-slate-850 dark:text-white">{stats.notesCount}</h3>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Side: Pending Evaluation Submissions */}
        <div className="lg:col-span-2 glass-premium p-6 rounded-3xl border border-slate-200/40 dark:border-slate-800/40 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200/30 dark:border-slate-800/30 pb-3">
            <ClipboardCheck className="h-5 w-5 text-indigo-500" />
            <h3 className="font-extrabold text-slate-850 dark:text-white">
              Pending Evaluations ({pendingEvaluations.length})
            </h3>
          </div>

          <div className="space-y-4">
            {pendingEvaluations.map((item) => (
              <div
                key={item.submission.id}
                className="p-4 bg-white/50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800/30 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">
                    {item.submission.studentName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    Paper: {item.paperTitle} ({item.paperSubject})
                  </p>
                  <span className="text-[10px] text-slate-400">
                    Submitted: {new Date(item.submission.submittedAt).toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => setEvaluatingSub(item)}
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shrink-0 shadow-md shadow-indigo-500/10"
                >
                  Grade / Evaluate
                </button>
              </div>
            ))}

            {pendingEvaluations.length === 0 && (
              <div className="text-center py-10 text-slate-450 text-xs">
                Awesome! No pending answer sheets left to grade.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Class Wise Enrollments */}
        <div className="glass-premium p-6 rounded-3xl border border-slate-200/40 dark:border-slate-800/40 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200/30 dark:border-slate-800/30 pb-3">
            <Star className="h-5 w-5 text-amber-500" />
            <h3 className="font-extrabold text-slate-850 dark:text-white">
              Class Breakdown
            </h3>
          </div>

          <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
            {Object.keys(classBreakdown).map((cls) => (
              <div key={cls} className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-650 dark:text-slate-400">{cls}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 font-extrabold text-slate-700 dark:text-slate-300">
                  {classBreakdown[cls]} Students
                </span>
              </div>
            ))}

            {Object.keys(classBreakdown).length === 0 && (
              <div className="text-center py-10 text-slate-450 text-xs">
                No students enrolled in the system yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grading / Evaluation Modal */}
      {evaluatingSub && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-premium max-w-xl w-full p-6 sm:p-8 rounded-3xl shadow-2xl relative text-left">
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mb-2">
              Grade Answer Sheet
            </h3>
            <p className="text-xs text-slate-500 mb-6 border-b pb-3">
              Student: {evaluatingSub.submission.studentName} | Assignment: {evaluatingSub.paperTitle}
            </p>

            <div className="space-y-4 mb-6 text-xs max-h-60 overflow-y-auto pr-1">
              {evaluatingSub.submission.answerText && (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border rounded-xl leading-relaxed">
                  <p className="font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-[9px]">Typed Student Solution:</p>
                  <p className="whitespace-pre-wrap text-slate-800 dark:text-slate-200">{evaluatingSub.submission.answerText}</p>
                </div>
              )}

              {evaluatingSub.submission.answerFileUrl && (
                <div className="flex items-center justify-between p-3 bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200/30 rounded-xl">
                  <div className="min-w-0">
                    <p className="font-bold truncate text-slate-800 dark:text-slate-200">
                      {evaluatingSub.submission.answerFileName || 'Scanned_Worksheet.pdf'}
                    </p>
                    <span className="text-[10px] text-slate-450">Scanned attachment file</span>
                  </div>
                  <a
                    href={getFileUrl(evaluatingSub.submission.answerFileUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg flex items-center gap-1.5"
                  >
                    <FileCheck2 className="h-4.5 w-4.5" />
                    <span>View File</span>
                  </a>
                </div>
              )}
            </div>

            <form onSubmit={handleEvaluationSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4 items-center">
                <label className="col-span-1 text-xs font-bold text-slate-650 dark:text-slate-400">
                  Earned Score (0-100):
                </label>
                <input
                  type="number"
                  placeholder="85"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="col-span-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 block">
                  Evaluation Feedback Comments:
                </label>
                <textarea
                  rows={3}
                  placeholder="Well structured answers. Good work on fraction visual models..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEvaluatingSub(null);
                    setScore('');
                    setFeedback('');
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEval}
                  className="px-5 py-2.5 text-xs font-bold bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl shadow-md disabled:opacity-50"
                >
                  {submittingEval ? 'Submitting...' : 'Post Evaluation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

export default AdminDashboard;
