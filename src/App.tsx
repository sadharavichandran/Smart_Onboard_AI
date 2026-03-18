import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import RoleSelection from './pages/RoleSelection';
import AISkillAssessment from './pages/AISkillAssessment';
import LearningPlan from './pages/LearningPlan';
import Dashboard from './pages/Dashboard';
import DailyLearning from './pages/DailyLearning';
import TrackingDashboard from './pages/TrackingDashboard';
import FinalTest from './pages/FinalTest';
import Projects from './pages/Projects';
import AIMentor from './pages/AIMentor';
import { LanguageProvider } from './context/LanguageContext';
import Onboarding from './pages/Onboarding';
import Settings from './pages/Settings';
import LanguageSelection from './pages/LanguageSelection';
import DashboardLayout from './components/DashboardLayout';
import { User } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const REQUIRED_DAYS = 7;

  useEffect(() => {
    const syncUser = () => {
      const savedUser = localStorage.getItem('smartonboard_user');
      if (!savedUser) return;

      try {
        const parsed = JSON.parse(savedUser) as User;
        setUser((prev) => {
          const prevText = prev ? JSON.stringify(prev) : '';
          const parsedText = JSON.stringify(parsed);
          return prevText === parsedText ? prev : parsed;
        });
      } catch {
        // Ignore invalid localStorage payload.
      }
    };

    syncUser();

    const onStorage = (event: StorageEvent) => {
      if (event.key === 'smartonboard_user') {
        syncUser();
      }
    };

    window.addEventListener('storage', onStorage);
    const poller = window.setInterval(syncUser, 2000);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.clearInterval(poller);
    };
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('smartonboard_user', JSON.stringify(user));
    }
    setLoading(false);
  }, [user]);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleUpdateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('smartonboard_user');
  };

  const completedDaysCount = Object.values(user?.progress || {}).filter((day) => day.completed).length;
  const isFinalTestUnlocked = completedDaysCount >= REQUIRED_DAYS;

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <LanguageProvider user={user} onUpdateUser={handleUpdateUser}>
      <BrowserRouter>
        <Routes>
          <Route 
            path="/" 
            element={user ? <Navigate to="/dashboard" /> : <Landing />} 
          />
          <Route 
            path="/login" 
            element={user ? <Navigate to="/role-selection" /> : <Login onLogin={handleLogin} />} 
          />
          <Route 
            path="/signup" 
            element={user ? <Navigate to="/role-selection" /> : <Signup onLogin={handleLogin} />} 
          />
          <Route 
            path="/role-selection" 
            element={user ? <RoleSelection user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/onboarding" 
            element={user ? <Onboarding user={user} onUpdateUser={handleUpdateUser} /> : <Navigate to="/login" />} 
          />
          
          {/* Dashboard Layout Wrapper */}
          <Route 
            element={user ? <DashboardLayout user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
          >
            <Route path="/dashboard" element={<Dashboard user={user} onLogout={handleLogout} />} />
            <Route path="/learning-plan" element={<LearningPlan user={user} />} />
            <Route path="/skill-assessment" element={<AISkillAssessment user={user} onUpdateUser={handleUpdateUser} />} />
            <Route path="/tracking" element={<TrackingDashboard user={user} />} />
            <Route path="/projects" element={<Projects user={user} />} />
            <Route path="/ai-mentor" element={<AIMentor user={user} />} />
            <Route path="/final-test" element={isFinalTestUnlocked ? <FinalTest user={user} /> : <Navigate to="/dashboard" />} />
            <Route path="/settings" element={<Settings user={user} onUpdateUser={handleUpdateUser} />} />
            <Route path="/language" element={<LanguageSelection />} />
            <Route path="/learning/:day" element={<DailyLearning user={user} onUpdateUser={handleUpdateUser} />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Route>
          

        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
