import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Orbit, Key, Mail, Lock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [authMode, setAuthMode] = useState<'password' | 'apiKey'>('password');
  const [email, setEmail] = useState('operator@clarityx.ai');
  const [password, setPassword] = useState('••••••••••••');
  const [apiKey, setApiKey] = useState('cx_live_ak_98f7e2a9b401c8734e56');
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (authMode === 'password') {
        await login({ email, password });
      } else {
        await login({ apiKey });
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleQuickDemo = async () => {
    setError(null);
    try {
      await login({ email: 'evaluator@clarityx.ai', password: 'demo-password' });
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Demo login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4">
      {/* Login Card */}
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        {/* Header with Logo */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex w-12 h-12 rounded-xl bg-emerald-600 items-center justify-center text-white mb-1 shadow-sm">
            <Orbit className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome to Clarity<span className="text-emerald-600">X</span>
          </h1>
          <p className="text-xs text-slate-500">
            Satellite Image Quality & Cloud Detection
          </p>
        </div>

        {/* 1-Click Instant Demo Access */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleQuickDemo}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2 border border-emerald-200 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Instant Demo Access (1-Click)</span>
          </button>
        </div>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-slate-400 text-xs">or continue with</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Tab switch: Email/Password vs API Key */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg border border-slate-200 mb-5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setAuthMode('password')}
            className={`py-1.5 rounded-md transition-all ${
              authMode === 'password'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Email & Password
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('apiKey')}
            className={`py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'apiKey'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-slate-500" />
            API Key
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'password' ? (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Work Email</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Password</span>
                  </label>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
              </div>
            </>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-slate-400" />
                  <span>Service Account Key</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">X-API-KEY</span>
              </label>
              <textarea
                rows={2}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="cx_live_ak_..."
                required
                className="w-full px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Secure Satellite Processing Environment</span>
        </div>
      </div>
    </div>
  );
};
