import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Nav from './components/Nav';
import Home from './pages/Home';
import Transparency from './pages/Transparency';
import FAQ from './pages/FAQ';
import Landing from './pages/Landing';
import Emails from './pages/Emails';  // Import the Emails component
import Alias from './pages/Alias'; // Import the Alias component
import PasswordManager from './pages/passwordManager'; // Import the PasswordManager component
import useAuth from './hooks/useAuth';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}

function AppContent() {
  const { isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Nav isAuthenticated={isAuthenticated} onLogout={logout} />
      <div className="pt-20">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/transparency" element={<Transparency />} />
          <Route path="/faqs" element={<FAQ />} />
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/emails" 
            element={
              <ProtectedRoute>
                <Emails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/alias" 
            element={
              <ProtectedRoute>
                <Alias />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/password-manager" 
            element={
              <ProtectedRoute>
                <PasswordManager />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
