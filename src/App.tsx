import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Login } from './components/Auth/Login';
import { Signup } from './components/Auth/Signup';
import { Dashboard } from './components/Dashboard/Dashboard';

function App() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return authMode === 'login' ? (
      <Login onToggleMode={() => setAuthMode('signup')} />
    ) : (
      <Signup onToggleMode={() => setAuthMode('login')} />
    );
  }

  return <Dashboard />;
}

export default App;
