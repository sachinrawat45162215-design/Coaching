import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { CheckCircle, XCircle, Award, ArrowLeft, RefreshCw } from 'lucide-react';
import Toast from '../components/Toast';

const QuizResult = ({ kidsMode }) => {
  const { id } = useParams(); // resultId
  const { user } = useAuth();
  const [result, setResult] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchResultAndQuiz = async () => {
      try {
        if (!user) return;
        // Fetch all results for student
        const studentResults = await api.get(`/results/student/${user.id}`);
        const foundResult = studentResults.find(r => r.id === id);
        
        if (!foundResult) {
          throw new Error("Result details not found.");
        }
        
        setResult(foundResult);

        // Fetch corresponding quiz questions
        const quizData = await api.get(`/quizzes/${foundResult.assessmentId}`);
        setQuiz(quizData);
      } catch (err) {
        setToast({ message: err.message, type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchResultAndQuiz();
  }, [id, user]);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!result || !quiz) {
    return (
      <div className="p-6 text-center text-slate-500">
        Result data could not be loaded.
      </div>
    );
  }

  const scoreColor = result.score >= 70 
    ? 'text-emerald-600 dark:text-emerald-400' 
    : result.score >= 40 
    ? 'text-amber-500' 
    : 'text-rose-600 dark:text-rose-400';

  const scoreBg = result.score >= 70 
    ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/50' 
    : result.score >= 40 
    ? 'bg-amber-50 border-amber-200/50' 
    : 'bg-rose-50 border-rose-200/50';

  return (
    <div className={`p-6 max-w-4xl mx-auto space-y-8 text-left ${kidsMode ? 'theme-kids bg-pink-50/10' : ''}`}>
      {/* Back to list */}
      <Link
        to="/quizzes"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Quizzes</span>
      </Link>

      {/* Grade Card Summary */}
      <div className={`glass-premium p-8 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg ${scoreBg}`}>
        <div className="space-y-3 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold rounded-full text-xs border border-slate-100">
            <Award className="h-3.5 w-3.5 text-amber-500" /> Quiz Finished!
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">
            {quiz.title}
          </h2>
          <p className="text-xs text-slate-500">
            Attempted on: {new Date(result.date).toLocaleString()}
          </p>
        </div>

        {/* Score Ring */}
        <div className="flex flex-col items-center">
          <div className={`text-4xl md:text-5xl font-black ${scoreColor}`}>
            {result.score}%
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">
            Overall Score
          </span>
        </div>
      </div>

      {/* Review Answers heading */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-800 dark:text-white border-b border-slate-200/40 dark:border-slate-800/40 pb-3">
          Question Review
        </h3>

        <div className="space-y-6">
          {quiz.questions.map((q, idx) => {
            const studentAnswers = result.answers?.[q.id] || [];
            const correctAnswers = q.correctAnswers || [];

            // Check if correct
            const sortedStudent = [...studentAnswers].sort((a, b) => a - b);
            const sortedCorrect = [...correctAnswers].sort((a, b) => a - b);
            const isCorrect = sortedStudent.length === sortedCorrect.length &&
                              sortedStudent.every((val, index) => val === sortedCorrect[index]);

            return (
              <div
                key={q.id}
                className="glass-premium p-6 rounded-3xl border border-slate-200/40 dark:border-slate-800/40 space-y-4 relative overflow-hidden"
              >
                {/* Correct/Incorrect Tag */}
                <div className="absolute top-4 right-4">
                  {isCorrect ? (
                    <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                      <CheckCircle className="h-4 w-4" />
                      <span>Correct</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-rose-600 text-xs font-bold bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full">
                      <XCircle className="h-4 w-4" />
                      <span>Incorrect</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1 pr-24">
                  <span className="text-[10px] font-bold text-slate-400">
                    Question {idx + 1}
                  </span>
                  <h4 className="font-bold text-slate-800 dark:text-white leading-relaxed">
                    {q.questionText}
                  </h4>
                </div>

                {/* Option list with selection highlighting */}
                <div className="space-y-2 pt-2">
                  {q.options.map((opt, optIdx) => {
                    const wasSelected = studentAnswers.includes(optIdx);
                    const wasCorrect = correctAnswers.includes(optIdx);

                    let optionBorder = 'border-slate-100 dark:border-slate-800/50';
                    let optionBg = 'bg-slate-50/50 dark:bg-slate-900/30';
                    let optionText = 'text-slate-700 dark:text-slate-400';
                    let checkLabel = null;

                    if (wasCorrect) {
                      optionBorder = 'border-emerald-500';
                      optionBg = 'bg-emerald-50/40 dark:bg-emerald-950/10';
                      optionText = 'text-emerald-950 dark:text-emerald-300 font-bold';
                      checkLabel = <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">(Correct Key)</span>;
                    } else if (wasSelected && !wasCorrect) {
                      optionBorder = 'border-rose-300';
                      optionBg = 'bg-rose-50/40 dark:bg-rose-950/10';
                      optionText = 'text-rose-950 dark:text-rose-300 font-bold';
                      checkLabel = <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">(Your Answer)</span>;
                    }

                    if (wasSelected && wasCorrect) {
                      checkLabel = <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">(Your Answer - Correct)</span>;
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${optionBorder} ${optionBg} ${optionText}`}
                      >
                        <span>{opt}</span>
                        {checkLabel}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
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

export default QuizResult;
