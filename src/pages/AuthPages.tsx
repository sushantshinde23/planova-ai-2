import React, { useState, useEffect } from 'react';
import { useMission, SettingsTabType } from '../store/missionContext';
import { ThemeToggle, LanguageSelector } from '../components/ThemeAndLanguageControls';
import {
  initiatePasswordReset,
  completePasswordReset,
} from '../lib/firebase';
import { MissionCategory } from '../types';
import {
  User,
  Shield,
  Key,
  Mail,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  LogOut,
  Sliders,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
  Sparkles,
  Clock,
  Fingerprint,
  Camera,
  Bell,
  Globe,
  Sun,
  Moon,
  RefreshCw,
} from 'lucide-react';

// Password strength helper
function evaluatePasswordStrength(pw: string) {
  const checks = {
    length: pw.length >= 8,
    mixedCase: /[a-z]/.test(pw) && /[A-Z]/.test(pw),
    number: /\d/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };
  const score = Object.values(checks).filter(Boolean).length;
  const labels = ['Too Weak', 'Weak', 'Fair', 'Good', 'Strong · Enterprise Grade'];
  const colors = [
    'bg-slate-300',
    'bg-red-500',
    'bg-amber-500',
    'bg-[#2563eb]',
    'bg-emerald-500',
  ];
  return { checks, score, label: labels[score], color: colors[score] };
}

// ============================================================================
// 1. STANDALONE AUTHENTICATION PORTAL (LOGIN / SIGN UP / FORGOT / RESET)
// ============================================================================
export const AuthPortal: React.FC<{
  initialMode?: 'login' | 'signup' | 'forgot' | 'reset';
  onAuthSuccess: () => void;
  onBackToLanding: () => void;
}> = ({ initialMode = 'login', onAuthSuccess, onBackToLanding }) => {
  const { loginWithEmail, registerAccount, loginWithGoogleProvider } = useMission();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>(initialMode);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Reset password states
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
    setErrorMsg(null);
    setInfoMsg(null);
  }, [initialMode]);

  const switchMode = (next: 'login' | 'signup' | 'forgot' | 'reset') => {
    setErrorMsg(null);
    setInfoMsg(null);
    setMode(next);
  };

  const pwStrength = evaluatePasswordStrength(mode === 'reset' ? newPassword : password);

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await loginWithEmail(email.trim(), password, rememberMe);
      onAuthSuccess();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Sign Up
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMsg('Please enter your full name (at least 2 characters).');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please confirm your password.');
      return;
    }
    if (!acceptedTerms) {
      setErrorMsg('Please acknowledge the PLANOVA AI Terms of Service and Privacy Policy.');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerAccount(fullName.trim(), email.trim(), password);
      onAuthSuccess();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Registration failed. Please verify your information.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Official Google OAuth 2.0 Sign-In
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    setIsSubmitting(true);
    try {
      await loginWithGoogleProvider();
      onAuthSuccess();
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Google sign-in window was closed before completing authentication.');
      } else {
        setErrorMsg(err?.message || 'Google OAuth authentication could not be completed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Forgot Password Request
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await initiatePasswordReset(email.trim());
      if (res.resetToken) {
        setResetToken(res.resetToken);
      }
      setInfoMsg(res.message);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to process password reset request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Reset Password Completion
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (newPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await completePasswordReset(resetToken, email.trim(), newPassword);
      setPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      switchMode('login');
      setInfoMsg(res.message);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Password reset failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b1120] text-[#0f172a] dark:text-slate-100 flex flex-col font-sans transition-colors duration-150">
      {/* Top Bar */}
      <header className="h-16 px-4 sm:px-8 border-b border-[#e2e8f0] dark:border-slate-800 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBackToLanding}
            className="px-3 py-1.5 rounded-lg border border-[#e2e8f0] dark:border-slate-800 bg-[#f8fafc] dark:bg-slate-800 hover:bg-slate-100 text-xs font-semibold text-[#0f172a] dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-2.5 cursor-pointer" onClick={onBackToLanding}>
            <div className="w-7 h-7 rounded-lg bg-[#172554] dark:bg-[#2563eb] text-white flex items-center justify-center font-black text-xs">
              P
            </div>
            <span className="font-black text-sm tracking-tight text-[#0f172a] dark:text-white">
              PLANOVA<span className="text-[#6366f1] dark:text-indigo-400 font-semibold ml-1">AI</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <LanguageSelector variant="dropdown" />
          <ThemeToggle showLabel={false} />
        </div>
      </header>

      {/* Main Split / Centered Enterprise Auth Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-grid-pattern">
        <div className="w-full max-w-md bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Brand Kicker */}
          <div className="space-y-1.5 text-center">
            <div className="w-10 h-10 rounded-xl bg-[#172554] dark:bg-[#2563eb] text-white flex items-center justify-center font-black text-base mx-auto shadow-xs mb-3">
              P
            </div>

            {mode === 'login' && (
              <>
                <h1 className="text-xl sm:text-2xl font-black text-[#0f172a] dark:text-white tracking-tight">
                  Welcome to PLANOVA AI
                </h1>
                <p className="text-xs sm:text-sm text-[#64748b] dark:text-slate-400">
                  Sign in to continue to your mission control center.
                </p>
              </>
            )}

            {mode === 'signup' && (
              <>
                <h1 className="text-xl sm:text-2xl font-black text-[#0f172a] dark:text-white tracking-tight">
                  Create Your Operator Account
                </h1>
                <p className="text-xs sm:text-sm text-[#64748b] dark:text-slate-400">
                  Initialize your persistent mission profile and security clearance.
                </p>
              </>
            )}

            {mode === 'forgot' && (
              <>
                <h1 className="text-xl sm:text-2xl font-black text-[#0f172a] dark:text-white tracking-tight">
                  Password Recovery
                </h1>
                <p className="text-xs sm:text-sm text-[#64748b] dark:text-slate-400">
                  Enter your registered email to receive a secure password reset link.
                </p>
              </>
            )}

            {mode === 'reset' && (
              <>
                <h1 className="text-xl sm:text-2xl font-black text-[#0f172a] dark:text-white tracking-tight">
                  Reset Your Password
                </h1>
                <p className="text-xs sm:text-sm text-[#64748b] dark:text-slate-400">
                  Choose a strong new password for your PLANOVA AI account.
                </p>
              </>
            )}
          </div>

          {/* Error & Info Alerts */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-2.5 text-xs text-emerald-800 dark:text-emerald-300">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{infoMsg}</span>
              </div>
              {mode === 'forgot' && (
                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => switchMode('reset')}
                    className="px-3 py-1.5 bg-[#172554] dark:bg-[#2563eb] text-white font-semibold rounded-lg text-[11px] flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Proceed to Reset Password Form</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ==============================================================
              MODE 1: LOGIN FORM
          ============================================================== */}
          {mode === 'login' && (
            <div className="space-y-4">
              {/* Official Google OAuth 2.0 Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-xs font-semibold text-[#0f172a] dark:text-white flex items-center justify-center gap-2.5 shadow-2xs transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#e2e8f0] dark:border-slate-800"></div>
                <span className="shrink mx-3 text-[10px] font-mono uppercase tracking-wider text-[#64748b]">
                  OR EMAIL CREDENTIALS
                </span>
                <div className="flex-grow border-t border-[#e2e8f0] dark:border-slate-800"></div>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0f172a] dark:text-slate-200 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#64748b] absolute left-3.5 top-2.5" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="operator@planova.ai"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2 text-xs bg-[#f8fafc] dark:bg-slate-900 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-[#0f172a] dark:text-white placeholder-[#64748b] focus:outline-hidden focus:ring-2 focus:ring-[#2563eb]/30"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#0f172a] dark:text-slate-200">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-xs font-semibold text-[#2563eb] dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#64748b] absolute left-3.5 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 text-xs bg-[#f8fafc] dark:bg-slate-900 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-[#0f172a] dark:text-white placeholder-[#64748b] focus:outline-hidden focus:ring-2 focus:ring-[#2563eb]/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-[#64748b] hover:text-[#0f172a] dark:hover:text-white cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none text-[#64748b] dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-[#172554] focus:ring-[#2563eb]"
                    />
                    <span>Remember Me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setEmail('sushantshinde5598@gmail.com');
                      setPassword('Planova@2026');
                    }}
                    className="text-[11px] font-mono text-[#6366f1] dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Fill Duty Credentials
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-[#172554] hover:bg-[#1e3a8a] dark:bg-[#2563eb] dark:hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>{isSubmitting ? 'Verifying Credentials...' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-4 border-t border-[#e2e8f0] dark:border-slate-800 text-center text-xs text-[#64748b] dark:text-slate-400">
                <span>Don’t have an account? </span>
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="font-bold text-[#2563eb] dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </div>
          )}

          {/* ==============================================================
              MODE 2: SIGN UP FORM
          ============================================================== */}
          {mode === 'signup' && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-xs font-semibold text-[#0f172a] dark:text-white flex items-center justify-center gap-2.5 shadow-2xs transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#e2e8f0] dark:border-slate-800"></div>
                <span className="shrink mx-3 text-[10px] font-mono uppercase tracking-wider text-[#64748b]">
                  OR REGISTER WITH EMAIL
                </span>
                <div className="flex-grow border-t border-[#e2e8f0] dark:border-slate-800"></div>
              </div>

              <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#0f172a] dark:text-slate-200 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#64748b] absolute left-3.5 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="Commander / Operator Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2 text-xs bg-[#f8fafc] dark:bg-slate-900 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-[#0f172a] dark:text-white placeholder-[#64748b] focus:outline-hidden focus:ring-2 focus:ring-[#2563eb]/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0f172a] dark:text-slate-200 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#64748b] absolute left-3.5 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="name@organization.gov"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2 text-xs bg-[#f8fafc] dark:bg-slate-900 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-[#0f172a] dark:text-white placeholder-[#64748b] focus:outline-hidden focus:ring-2 focus:ring-[#2563eb]/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0f172a] dark:text-slate-200 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#64748b] absolute left-3.5 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimum 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 text-xs bg-[#f8fafc] dark:bg-slate-900 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-[#0f172a] dark:text-white placeholder-[#64748b] focus:outline-hidden focus:ring-2 focus:ring-[#2563eb]/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-[#64748b] hover:text-[#0f172a] dark:hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {password.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex gap-1 h-1.5">
                        {[1, 2, 3, 4].map((bar) => (
                          <div
                            key={bar}
                            className={`flex-1 rounded-full transition-colors ${
                              pwStrength.score >= bar ? pwStrength.color : 'bg-slate-200 dark:bg-slate-800'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#64748b]">
                        <span>Strength: {pwStrength.label}</span>
                        <span>8+ chars · A-z · 0-9 · Symbol</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0f172a] dark:text-slate-200 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#64748b] absolute left-3.5 top-2.5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 text-xs bg-[#f8fafc] dark:bg-slate-900 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-[#0f172a] dark:text-white placeholder-[#64748b] focus:outline-hidden focus:ring-2 focus:ring-[#2563eb]/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-[#64748b] hover:text-[#0f172a] dark:hover:text-white cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <label className="flex items-start gap-2.5 pt-1 text-xs text-[#64748b] dark:text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-[#172554] focus:ring-[#2563eb]"
                  />
                  <span>
                    I agree to the PLANOVA AI Enterprise Governance Terms, Privacy Policy, and email verification protocol.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-[#172554] hover:bg-[#1e3a8a] dark:bg-[#2563eb] dark:hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>{isSubmitting ? 'Creating Account & Profile...' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-3 border-t border-[#e2e8f0] dark:border-slate-800 text-center text-xs text-[#64748b] dark:text-slate-400">
                <span>Already have an account? </span>
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="font-bold text-[#2563eb] dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}

          {/* ==============================================================
              MODE 3: FORGOT PASSWORD
          ============================================================== */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0f172a] dark:text-slate-200 mb-1.5">
                  Account Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#64748b] absolute left-3.5 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 text-xs bg-[#f8fafc] dark:bg-slate-900 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-[#0f172a] dark:text-white placeholder-[#64748b] focus:outline-hidden focus:ring-2 focus:ring-[#2563eb]/30"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-[#172554] hover:bg-[#1e3a8a] dark:bg-[#2563eb] dark:hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>{isSubmitting ? 'Dispatching Reset Link...' : 'Send Secure Reset Link'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-3 border-t border-[#e2e8f0] dark:border-slate-800 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="font-semibold text-[#64748b] hover:text-[#0f172a] dark:hover:text-white cursor-pointer"
                >
                  ← Back to Sign In
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('reset')}
                  className="font-semibold text-[#2563eb] dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Have a Reset Token?
                </button>
              </div>
            </form>
          )}

          {/* ==============================================================
              MODE 4: RESET PASSWORD
          ============================================================== */}
          {mode === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0f172a] dark:text-slate-200 mb-1">
                  Account Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="operator@planova.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#f8fafc] dark:bg-slate-900 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-[#0f172a] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0f172a] dark:text-slate-200 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#f8fafc] dark:bg-slate-900 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-[#0f172a] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0f172a] dark:text-slate-200 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Confirm new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#f8fafc] dark:bg-slate-900 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-[#0f172a] dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-[#172554] hover:bg-[#1e3a8a] dark:bg-[#2563eb] dark:hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>{isSubmitting ? 'Updating Password...' : 'Confirm & Reset Password'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-3 border-t border-[#e2e8f0] dark:border-slate-800 text-center text-xs">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="font-semibold text-[#64748b] hover:text-[#0f172a] dark:hover:text-white cursor-pointer"
                >
                  ← Return to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. DASHBOARD USER PROFILE & ACCOUNT SETTINGS CENTER
// ============================================================================
export const AuthPages: React.FC<{
  onAuthSuccess: () => void;
  onLogoutRedirect?: () => void;
}> = ({ onLogoutRedirect }) => {
  const {
    currentUser,
    setUserRole,
    updateUserProfile,
    logout,
    settingsTab,
    setSettingsTab,
    theme,
    setTheme,
    language,
    setLanguage,
  } = useMission();

  const [userName, setUserName] = useState(currentUser.name);
  const [department, setDepartment] = useState(currentUser.department);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    currentUser.preferences?.notificationsEnabled ?? true
  );
  const [autoApproveLowRisk, setAutoApproveLowRisk] = useState(
    currentUser.preferences?.autoApproveLowRisk ?? true
  );
  const [defaultDomain, setDefaultDomain] = useState<MissionCategory>(
    currentUser.preferences?.defaultDomain || 'emergency'
  );

  // Security password change states
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);

  useEffect(() => {
    setUserName(currentUser.name);
    setDepartment(currentUser.department);
    setAvatarUrl(currentUser.avatarUrl || '');
  }, [currentUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSavedMessage(null);
    setIsSaving(true);
    try {
      await updateUserProfile({
        name: userName.trim() || currentUser.name,
        department: department.trim() || currentUser.department,
        avatarUrl: avatarUrl.trim() || undefined,
      });
      setSavedMessage('User profile saved to database.');
      setTimeout(() => setSavedMessage(null), 3500);
    } catch {
      setSaveError('Unable to save your changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setSaveError(null);
    setSavedMessage(null);
    setIsSaving(true);
    try {
      await updateUserProfile({
        preferences: {
          theme,
          language,
          notificationsEnabled,
          defaultDomain,
          autoApproveLowRisk,
          compactTelemetry: false,
        },
      });
      setSavedMessage('Preferences saved and synchronized.');
      setTimeout(() => setSavedMessage(null), 3500);
    } catch {
      setSaveError('Unable to save your changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSecurityMessage(null);
    if (newPassword.length < 8 || newPassword !== confirmNewPassword) {
      setSaveError('Passwords must match and be at least 8 characters long.');
      return;
    }
    setIsSaving(true);
    try {
      await completePasswordReset('', currentUser.email, newPassword);
      setNewPassword('');
      setConfirmNewPassword('');
      setSecurityMessage('Password hash securely rotated.');
      setTimeout(() => setSecurityMessage(null), 3500);
    } catch {
      setSaveError('Unable to save your changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    if (onLogoutRedirect) onLogoutRedirect();
  };

  const tabs: { id: SettingsTabType; label: string; icon: any }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account Settings', icon: Sliders },
    { id: 'preferences', label: 'Preferences', icon: Globe },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#64748b] dark:text-slate-400">
            <span>AUTHENTICATED OPERATOR PROFILE</span>
            <span aria-hidden="true">·</span>
            <span>FIRESTORE PERSISTENCE</span>
          </div>
          <h1 className="text-xl font-black text-[#0f172a] dark:text-white tracking-tight mt-0.5">
            Profile, Account Settings & Security Governance
          </h1>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-slate-800 rounded-xl text-xs">
        {tabs.map((item) => {
          const Icon = item.icon;
          const isActive = settingsTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSettingsTab(item.id)}
              className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#172554] dark:bg-[#2563eb] text-white shadow-2xs'
                  : 'text-[#64748b] dark:text-slate-400 hover:text-[#0f172a] dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {savedMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{savedMessage}</span>
        </div>
      )}

      {saveError && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span>{saveError}</span>
        </div>
      )}

      {/* ==============================================================
          TAB 1: PROFILE
      ============================================================== */}
      {settingsTab === 'profile' && (
        <div className="p-6 bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-slate-800 rounded-2xl space-y-6 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#e2e8f0] dark:border-slate-800">
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={userName}
                  className="w-16 h-16 rounded-2xl object-cover border border-[#e2e8f0] dark:border-slate-700"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-[#172554] dark:bg-[#2563eb] text-white flex items-center justify-center font-black text-2xl">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">{userName}</h2>
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#64748b] dark:text-slate-400">
                  <span>{currentUser.email}</span>
                  <span>·</span>
                  <span className="text-[#2563eb] dark:text-blue-400 font-semibold uppercase">
                    {currentUser.role}
                  </span>
                  <span>·</span>
                  <span>Provider: {(currentUser.authProvider || 'email').toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Read-only Database Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-[#f8fafc] dark:bg-[#0b1120] border border-[#e2e8f0] dark:border-slate-800">
              <span className="text-[10px] uppercase text-[#64748b] block">User ID (UID)</span>
              <span className="font-bold text-[#0f172a] dark:text-white truncate block mt-0.5">
                {currentUser.id}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#f8fafc] dark:bg-[#0b1120] border border-[#e2e8f0] dark:border-slate-800">
              <span className="text-[10px] uppercase text-[#64748b] block">Account Created</span>
              <span className="font-bold text-[#0f172a] dark:text-white block mt-0.5">
                {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'Active'}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#f8fafc] dark:bg-[#0b1120] border border-[#e2e8f0] dark:border-slate-800">
              <span className="text-[10px] uppercase text-[#64748b] block">Last Login</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                {currentUser.lastLoginAt ? new Date(currentUser.lastLoginAt).toLocaleString() : 'Current Session'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-[#0f172a] dark:text-slate-200 block mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#f8fafc] dark:bg-slate-900 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-[#0f172a] dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-[#0f172a] dark:text-slate-200 block mb-1.5">
                  Operational Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#f8fafc] dark:bg-slate-900 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-[#0f172a] dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-[#0f172a] dark:text-slate-200 block mb-1.5">
                Profile Image URL
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#f8fafc] dark:bg-slate-900 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-[#0f172a] dark:text-white font-mono"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#172554] hover:bg-[#1e3a8a] dark:bg-[#2563eb] dark:hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==============================================================
          TAB 2: ACCOUNT SETTINGS & RBAC
      ============================================================== */}
      {settingsTab === 'account' && (
        <div className="p-6 bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-slate-800 rounded-2xl space-y-5 shadow-2xs">
          <div>
            <h2 className="text-base font-bold text-[#0f172a] dark:text-white">
              Account Clearance & Role-Based Access Control (RBAC)
            </h2>
            <p className="text-xs text-[#64748b] dark:text-slate-400 mt-0.5">
              Configure operational authority level for human-in-the-loop mission approvals.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                role: 'admin' as const,
                title: 'Administrator',
                desc: 'Full sovereign clearance: Launch, terminate, override security boundaries, edit plan rules, and approve critical risk actions.',
              },
              {
                role: 'operator' as const,
                title: 'Mission Operator (Active Duty)',
                desc: 'Standard command clearance: Create and execute missions, authorize high-impact re-plans, inject telemetry disruptions.',
              },
              {
                role: 'viewer' as const,
                title: 'Auditor / Viewer',
                desc: 'Read-only access: Monitor telemetry streams, inspect dependency graphs, and download verified audit ledgers.',
              },
            ].map((r) => (
              <div
                key={r.role}
                onClick={() => {
                  setUserRole(r.role);
                  updateUserProfile({ role: r.role });
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  currentUser.role === r.role
                    ? 'border-[#2563eb] bg-blue-50/40 dark:bg-blue-950/30 ring-1 ring-[#2563eb]'
                    : 'border-[#e2e8f0] dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-[#0f172a] dark:text-white">
                    {r.title}
                  </span>
                  {currentUser.role === r.role && (
                    <CheckCircle2 className="w-4 h-4 text-[#2563eb] dark:text-blue-400" />
                  )}
                </div>
                <p className="text-xs text-[#64748b] dark:text-slate-400 leading-relaxed">
                  {r.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==============================================================
          TAB 3: PREFERENCES
      ============================================================== */}
      {settingsTab === 'preferences' && (
        <div className="p-6 bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-slate-800 rounded-2xl space-y-6 shadow-2xs text-xs">
          <div>
            <h2 className="text-base font-bold text-[#0f172a] dark:text-white">
              Workspace & Interface Preferences
            </h2>
            <p className="text-xs text-[#64748b] dark:text-slate-400 mt-0.5">
              Customize your default visual mode, language, and autonomous notification settings.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#f8fafc] dark:bg-[#0b1120] border border-[#e2e8f0] dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#0f172a] dark:text-white block">Interface Theme</span>
                <span className="text-[#64748b] dark:text-slate-400">Light Mode is the enterprise default</span>
              </div>
              <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-slate-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`px-2.5 py-1 rounded font-semibold flex items-center gap-1 cursor-pointer ${
                    theme === 'light' ? 'bg-[#172554] text-white' : 'text-[#64748b]'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`px-2.5 py-1 rounded font-semibold flex items-center gap-1 cursor-pointer ${
                    theme === 'dark' ? 'bg-[#2563eb] text-white' : 'text-[#64748b]'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#f8fafc] dark:bg-[#0b1120] border border-[#e2e8f0] dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#0f172a] dark:text-white block">Console Language</span>
                <span className="text-[#64748b] dark:text-slate-400">Multilingual localization</span>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="px-3 py-1.5 bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-slate-700 rounded-lg font-semibold text-[#0f172a] dark:text-white"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="p-4 rounded-xl bg-[#f8fafc] dark:bg-[#0b1120] border border-[#e2e8f0] dark:border-slate-800 flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-bold text-[#0f172a] dark:text-white block">
                  Real-Time Disruption & Approval Alerts
                </span>
                <span className="text-[#64748b] dark:text-slate-400">
                  Notify immediately when HIGH or CRITICAL risk tasks require human authorization
                </span>
              </div>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-[#2563eb]"
              />
            </label>

            <label className="p-4 rounded-xl bg-[#f8fafc] dark:bg-[#0b1120] border border-[#e2e8f0] dark:border-slate-800 flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-bold text-[#0f172a] dark:text-white block">
                  Autonomous Low-Risk Execution
                </span>
                <span className="text-[#64748b] dark:text-slate-400">
                  Allow PLANOVA AI to execute LOW-risk telemetry and weather sweeps without manual prompts
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoApproveLowRisk}
                onChange={(e) => setAutoApproveLowRisk(e.target.checked)}
                className="w-4 h-4 rounded text-[#2563eb]"
              />
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSavePreferences}
              className="px-5 py-2.5 bg-[#172554] hover:bg-[#1e3a8a] dark:bg-[#2563eb] dark:hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* ==============================================================
          TAB 4: SECURITY
      ============================================================== */}
      {settingsTab === 'security' && (
        <div className="p-6 bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-slate-800 rounded-2xl space-y-6 shadow-2xs text-xs">
          <div>
            <h2 className="text-base font-bold text-[#0f172a] dark:text-white">
              Cryptographic Credentials & Session Security
            </h2>
            <p className="text-xs text-[#64748b] dark:text-slate-400 mt-0.5">
              Passwords are salted and hashed using scrypt. Rate-limiting and brute-force lockouts are active.
            </p>
          </div>

          {securityMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 font-semibold text-emerald-800 dark:text-emerald-300">
              {securityMessage}
            </div>
          )}

          <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
            <div>
              <label className="font-semibold text-[#0f172a] dark:text-slate-200 block mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#f8fafc] dark:bg-slate-900 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-[#0f172a] dark:text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-[#0f172a] dark:text-slate-200 block mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                placeholder="Confirm new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#f8fafc] dark:bg-slate-900 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-[#0f172a] dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-[#172554] hover:bg-[#1e3a8a] dark:bg-[#2563eb] dark:hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Rotate Password Hash
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
