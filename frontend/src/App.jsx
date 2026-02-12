import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './components/Landing';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Notes from './components/Notes';
import Quiz from './components/Quiz';
import QuizResults from './components/QuizResults';
import PricingPage from './components/PricingPage';
import AITeaching from './components/AITeaching';
import Analytics from './components/Analytics';
import PaymentCallback from './components/PaymentCallback';
import ErrorBoundary from './components/ErrorBoundary';
import Loading from './components/Loading';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { getProfile } from './api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getProfile()
        .then((res) => {
          setUser(res.data);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <SubscriptionProvider user={user}>
          <Routes>
          <Route
            path="/login"
            element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/signup"
            element={!user ? <Signup onLogin={handleLogin} /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/pricing"
            element={user ? <PricingPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/subscription/callback"
            element={user ? <PaymentCallback /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard"
            element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={user ? <Profile user={user} setUser={setUser} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/notes"
            element={user ? <Notes user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/teaching"
            element={user ? <AITeaching user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/analytics"
            element={user ? <Analytics user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/quiz/:id"
            element={user ? <Quiz user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/quiz/:id/results"
            element={user ? <QuizResults user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
        </Routes>
        </SubscriptionProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
