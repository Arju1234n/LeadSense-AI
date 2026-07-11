'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { importService } from '@/services/import.service';
import { Lock, Mail, AlertCircle, Sparkles, LogIn, Key, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);

    try {
      const res = await importService.login({ email, password });
      if (res.success && res.data?.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        router.push('/dashboard');
      } else {
        setError('Authentication succeeded but token was not returned.');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        err.message || 
        'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoBypass = async () => {
    setLoading(true);
    setError(null);
    try {
      // Call /auth/login with seed account
      const res = await importService.login({
        email: 'user@groweasy.com',
        password: 'password123',
      });
      if (res.success && res.data?.token) {
        const userObj = { ...res.data.user, isGuest: true };
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(userObj));
        router.push('/dashboard');
      } else {
        setError('Authentication succeeded but token was not returned.');
      }
    } catch (err: any) {
      // Local fallback in case backend database is offline or not fully seeded
      localStorage.setItem('token', 'guest_token_bypass_session');
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: 'bypass_user_id',
          name: 'Guest User',
          email: 'user@groweasy.com',
          role: 'user',
          isGuest: true,
        })
      );
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary bg-dots flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Visual background accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className="w-full max-w-md card-glass relative z-10 p-8 shadow-2xl border border-border-primary bg-bg-secondary"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-indigo-500 dark:text-indigo-400 font-semibold text-xs tracking-wide uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>GrowEasy Importer</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-text-primary">Welcome Back</h2>
          <p className="text-text-secondary text-sm font-medium mt-2">
            Sign in to upload and map your CSV leads.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 flex items-center gap-3 text-sm font-semibold"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider pl-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full p-3 pl-12 bg-bg-secondary border border-border-primary rounded-xl focus:border-accent focus:ring-1 focus:ring-accent outline-none text-text-primary text-sm font-medium transition-colors"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider pl-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 pl-12 bg-bg-secondary border border-border-primary rounded-xl focus:border-accent focus:ring-1 focus:ring-accent outline-none text-text-primary text-sm font-medium transition-colors"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-base font-bold shadow-md shadow-indigo-500/10"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="relative my-8 text-center">
          <hr className="border-border-primary" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-secondary px-3 text-xs font-bold text-text-tertiary uppercase tracking-wider">
            OR
          </span>
        </div>

        {/* Demo Quick Login / Continue as Guest */}
        <button
          onClick={handleDemoBypass}
          className="w-full btn-secondary py-3 flex items-center justify-center gap-2 hover:border-indigo-500/30 hover:bg-indigo-500/5 text-indigo-500 dark:text-indigo-400 font-bold"
          disabled={loading}
          type="button"
        >
          <Key className="w-5 h-5" />
          <span>Continue as Guest</span>
        </button>

        {/* Guest Mode Explainer */}
        <div className="text-center mt-4">
          <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
            Demo Quick Access
          </h4>
          <p className="text-xs text-text-tertiary">
            Explore the AI-powered CSV Importer without creating an account.
          </p>
        </div>

        {/* Footer Link */}
        <div className="mt-8 pt-4 border-t border-border-primary text-center text-xs text-text-secondary font-medium">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-accent hover:underline font-bold block mt-1">
            Register Here
          </Link>
        </div>

        {/* Platform Indicator */}
        <div className="mt-8 pt-4 border-t border-border-primary flex items-center justify-between text-xs text-text-tertiary font-semibold">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>Backend API: Active</span>
          </div>
          <span>v1.0.0</span>
        </div>
      </motion.div>
    </div>
  );
}
