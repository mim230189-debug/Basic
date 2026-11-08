import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { store } from '../../services/store';
import { Customer, Invoice, Payment } from '../../types';
import {
  CreditCard,
  Users,
  Search,
  CheckCircle2,
  DollarSign,
  Download,
  Plus,
  Send,
  MessageSquareWarning,
  TrendingUp,
  FileText,
  X,
} from 'lucide-react';
import { generatePaymentReceiptPDF } from '../../services/pdfGenerator';

export const EmployeeDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const customers = store.getCustomers();
  const invoices = store.getInvoices();
  const payments = store.getPayments();
  const settings = store.getSettings();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'customers' | 'collections' | 'complaints'>('customers');

  // Quick Collection Modal
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [targetCustomer, setTargetCustomer] = useState<Customer | null>(null);
  const [targetInvoice, setTargetInvoice] = useState<Invoice | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<'Cash' | 'bKash' | 'Nagad'>('Cash');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');

  // Daily remittance submitted state
  const [remittanceSubmitted, setRemittanceSubmitted] = useState(false);

  // Filter payments collected by this employee
  const employeeName = currentUser?.name || 'কবির হোসেন';
  const myPayments = payments.filter((p) => p.collectedBy.includes(employeeName) || p.collectedByRole === 'employee');
  const todayStr = '08-11-2026';
  const myTodayCollection = myPayments
    .filter((p) => !p.isReversed && p.paymentDate === todayStr)
    .reduce((s, p) => s + p.amount, 0);

  const handleOpenCollect = (c: Customer) => {
    setTargetCustomer(c);
    const custInvs = store.getInvoicesByCustomer(c.id);
    const unpaidInv = custInvs.find((i) => i.status !== 'paid') || custInvs[0];
    setTargetInvoice(unpaidInv || null);
    setAmount(unpaidInv ? unpaidInv.remainingBalance : c.monthlyBill);
    setTransactionId(`FLD-${Date.now().toString().slice(-4)}`);
    setNotes('');
    setIsCollectModalOpen(true);
  };

  const handleConfirmCollect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCustomer || amount <= 0) return;

    const res = await store.recordPayment({
      customerId: targetCustomer.id,
      invoiceId: targetInvoice?.id || '',
      amount: Number(amount),
      method,
      transactionId: transactionId || `CASH-${Date.now().toString().slice(-4)}`,
      paymentDate: todayStr,
      collectedBy: employeeName,
      collectedByRole: 'employee',
      notes,
    });

    setIsCollectModalOpen(false);

    if (confirm('পেমেন্ট সফলভাবে সংরক্ষিত হয়েছে! আপনি কি গ্রাহককে মানি রসিদ (PDF) ডাউনলোড করে দিতে চান?')) {
      generatePaymentReceiptPDF(res.payment, res.invoice, settings);
    }
  };

  const handleSubmitDailyRemittance = () => {
    setRemittanceSubmitted(true);
    store.logAudit(
      currentUser?.id || 'EMP',
      employeeName,
      'Daily Remittance Report',
      `Submitted daily collection report of ৳${myTodayCollection.toLocaleString()} to central account`
    );
    setTimeout(() => setRemittanceSubmitted(false), 4000);
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mobile.includes(searchTerm) ||
      c.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-orange-600/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="px-2 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
              কর্মচারী / বিলিং পোর্টাল
            </span>
            <h1 className="text-xl sm:text-2xl font-black mt-1">
              স্বাগতম, {employeeName}!
            </h1>
            <p className="text-xs text-orange-100 mt-0.5">
              ফিল্ড বিল কালেকশন, কাস্টমার ব্যালেন্স চেক এবং তাৎক্ষণিক মানি রসিদ প্রদান।
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-right">
            <span className="text-[11px] text-orange-100 block">আজকের সংগৃহীত টাকা (Today)</span>
            <span className="text-2xl font-black tabular-nums">
              ৳{myTodayCollection.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Daily Remittance Button */}
      {myTodayCollection > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">
              দৈনিক কালেকশন রিপোর্ট ও ক্যাশ জমা (Daily Remittance)
            </h4>
            <p className="text-[11px] text-slate-500">
              আজকের সর্বমোট আদায় ৳{myTodayCollection.toLocaleString()} প্রধান ক্যাশিয়ারের কাছে হস্তান্তরের রিপোর্ট সাবমিট করুন।
            </p>
          </div>

          <button
            onClick={handleSubmitDailyRemittance}
            disabled={remittanceSubmitted}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{remittanceSubmitted ? 'রিপোর্ট সাবমিট হয়েছে!' : 'কালেকশন রিপোর্ট জমা দিন'}</span>
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('customers')}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'customers'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          গ্রাহকদের তালিকা ও বিল কালেকশন ({customers.length})
        </button>
        <button
          onClick={() => setActiveTab('collections')}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'collections'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          আমার কালেকশন হিস্ট্রি ({myPayments.length})
        </button>
      </div>

      {/* Customers List for Collection */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 ml-1" />
            <input
              type="text"
              placeholder="গ্রাহকের নাম, আইডি, মোবাইল বা এলাকা দিয়ে খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-transparent focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredCustomers.map((c) => (
              <div
                key={c.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {c.name}
                    </span>
                    <span className="font-mono text-[10px] px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 rounded text-slate-500">
                      {c.id}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {c.address} · <span className="font-mono">{c.mobile}</span>
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-[11px]">
                    <span className="font-semibold text-blue-600">{c.packageName}</span>
                    <span>·</span>
                    <span className={c.balance < 0 ? 'text-red-600 font-bold' : 'text-emerald-600'}>
                      {c.balance < 0 ? `বকেয়া: ৳${Math.abs(c.balance)}` : 'পরিশোধিত'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenCollect(c)}
                  className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shrink-0 shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>কালেক্ট</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collection History */}
      {activeTab === 'collections' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-950 font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-4">রসিদ নং</th>
                <th className="py-2.5 px-4">গ্রাহক</th>
                <th className="py-2.5 px-4">মেথড</th>
                <th className="py-2.5 px-4">টাকার পরিমাণ</th>
                <th className="py-2.5 px-4">তারিখ</th>
                <th className="py-2.5 px-4 text-right">রসিদ PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {myPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    কোন পেমেন্ট কালেকশন রেকর্ড নেই
                  </td>
                </tr>
              ) : (
                myPayments.map((p) => {
                  const inv = invoices.find((i) => i.id === p.invoiceId);
                  return (
                    <tr key={p.id}>
                      <td className="py-2.5 px-4 font-mono font-bold text-blue-600">{p.receiptNumber}</td>
                      <td className="py-2.5 px-4">{p.customerName} ({p.customerId})</td>
                      <td className="py-2.5 px-4 font-semibold">{p.method}</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-emerald-600 tabular-nums">৳{p.amount.toLocaleString()}</td>
                      <td className="py-2.5 px-4 font-mono">{p.paymentDate}</td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => generatePaymentReceiptPDF(p, inv, settings)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
                          title="মানি রসিদ ডাউনলোড"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Collect Modal */}
      {isCollectModalOpen && targetCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                বিল পেমেন্ট সংগ্রহ: {targetCustomer.name}
              </h3>
              <button onClick={() => setIsCollectModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmCollect} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  টাকার পরিমাণ (BDT) *
                </label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono font-bold text-lg text-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  পেমেন্ট মাধ্যম *
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-medium"
                >
                  <option value="Cash">ক্যাশ (Cash)</option>
                  <option value="bKash">বিকাশ (bKash)</option>
                  <option value="Nagad">নগদ (Nagad)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  রসিদ নম্বর / নোট
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="যেমন: ফিল্ড কালেকশন স্লিপ"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCollectModalOpen(false)}
                  className="flex-1 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-md"
                >
                  পেমেন্ট গ্রহণ ও রসিদ তৈরি
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
