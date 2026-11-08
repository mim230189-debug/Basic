import React, { useState } from 'react';
import { store } from '../../services/store';
import { Expense, Income } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  DollarSign,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Trash2,
  Calendar,
  X,
  FileSpreadsheet,
} from 'lucide-react';

export const AccountsManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>(store.getExpenses());
  const [incomes, setIncomes] = useState<Income[]>(store.getIncome());
  const payments = store.getPayments();
  const invoices = store.getInvoices();

  const [activeTab, setActiveTab] = useState<'expenses' | 'income'>('expenses');

  // Add Expense Modal
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expCategory, setExpCategory] = useState<Expense['category']>('Bandwidth Costs');
  const [expAmount, setExpAmount] = useState<number>(0);
  const [expDate, setExpDate] = useState('08-11-2026');
  const [expDescription, setExpDescription] = useState('');

  // Add Income Modal
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [incCategory, setIncCategory] = useState<Income['category']>('Installation Charge');
  const [incAmount, setIncAmount] = useState<number>(0);
  const [incDate, setIncDate] = useState('08-11-2026');
  const [incDescription, setIncDescription] = useState('');

  const refresh = () => {
    setExpenses(store.getExpenses());
    setIncomes(store.getIncome());
  };

  // Metrics
  const totalBilledRevenue = invoices.reduce((s, i) => s + i.totalPayable, 0);
  const totalActualCashCollected = payments.filter((p) => !p.isReversed).reduce((s, p) => s + p.amount, 0);
  const totalOtherIncome = incomes.filter((i) => i.category !== 'Monthly Bill Collection').reduce((s, i) => s + i.amount, 0);
  const totalCashInflow = totalActualCashCollected + totalOtherIncome;
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netCashProfit = totalCashInflow - totalExpenses;

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (expAmount <= 0) return;
    store.addExpense({
      category: expCategory,
      amount: Number(expAmount),
      date: expDate,
      description: expDescription,
      recordedBy: currentUser?.name || 'Admin',
    });
    setIsExpenseModalOpen(false);
    setExpAmount(0);
    setExpDescription('');
    refresh();
  };

  const handleAddIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (incAmount <= 0) return;
    store.addIncome({
      category: incCategory,
      amount: Number(incAmount),
      date: incDate,
      description: incDescription,
      recordedBy: currentUser?.name || 'Admin',
    });
    setIsIncomeModalOpen(false);
    setIncAmount(0);
    setIncDescription('');
    refresh();
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('আপনি কি এই খরচের এন্ট্রি মুছে ফেলতে চান?')) {
      store.deleteExpense(id);
      refresh();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">আয় ও ব্যয় হিসাব (Accounts & Ledger)</h2>
          <p className="text-xs text-slate-500">
            ব্যান্ডউইথ, অফিস ও মেইনটেন্যান্স খরচ এবং ক্যাশ কালেকশন ভিত্তিক লাভ-ক্ষতি বিবরণী।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsIncomeModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন আয় যোগ</span>
          </button>
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন খরচ যোগ</span>
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Total Billed Revenue */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">মোট বিলকৃত রাজস্ব (Accrual)</span>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
            ৳{totalBilledRevenue.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">ইনভয়েস অনুযায়ী দাবি</p>
        </div>

        {/* Actual Cash Collected */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">প্রকৃত ক্যাশ প্রাপ্তি (Collected)</span>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            ৳{totalCashInflow.toLocaleString()}
          </p>
          <p className="text-[10px] text-emerald-600/80 mt-1">বিল কালেকশন + অন্যান্য আয়</p>
        </div>

        {/* Total Expenses */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">মোট খরচ (Total Expenses)</span>
          <p className="text-xl font-black text-red-600 dark:text-red-400 mt-1 tabular-nums">
            ৳{totalExpenses.toLocaleString()}
          </p>
          <p className="text-[10px] text-red-500/80 mt-1">ব্যান্ডউইথ, বেতন ও বিদ্যুৎ</p>
        </div>

        {/* Net Cash Profit */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">নিট ক্যাশ লাভ (Net Profit)</span>
          <p className={`text-xl font-black mt-1 tabular-nums ${netCashProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600'}`}>
            ৳{netCashProfit.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">(ক্যাশ প্রাপ্তি - মোট খরচ)</p>
        </div>

      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'expenses'
              ? 'border-red-600 text-red-600 dark:text-red-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          খরচের খতিয়ান ({expenses.length} টি ভাউচার)
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'income'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          আয়ের খতিয়ান ({incomes.length} টি রেকর্ড)
        </button>
      </div>

      {/* Expenses Table */}
      {activeTab === 'expenses' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">ভাউচার আইডি</th>
                  <th className="py-3 px-4">খরচের খাত (Category)</th>
                  <th className="py-3 px-4">পরিমাণ (BDT)</th>
                  <th className="py-3 px-4">তারিখ</th>
                  <th className="py-3 px-4">বিবরণ</th>
                  <th className="py-3 px-4">নথিভুক্তকারী</th>
                  <th className="py-3 px-4 text-right">মুছুন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {exp.id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {exp.category}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-red-600 tabular-nums">
                      ৳{exp.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {exp.date}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {exp.description}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {exp.recordedBy}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="p-1 rounded text-slate-400 hover:text-red-600"
                        title="মুছুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Incomes Table */}
      {activeTab === 'income' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">আইডি</th>
                  <th className="py-3 px-4">আয়ের খাত (Category)</th>
                  <th className="py-3 px-4">পরিমাণ (BDT)</th>
                  <th className="py-3 px-4">তারিখ</th>
                  <th className="py-3 px-4">বিবরণ</th>
                  <th className="py-3 px-4">নথিভুক্তকারী</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {incomes.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {inc.id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-700 dark:text-emerald-300">
                      {inc.category}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600 tabular-nums">
                      +৳{inc.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {inc.date}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {inc.description}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {inc.recordedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                নতুন খরচ লিপিবদ্ধ করুন (Add Expense)
              </h3>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  খরচের খাত নির্বাচন করুন *
                </label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-medium"
                >
                  <option value="Bandwidth Costs">ব্যান্ডউইথ খরচ (Bandwidth Costs)</option>
                  <option value="Office Rent">অফিস ও সার্ভার রুম ভাড়া (Office Rent)</option>
                  <option value="Employee Salaries">কর্মচারীদের বেতন (Employee Salaries)</option>
                  <option value="Electricity & Utility">বিদ্যুৎ ও ইউটিলিটি বিল (Electricity)</option>
                  <option value="Equipment Purchases">সরঞ্জাম ক্রয় (Equipment Purchases)</option>
                  <option value="Fiber & Maintenance">অপটিক্যাল ফাইবার ও রক্ষণাবেক্ষণ</option>
                  <option value="Other Expenses">অন্যান্য অফিস খরচ</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    টাকার পরিমাণ (BDT) *
                  </label>
                  <input
                    type="number"
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    তারিখ *
                  </label>
                  <input
                    type="text"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  খরচের বিবরণ *
                </label>
                <textarea
                  required
                  rows={2}
                  value={expDescription}
                  onChange={(e) => setExpDescription(e.target.value)}
                  placeholder="কার কাছে পরিশোধ, ভাউচার নম্বর বা কাজের বিবরণ..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md"
                >
                  খরচ সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Income Modal */}
      {isIncomeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                নতুন আয় লিপিবদ্ধ করুন (Add Income)
              </h3>
              <button onClick={() => setIsIncomeModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddIncomeSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  আয়ের খাত নির্বাচন করুন *
                </label>
                <select
                  value={incCategory}
                  onChange={(e) => setIncCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-medium"
                >
                  <option value="Installation Charge">নতুন ইনস্টলেশন ফি (Installation Charge)</option>
                  <option value="New Connection Fee">নতুন সংযোগ রেজিস্ট্রেশন চার্জ</option>
                  <option value="Equipment Sale">রাউটার/অনু সেলস (Equipment Sale)</option>
                  <option value="Other Income">অন্যান্য বিবিধ আয়</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    টাকার পরিমাণ (BDT) *
                  </label>
                  <input
                    type="number"
                    required
                    value={incAmount}
                    onChange={(e) => setIncAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    তারিখ *
                  </label>
                  <input
                    type="text"
                    value={incDate}
                    onChange={(e) => setIncDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  আয়ের বিবরণ *
                </label>
                <textarea
                  required
                  rows={2}
                  value={incDescription}
                  onChange={(e) => setIncDescription(e.target.value)}
                  placeholder="গ্রাহকের নাম বা আয়ের বিবরণ..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsIncomeModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                >
                  আয় সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
