import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Award, 
  FolderOpen, 
  Users, 
  FilePlus, 
  Upload, 
  ClipboardCheck, 
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/quizzes', label: 'Quizzes', icon: BookOpen },
    { to: '/papers', label: 'Question Papers', icon: FileText },
    { to: '/notes', label: 'Notes Library', icon: FolderOpen },
    { to: '/results', label: 'My Performance', icon: Award },
  ];

  const adminLinks = [
    { to: '/admin-dashboard', label: 'Admin Panel', icon: LayoutDashboard },
    { to: '/admin-students', label: 'Student Directory', icon: Users },
    { to: '/admin-quizzes', label: 'Manage Quizzes', icon: FilePlus },
    { to: '/admin-uploads', label: 'Upload Papers/Notes', icon: Upload },
  ];

  const links = user.role === 'admin' ? adminLinks : studentLinks;

  return (
    <aside className="glass w-64 h-[calc(100vh-76px)] hidden md:flex flex-col justify-between p-4 border-r border-slate-200 dark:border-slate-800 transition-all duration-300">
      <div className="space-y-6">
        <div className="px-3">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Main Menu
          </p>
        </div>

        <nav className="space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20 scale-[1.02]'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-brand-600 dark:hover:text-brand-400'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
