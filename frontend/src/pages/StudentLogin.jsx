import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, User, Mail, Lock, Clipboard, Hash, Sparkles } from 'lucide-react';
import Toast from '../components/Toast';
import api from '../utils/api';


const StudentLogin = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [className, setClassName] = useState('Class 5');
  const [rollNo, setRollNo] = useState('');
  
  // Password Reset state
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name || !email || !password || !className || !rollNo) {
          throw new Error('Please fill in all fields.');
        }
        await register(name, email, password, className, rollNo);
        setToast({ message: 'Welcome to EduSphere! Registered successfully.', type: 'success' });
      } else {
        if (!email || !password) {
          throw new Error('Please enter both email and password.');
        }
        await login(email, password);
        setToast({ message: 'Welcome back!', type: 'success' });
      }
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail || !resetNewPassword) {
      setToast({ message: 'Please fill in all fields.', type: 'error' });
      return;
    }
    
    try {
      const data = await api.post('/auth/reset-password', { email: resetEmail, newPassword: resetNewPassword });

      
      setToast({ message: 'Password updated successfully!', type: 'success' });
      setShowReset(false);
      setResetEmail('');
      setResetNewPassword('');
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const classes = Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`);

  return (
    <div className="min-h-[calc(100vh-76px)] flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="glass-premium max-w-5xl w-full rounded-3xl overflow-hidden grid md:grid-cols-2 shadow-2xl">
        {/* Left Graphics Panel */}
        <div className="bg-gradient-to-tr from-brand-600 to-indigo-600 text-white p-12 hidden md:flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-lg">
              ES
            </div>
            <h2 className="text-3xl font-extrabold mt-8 leading-tight">
              Unlock Your Full Learning Potential
            </h2>
            <p className="mt-4 text-white/80 text-sm leading-relaxed">
              Join thousands of students accessing interactive lessons, tracking their grades, and excelling in exams across all grade levels.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl">
              <Sparkles className="h-5 w-5 text-amber-300 shrink-0" />
              <p className="text-xs font-semibold">
                Auto-scored timed quizzes with instantaneous feedback report.
              </p>
            </div>
            <p className="text-xs text-white/50">© 2026 EduSphere. All rights reserved.</p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">
              {isSignUp ? 'Create Student Account' : 'Student Sign In'}
            </h2>
            <p className="text-xs text-slate-500 mt-1.5">
              {isSignUp
                ? 'Fill in your details below to get registered'
                : 'Enter your credentials to access your dashboard'}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Abhi Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
                      Class Level
                    </label>
                    <div className="relative">
                      <Clipboard className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                      <select
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500 transition-colors appearance-none"
                      >
                        {classes.map((cls) => (
                          <option key={cls} value={cls}>
                            {cls}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
                      Roll Number
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="05"
                        value={rollNo}
                        onChange={(e) => setRollNo(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500 transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="email"
                  placeholder="student@platform.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500 transition-colors"
                  required
                />
              </div>
            </div>

            {!isSignUp && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowReset(true)}
                  className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-all duration-300 disabled:opacity-55"
            >
              {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-350"
            >
              {isSignUp ? (
                <span>
                  Already have an account?{' '}
                  <strong className="text-brand-600 dark:text-brand-400 hover:underline">
                    Sign In here
                  </strong>
                </span>
              ) : (
                <span>
                  Don't have an account?{' '}
                  <strong className="text-brand-600 dark:text-brand-400 hover:underline">
                    Sign Up here
                  </strong>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showReset && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-premium max-w-md w-full p-6 rounded-3xl shadow-2xl relative">
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mb-2">
              Reset Password
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Enter your email and provide a new password to reset it.
            </p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="student@platform.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowReset(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-md"
                >
                  Save New Password
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

export default StudentLogin;
