import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Clock, AlertTriangle, ChevronRight, ChevronLeft, Send } from 'lucide-react';
import Toast from '../components/Toast';

const QuizAttempt = ({ kidsMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Quiz state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { q_id: [indices] }
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const timerRef = useRef(null);
  const quizRef = useRef(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quizData = await api.get(`/quizzes/${id}`);
        setQuiz(quizData);
        setTimeLeft(quizData.duration * 60);
      } catch (err) {
        setToast({ message: err.message, type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  // Keep a ref to the latest values so the timer callback can read them without re-binding
  const submittingRef = useRef(submitting);
  submittingRef.current = submitting;
  const selectedAnswersRef = useRef(selectedAnswers);
  selectedAnswersRef.current = selectedAnswers;

  // Auto-submit trigger
  const triggerAutoSubmit = async () => {
    if (submittingRef.current) return;
    setSubmitting(true);
    setToast({ message: 'Time is up! Submitting quiz answers automatically...', type: 'info' });
    
    try {
      const response = await api.post('/results/quiz-submit', {
        quizId: id,
        answers: selectedAnswersRef.current
      });
      navigate(`/quiz-result/${response.resultId}`);
    } catch (err) {
      setToast({ message: 'Auto-submit failed: ' + err.message, type: 'error' });
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (loading || !quiz) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          triggerAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, quiz]);

  // Answer handler
  const handleSelect = (questionId, optionIdx, isMultiple) => {
    const currentSelections = selectedAnswers[questionId] || [];
    
    if (isMultiple) {
      if (currentSelections.includes(optionIdx)) {
        setSelectedAnswers({
          ...selectedAnswers,
          [questionId]: currentSelections.filter(idx => idx !== optionIdx)
        });
      } else {
        setSelectedAnswers({
          ...selectedAnswers,
          [questionId]: [...currentSelections, optionIdx]
        });
      }
    } else {
      setSelectedAnswers({
        ...selectedAnswers,
        [questionId]: [optionIdx]
      });
    }
  };

  // Submit trigger
  const handleSubmit = async () => {
    if (window.confirm("Are you sure you want to finish and submit your answers?")) {
      setSubmitting(true);
      if (timerRef.current) clearInterval(timerRef.current);

      try {
        const response = await api.post('/results/quiz-submit', {
          quizId: id,
          answers: selectedAnswers
        });
        setToast({ message: 'Quiz submitted successfully!', type: 'success' });
        setTimeout(() => navigate(`/quiz-result/${response.resultId}`), 1000);
      } catch (err) {
        setToast({ message: err.message, type: 'error' });
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="p-6 text-center text-slate-500">
        Quiz not found or could not be loaded.
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIdx];
  const isMultiple = currentQuestion.type === 'multiple';

  // Format timer text
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className={`p-6 max-w-4xl mx-auto space-y-6 text-left ${kidsMode ? 'theme-kids bg-pink-50/10' : ''}`}>
      {/* Top quiz bar */}
      <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-slate-800/40 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white truncate">
            {quiz.title}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Subject: {quiz.subject} | Grade: {quiz.class}
          </p>
        </div>

        {/* Timer view */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-mono font-bold text-sm shadow-sm border ${
          timeLeft < 60 
            ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950 dark:border-rose-900 dark:text-rose-400 animate-pulse'
            : 'bg-white border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
        }`}>
          <Clock className="h-4 w-4" />
          <span>{timerText}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Left Side: Question Navigation */}
        <div className="md:col-span-1 glass-premium p-4 rounded-3xl border border-slate-200/40 dark:border-slate-800/40 self-start">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Question Map
          </p>
          <div className="grid grid-cols-4 gap-2">
            {quiz.questions.map((_, idx) => {
              const qId = quiz.questions[idx].id;
              const hasAnswered = selectedAnswers[qId] && selectedAnswers[qId].length > 0;
              const isCurrent = idx === currentIdx;

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  className={`h-9 w-9 rounded-xl font-bold text-xs transition-all ${
                    isCurrent
                      ? 'bg-brand-600 text-white scale-105 shadow-md shadow-brand-500/10'
                      : hasAnswered
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/40'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Attempt Box */}
        <div className="md:col-span-3 space-y-6">
          <div className="glass-premium p-6 sm:p-8 rounded-3xl border border-slate-200/40 dark:border-slate-800/40 space-y-6">
            {/* Question description */}
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                Question {currentIdx + 1} of {quiz.questions.length}
              </span>
              {isMultiple && (
                <span className="ml-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                  (Multiple Answers Possible)
                </span>
              )}
              <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-relaxed">
                {currentQuestion.questionText}
              </h3>
            </div>

            {/* Answer Options list */}
            <div className="space-y-3">
              {currentQuestion.options.map((opt, optIdx) => {
                const isChecked = selectedAnswers[currentQuestion.id]?.includes(optIdx) || false;
                
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelect(currentQuestion.id, optIdx, isMultiple)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all ${
                      isChecked
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 text-brand-900 dark:text-brand-300 font-bold scale-[1.01]'
                        : 'border-slate-200/60 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-400'
                    }`}
                  >
                    <span>{opt}</span>
                    <div className={`h-5 w-5 rounded-lg border-2 flex items-center justify-center shrink-0 ${
                      isChecked 
                        ? 'border-brand-600 bg-brand-600 text-white' 
                        : 'border-slate-300 dark:border-slate-700'
                    }`}>
                      {isChecked && (
                        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 font-bold text-xs"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </button>

            {currentIdx < quiz.questions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx(prev => prev + 1)}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs shadow-sm"
              >
                <span>Next MCQ</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/15"
              >
                <Send className="h-4 w-4" />
                <span>Submit Assessment</span>
              </button>
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

export default QuizAttempt;
