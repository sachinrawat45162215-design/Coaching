import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { BASE_URL, getFileUrl } from '../utils/api';

import { 
  FileText, 
  Calendar, 
  Download, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  FileCheck,
  GraduationCap
} from 'lucide-react';
import Toast from '../components/Toast';

const QuestionPapersList = ({ kidsMode }) => {
  const { user } = useAuth();
  const [papers, setPapers] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Attempt overlay state
  const [activePaper, setActivePaper] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const subjects = ['All', 'Math', 'Science', 'English', 'Social Studies'];

  const fetchPapers = async () => {
    try {
      if (!user) return;
      const data = await api.get('/papers');
      setPapers(data);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [user]);

  const filteredPapers = selectedSubject === 'All'
    ? papers
    : papers.filter(p => p.subject === selectedSubject);

  const handleAttemptSubmit = async (e) => {
    e.preventDefault();
    if (!answerText && !uploadFile) {
      setToast({ message: "Please type an answer text or upload an answer file.", type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('answerText', answerText);
      if (uploadFile) {
        formData.append('file', uploadFile);
      }

      await api.post(`/papers/${activePaper.id}/submit`, formData, true);
      setToast({ message: "Worksheet answers submitted successfully!", type: 'success' });
      
      // Reset
      setAnswerText('');
      setUploadFile(null);
      setActivePaper(null);
      
      // Refresh list
      fetchPapers();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
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
    <div className={`p-6 space-y-6 text-left ${kidsMode ? 'theme-kids bg-pink-50/10' : ''}`}>
      {/* Top filter section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">
            Question Papers & Worksheets
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Download textbook worksheets and submit solutions online.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                selectedSubject === sub
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/40 dark:border-slate-800/40 hover:bg-slate-50'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Papers grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPapers.map((paper) => {
          const submission = paper.submissions?.find(s => s.studentId === user.id);
          const isSubmitted = !!submission;
          const isEvaluated = submission?.status === 'evaluated';

          return (
            <div
              key={paper.id}
              className={`glass-premium p-6 rounded-3xl border flex flex-col justify-between hover:scale-[1.02] transition-all relative overflow-hidden ${
                kidsMode
                  ? 'kids-card border-amber-300'
                  : 'border-slate-200/45 dark:border-slate-800/45'
              }`}
            >
              {/* Submission status tag */}
              <div className="absolute top-3 right-3">
                {isEvaluated ? (
                  <span className="flex items-center gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                    <FileCheck className="h-3 w-3" />
                    <span>Graded: {submission.score}/100</span>
                  </span>
                ) : isSubmitted ? (
                  <span className="flex items-center gap-1 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Submitted</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                    <AlertCircle className="h-3 w-3" />
                    <span>Pending</span>
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <span className="inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {paper.subject}
                </span>

                <h3 className="text-lg font-extrabold text-slate-800 dark:text-white leading-tight pr-20">
                  {paper.title}
                </h3>

                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>Due: {paper.dueDate}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/30 dark:border-slate-800/30 space-y-2">
                <a
                  href={getFileUrl(paper.fileUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Paper</span>
                </a>

                {isEvaluated ? (
                  <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100/40 text-xs">
                    <p className="font-extrabold text-emerald-800 dark:text-emerald-300">Feedback comments:</p>
                    <p className="text-slate-600 dark:text-slate-400 mt-1 italic">"{submission.feedback || 'Excellent submission!'}"</p>
                  </div>
                ) : (
                  <button
                    onClick={() => setActivePaper(paper)}
                    className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-all"
                  >
                    <UploadCloud className="h-4 w-4" />
                    <span>{isSubmitted ? 'Resubmit Answers' : 'Upload Solutions'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredPapers.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white/20 dark:bg-slate-900/10 rounded-3xl border border-dashed border-slate-300/40 dark:border-slate-800/40">
            <FileText className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 dark:text-slate-300">No question papers assigned</h3>
            <p className="text-xs text-slate-500 mt-1">
              There are no question papers matching {selectedSubject === 'All' ? 'your class' : `subject ${selectedSubject}`} yet.
            </p>
          </div>
        )}
      </div>

      {/* Answer Submission Modal */}
      {activePaper && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-premium max-w-xl w-full p-6 sm:p-8 rounded-3xl shadow-2xl relative text-left">
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mb-2">
              Submit Worksheet Solution
            </h3>
            <p className="text-xs text-slate-500 mb-6 truncate">
              Paper: {activePaper.title}
            </p>
            
            <form onSubmit={handleAttemptSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Type Answer / Explanations
                </label>
                <textarea
                  rows={4}
                  placeholder="Type your final answers or solution details here..."
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Or Attach Worksheets (PDF/Images)
                </label>
                <input
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setActivePaper(null);
                    setAnswerText('');
                    setUploadFile(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Uploading...' : 'Submit Answers'}
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

export default QuestionPapersList;
