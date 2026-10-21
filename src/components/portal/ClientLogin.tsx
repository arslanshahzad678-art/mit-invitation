import React, { useState } from 'react';
import { 
  clientLoginWithEmail, 
  clientSignUpWithEmail, 
  clientLoginWithGoogle, 
  requestPasswordReset, 
  getFriendlyAuthErrorMessage 
} from '../../services/firebaseAuth';
import { useStore } from '../../context/StoreContext';
import { 
  Lock, 
  Mail, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  Heart, 
  CheckCircle, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export const ClientLogin: React.FC = () => {
  const { navigate, showToast } = useStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters.');
        }
        await clientSignUpWithEmail(email, password);
        showToast('Account created successfully! Welcome to your Portal.', 'success');
      } else {
        await clientLoginWithEmail(email, password);
        showToast('Welcome back to your Host Portal!', 'success');
      }
      navigate('portal');
    } catch (err: any) {
      setErrorMessage(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await clientLoginWithGoogle();
      showToast('Signed in with Google!', 'success');
      navigate('portal');
    } catch (err: any) {
      setErrorMessage(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMessage('Please enter your email address to receive password reset instructions.');
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await requestPasswordReset(email);
      setResetSent(true);
      showToast('Password reset email sent!', 'info');
    } catch (err: any) {
      setErrorMessage(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#DCE8E4] shadow-xl p-8 space-y-6">
        
        {/* Header Icon */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-[#DCE8E4]/60 mx-auto flex items-center justify-center text-[#5E8C84] shadow-inner">
            <Heart className="w-7 h-7 fill-[#5E8C84]" />
          </div>
          <h2 className="text-2xl font-serif-brand font-semibold text-[#26343C]">
            {isSignUp ? 'Create Client Account' : 'Host Portal Login'}
          </h2>
          <p className="text-xs text-[#26343C]/70">
            {isSignUp 
              ? 'Sign up to track your wedding guest RSVPs and download contact sheets.' 
              : 'Sign in to access your digital wedding invitation and guest responses.'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="flex-1">{errorMessage}</p>
          </div>
        )}

        {/* Password Reset Notice */}
        {resetSent && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="flex-1">
              Instructions to reset your password have been emailed to <strong>{email}</strong>.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#26343C] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#26343C]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="couple@example.com"
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#F2F6F6] rounded-xl border border-transparent focus:border-[#5E8C84] outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#26343C]">
                Password
              </label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[11px] text-[#5E8C84] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#26343C]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full pl-10 pr-10 py-2.5 text-xs bg-[#F2F6F6] rounded-xl border border-transparent focus:border-[#5E8C84] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-[#26343C]/40 hover:text-[#26343C] absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#5E8C84] hover:bg-[#4d756e] text-white font-semibold rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? 'Create Account & Continue' : 'Sign In to Portal'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#DCE8E4] w-full" />
          <span className="bg-white px-3 text-[11px] text-[#26343C]/50 uppercase tracking-wider font-semibold">
            Or
          </span>
        </div>

        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={isLoading}
          className="w-full py-2.5 bg-white border border-[#DCE8E4] hover:bg-[#FAF7F2] text-[#26343C] font-semibold rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
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
        </button>

        {/* Toggle sign in / sign up */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMessage(null);
            }}
            className="text-xs text-[#5E8C84] hover:underline font-medium cursor-pointer"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account yet? Create one"}
          </button>
        </div>

      </div>
    </div>
  );
};
