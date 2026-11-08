import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Wifi,
  Shield,
  UserCheck,
  Smartphone,
  Lock,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Flame,
  Settings,
  HelpCircle,
  Info,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const {
    login,
    loginWithGoogle,
    registerAdmin,
    resetPassword,
    sendCustomerOTP,
    verifyCustomerOTP,
    isFirebaseConnected,
  } = useAuth();

  const [authMode, setAuthMode] = useState<'standard' | 'customer_otp'>('standard');

  // Standard Login fields
  const [identifier, setIdentifier] = useState('mim230189@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Customer OTP fields
  const [customerMobile, setCustomerMobile] = useState('01711223344');
  const [otpStep, setOtpStep] = useState<'enter_mobile' | 'enter_otp'>('enter_mobile');
  const [otpCode, setOtpCode] = useState('');
  const [otpNotice, setOtpNotice] = useState('');

  // Initial Admin Setup modal
  const [showAdminSetupModal, setShowAdminSetupModal] = useState(false);
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [adminSetupMsg, setAdminSetupMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [adminSetupLoading, setAdminSetupLoading] = useState(false);

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotInput, setForgotInput] = useState('mim230189@gmail.com');
  const [forgotNotice, setForgotNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleStandardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(identifier, password);
      if (!res.success) {
        setError(res.message);
      }
    } catch {
      setError('লগইন প্রক্রিয়ায় ত্রুটি দেখা দিয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await loginWithGoogle();
      if (!res.success) {
        setError(res.message);
      }
    } catch {
      setError('Google সাইন-ইন প্রক্রিয়া সম্পন্ন হয়নি।');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await sendCustomerOTP(customerMobile);
      if (res.success) {
        setOtpStep('enter_otp');
        setOtpNotice(
          `${res.message} ${res.mockOtp ? `(পরীক্ষামূলক কোড: ${res.mockOtp})` : ''}`
        );
        if (res.mockOtp) setOtpCode(res.mockOtp);
      } else {
        setError(res.message);
      }
    } catch {
      setError('ওটিপি কোড পাঠাতে ত্রুটি হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await verifyCustomerOTP(customerMobile, otpCode);
      if (!res.success) {
        setError(res.message);
      }
    } catch {
      setError('ওটিপি যাচাইকরণে ত্রুটি হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminSetupMsg(null);

    if (newAdminPassword.length < 6) {
      setAdminSetupMsg({
        text: 'পাসওয়ার্ড অবশ্যই কমপক্ষে ৬ অক্ষরের হতে হবে।',
        type: 'error',
      });
      return;
    }

    if (newAdminPassword !== confirmAdminPassword) {
      setAdminSetupMsg({
        text: 'উভয় পাসওয়ার্ড হুবহু মিলতে হবে।',
        type: 'error',
      });
      return;
    }

    setAdminSetupLoading(true);
    try {
      const res = await registerAdmin(newAdminPassword);
      if (res.success) {
        setAdminSetupMsg({ text: res.message, type: 'success' });
        setTimeout(() => {
          setShowAdminSetupModal(false);
          setAdminSetupMsg(null);
        }, 1500);
      } else {
        setAdminSetupMsg({ text: res.message, type: res.requiresConfig ? 'info' : 'error' });
      }
    } catch {
      setAdminSetupMsg({
        text: 'অ্যাডমিন অ্যাকাউন্ট তৈরি করতে ব্যর্থ হয়েছে।',
        type: 'error',
      });
    } finally {
      setAdminSetupLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotNotice(null);
    const trimmed = forgotInput.trim();
    if (!trimmed) return;

    setForgotLoading(true);
    try {
      if (trimmed.includes('@')) {
        const res = await resetPassword(trimmed);
        setForgotNotice({
          text: res.message,
          type: res.success ? 'success' : 'error',
        });
      } else {
        setForgotNotice({
          text: `আপনার মোবাইল নম্বরে (${trimmed}) পাসওয়ার্ড রিসেট নির্দেশিকা পাঠানো হয়েছে।`,
          type: 'success',
        });
      }
    } catch {
      setForgotNotice({
        text: 'পাসওয়ার্ড রিসেট প্রক্রিয়া ব্যর্থ হয়েছে।',
        type: 'error',
      });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Brand Lockup */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-800 to-indigo-900 flex items-center justify-center text-white shadow-xl shadow-blue-600/30">
            <Wifi className="w-8 h-8 text-orange-400 stroke-[2.5]" />
          </div>
        </div>

        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          WINK NETWORK ISP
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          প্রোডাকশন আইএসপি বিলিং ও ম্যানেজমেন্ট সিস্টেম
        </p>

        {/* Database Live Connectivity Badge */}
        <div className="mt-3 flex items-center justify-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            Cloud Firestore লাইভ ডাটাবেজ সংযুক্ত
          </span>
        </div>

        {/* Quick Portal Identity Selector */}
        <div className="mt-4 bg-blue-50 dark:bg-blue-950/40 p-3 rounded-2xl border border-blue-200 dark:border-blue-900/60">
          <p className="text-[11px] font-semibold text-blue-900 dark:text-blue-300 text-center mb-2">
            পোর্টাল নির্বাচন (Portal Quick Select):
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setAuthMode('standard');
                setIdentifier('mim230189@gmail.com');
                setPassword('');
                setError('');
              }}
              className={`flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-slate-900 border transition-all text-center ${
                identifier === 'mim230189@gmail.com' && authMode === 'standard'
                  ? 'border-blue-600 shadow-md ring-1 ring-blue-600'
                  : 'border-blue-200 dark:border-blue-800 hover:border-blue-600'
              }`}
            >
              <Shield className="w-4 h-4 text-blue-600 mb-1" />
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">অ্যাডমিন</span>
              <span className="text-[9px] text-slate-400 truncate max-w-full">mim230189</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('standard');
                setIdentifier('kabir@winkisp.com');
                setPassword('');
                setError('');
              }}
              className={`flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-slate-900 border transition-all text-center ${
                identifier === 'kabir@winkisp.com' && authMode === 'standard'
                  ? 'border-orange-500 shadow-md ring-1 ring-orange-500'
                  : 'border-orange-200 dark:border-orange-800 hover:border-orange-500'
              }`}
            >
              <UserCheck className="w-4 h-4 text-orange-500 mb-1" />
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">কর্মচারী</span>
              <span className="text-[9px] text-slate-400">kabir@wink</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('customer_otp');
                setCustomerMobile('01711223344');
                setError('');
              }}
              className={`flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-slate-900 border transition-all text-center ${
                authMode === 'customer_otp'
                  ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500'
                  : 'border-emerald-200 dark:border-emerald-800 hover:border-emerald-500'
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-600 mb-1" />
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">গ্রাহক</span>
              <span className="text-[9px] text-slate-400">01711223344</span>
            </button>
          </div>
        </div>

      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-6 px-5 sm:px-8 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-3xl border border-slate-200 dark:border-slate-800">
          
          {/* Auth Mode Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('standard');
                setError('');
              }}
              className={`py-1.5 rounded-lg transition-colors ${
                authMode === 'standard'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              ইমেইল / পাসওয়ার্ড
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('customer_otp');
                setError('');
              }}
              className={`py-1.5 rounded-lg transition-colors ${
                authMode === 'customer_otp'
                  ? 'bg-white dark:bg-slate-900 text-orange-500 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              মোবাইল ওটিপি (গ্রাহক)
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {/* Standard Form */}
          {authMode === 'standard' ? (
            <form className="space-y-4" onSubmit={handleStandardSubmit}>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ইমেইল / ইউজার আইডি (Authorized Email)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="mim230189@gmail.com বা ইউজার আইডি"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-[13px]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    পাসওয়ার্ড (Password)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotInput(identifier);
                      setForgotNotice(null);
                      setShowForgotModal(true);
                    }}
                    className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    ভুলে গেছেন?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="আপনার পাসওয়ার্ড লিখুন"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 active:scale-[0.98] transition-all disabled:opacity-70"
              >
                <span>{loading ? 'লগইন যাচাই হচ্ছে...' : 'লগইন করুন'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Initial Admin Setup Link */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAdminSetupMsg(null);
                    setShowAdminSetupModal(true);
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>প্রথমবার অ্যাডমিন পাসওয়ার্ড সেটআপ (First Time Setup)</span>
                </button>
              </div>

              {/* Google Auth Divider & Button */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white dark:bg-slate-900 px-2 text-slate-400">বা সরাসরি Google সাইন-ইন</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Google একাউন্ট দিয়ে লগইন (mim230189@gmail.com)</span>
              </button>
            </form>
          ) : (
            /* Customer Mobile OTP Login */
            <div className="space-y-4">
              {otpNotice && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 text-xs text-blue-800 dark:text-blue-300 rounded-xl leading-relaxed">
                  {otpNotice}
                </div>
              )}

              {otpStep === 'enter_mobile' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      নিবন্ধিত মোবাইল নম্বর (Registered Mobile)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={customerMobile}
                        onChange={(e) => setCustomerMobile(e.target.value)}
                        placeholder="যেমন: 01711223344"
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'ওটিপি পাঠানো হচ্ছে...' : 'ওটিপি কোড পাঠান (Send OTP)'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      ৬-ডিজিটের ওটিপি ভেরিফিকেশন কোড
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="৬ ডিজিটের কোড"
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono font-bold tracking-widest text-center focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOtpStep('enter_mobile')}
                      className="py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      নম্বর পরিবর্তন
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all"
                    >
                      {loading ? 'যাচাই হচ্ছে...' : 'যাচাই করুন ও প্রবেশ করুন'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[11px] text-slate-500">
              ২৪/৭ কাস্টমার সার্ভিস হটলাইন: <strong className="text-blue-600 dark:text-blue-400">+880 9600-998877</strong>
            </p>
          </div>

        </div>
      </div>

      {/* Initial Admin Setup Modal */}
      {showAdminSetupModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                প্রথমবার অ্যাডমিন পাসওয়ার্ড সেটআপ
              </h3>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              এই অ্যাপ্লিকেশনের অনুমোদিত ফায়ারবেস অ্যাডমিন একাউন্ট হচ্ছে <strong className="text-slate-900 dark:text-slate-100 font-mono">mim230189@gmail.com</strong>। ফায়ারবেস অথেন্টিকেশন ডাটাবেজে পাসওয়ার্ড দিয়ে একাউন্ট তৈরি করুন।
            </p>

            {adminSetupMsg && (
              <div
                className={`mb-4 p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2 ${
                  adminSetupMsg.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-300'
                    : adminSetupMsg.type === 'info'
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 text-blue-800 dark:text-blue-300'
                    : 'bg-red-50 dark:bg-red-950/40 border-red-200 text-red-800 dark:text-red-300'
                }`}
              >
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div>{adminSetupMsg.text}</div>
              </div>
            )}

            <form onSubmit={handleAdminSetupSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  অ্যাডমিন ইমেইল (স্থির ও সুরক্ষিত)
                </label>
                <input
                  type="text"
                  disabled
                  value="mim230189@gmail.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="শক্তিশালী নতুন পাসওয়ার্ড লিখুন"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  পাসওয়ার্ড নিশ্চিত করুন
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmAdminPassword}
                  onChange={(e) => setConfirmAdminPassword(e.target.value)}
                  placeholder="পুনরায় পাসওয়ার্ড লিখুন"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminSetupModal(false)}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={adminSetupLoading}
                  className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all disabled:opacity-60"
                >
                  {adminSetupLoading ? 'সেটআপ হচ্ছে...' : 'অ্যাকাউন্ট তৈরি করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              পাসওয়ার্ড রিসেট (Password Reset)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              আপনার ইমেইল বা নিবন্ধিত মোবাইল নম্বর দিন। ইমেইলের ক্ষেত্রে সরাসরি ফায়ারবেস পাসওয়ার্ড রিসেট লিংক পাঠানো হবে।
            </p>

            {forgotNotice && (
              <div
                className={`mb-4 p-3 rounded-xl border text-xs flex items-start gap-2 ${
                  forgotNotice.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-700 dark:text-emerald-300'
                    : 'bg-red-50 dark:bg-red-950/40 border-red-200 text-red-700 dark:text-red-300'
                }`}
              >
                {forgotNotice.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{forgotNotice.text}</span>
              </div>
            )}

            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <input
                type="text"
                required
                placeholder="mim230189@gmail.com বা 017XXXXXXXX"
                value={forgotInput}
                onChange={(e) => setForgotInput(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  বন্ধ করুন
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-60"
                >
                  {forgotLoading ? 'পাঠানো হচ্ছে...' : 'রিসেট লিংক পাঠান'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
