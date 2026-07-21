import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { UploadCloud, Trash2, FileText, FolderOpen, Calendar, BookText } from 'lucide-react';
import Toast from '../components/Toast';

const AdminUploads = () => {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'manage'
  const [contentType, setContentType] = useState('paper'); // 'paper' or 'note'
  const [papers, setPapers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [className, setClassName] = useState('Class 5');
  const [subject, setSubject] = useState('Math');
  const [dueDate, setDueDate] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const classes = Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`);
  const subjects = ['Math', 'Science', 'English', 'Social Studies'];

  const fetchLibrary = async () => {
    try {
      const [papersData, notesData] = await Promise.all([
        api.get('/papers?className=All'), // fetch all papers
        api.get('/notes?className=All')   // fetch all notes
      ]);
      setPapers(papersData);
      setNotes(notesData);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!title || !file) {
      setToast({ message: "Please fill in all fields and select a file.", type: 'error' });
      return;
    }

    if (contentType === 'paper' && !dueDate) {
      setToast({ message: "Due date is required for question papers.", type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('className', className);
      formData.append('subject', subject);
      formData.append('file', file);
      if (contentType === 'paper') {
        formData.append('dueDate', dueDate);
      }

      const endpoint = contentType === 'paper' ? '/papers' : '/notes';
      await api.post(endpoint, formData, true);

      setToast({ message: `Successfully uploaded ${contentType === 'paper' ? 'Question Paper' : 'Study Notes'}!`, type: 'success' });
      
      // Reset form
      setTitle('');
      setClassName('Class 5');
      setSubject('Math');
      setDueDate('');
      setFile(null);
      
      // Refresh library & switch to manage tab
      fetchLibrary();
      setActiveTab('manage');
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePaper = async (paperId, paperTitle) => {
    if (window.confirm(`Are you sure you want to permanently delete the question paper "${paperTitle}"? This will also wipe student grades for this paper.`)) {
      try {
        await api.delete(`/papers/${paperId}`);
        setToast({ message: `Successfully deleted paper "${paperTitle}".`, type: 'success' });
        fetchLibrary();
      } catch (err) {
        setToast({ message: err.message, type: 'error' });
      }
    }
  };

  const handleDeleteNote = async (noteId, noteTitle) => {
    if (window.confirm(`Are you sure you want to permanently delete the study note "${noteTitle}"?`)) {
      try {
        await api.delete(`/notes/${noteId}`);
        setToast({ message: `Successfully deleted note "${noteTitle}".`, type: 'success' });
        fetchLibrary();
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
            Library Uploads
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish assessment question papers and class summary notes.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'upload'
                ? 'bg-brand-600 text-white shadow shadow-brand-500/10'
                : 'bg-white dark:bg-slate-900 text-slate-650 dark:text-slate-400 border border-slate-200/40 hover:bg-slate-50'
            }`}
          >
            Upload Content
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'manage'
                ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow'
                : 'bg-white dark:bg-slate-900 text-slate-650 dark:text-slate-400 border border-slate-200/40 hover:bg-slate-50'
            }`}
          >
            Manage Library Files
          </button>
        </div>
      </div>

      {activeTab === 'upload' ? (
        /* Upload Content Tab */
        <div className="glass-premium p-6 sm:p-8 rounded-3xl border border-slate-200/40 dark:border-slate-800/40 space-y-6 max-w-2xl mx-auto">
          {/* Content Type Selector */}
          <div className="flex gap-4 p-1.5 bg-slate-50 dark:bg-slate-900 border rounded-2xl">
            <button
              type="button"
              onClick={() => setContentType('paper')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${
                contentType === 'paper'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-350'
              }`}
            >
              Question Paper / Worksheet
            </button>
            <button
              type="button"
              onClick={() => setContentType('note')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${
                contentType === 'note'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-350'
              }`}
            >
              Study Notes / PDF
            </button>
          </div>

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
                Material Title
              </label>
              <input
                type="text"
                placeholder={contentType === 'paper' ? 'Mid-Term Math Exam Paper' : 'Fraction Division Cheat Sheet'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
                  Target Class
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

            {contentType === 'paper' && (
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
                  Due Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
                Select File attachment (PDF/DOCX/Image)
              </label>
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-brand-500 rounded-2xl p-6 text-center cursor-pointer transition-colors relative group">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  required
                />
                <UploadCloud className="h-10 w-10 text-slate-400 mx-auto group-hover:text-brand-500 transition-colors mb-2" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-350">
                  {file ? file.name : 'Drag & drop file or click to browse'}
                </p>
                <p className="text-xs text-slate-400 mt-1">PDF, DOC, Images allowed up to 10MB</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold shadow-lg shadow-brand-500/10 hover:shadow-brand-500/25 transition-all text-xs disabled:opacity-50"
            >
              {submitting ? 'Publishing Material...' : `Publish ${contentType === 'paper' ? 'Question Paper' : 'Study Notes'}`}
            </button>
          </form>
        </div>
      ) : (
        /* Manage Library Files Tab */
        <div className="grid md:grid-cols-2 gap-8">
          {/* Question Papers list */}
          <div className="glass-premium p-6 rounded-3xl border border-slate-200/40 dark:border-slate-800/40 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200/30 dark:border-slate-850 pb-3">
              <FileText className="h-5 w-5 text-indigo-500" />
              <h3 className="font-extrabold text-slate-850 dark:text-white">Question Papers ({papers.length})</h3>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {papers.map((paper) => (
                <div
                  key={paper.id}
                  className="p-3 bg-white/50 dark:bg-slate-900/40 border rounded-2xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{paper.title}</p>
                    <span className="text-[10px] text-slate-500">
                      Class: {paper.class} | Subject: {paper.subject} | Due: {paper.dueDate}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeletePaper(paper.id, paper.title)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg shrink-0 transition-colors"
                    title="Delete Paper"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {papers.length === 0 && (
                <p className="text-center py-10 text-slate-400 text-xs">No question papers published yet.</p>
              )}
            </div>
          </div>

          {/* Study Notes list */}
          <div className="glass-premium p-6 rounded-3xl border border-slate-200/40 dark:border-slate-800/40 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200/30 dark:border-slate-850 pb-3">
              <BookText className="h-5 w-5 text-emerald-500" />
              <h3 className="font-extrabold text-slate-850 dark:text-white">Study Notes ({notes.length})</h3>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 bg-white/50 dark:bg-slate-900/40 border rounded-2xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{note.title}</p>
                    <span className="text-[10px] text-slate-500">
                      Class: {note.class} | Subject: {note.subject}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteNote(note.id, note.title)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg shrink-0 transition-colors"
                    title="Delete Note"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {notes.length === 0 && (
                <p className="text-center py-10 text-slate-400 text-xs">No study notes published yet.</p>
              )}
            </div>
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

export default AdminUploads;
