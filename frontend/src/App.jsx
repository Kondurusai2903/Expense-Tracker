import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Analytics from './pages/Analytics';
import NotFound from './pages/NotFound';

const ThemedToaster = () => {
  const { isDark } = useTheme();
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: isDark ? '#252530' : '#FFFFFF',
          color: isDark ? '#F2F2F8' : '#14142A',
          border: isDark ? '1px solid #383845' : '1px solid #D4D8EC',
          borderRadius: '10px',
          fontSize: '13px',
          fontFamily: 'Inter, sans-serif',
          boxShadow: isDark
            ? '0 4px 24px rgba(0,0,0,0.4)'
            : '0 4px 24px rgba(0,0,0,0.1)',
        },
        success: {
          iconTheme: {
            primary: '#45D49A',
            secondary: isDark ? '#252530' : '#FFFFFF',
          },
        },
        error: {
          iconTheme: {
            primary: '#F56666',
            secondary: isDark ? '#252530' : '#FFFFFF',
          },
        },
      }}
    />
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/analytics" element={<Analytics />} />
            </Route>

            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>

        <ThemedToaster />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
