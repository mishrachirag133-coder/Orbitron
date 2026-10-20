import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Orbit, Key, Mail, Lock, ArrowRight, ShieldCheck, Sparkles, Satellite } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background radial glow & satellite grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* Login Card */}
      <div className="relative w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl z-10">
        {/* Header with Logo */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 items-center justify-center shadow-lg shadow-emerald-500/25 mb-1">
            <Orbit className="w-6 h-6 text-slate-950 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Clarity<span className="text-emerald-400">X</span> Console
          </h1>
          <p className="text-xs text-slate-400">
            AI-Powered Satellite Cloud-Masking & Quality Intelligence
          </p>
        </div>

        {/* Tab switch: Email/Password vs API Key */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-lg border border-slate-800 mb-6 text-xs font-medium">
          <button
            type="button"
            onClick={() => setAuthMode('password')}
            className={`py-2 rounded-md transition-all ${
              authMode === 'password'
                ? 'bg-slate-800 text-white shadow font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Email & Password
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('apiKey')}
            className={`py-2 rounded-md transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'apiKey'
                ? 'bg-slate-800 text-white shadow font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-emerald-400" />
            API Key
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'password' ? (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Work Email</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@organization.ai"
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Password</span>
                  </label>
                  <span className="text-[11px] text-emerald-400 hover:underline cursor-pointer">
                    Forgot?
                  </span>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Service Account Key</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">X-API-KEY</span>
              </label>
              <textarea
                rows={2}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="cx_live_ak_..."
                required
                className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-emerald-300 font-mono text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            <span>{isLoading ? 'Authenticating...' : 'Sign In to ClarityX'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Access Button */}
        <div className="mt-5 pt-5 border-t border-slate-800/80">
          <button
            type="button"
            onClick={handleQuickDemo}
            className="w-full py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center justify-center gap-2 border border-slate-700/60 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Instant Demo Access (Preloaded Pipeline)</span>
          </button>
        </div>

        {/* Feature badges */}
        <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>ISO 19115 Ready</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Satellite className="w-3.5 h-3.5 text-sky-400" />
            <span>Multispectral AI</span>
          </div>
        </div>
      </div>
    </div>
  );
};
