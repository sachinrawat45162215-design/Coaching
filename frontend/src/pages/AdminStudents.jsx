import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Users, Search, Trash2, ShieldAlert } from 'lucide-react';
import Toast from '../components/Toast';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const classes = ['All', ...Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`)];

  const fetchStudents = async () => {
    try {
      const classQuery = selectedClass === 'All' ? '' : `className=${encodeURIComponent(selectedClass)}`;
      const searchQuery = searchTerm ? `search=${encodeURIComponent(searchTerm)}` : '';
      
      const queryParams = [classQuery, searchQuery].filter(Boolean).join('&');
      const endpoint = `/students${queryParams ? `?${queryParams}` : ''}`;
      
      const data = await api.get(endpoint);
      setStudents(data);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedClass, searchTerm]);

  const handleDelete = async (studentId, studentName) => {
    if (window.confirm(`Are you absolutely sure you want to permanently delete the student account for "${studentName}"? This will clean up all their results and exam submissions.`)) {
      try {
        await api.delete(`/students/${studentId}`);
        setToast({ message: `Deleted student "${studentName}" successfully.`, type: 'success' });
        
        // Reload list
        fetchStudents();
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
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/40 dark:border-slate-800/40 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">
            Student Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter by class, or manage registered student accounts.
          </p>
        </div>
      </div>

      {/* Filters & Search section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Search Input */}
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Class Selection Dropdown */}
        <div className="relative">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-brand-500 appearance-none"
          >
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                Filter: {cls === 'All' ? 'All Classes' : cls}
              </option>
            ))}
          </select>
          {/* Custom arrow icon styling */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="glass-premium rounded-3xl border border-slate-200/40 dark:border-slate-800/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-bold border-b border-slate-200/30 dark:border-slate-800/30">
                <th className="px-6 py-4">Student Info</th>
                <th className="px-6 py-4">Class level</th>
                <th className="px-6 py-4">Roll number</th>
                <th className="px-6 py-4">Email address</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img
                      src={student.profilePhoto || `https://api.dicebear.com/7.x/adventurer/svg?seed=${student.name}`}
                      alt="Avatar"
                      className="h-10 w-10 rounded-xl bg-slate-100 object-cover shrink-0"
                    />
                    <span className="font-bold text-slate-850 dark:text-slate-100">
                      {student.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">
                    {student.class}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {student.rollNo}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {student.email}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(student.id, student.name)}
                      className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all"
                      title="Delete Account"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {students.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-14 text-slate-400 text-xs">
                    No students matching the criteria were found.
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

export default AdminStudents;
