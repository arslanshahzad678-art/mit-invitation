import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { StoreSettings } from '../../types';
import { 
  changeAdminPassword, 
  setPasswordForGoogleAccount, 
  requestPasswordReset, 
  getFriendlyAuthErrorMessage 
} from '../../services/firebaseAuth';
import { PaymentMethodsManager } from './PaymentMethodsManager';
import { 
  Settings, 
  MessageCircle, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Globe, 
  Lock, 
  Save, 
  Bell, 
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  AlertCircle,
  CheckCircle,
  Loader2,
  Send
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { storeSettings, updateStoreSettings, adminUser, logoutAdmin, showToast } = useStore();

  const [formData, setFormData] = useState<StoreSettings>({ ...storeSettings });

  // Security card state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Security action states
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isResetSending, setIsResetSending] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [securitySuccess, setSecuritySuccess] = useState<string | null>(null);

  // Check providers on the logged-in user
  const hasPasswordProvider = adminUser?.providerData?.some((p) => p.providerId === 'password') ?? false;
  const hasGoogleProvider = adminUser?.providerData?.some((p) => p.providerId === 'google.com') ?? false;

  const handleChange = (field: keyof StoreSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveStoreSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings(formData);
    showToast('Store & WhatsApp settings updated successfully!');
  };

  // Calculate password strength
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: 'None', score: 0, color: 'bg-slate-200' };
    if (pwd.length < 8) return { label: 'Too short (min 8 characters)', score: 1, color: 'bg-rose-500' };

    let score = 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { label: 'Weak', score: 2, color: 'bg-amber-500' };
    if (score === 3) return { label: 'Good', score: 3, color: 'bg-[#5E8C84]' };
    return { label: 'Strong', score: 4, color: 'bg-emerald-600' };
  };

  const strength = getPasswordStrength(newPassword);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError(null);
    setSecuritySuccess(null);

    if (newPassword.length < 8) {
      setSecurityError('New password must be at least 8 characters in length.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityError('New password and confirmation password do not match.');
      return;
    }

    if (hasPasswordProvider && !currentPassword) {
      setSecurityError('Please enter your current password to authorize this update.');
      return;
    }

    setIsUpdatingPassword(true);

    try {
      if (hasPasswordProvider) {
        await changeAdminPassword(currentPassword, newPassword);
        setSecuritySuccess('Password successfully updated. You can now use your new password to sign in.');
      } else {
        await setPasswordForGoogleAccount(newPassword);
        setSecuritySuccess('Password successfully linked! You can now sign in using both Google and your email/password.');
      }
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password updated successfully!', 'success');
    } catch (err: any) {
      console.error('Password change error:', err);
      const friendly = getFriendlyAuthErrorMessage(err);
      setSecurityError(friendly);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSendBackupResetEmail = async () => {
    if (!adminUser?.email) return;
    setSecurityError(null);
    setSecuritySuccess(null);
    setIsResetSending(true);

    try {
      await requestPasswordReset(adminUser.email);
      setSecuritySuccess(`Password reset email sent to ${adminUser.email}. Check your inbox to set a new password.`);
      showToast('Password reset email sent!', 'info');
    } catch (err: any) {
      console.error(err);
      setSecurityError(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsResetSending(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif-brand text-[#26343C]">
            Store & Concierge Settings
          </h2>
          <p className="text-xs text-[#26343C]/70">
            Configure target WhatsApp number for receiving customer orders, contact info, and admin security credentials.
          </p>
        </div>

        <button
          type="submit"
          form="storeSettingsForm"
          className="px-6 py-2.5 bg-[#5E8C84] hover:bg-[#4d756e] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Store Settings</span>
        </button>
      </div>

      <form id="storeSettingsForm" onSubmit={handleSaveStoreSettings} className="space-y-6">
        {/* Target WhatsApp Configuration (Crucial) */}
        <div className="p-6 bg-white rounded-3xl border border-[#5E8C84]/40 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#25D366]/20 text-[#1EBE5D] flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-brand text-base font-semibold text-[#26343C]">
                WhatsApp Order Destination
              </h3>
              <p className="text-xs text-[#26343C]/70">
                When a visitor places an order, it opens a prefilled WhatsApp chat with this phone number.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#26343C] mb-1">
                WhatsApp Number (International format digits only) *
              </label>
              <input
                type="text"
                required
                value={formData.whatsAppNumber}
                onChange={(e) => handleChange('whatsAppNumber', e.target.value)}
                placeholder="e.g. 923425364018 (Country code + number, no + sign)"
                className="w-full px-3.5 py-2.5 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl text-xs font-mono text-[#26343C] focus:outline-none focus:border-[#5E8C84]"
              />
              <span className="text-[10px] text-[#26343C]/60 mt-1 block">
                Example: 923425364018 (PK) | 15551234567 (US) | 447911123456 (UK) | 971501234567 (UAE)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#26343C] mb-1">
                Formatted Display Phone *
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="e.g. +92 342 5364018"
                className="w-full px-3.5 py-2.5 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl text-xs text-[#26343C] focus:outline-none focus:border-[#5E8C84]"
              />
              <span className="text-[10px] text-[#26343C]/60 mt-1 block">
                Shown to visitors on the website header, footer, and contact concierge.
              </span>
            </div>
          </div>
        </div>

        {/* General Contact Details */}
        <div className="p-6 bg-white rounded-3xl border border-[#DCE8E4] shadow-xs space-y-4">
          <h3 className="font-serif-brand text-base font-semibold text-[#26343C] flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#5E8C84]" />
            <span>Contact Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#26343C] mb-1">
                Public Support Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl text-xs text-[#26343C]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#26343C] mb-1">
                Studio Working Hours
              </label>
              <input
                type="text"
                value={formData.workingHours}
                onChange={(e) => handleChange('workingHours', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl text-xs text-[#26343C]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#26343C] mb-1">
              Studio Physical Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl text-xs text-[#26343C]"
            />
          </div>
        </div>

        {/* Currency & Announcement Bar */}
        <div className="p-6 bg-white rounded-3xl border border-[#DCE8E4] shadow-xs space-y-4">
          <h3 className="font-serif-brand text-base font-semibold text-[#26343C] flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#5E8C84]" />
            <span>Announcement & Currency</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#26343C] mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                value={formData.currencySymbol}
                onChange={(e) => handleChange('currencySymbol', e.target.value)}
                placeholder="$"
                className="w-full px-3.5 py-2.5 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl text-xs text-[#26343C]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#26343C] mb-1">
                Announcement Banner Text
              </label>
              <input
                type="text"
                value={formData.announcementText}
                onChange={(e) => handleChange('announcementText', e.target.value)}
                placeholder="✨ Complimentary 24-Hour Express Delivery on all Digital Suites"
                className="w-full px-3.5 py-2.5 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl text-xs text-[#26343C]"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={formData.showAnnouncement}
              onChange={(e) => handleChange('showAnnouncement', e.target.checked)}
              className="rounded text-[#5E8C84] focus:ring-0"
            />
            <span className="font-medium text-[#26343C]">Enable announcement banner across top of website</span>
          </label>
        </div>

        {/* Social Links */}
        <div className="p-6 bg-white rounded-3xl border border-[#DCE8E4] shadow-xs space-y-4">
          <h3 className="font-serif-brand text-base font-semibold text-[#26343C] flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#5E8C84]" />
            <span>Social Media Profiles</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#26343C] mb-1">
                Instagram Profile URL
              </label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => handleChange('instagram', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl text-xs text-[#26343C]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#26343C] mb-1">
                Pinterest Profile URL
              </label>
              <input
                type="text"
                value={formData.pinterest}
                onChange={(e) => handleChange('pinterest', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl text-xs text-[#26343C]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#26343C] mb-1">
                TikTok Profile URL
              </label>
              <input
                type="text"
                value={formData.tiktok}
                onChange={(e) => handleChange('tiktok', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl text-xs text-[#26343C]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#26343C] mb-1">
                Facebook Page URL
              </label>
              <input
                type="text"
                value={formData.facebook}
                onChange={(e) => handleChange('facebook', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl text-xs text-[#26343C]"
              />
            </div>
          </div>
        </div>
      </form>

      {/* PAYMENT METHODS MANAGER */}
      <PaymentMethodsManager />

      {/* SECURITY CARD (IMPORTANT: Firebase Authentication & Password Management) */}
      <div className="p-6 sm:p-8 bg-white rounded-3xl border border-[#DCE8E4] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCE8E4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DCE8E4] text-[#5E8C84] flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-serif-brand text-lg font-semibold text-[#26343C]">
                Security & Administrator Password
              </h3>
              <p className="text-xs text-[#26343C]/70">
                Connected account: <span className="font-mono text-[#5E8C84] font-medium">{adminUser?.email || 'N/A'}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={logoutAdmin}
            className="px-4 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Security Alerts */}
        {securityError && (
          <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <p className="text-[11px] leading-relaxed">{securityError}</p>
          </div>
        )}

        {securitySuccess && (
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in duration-200">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <p className="text-[11px] leading-relaxed">{securitySuccess}</p>
          </div>
        )}

        {/* Provider Status Indicator */}
        <div className="p-4 bg-[#F2F6F6] rounded-2xl border border-[#DCE8E4] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#5E8C84]" />
            <span className="font-medium text-[#26343C]">Active Authentication Methods:</span>
            <div className="flex items-center gap-1.5">
              {hasPasswordProvider && (
                <span className="px-2 py-0.5 bg-white border border-[#DCE8E4] rounded-md font-medium text-[11px] text-[#26343C]">
                  Email & Password
                </span>
              )}
              {hasGoogleProvider && (
                <span className="px-2 py-0.5 bg-white border border-[#DCE8E4] rounded-md font-medium text-[11px] text-[#26343C] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Google Sign-In
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSendBackupResetEmail}
            disabled={isResetSending}
            className="text-xs text-[#5E8C84] hover:underline flex items-center gap-1 font-medium disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-3 h-3" />
            <span>{isResetSending ? 'Sending reset link...' : 'Send me a password reset email'}</span>
          </button>
        </div>

        {/* Change / Set Password Form */}
        <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-1">
          {hasPasswordProvider ? (
            <div>
              <label className="block text-xs font-semibold text-[#26343C] mb-1">
                Current Password *
              </label>
              <div className="relative max-w-md">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password..."
                  className="w-full px-3.5 pr-10 py-2.5 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl text-xs text-[#26343C] focus:outline-none focus:border-[#5E8C84]"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#26343C]/50 hover:text-[#26343C] p-1"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
              <p className="font-semibold text-amber-950 mb-0.5">Google Sign-in Account</p>
              <p className="text-[11px] text-amber-800">
                You originally signed in with Google only. You can enter a new password below to link an email/password credential to this account so you can use both methods.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-[#26343C] mb-1">
                {hasPasswordProvider ? 'New Password *' : 'Set Account Password *'}
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full px-3.5 pr-10 py-2.5 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl text-xs text-[#26343C] focus:outline-none focus:border-[#5E8C84]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#26343C]/50 hover:text-[#26343C] p-1"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold text-[#26343C] mb-1">
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3.5 pr-10 py-2.5 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl text-xs text-[#26343C] focus:outline-none focus:border-[#5E8C84]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#26343C]/50 hover:text-[#26343C] p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Password Strength Meter */}
          {newPassword && (
            <div className="max-w-md space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#26343C]/70">Password strength:</span>
                <span className="font-semibold text-[#26343C]">{strength.label}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                <div className={`h-full flex-1 rounded-full ${strength.score >= 1 ? strength.color : 'bg-slate-200'}`} />
                <div className={`h-full flex-1 rounded-full ${strength.score >= 2 ? strength.color : 'bg-slate-200'}`} />
                <div className={`h-full flex-1 rounded-full ${strength.score >= 3 ? strength.color : 'bg-slate-200'}`} />
                <div className={`h-full flex-1 rounded-full ${strength.score >= 4 ? strength.color : 'bg-slate-200'}`} />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="px-6 py-2.5 bg-[#5E8C84] hover:bg-[#4d756e] disabled:opacity-60 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isUpdatingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating password...</span>
                </>
              ) : (
                <span>{hasPasswordProvider ? 'Update Administrator Password' : 'Set Account Password'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
