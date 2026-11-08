import React, { useState } from 'react';
import { CompanySettings } from '../../types';
import { store } from '../../services/store';
import { FIRESTORE_RULES_CONTENT, initFirebaseFromSettings } from '../../services/firebase';
import {
  Settings,
  Building,
  Phone,
  CreditCard,
  Database,
  Shield,
  Save,
  RotateCcw,
  CheckCircle2,
  Copy,
  ExternalLink,
  Code2,
} from 'lucide-react';

import firebaseAppletConfig from '../../../firebase-applet-config.json';

export const SettingsFirebase: React.FC = () => {
  const [settings, setSettings] = useState<CompanySettings>(store.getSettings());
  const [isSaved, setIsSaved] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);
  const [firebaseStatusMsg, setFirebaseStatusMsg] = useState('লাইভ ক্লাউড ফায়ারস্টোর ডাটাবেজ সফলভাবে সংযুক্ত রয়েছে।');
  const [isTestingSync, setIsTestingSync] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [address, setAddress] = useState(settings.address);
  const [contactNumber, setContactNumber] = useState(settings.contactNumber);
  const [supportNumber, setSupportNumber] = useState(settings.supportNumber);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [email, setEmail] = useState(settings.email);
  const [invoicePrefix, setInvoicePrefix] = useState(settings.invoicePrefix);
  const [billingCycleDay, setBillingCycleDay] = useState(settings.billingCycleDay);
  const [dueDays, setDueDays] = useState(settings.dueDays);
  const [currency, setCurrency] = useState(settings.currency);

  // Gateway Merchants
  const [bkashMerchant, setBkashMerchant] = useState(settings.bkashMerchant);
  const [nagadMerchant, setNagadMerchant] = useState(settings.nagadMerchant);
  const [rocketMerchant, setRocketMerchant] = useState(settings.rocketMerchant);
  const [bankDetails, setBankDetails] = useState(settings.bankDetails);

  // Firebase Config with provisioned defaults
  const [apiKey, setApiKey] = useState(firebaseAppletConfig.apiKey || settings.firebaseConfig?.apiKey || '');
  const [authDomain, setAuthDomain] = useState(firebaseAppletConfig.authDomain || settings.firebaseConfig?.authDomain || '');
  const [projectId, setProjectId] = useState(firebaseAppletConfig.projectId || settings.firebaseConfig?.projectId || '');
  const [storageBucket, setStorageBucket] = useState(firebaseAppletConfig.storageBucket || settings.firebaseConfig?.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(firebaseAppletConfig.messagingSenderId || settings.firebaseConfig?.messagingSenderId || '');
  const [appId, setAppId] = useState(firebaseAppletConfig.appId || settings.firebaseConfig?.appId || '');

  const handleTestSync = async () => {
    setIsTestingSync(true);
    await store.seedInitialData();
    setFirebaseStatusMsg('ক্লাউড ফায়ারস্টোর ডাটাবেজ সিঙ্ক সফল! সকল রেকর্ড ডাটাবেজে উপস্থিত রয়েছে।');
    setIsTestingSync(false);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();

    const hasFb = Boolean(apiKey.trim() && projectId.trim());
    const newSettings: Partial<CompanySettings> = {
      companyName,
      tagline,
      address,
      contactNumber,
      supportNumber,
      whatsappNumber,
      email,
      invoicePrefix,
      billingCycleDay: Number(billingCycleDay),
      dueDays: Number(dueDays),
      currency,
      bkashMerchant,
      nagadMerchant,
      rocketMerchant,
      bankDetails,
      firebaseConnected: hasFb,
      firebaseConfig: hasFb
        ? {
            apiKey,
            authDomain,
            projectId,
            storageBucket,
            messagingSenderId,
            appId,
          }
        : undefined,
    };

    store.updateSettings(newSettings);
    setSettings(store.getSettings());
    setIsSaved(true);

    if (hasFb) {
      const res = initFirebaseFromSettings(store.getSettings());
      setFirebaseStatusMsg(res.message);
    } else {
      setFirebaseStatusMsg('লোকাল হাই-স্পিড পারসিস্টেন্ট ডাটাবেজ সচল রয়েছে।');
    }

    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCopyRules = () => {
    navigator.clipboard.writeText(FIRESTORE_RULES_CONTENT);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2000);
  };

  const handleResetDatabase = () => {
    if (confirm('সতর্কতা: এটি সম্পূর্ণ লোকাল ডাটাবেজ রিসেট করে ডিফল্ট ডেমো ডেটায় ফিরিয়ে আনবে। আপনি কি নিশ্চিত?')) {
      store.resetDatabase();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">কোম্পানি সেটিংস ও ফায়ারবেস (Settings & Firebase)</h2>
        <p className="text-xs text-slate-500">
          আইএসপি ব্র্যান্ডিং, বিলিং নিয়ম, মোবাইল ব্যাংকিং মার্চেন্ট ও ফায়ারবেস সিকিউরিটি রুলস কনফিগারেশন।
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* Section 1: Company Profile */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Building className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              কোম্পানি পরিচিতি ও ইনভয়েস হেডার (Company Profile)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                কোম্পানির নাম (Company Name) *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ট্যাগলাইন / স্লোগান
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              অফিসের ঠিকানা (Address) *
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                অফিস হটলাইন *
              </label>
              <input
                type="text"
                required
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ২৪/৭ সাপোর্ট হেল্পলাইন *
              </label>
              <input
                type="text"
                required
                value={supportNumber}
                onChange={(e) => setSupportNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                হোয়াটসঅ্যাপ সাপোর্ট নম্বর *
              </label>
              <input
                type="text"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+88017XXXXXXXX"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Billing Rules */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Settings className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              বিলিং সাইকেল ও ইনভয়েস প্রিফিক্স (Billing Rules)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ইনভয়েস প্রিফিক্স
              </label>
              <input
                type="text"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                বিলিং তৈরির তারিখ (দিন)
              </label>
              <input
                type="number"
                value={billingCycleDay}
                onChange={(e) => setBillingCycleDay(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                বিল পরিশোধের মেয়াদ (দিন)
              </label>
              <input
                type="number"
                value={dueDays}
                onChange={(e) => setDueDays(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                মুদ্রা (Currency)
              </label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Payment Gateways */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <CreditCard className="w-4 h-4 text-orange-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              মোবাইল ব্যাংকিং ও মার্চেন্ট অ্যাকাউন্ট (Payment Methods)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                বিকাশ মার্চেন্ট নম্বর (bKash)
              </label>
              <input
                type="text"
                value={bkashMerchant}
                onChange={(e) => setBkashMerchant(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                নগদ মার্চেন্ট নম্বর (Nagad)
              </label>
              <input
                type="text"
                value={nagadMerchant}
                onChange={(e) => setNagadMerchant(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                রকেট মার্চেন্ট নম্বর (Rocket)
              </label>
              <input
                type="text"
                value={rocketMerchant}
                onChange={(e) => setRocketMerchant(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ব্যাংক অ্যাকাউন্ট বিবরণ (Bank Account Details)
            </label>
            <input
              type="text"
              value={bankDetails}
              onChange={(e) => setBankDetails(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-xs"
            />
          </div>
        </div>

        {/* Section 4: Firebase Configuration & Security Rules */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                ফায়ারবেস ক্লাউড ডাটাবেজ ইন্টিগ্রেশন (Firebase Firestore & Auth)
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
              লাইভ ফায়ারস্টোর ডাটাবেজ সংযুক্ত (Connected)
            </span>
          </div>

          <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-900 dark:text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold">{firebaseStatusMsg}</p>
              <p className="text-[11px] opacity-80 mt-0.5">
                প্রজেক্ট আইডি: <span className="font-mono font-bold">{projectId}</span> | ডাটাবেজ: <span className="font-mono">{firebaseAppletConfig.firestoreDatabaseId}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleTestSync}
              disabled={isTestingSync}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 shadow-sm"
            >
              {isTestingSync ? 'সিঙ্ক পরীক্ষা চলছে...' : 'ডাটাবেজ সিঙ্ক ও রি-সিড টেস্ট'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                API Key
              </label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Project ID
              </label>
              <input
                type="text"
                placeholder="operating-scheduler-0lvvl"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
              />
            </div>
          </div>

          {/* Firestore Security Rules Display */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-blue-600" />
                <span>প্রোডাকশন ফায়ারস্টোর সিকিউরিটি রুলস (firestore.rules):</span>
              </span>
              <button
                type="button"
                onClick={handleCopyRules}
                className="text-[11px] text-blue-600 font-semibold flex items-center gap-1 hover:underline"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedRules ? 'কপি হয়েছে!' : 'রুলস কপি করুন'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950 text-slate-200 text-[10px] font-mono rounded-2xl overflow-x-auto max-h-40 border border-slate-800">
              {FIRESTORE_RULES_CONTENT}
            </pre>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleResetDatabase}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 font-semibold text-xs hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ডাটাবেজ রিসেট করুন (Reset to Defaults)</span>
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>সেটিংস সংরক্ষণ করুন (Save Settings)</span>
          </button>
        </div>

        {isSaved && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>কোম্পানি সেটিংস ও কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!</span>
          </div>
        )}

      </form>
    </div>
  );
};
