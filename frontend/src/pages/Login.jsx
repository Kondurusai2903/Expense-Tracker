import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { loginApi } from '../api/auth.api';
import { useAuthContext } from '../context/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await loginApi(data.email, data.password);
      login(res.user);
      toast.success(`Welcome back, ${res.user.name.split(' ')[0]}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.message;
      toast.error(msg ?? 'Login failed. Please try again.');
    }
  };

  const inputStyle = {
    background: 'var(--color-surface-elevated)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    borderRadius: '10px',
    width: '100%',
    padding: '12px 14px',
    fontSize: '14px',
    outline: 'none',
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div
            className="inline-flex w-14 h-14 rounded-2xl items-center justify-center text-2xl font-bold mb-4"
            style={{ background: 'var(--color-primary)', color: '#12121A' }}
          >
            S
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            SpendSense
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Track every rupee, own your future.
          </p>
        </div>

        <div
          className="rounded-2xl border p-6"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <h2 className="font-semibold text-lg mb-5" style={{ color: 'var(--color-text-primary)' }}>
            Sign in to your account
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Email address
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
              />
              {errors.email && (
                <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: '42px' }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-opacity disabled:opacity-70 mt-2"
              style={{ background: 'var(--color-primary)', color: '#12121A' }}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(18,18,26,0.3)', borderTopColor: '#12121A' }} />
              ) : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-5" style={{ color: 'var(--color-text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" className="font-medium" style={{ color: 'var(--color-primary)' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
