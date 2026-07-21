import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { getFileUrl } from '../utils/api';

import { FolderOpen, Download, BookText, Calendar } from 'lucide-react';
import Toast from '../components/Toast';

const NotesLibrary = ({ kidsMode }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const subjects = ['All', 'Math', 'Science', 'English', 'Social Studies'];

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        if (!user) return;
        const data = await api.get('/notes');
        setNotes(data);
      } catch (err) {
        setToast({ message: err.message, type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [user]);

  const filteredNotes = selectedSubject === 'All'
    ? notes
    : notes.filter(n => n.subject === selectedSubject);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 text-left ${kidsMode ? 'theme-kids bg-pink-50/10' : ''}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">
            Class Study Notes
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse and download study materials categorized by subject.
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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className={`glass-premium p-6 rounded-3xl border flex flex-col justify-between hover:scale-[1.02] transition-all relative overflow-hidden ${
              kidsMode
                ? 'kids-card border-amber-300'
                : 'border-slate-200/45 dark:border-slate-800/45'
            }`}
          >
            <div className="space-y-4">
              <span className="inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                {note.subject}
              </span>

              <div className="flex gap-3 items-start">
                <BookText className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white leading-tight">
                  {note.title}
                </h3>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-2">
                <Calendar className="h-4 w-4 shrink-0 text-slate-450" />
                <span>Uploaded: {new Date(note.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200/30 dark:border-slate-800/30">
              <a
                href={getFileUrl(note.fileUrl)}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-700 dark:hover:bg-slate-100 transition-colors shadow-sm"
              >
                <Download className="h-4 w-4" />
                <span>Download Notes</span>
              </a>
            </div>
          </div>
        ))}

        {filteredNotes.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white/20 dark:bg-slate-900/10 rounded-3xl border border-dashed border-slate-300/40 dark:border-slate-800/40">
            <FolderOpen className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 dark:text-slate-300">No study notes available</h3>
            <p className="text-xs text-slate-500 mt-1">
              There are no notes uploaded for {selectedSubject === 'All' ? 'your class' : `subject ${selectedSubject}`} yet.
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

export default NotesLibrary;
