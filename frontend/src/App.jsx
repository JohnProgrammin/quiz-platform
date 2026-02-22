// Cache bust: 2026-02-19-forced-redeploy
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Landing from './components/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './components/Dashboard';
import Profile from './pages/Profile';
import Notes from './components/Notes';
import Quiz from './pages/Quiz';
import QuizResults from './components/QuizResults';
import PricingPage from './components/PricingPage';
import AITeaching from './components/AITeaching';
import Analytics from './pages/Analytics';
import PaymentCallback from './components/PaymentCallback';
import ErrorBoundary from './components/ErrorBoundary';
import Loading from './components/Loading';
import About from './components/About';
import Contact from './components/Contact';
import Privacy from './components/Privacy';
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

  // Wrapper component that provides the sidebar layout
  const WithLayout = ({ children }) => (
    <DashboardLayout user={user} onLogout={handleLogout}>
      {children}
    </DashboardLayout>
  );

  return (
    <ErrorBoundary>
      <Router>
        <SubscriptionProvider user={user}>
          {/* Sonner toast provider */}
          <Toaster
            position="top-center"
            richColors
            expand={false}
            closeButton
            toastOptions={{
              style: {
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 700,
                borderRadius: '16px',
                border: '2px solid #e8e8e8',
                boxShadow: '0 4px 0 #e0e0e0',
                background: '#ffffff',
                color: '#1a1a2e',
                fontSize: '14px',
              },
              actionButtonStyle: {
                background: '#7c5bfc',
                color: '#fff',
                fontWeight: 800,
                borderRadius: '8px',
                fontSize: '12px',
              },
              cancelButtonStyle: {
                background: '#f3f4f6',
                color: '#6b7280',
                fontWeight: 800,
                borderRadius: '8px',
                fontSize: '12px',
              },
            }}
          />

          <Routes>
            {/* Public routes — no sidebar */}
            <Route
              path="/login"
              element={!user ? <Login /> : <Navigate to="/dashboard" />}
            />
            <Route
              path="/signup"
              element={!user ? <Signup /> : <Navigate to="/dashboard" />}
            />
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />

            <Route
              path="/dashboard"
              element={user ? <WithLayout><Dashboard /></WithLayout> : <Navigate to="/login" />}
            />
            <Route
              path="/pricing"
              element={user ? <WithLayout><PricingPage user={user} onLogout={handleLogout} /></WithLayout> : <Navigate to="/login" />}
            />
            <Route
              path="/subscription/callback"
              element={user ? <PaymentCallback /> : <Navigate to="/login" />}
            />
            <Route
              path="/profile"
              element={user ? <WithLayout><Profile user={user} setUser={setUser} onLogout={handleLogout} /></WithLayout> : <Navigate to="/login" />}
            />
            <Route
              path="/notes"
              element={user ? <WithLayout><Notes user={user} onLogout={handleLogout} /></WithLayout> : <Navigate to="/login" />}
            />
            <Route
              path="/ai-teaching"
              element={user ? <WithLayout><AITeaching user={user} onLogout={handleLogout} /></WithLayout> : <Navigate to="/login" />}
            />
            <Route
              path="/analytics"
              element={user ? <WithLayout><Analytics user={user} onLogout={handleLogout} /></WithLayout> : <Navigate to="/login" />}
            />
            <Route
              path="/quiz/:id"
              element={user ? <WithLayout><Quiz user={user} onLogout={handleLogout} /></WithLayout> : <Navigate to="/login" />}
            />
            <Route
              path="/quiz/:id/results"
              element={user ? <WithLayout><QuizResults user={user} onLogout={handleLogout} /></WithLayout> : <Navigate to="/login" />}
            />
          </Routes>
        </SubscriptionProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
