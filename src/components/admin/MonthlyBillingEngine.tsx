import React, { useState } from 'react';
import { store } from '../../services/store';
import { Invoice } from '../../types';
import {
  CalendarCheck2,
  Play,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  ShieldCheck,
  RefreshCw,
  Download,
  Search,
} from 'lucide-react';
import { generateInvoicePDF } from '../../services/pdfGenerator';

export const MonthlyBillingEngine: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(store.getInvoices());
  const customers = store.getCustomers();
  const settings = store.getSettings();

  // Next billing month default: e.g. December 2026 or November 2026
  const [billingMonthKey, setBillingMonthKey] = useState('2026-11');
  const [billingMonthName, setBillingMonthName] = useState('নভেম্বর ২০২৬ (November 2026)');
  const [dueDate, setDueDate] = useState('10-11-2026');

  const [isRunning, setIsRunning] = useState(false);
  const [lastRunResult, setLastRunResult] = useState<{ generated: number; skipped: number } | null>(null);

  const activeCustomers = customers.filter((c) => c.status === 'active');
  const projectedBillingTotal = activeCustomers.reduce((sum, c) => sum + c.monthlyBill, 0);

  const refreshInvoices = () => {
    setInvoices(store.getInvoices());
  };

  const handleRunBilling = async () => {
    if (!confirm(`আপনি কি ${billingMonthName}-এর জন্য বিল জেনারেট করতে চান? সক্রিয় গ্রাহক: ${activeCustomers.length} জন। ডুপ্লিকেট ইনভয়েস থাকলে তা স্বয়ংক্রিয়ভাবে স্কিপ হবে।`)) {
      return;
    }

    setIsRunning(true);
    try {
      const res = await store.generateMonthlyBills(billingMonthKey, billingMonthName, dueDate, 'Admin / Scheduler');
      setLastRunResult(res);
      refreshInvoices();
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">মাসিক বিলিং ইঞ্জিন (Monthly Billing Engine)</h2>
        <p className="text-xs text-slate-500">
          সক্রিয় গ্রাহকদের জন্য মাসিক বিল প্রস্তুতকরণ, পূর্বের বকেয়া হিসাব ও ক্লাউড সিডিউলার ব্যবস্থাপনা।
        </p>
      </div>

      {/* Engine Control Console Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CalendarCheck2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                স্বয়ংক্রিয় মাসিক বিল প্রস্তুতকারক
              </h3>
              <p className="text-xs text-slate-500">
                গ্রাহকের বর্তমান প্যাকেজ রেট এবং পূর্ববর্তী বকেয়া যোগ করে ইনভয়েস তৈরি করা হয়।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunBilling}
              disabled={isRunning || activeCustomers.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>বিল প্রস্তুত হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>বিলিং ইঞ্জিন রান করুন</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Configuration Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              বিলিং মাস নির্বাচন করুন
            </label>
            <select
              value={billingMonthKey}
              onChange={(e) => {
                const val = e.target.value;
                setBillingMonthKey(val);
                if (val === '2026-11') setBillingMonthName('নভেম্বর ২০২৬ (November 2026)');
                else if (val === '2026-12') setBillingMonthName('ডিসেম্বর ২০২৬ (December 2026)');
                else if (val === '2027-01') setBillingMonthName('জানুয়ারি ২০২৭ (January 2027)');
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium"
            >
              <option value="2026-11">নভেম্বর ২০২৬ (November 2026)</option>
              <option value="2026-12">ডিসেম্বর ২০২৬ (December 2026)</option>
              <option value="2027-01">জানুয়ারি ২০২৭ (January 2027)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              বিল পরিশোধের শেষ তারিখ (Due Date)
            </label>
            <input
              type="text"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              placeholder="DD-MM-YYYY"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              প্রত্যাশিত রাজস্ব (Projected Revenue)
            </label>
            <div className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-300 font-bold tabular-nums">
              ৳{projectedBillingTotal.toLocaleString()} ({activeCustomers.length} জন সক্রিয়)
            </div>
          </div>
        </div>

        {/* Last Run Feedback */}
        {lastRunResult && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <strong>বিলিং সফল!</strong> {lastRunResult.generated} টি নতুন ইনভয়েস তৈরি হয়েছে। ({lastRunResult.skipped} টি ডুপ্লিকেট স্কিপ করা হয়েছে)।
              </span>
            </div>
            <button
              onClick={() => setLastRunResult(null)}
              className="text-[11px] text-emerald-700 font-semibold hover:underline"
            >
              বন্ধ করুন
            </button>
          </div>
        )}

        {/* Safety Engine Invariants Guarantee */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>সিস্টেম সুরক্ষা ও ডুপ্লিকেট প্রতিরোধ নিয়মাবলী:</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            ১. একই গ্রাহকের জন্য এক মাসে একাধিক ইনভয়েস তৈরি হয় না (Zero Duplicate Invoicing)।<br />
            ২. পূর্ববর্তী মাসের অপরিশোধিত টাকা স্বয়ংক্রিয়ভাবে নতুন বিলের &apos;পূর্বের বকেয়া&apos; (Previous Due) হিসেবে যোগ হয়।<br />
            ৩. ব্যাকএন্ড ক্রন শিডিউলার প্রতিদিন রাত ১২:০১ টায় অটোমেটিক চেক রান করে।
          </p>
        </div>

      </div>

      {/* Recent Invoices Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            সর্বশেষ তৈরি করা ইনভয়েসের তালিকা ({invoices.length} টি)
          </h3>
          <span className="text-xs text-slate-500">সর্বশেষ আপডেট: ০৮ নভেম্বর ২০২৬</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">ইনভয়েস নম্বর</th>
                <th className="py-3 px-4">গ্রাহকের নাম ও আইডি</th>
                <th className="py-3 px-4">বিলিং মাস</th>
                <th className="py-3 px-4">মূল প্যাকেজ ফি</th>
                <th className="py-3 px-4">পূর্বের বকেয়া</th>
                <th className="py-3 px-4">মোট প্রদেয়</th>
                <th className="py-3 px-4">পরিশোধিত</th>
                <th className="py-3 px-4">স্ট্যাটাস</th>
                <th className="py-3 px-4 text-right">PDF ইনভয়েস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {inv.id}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{inv.customerName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{inv.customerId}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {inv.billingMonth}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums">
                    ৳{inv.currentBill.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-red-500">
                    {inv.previousDue > 0 ? `+৳${inv.previousDue.toLocaleString()}` : '৳০'}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                    ৳{inv.totalPayable.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-600 tabular-nums">
                    ৳{inv.amountPaid.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        inv.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : inv.status === 'partially_paid'
                          ? 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                          : inv.status === 'overdue'
                          ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {inv.status === 'paid'
                        ? 'পরিশোধিত'
                        : inv.status === 'partially_paid'
                        ? 'আংশিক পরিশোধ'
                        : inv.status === 'overdue'
                        ? 'মেয়াদোত্তীর্ণ'
                        : 'বকেয়া'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => generateInvoicePDF(inv, settings)}
                      className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                      title="ডাউনলোড ইনভয়েস (PDF)"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
