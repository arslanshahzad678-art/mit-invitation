import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  loginWithEmail, 
  loginWithGoogle, 
  requestPasswordReset, 
  getFriendlyAuthErrorMessage 
} from '../../services/firebaseAuth';
import { OWNER_EMAIL, isFirebaseConfigured } from '../../config/firebase';
import { 
  Lock, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ShieldCheck,
  Mail,
  Info
} from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { navigate, showToast } = useStore();

  const [email] = useState(OWNER_EMAIL);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Loading states
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);

  // Feedback states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  const firebaseReady = isFirebaseConfigured();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setErrorMessage(null);
    setResetSuccessMessage(null);
    setIsEmailLoading(true);

    try {
      await loginWithEmail(email, password);
      showToast('Welcome to MIT Management Studio', 'success');
    } catch (err: any) {
      console.error('Email sign-in error:', err);
      const friendly = getFriendlyAuthErrorMessage(err);
      setErrorMessage(friendly);
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setResetSuccessMessage(null);
    setIsGoogleLoading(true);

    try {
      await loginWithGoogle();
      showToast('Signed in with Google as Administrator', 'success');
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      const friendly = getFriendlyAuthErrorMessage(err);
      setErrorMessage(friendly);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setErrorMessage(null);
    setResetSuccessMessage(null);
    setIsResetLoading(true);

    try {
      await requestPasswordReset(email);
      setResetSuccessMessage(
        `A password reset link has been dispatched to ${email}. Please check your inbox and spam folder.`
      );
      showToast('Password reset email sent!', 'info');
    } catch (err: any) {
      console.error('Password reset error:', err);
      const friendly = getFriendlyAuthErrorMessage(err);
      setErrorMessage(friendly);
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#DCE8E4] p-8 sm:p-10 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Return to boutique */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('home')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#26343C]/60 hover:text-[#5E8C84] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Boutique</span>
          </button>

          <span className="text-[10px] uppercase tracking-wider text-[#5E8C84] font-semibold bg-[#DCE8E4] px-2.5 py-0.5 rounded-full">
            Admin Studio
          </span>
        </div>

        {/* Lock Icon & Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#DCE8E4] text-[#5E8C84] mx-auto flex items-center justify-center shadow-xs">
            <Lock className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h2 className="text-2xl font-serif-brand text-[#26343C] font-normal">
            Admin Studio Login
          </h2>
          <p className="text-xs text-[#26343C]/70 leading-relaxed max-w-xs mx-auto">
            Authorized administrator authentication via Firebase for managing products, design, and WhatsApp orders.
          </p>
        </div>

        {/* Firebase Config Notice if placeholder */}
        {!firebaseReady && (
          <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#E8DFC9] flex items-start gap-2.5 text-xs text-[#5C4827]">
            <Info className="w-4 h-4 shrink-0 text-[#8E723D] mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-[11px] text-[#5C4827]">
                Firebase Credentials Notice
              </p>
              <p className="text-[10px] leading-relaxed text-[#75613B]">
                Your Firebase project configuration is set up in <code className="bg-white/80 px-1 py-0.5 rounded font-mono">src/config/firebase.ts</code>. Remember to paste your Firebase project API keys to connect your live database.
              </p>
            </div>
          </div>
        )}

        {/* Error Feedback Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <p className="text-[11px] leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Password Reset Confirmation Banner */}
        {resetSuccessMessage && (
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in duration-200">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <p className="text-[11px] leading-relaxed">{resetSuccessMessage}</p>
          </div>
        )}

        {/* Primary Form */}
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          
          {/* Pre-filled & Locked Owner Email */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#26343C]">
                Administrator Email
              </label>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#5E8C84] bg-[#DCE8E4] px-2 py-0.5 rounded-full border border-[#5E8C84]/30">
                <ShieldCheck className="w-3 h-3 text-[#5E8C84]" />
                <span>Verified Owner</span>
              </span>
            </div>

            <div className="relative">
              <Mail className="w-4 h-4 text-[#26343C]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                readOnly
                value={email}
                className="w-full pl-10 pr-4 py-2.5 bg-[#EBF0EE] border border-[#DCE8E4] rounded-xl text-xs text-[#26343C] font-medium cursor-not-allowed select-all"
                title="Pre-filled and locked to authorized store owner"
              />
            </div>
          </div>

          {/* Password Field with Show/Hide Eye Toggle */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#26343C]">
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isResetLoading || isEmailLoading || isGoogleLoading}
                className="text-[11px] font-medium text-[#5E8C84] hover:underline disabled:opacity-50"
              >
                {isResetLoading ? 'Sending...' : 'Forgot password?'}
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="Enter your administrator password"
                className="w-full pl-3.5 pr-10 py-2.5 bg-[#F2F6F6] rounded-xl text-xs text-[#26343C] border border-[#DCE8E4] focus:outline-none focus:border-[#5E8C84] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#26343C]/50 hover:text-[#26343C] p-1 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={isEmailLoading || isGoogleLoading || isResetLoading}
            className="w-full py-3 px-4 bg-[#5E8C84] hover:bg-[#4d756e] disabled:opacity-70 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {isEmailLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign in as administrator</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#DCE8E4] w-full" />
          <span className="bg-white px-3 text-[11px] text-[#26343C]/50 uppercase tracking-wider font-medium">
            or sign in with Google
          </span>
          <div className="border-t border-[#DCE8E4] w-full" />
        </div>

        {/* Google Sign-in Button */}
        <div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isEmailLoading || isGoogleLoading || isResetLoading}
            className="w-full py-2.5 px-4 bg-white border border-[#DCE8E4] hover:border-[#5E8C84] hover:bg-slate-50 disabled:opacity-70 text-[#26343C] text-xs font-semibold rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-2.5 cursor-pointer disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#5E8C84]" />
                <span>Connecting with Google...</span>
              </>
            ) : (
              <>
                {/* Official Google multicolored icon */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>

        {/* Footer info note */}
        <p className="text-[10px] text-center text-[#26343C]/60 leading-relaxed pt-2">
          Only administrator accounts registered in the authorization allow-list can enter the studio.
        </p>

      </div>
    </div>
  );
};
