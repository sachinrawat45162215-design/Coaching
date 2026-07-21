import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Sparkles, LogOut, Award } from 'lucide-react';

const Navbar = ({ darkMode, setDarkMode, kidsMode, setKidsMode }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="glass sticky top-0 z-30 w-full px-6 py-4 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-brand-500/20">
          ES
        </div>
        <div>
          <span className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-400 dark:to-indigo-300">
            EduSphere
          </span>
          <span className="ml-1.5 text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 font-bold dark:bg-brand-950/50 dark:text-brand-300">
            v1.0
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user && user.role === 'student' && (
          <button
            onClick={() => setKidsMode(!kidsMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 shadow-sm ${
              kidsMode
                ? 'bg-amber-400 text-amber-950 hover:bg-amber-500 scale-105'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
            title="Toggle between Playful Kids Mode & Senior Mode"
          >
            <Sparkles className="h-3.5 w-3.5 animate-spin-slow text-amber-600" />
            <span>{kidsMode ? 'Kids Mode: ON' : 'Regular Mode'}</span>
          </button>
        )}

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5" />}
        </button>

        {user ? (
          <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{user.name}</p>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                {user.role === 'admin' ? 'Admin' : `${user.class} | Roll: ${user.rollNo}`}
              </span>
            </div>
            <img
              src={user.profilePhoto || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
              alt="Profile"
              className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 object-cover"
            />
          </div>
        ) : null}
      </div>
    </nav>
  );
};

export default Navbar;
