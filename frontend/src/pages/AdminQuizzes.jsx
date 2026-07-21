import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Trash2, HelpCircle, FileQuestion, BookOpen, Clock } from 'lucide-react';
import Toast from '../components/Toast';

const AdminQuizzes = () => {
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'create'
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [className, setClassName] = useState('Class 5');
  const [subject, setSubject] = useState('Math');
  const [duration, setDuration] = useState('15');
  const [questions, setQuestions] = useState([
    {
      questionText: '',
      options: ['', ''],
      correctAnswers: [],
      type: 'single'
    }
  ]);

  const classes = Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`);
  const subjects = ['Math', 'Science', 'English', 'Social Studies'];

  const fetchQuizzes = async () => {
    try {
      // Get all quizzes
      const data = await api.get('/quizzes?className=All'); // Admin fetches all
      setQuizzes(data);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Form Handlers
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        options: ['', ''],
        correctAnswers: [],
        type: 'single'
      }
    ]);
  };

  const handleRemoveQuestion = (qIdx) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, idx) => idx !== qIdx));
  };

  const handleQuestionTextChange = (qIdx, text) => {
    const updated = [...questions];
    updated[qIdx].questionText = text;
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx, optIdx, text) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx] = text;
    setQuestions(updated);
  };

  const handleAddOption = (qIdx) => {
    const updated = [...questions];
    updated[qIdx].options.push('');
    setQuestions(updated);
  };

  const handleRemoveOption = (qIdx, optIdx) => {
    const updated = [...questions];
    if (updated[qIdx].options.length <= 2) return;
    updated[qIdx].options = updated[qIdx].options.filter((_, idx) => idx !== optIdx);
    // Correct index correction
    updated[qIdx].correctAnswers = updated[qIdx].correctAnswers
      .filter(idx => idx !== optIdx)
      .map(idx => idx > optIdx ? idx - 1 : idx);
    setQuestions(updated);
  };

  const handleCorrectToggle = (qIdx, optIdx, isMultiple) => {
    const updated = [...questions];
    const currentCorrect = updated[qIdx].correctAnswers;

    if (isMultiple) {
      if (currentCorrect.includes(optIdx)) {
        updated[qIdx].correctAnswers = currentCorrect.filter(idx => idx !== optIdx);
      } else {
        updated[qIdx].correctAnswers = [...currentCorrect, optIdx];
      }
    } else {
      updated[qIdx].correctAnswers = [optIdx];
    }
    setQuestions(updated);
  };

  const handleQuestionTypeChange = (qIdx, type) => {
    const updated = [...questions];
    updated[qIdx].type = type;
    updated[qIdx].correctAnswers = []; // reset corrects on type change
    setQuestions(updated);
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!title) {
      setToast({ message: "Quiz title is required.", type: 'error' });
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        setToast({ message: `Question ${i + 1} text is empty.`, type: 'error' });
        return;
      }
      if (q.options.some(opt => !opt.trim())) {
        setToast({ message: `Some options in Question ${i + 1} are empty.`, type: 'error' });
        return;
      }
      if (q.correctAnswers.length === 0) {
        setToast({ message: `Please pick at least one correct key for Question ${i + 1}.`, type: 'error' });
        return;
      }
    }

    try {
      await api.post('/quizzes', {
        title,
        className,
        subject,
        duration: parseInt(duration),
        questions
      });

      setToast({ message: "Quiz published successfully!", type: 'success' });
      
      // Reset form
      setTitle('');
      setClassName('Class 5');
      setSubject('Math');
      setDuration('15');
      setQuestions([
        {
          questionText: '',
          options: ['', ''],
          correctAnswers: [],
          type: 'single'
        }
      ]);
      
      // Navigate to list
      setActiveTab('list');
      fetchQuizzes();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const handleDeleteQuiz = async (quizId, quizTitle) => {
    if (window.confirm(`Are you sure you want to permanently delete the quiz "${quizTitle}"?`)) {
      try {
        await api.delete(`/quizzes/${quizId}`);
        setToast({ message: `Deleted quiz "${quizTitle}" successfully.`, type: 'success' });
        fetchQuizzes();
      } catch (err) {
        setToast({ message: err.message, type: 'error' });
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

  return (
    <div className="p-6 space-y-6 text-left">
      {/* Header section with Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/40 dark:border-slate-800/40 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">
            Quiz Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Author and inspect timed multiple-choice assessments.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'list'
                ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow'
                : 'bg-white dark:bg-slate-900 text-slate-650 dark:text-slate-400 border border-slate-200/40 hover:bg-slate-50'
            }`}
          >
            Active Quizzes
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'create'
                ? 'bg-brand-600 text-white shadow shadow-brand-500/10'
                : 'bg-white dark:bg-slate-900 text-slate-650 dark:text-slate-400 border border-slate-200/40 hover:bg-slate-50'
            }`}
          >
            Create New Quiz
          </button>
        </div>
      </div>

      {activeTab === 'list' ? (
        /* Quiz List Tab */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="glass-premium p-6 rounded-3xl border border-slate-200/40 dark:border-slate-800/40 flex flex-col justify-between hover:scale-[1.01] transition-all"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                    {quiz.subject}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {quiz.class}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-800 dark:text-white leading-tight">
                  {quiz.title}
                </h3>

                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>{quiz.duration} mins</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <HelpCircle className="h-4 w-4 text-slate-400" />
                    <span>{quiz.questions?.length || 0} Questions</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/30 dark:border-slate-800/30">
                <button
                  onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                  className="w-full py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Quiz</span>
                </button>
              </div>
            </div>
          ))}

          {quizzes.length === 0 && (
            <div className="col-span-full text-center py-16 bg-white/20 dark:bg-slate-900/10 rounded-3xl border border-dashed border-slate-300/40 dark:border-slate-800/40">
              <FileQuestion className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 dark:text-slate-300">No quizzes authoring records</h3>
              <p className="text-xs text-slate-500 mt-1">
                Click "Create New Quiz" above to publish your first assessment.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Create Quiz Form Tab */
        <form onSubmit={handleQuizSubmit} className="glass-premium p-6 sm:p-8 rounded-3xl border border-slate-200/40 dark:border-slate-800/40 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
                Quiz Title
              </label>
              <input
                type="text"
                placeholder="Mid-Term Math assessment"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
                Target Class Level
              </label>
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-brand-500"
              >
                {classes.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-brand-500"
              >
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
                Timer Duration (Minutes)
              </label>
              <input
                type="number"
                placeholder="15"
                min="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-brand-500"
                required
              />
            </div>
          </div>

          {/* Questions Editor */}
          <div className="space-y-6 pt-4 border-t border-slate-200/30 dark:border-slate-800/30">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-slate-800 dark:text-white">
                Questions Board
              </h3>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-3.5 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors dark:bg-brand-950/40 dark:text-brand-300"
              >
                <Plus className="h-4 w-4" />
                <span>Add MCQ Question</span>
              </button>
            </div>

            <div className="space-y-8">
              {questions.map((q, qIdx) => (
                <div
                  key={qIdx}
                  className="p-5 bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200/10 space-y-4 relative"
                >
                  {/* Delete question floating index */}
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIdx)}
                      className="absolute top-4 right-4 p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                      title="Remove Question"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-500 block mb-1">
                        Question {qIdx + 1} text
                      </label>
                      <input
                        type="text"
                        placeholder="What is the chemical symbol for Helium?"
                        value={q.questionText}
                        onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">
                        MCQ Type
                      </label>
                      <select
                        value={q.type}
                        onChange={(e) => handleQuestionTypeChange(qIdx, e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none"
                      >
                        <option value="single">Single Choice (Radio)</option>
                        <option value="multiple">Multiple Correct (Checkbox)</option>
                      </select>
                    </div>
                  </div>

                  {/* Options management */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold text-slate-500 block">
                      Options & Correct Keys
                    </label>
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = q.correctAnswers.includes(optIdx);

                        return (
                          <div key={optIdx} className="flex items-center gap-3">
                            <input
                              type={q.type === 'single' ? 'radio' : 'checkbox'}
                              name={`correct-key-${qIdx}`}
                              checked={isCorrect}
                              onChange={() => handleCorrectToggle(qIdx, optIdx, q.type === 'multiple')}
                              className="h-4.5 w-4.5 text-brand-600 focus:ring-brand-500 rounded border-slate-350"
                              title="Mark as correct answer option"
                            />
                            <input
                              type="text"
                              placeholder={`Option ${optIdx + 1}`}
                              value={opt}
                              onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none"
                              required
                            />
                            {q.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveOption(qIdx, optIdx)}
                                className="p-1.5 text-slate-400 hover:text-rose-500"
                                title="Remove Option"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddOption(qIdx)}
                      className="text-xs font-bold text-brand-600 hover:underline inline-flex items-center gap-1.5 pt-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Option Field</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200/30 dark:border-slate-800/30 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-all text-xs"
            >
              Publish Assessment Quiz
            </button>
          </div>
        </form>
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

export default AdminQuizzes;
