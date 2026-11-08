import React from 'react';
import {
  Users,
  CheckCircle,
  AlertOctagon,
  Clock,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  Calendar,
  DollarSign,
  PlusCircle,
  FileText,
  ArrowUpRight,
  Wifi,
} from 'lucide-react';
import { store } from '../../services/store';
import { AdminTab } from './AdminSidebar';

interface AdminDashboardProps {
  onNavigate: (tab: AdminTab) => void;
  onOpenPaymentModal: () => void;
  onOpenCustomerModal: () => void;
  onOpenBillingModal: () => void;
  onOpenExpenseModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate,
  onOpenPaymentModal,
  onOpenCustomerModal,
  onOpenBillingModal,
  onOpenExpenseModal,
}) => {
  const customers = store.getCustomers();
  const invoices = store.getInvoices();
  const payments = store.getPayments();
  const expenses = store.getExpenses();
  const packages = store.getPackages();

  // Metrics computation
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.status === 'active').length;
  const inactiveCustomers = customers.filter((c) => c.status === 'inactive').length;
  const suspendedCustomers = customers.filter((c) => c.status === 'suspended').length;

  // Invoices metrics for current month
  const currentMonthInvoices = invoices.filter((i) => i.billingMonthKey === '2026-11');
  const totalMonthlyBilling = currentMonthInvoices.reduce((sum, i) => sum + i.totalPayable, 0);
  const totalCollectedAmount = payments.filter((p) => !p.isReversed).reduce((sum, p) => sum + p.amount, 0);

  // Outstanding across all invoices
  const totalOutstandingAmount = invoices.reduce((sum, i) => sum + i.remainingBalance, 0);

  // Today's collection
  const todayStr = '08-11-2026';
  const todayPayments = payments.filter((p) => !p.isReversed && p.paymentDate === todayStr);
  const todayCollection = todayPayments.reduce((sum, p) => sum + p.amount, 0);

  // Monthly expenses
  const monthlyExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Estimated Monthly Profit (Total collected - Expenses)
  const monthlyProfit = totalCollectedAmount - monthlyExpenses;

  // Package breakdown
  const packageStats = packages.map((pkg) => {
    const count = customers.filter((c) => c.packageId === pkg.id).length;
    return {
      name: pkg.name.split(' - ')[0] || pkg.name,
      speed: pkg.speed,
      price: pkg.price,
      count,
    };
  });

  // Invoice status counts
  const paidCount = invoices.filter((i) => i.status === 'paid').length;
  const unpaidCount = invoices.filter((i) => i.status === 'unpaid').length;
  const partialCount = invoices.filter((i) => i.status === 'partially_paid').length;
  const overdueCount = invoices.filter((i) => i.status === 'overdue').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-blue-900/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-300 border border-orange-400/30 text-[10px] font-bold uppercase tracking-wider">
                লাইভ অপারেশনস
              </span>
              <span className="text-xs text-blue-200">এশিয়া/ঢাকা সময়: ০৮ নভেম্বর ২০২৬</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1.5">
              WINK NETWORK ISP - ড্যাশবোর্ড ওভারভিউ
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/80 mt-1 max-w-2xl">
              আজকের বিলিং, ইন্টারনেট কালেকশন, কাস্টমার অ্যাক্টিভিটি ও ফাইন্যান্সিয়াল রিপোর্ট।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenPaymentModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>পেমেন্ট গ্রহণ</span>
            </button>
            <button
              onClick={onOpenCustomerModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>নতুন গ্রাহক</span>
            </button>
            <button
              onClick={onOpenBillingModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>মাসিক বিল জেনারেট</span>
            </button>
            <button
              onClick={onOpenExpenseModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>খরচ যোগ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Customers */}
        <div
          onClick={() => onNavigate('customers')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">মোট গ্রাহক</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2 tabular-nums">
            {totalCustomers.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center gap-2 text-[11px]">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{activeCustomers} সক্রিয়</span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-amber-500 font-semibold">{suspendedCustomers} স্থগিত</span>
          </div>
        </div>

        {/* Total Monthly Billing */}
        <div
          onClick={() => onNavigate('invoices')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">চলতি মাসের বিলিং</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2 tabular-nums">
            ৳{totalMonthlyBilling.toLocaleString()}
          </p>
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            নভেম্বর ২০২৬ ইনভয়েস
          </p>
        </div>

        {/* Total Collected */}
        <div
          onClick={() => onNavigate('payments')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">মোট আদায়কৃত টাকা</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2 tabular-nums">
            ৳{totalCollectedAmount.toLocaleString()}
          </p>
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            আজকের আদায়: ৳{todayCollection.toLocaleString()}
          </p>
        </div>

        {/* Total Outstanding */}
        <div
          onClick={() => onNavigate('invoices')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-red-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">মোট বকেয়া টাকা</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950 flex items-center justify-center text-red-600 dark:text-red-400">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-red-600 dark:text-red-400 mt-2 tabular-nums">
            ৳{totalOutstandingAmount.toLocaleString()}
          </p>
          <p className="mt-2 text-[11px] text-red-500/80">
            {overdueCount + unpaidCount} টি ইনভয়েসে বকেয়া রয়েছে
          </p>
        </div>

      </div>

      {/* Secondary Metrics Row: Expenses, Profit, Today's Collection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">মাসিক মোট খরচ (Expenses)</span>
            <span className="text-xs font-bold text-slate-400">{expenses.length} টি ভাউচার</span>
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
            ৳{monthlyExpenses.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            ব্যান্ডউইথ, বিদ্যুৎ ও অফিস ব্যবস্থাপনা খরচ
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">নিট ক্যাশ ফ্লো / আনুমানিক লাভ</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
              ক্যাশ হিসাব
            </span>
          </div>
          <p className={`text-xl font-black mt-1 tabular-nums ${monthlyProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600'}`}>
            ৳{monthlyProfit.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            (মোট কালেকশন - মোট খরচ)
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">ইনভয়েস স্ট্যাটাস সামারি</span>
            <span className="text-xs text-blue-600 font-semibold">{invoices.length} টি সর্বমোট</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 mt-3 text-center">
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold">পরিশোধ</span>
              <p className="text-sm font-black text-emerald-700 dark:text-emerald-300 tabular-nums">{paidCount}</p>
            </div>
            <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800">
              <span className="text-[10px] text-orange-700 dark:text-orange-300 font-bold">আংশিক</span>
              <p className="text-sm font-black text-orange-700 dark:text-orange-300 tabular-nums">{partialCount}</p>
            </div>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold">বকেয়া</span>
              <p className="text-sm font-black text-amber-700 dark:text-amber-300 tabular-nums">{unpaidCount}</p>
            </div>
            <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800">
              <span className="text-[10px] text-red-700 dark:text-red-300 font-bold">মেয়াদোত্তীর্ণ</span>
              <p className="text-sm font-black text-red-700 dark:text-red-300 tabular-nums">{overdueCount}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Visual Analytics / Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Package-wise Customer Distribution */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">প্যাকেজ ভিত্তিক গ্রাহক বণ্টন</h3>
              <p className="text-[11px] text-slate-500">বিভিন্ন স্পিড প্যাকেজের সক্রিয় ব্যবহারকারী</p>
            </div>
            <button
              onClick={() => onNavigate('packages')}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline"
            >
              <span>প্যাকেজ তালিকা</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {packageStats.map((pkg, idx) => {
              const pct = totalCustomers > 0 ? Math.round((pkg.count / totalCustomers) * 100) : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {pkg.name} ({pkg.speed})
                    </span>
                    <span className="tabular-nums font-mono text-slate-500">
                      {pkg.count} জন ({pct}%) · ৳{pkg.price}/মাস
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Recent Payment Collections */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">সাম্প্রতিক পেমেন্ট কালেকশন</h3>
              <p className="text-[11px] text-slate-500">সর্বশেষ পরিশোধিত বিলের ট্রানজেকশন</p>
            </div>
            <button
              onClick={() => onNavigate('payments')}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline"
            >
              <span>সকল পেমেন্ট</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            {payments.slice(0, 5).map((pay) => (
              <div key={pay.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {pay.customerName}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    আইডি: {pay.customerId} · {pay.method} ({pay.paymentDate})
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    +৳{pay.amount.toLocaleString()}
                  </span>
                  <span className="block text-[10px] text-slate-400 font-mono">
                    {pay.receiptNumber}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
