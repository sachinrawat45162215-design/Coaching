import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { BookOpen, Clock, HelpCircle, CheckCircle } from 'lucide-react';
import Toast from '../components/Toast';

const QuizList = ({ kidsMode }) => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const subjects = ['All', 'Math', 'Science', 'English', 'Social Studies'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return;
        const [qData, rData] = await Promise.all([
          api.get('/quizzes'),
          api.get(`/results/student/${user.id}`)
        ]);
        setQuizzes(qData);
        setResults(rData);
      } catch (err) {
        setToast({ message: err.message, type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const filteredQuizzes = selectedSubject === 'All'
    ? quizzes
    : quizzes.filter(q => q.subject === selectedSubject);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 text-left ${kidsMode ? 'theme-kids bg-pink-50/10' : ''}`}>
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">
            Available Quizzes
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Test your understanding and earn high marks!
          </p>
        </div>

        {/* Subject Filter list */}
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

      {/* Quizzes List Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.map((quiz) => {
          const quizResult = results.find(r => r.assessmentId === quiz.id && r.assessmentType === 'quiz');
          const isCompleted = !!quizResult;

          return (
            <div
              key={quiz.id}
              className={`glass-premium p-6 rounded-3xl border flex flex-col justify-between hover:scale-[1.02] transition-all relative overflow-hidden ${
                kidsMode
                  ? 'kids-card border-amber-300'
                  : 'border-slate-200/45 dark:border-slate-800/45'
              }`}
            >
              {/* Completed overlay status banner */}
              {isCompleted && (
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  <CheckCircle className="h-3 w-3" />
                  <span>Graded: {quizResult.score}%</span>
                </div>
              )}

              <div className="space-y-4">
                <span className="inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                  {quiz.subject}
                </span>

                <h3 className="text-lg font-extrabold text-slate-800 dark:text-white leading-tight pr-14">
                  {quiz.title}
                </h3>

                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{quiz.duration} mins</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span>{quiz.questions?.length || 0} MCQs</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/30 dark:border-slate-800/30">
                {isCompleted ? (
                  <Link
                    to={`/quiz-result/${quizResult.id}`}
                    className="w-full py-2.5 rounded-xl border border-emerald-500 text-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 font-bold text-xs inline-block text-center transition-colors"
                  >
                    Review Answers
                  </Link>
                ) : (
                  <Link
                    to={`/quiz-attempt/${quiz.id}`}
                    className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs inline-block text-center shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-all"
                  >
                    Start Attempt
                  </Link>
                )}
              </div>
            </div>
          );
        })}

        {filteredQuizzes.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white/20 dark:bg-slate-900/10 rounded-3xl border border-dashed border-slate-300/40 dark:border-slate-800/40">
            <BookOpen className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 dark:text-slate-300">No quizzes found</h3>
            <p className="text-xs text-slate-500 mt-1">
              There are no quizzes uploaded for {selectedSubject === 'All' ? 'your class' : `subject ${selectedSubject}`} yet.
            </p>
          </div>
        )}
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

export default QuizList;
