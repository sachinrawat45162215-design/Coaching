import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import Layouts & Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Import Pages
import LandingPage from './pages/LandingPage';
import StudentLogin from './pages/StudentLogin';
import AdminLogin from './pages/AdminLogin';
import StudentDashboard from './pages/StudentDashboard';
import QuizList from './pages/QuizList';
import QuizAttempt from './pages/QuizAttempt';
import QuizResult from './pages/QuizResult';
import QuestionPapersList from './pages/QuestionPapersList';
import NotesLibrary from './pages/NotesLibrary';
import ResultsPerformance from './pages/ResultsPerformance';
import AdminDashboard from './pages/AdminDashboard';
import AdminStudents from './pages/AdminStudents';
import AdminQuizzes from './pages/AdminQuizzes';
import AdminUploads from './pages/AdminUploads';

// Protected Route for Students
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== 'student') {
    return <Navigate to="/admin-dashboard" replace />;
  }
  
  return children;
};

// Protected Route for Admins
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/admin-login" replace />;
  }
  
  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const MainLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [kidsMode, setKidsMode] = useState(() => localStorage.getItem('kidsMode') === 'true');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  useEffect(() => {
    if (kidsMode && user?.role === 'student') {
      document.body.classList.add('theme-kids');
      localStorage.setItem('kidsMode', 'true');
    } else {
      document.body.classList.remove('theme-kids');
      localStorage.setItem('kidsMode', 'false');
    }
  }, [kidsMode, user]);

  // Pages where Sidebar should not be shown
  const noSidebarPaths = ['/', '/login', '/admin-login'];
  const showSidebar = user && !noSidebarPaths.includes(location.pathname);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100 dark' : 'bg-slate-50 text-slate-800'}`}>
      <Navbar 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        kidsMode={kidsMode} 
        setKidsMode={setKidsMode} 
      />
      
      <div className="flex flex-1 relative">
        {showSidebar && <Sidebar />}
        <main className="flex-1 overflow-x-hidden">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<StudentLogin />} />
            <Route path="/admin-login" element={<AdminLogin />} />

            {/* Student Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard kidsMode={kidsMode} /></ProtectedRoute>} />
            <Route path="/quizzes" element={<ProtectedRoute><QuizList kidsMode={kidsMode} /></ProtectedRoute>} />
            <Route path="/quiz-attempt/:id" element={<ProtectedRoute><QuizAttempt kidsMode={kidsMode} /></ProtectedRoute>} />
            <Route path="/quiz-result/:id" element={<ProtectedRoute><QuizResult kidsMode={kidsMode} /></ProtectedRoute>} />
            <Route path="/papers" element={<ProtectedRoute><QuestionPapersList kidsMode={kidsMode} /></ProtectedRoute>} />
            <Route path="/notes" element={<ProtectedRoute><NotesLibrary kidsMode={kidsMode} /></ProtectedRoute>} />
            <Route path="/results" element={<ProtectedRoute><ResultsPerformance kidsMode={kidsMode} /></ProtectedRoute>} />

            {/* Admin Protected Routes */}
            <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin-students" element={<AdminRoute><AdminStudents /></AdminRoute>} />
            <Route path="/admin-quizzes" element={<AdminRoute><AdminQuizzes /></AdminRoute>} />
            <Route path="/admin-uploads" element={<AdminRoute><AdminUploads /></AdminRoute>} />

            {/* Fallback Catch All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;
