import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ShieldCheck } from 'lucide-react';
import Toast from '../components/Toast';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Please fill in all fields.');
      }
      
      const loggedUser = await login(email, password);
      
      if (loggedUser.role !== 'admin') {
        throw new Error('Access denied. This portal is for administrators only.');
      }

      setToast({ message: 'Admin authenticated successfully!', type: 'success' });
      setTimeout(() => navigate('/admin-dashboard'), 1000);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-76px)] flex items-center justify-center bg-slate-900 text-slate-100 p-6 relative overflow-hidden">
      {/* Background radial effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      
      <div className="glass-premium max-w-md w-full p-8 sm:p-10 rounded-3xl border border-white/5 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/20 mb-4">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Admin Console
          </h2>
          <p className="text-xs text-slate-400 mt-1.5">
            Authorized personnel login only
          </p>
        </div>

        <form onSubmit={handleAdminSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
              <input
                type="email"
                placeholder="admin@platform.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/5 bg-slate-950/50 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1.5">
              Secure Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/5 bg-slate-950/50 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold shadow-lg shadow-violet-500/20 hover:shadow-violet-500/35 transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In To Panel'}
          </button>
        </form>
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

export default AdminLogin;
