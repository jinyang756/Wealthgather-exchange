import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import TradingHall from './pages/TradingHall';
import Market from './pages/Market';
import Trade from './pages/Trade';
import FastLane from './pages/FastLane'; 
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MarketProvider } from './contexts/MarketContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// --- SECURITY LAYER COMPONENT (REFACTORED FOR COMPLIANCE) ---
const SecurityLayer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // We removed the "Screen Warning" flash because it looks like ransomware behavior.
  
  useEffect(() => {
    // 1. Basic UI Protection: Disable Context Menu (Right Click)
    // This is standard for trading apps to prevent inspecting elements easily,
    // but doesn't trigger "Malware" flags like keyboard hooking does.
    const handleContextMenu = (e: MouseEvent) => {
      // Allow right click on inputs so users can paste
      if ((e.target as HTMLElement).tagName === 'INPUT') return true;
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <div className="relative min-h-screen">
      {children}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SecurityLayer>
        <MarketProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Protected Routes */}
              <Route
                path="*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<TradingHall />} />
                        <Route path="/market" element={<Market />} />
                        <Route path="/trade" element={<Trade />} />
                        <Route path="/fast-lane" element={<FastLane />} /> 
                        <Route path="/profile" element={<Profile />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </MarketProvider>
      </SecurityLayer>
    </AuthProvider>
  );
};

export default App;