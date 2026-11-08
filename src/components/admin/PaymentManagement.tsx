import React, { useState } from 'react';
import { Payment, Customer, Invoice } from '../../types';
import { store } from '../../services/store';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Download,
  Calendar,
  X,
  User,
  Hash,
} from 'lucide-react';
import { generatePaymentReceiptPDF } from '../../services/pdfGenerator';
import { useAuth } from '../../context/AuthContext';

interface PaymentManagementProps {
  initialCustomerId?: string;
}

export const PaymentManagement: React.FC<PaymentManagementProps> = ({ initialCustomerId }) => {
  const { currentUser } = useAuth();
  const [payments, setPayments] = useState<Payment[]>(store.getPayments());
  const customers = store.getCustomers();
  const invoices = store.getInvoices();
  const settings = store.getSettings();

  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');

  // Collect Payment Modal
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialCustomerId || customers[0]?.id || '');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<'Cash' | 'bKash' | 'Nagad' | 'Rocket' | 'Bank Transfer' | 'Other'>('bKash');
  const [transactionId, setTransactionId] = useState('');
  const [paymentDate, setPaymentDate] = useState('08-11-2026');
  const [notes, setNotes] = useState('');

  // Reversal Modal
  const [reversingPayment, setReversingPayment] = useState<Payment | null>(null);
  const [reversalReason, setReversalReason] = useState('');

  const refreshList = () => {
    setPayments(store.getPayments());
  };

  // Open modal & auto-pick customer's unpaid invoice
  const handleOpenCollect = (customerId?: string) => {
    const custId = customerId || initialCustomerId || customers[0]?.id || '';
    setSelectedCustomerId(custId);

    const custInvoices = store.getInvoicesByCustomer(custId);
    const unpaidInv = custInvoices.find((i) => i.status !== 'paid');
    if (unpaidInv) {
      setSelectedInvoiceId(unpaidInv.id);
      setAmount(unpaidInv.remainingBalance);
    } else if (custInvoices.length > 0) {
      setSelectedInvoiceId(custInvoices[0].id);
      setAmount(custInvoices[0].currentBill);
    } else {
      setSelectedInvoiceId('');
      setAmount(700);
    }

    setTransactionId(`TX-${Date.now().toString().slice(-6)}`);
    setPaymentDate(new Date().toLocaleDateString('en-GB').replace(/\//g, '-'));
    setNotes('');
    setIsCollectModalOpen(true);
  };

  const handleCustomerChange = (custId: string) => {
    setSelectedCustomerId(custId);
    const custInvoices = store.getInvoicesByCustomer(custId);
    const unpaidInv = custInvoices.find((i) => i.status !== 'paid');
    if (unpaidInv) {
      setSelectedInvoiceId(unpaidInv.id);
      setAmount(unpaidInv.remainingBalance);
    } else if (custInvoices.length > 0) {
      setSelectedInvoiceId(custInvoices[0].id);
      setAmount(custInvoices[0].currentBill);
    } else {
      setSelectedInvoiceId('');
      setAmount(0);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('পেমেন্টের পরিমাণ অবশ্যই শূন্যের চেয়ে বেশি হতে হবে।');
      return;
    }

    const res = await store.recordPayment({
      customerId: selectedCustomerId,
      invoiceId: selectedInvoiceId,
      amount: Number(amount),
      method,
      transactionId: transactionId || `CASH-${Date.now().toString().slice(-4)}`,
      paymentDate,
      collectedBy: currentUser?.name || 'বিলিং ম্যানেজার',
      collectedByRole: currentUser?.role === 'employee' ? 'employee' : 'admin',
      notes,
    });

    setIsCollectModalOpen(false);
    refreshList();

    // Prompt to download PDF Money Receipt
    if (confirm('পেমেন্ট সফলভাবে সংরক্ষিত হয়েছে! আপনি কি অফিসিয়াল মানি রসিদ (PDF) ডাউনলোড করতে চান?')) {
      generatePaymentReceiptPDF(res.payment, res.invoice, settings);
    }
  };

  const handleConfirmReversal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reversingPayment) return;

    await store.reversePayment(reversingPayment.id, reversalReason, currentUser?.name || 'Admin');
    setReversingPayment(null);
    setReversalReason('');
    refreshList();
  };

  // Filter payments
  const filtered = payments.filter((p) => {
    const matchesSearch =
      p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = methodFilter === 'all' || p.method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">পেমেন্ট কালেকশন ও রসিদ (Payments)</h2>
          <p className="text-xs text-slate-500">
            নগদ ও ডিজিটাল গেটওয়ে কালেকশন, মানি রসিদ জেনারেট এবং অডিট ট্রেইলযুক্ত পেমেন্ট রিভার্সাল।
          </p>
        </div>

        <button
          onClick={() => handleOpenCollect()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>পেমেন্ট গ্রহণ করুন (Collect Payment)</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="রসিদ নং, ট্রানজেকশন আইডি (TrxID), গ্রাহকের নাম বা আইডি খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium"
          >
            <option value="all">সকল পেমেন্ট মেথড</option>
            <option value="Cash">Cash (ক্যাশ)</option>
            <option value="bKash">bKash (বিকাশ)</option>
            <option value="Nagad">Nagad (নগদ)</option>
            <option value="Rocket">Rocket (রকেট)</option>
            <option value="Bank Transfer">Bank Transfer (ব্যাংক)</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">রসিদ ও পেমেন্ট আইডি</th>
                <th className="py-3 px-4">গ্রাহকের নাম ও আইডি</th>
                <th className="py-3 px-4">পরিমাণ (BDT)</th>
                <th className="py-3 px-4">মেথড ও ট্রানজেকশন</th>
                <th className="py-3 px-4">তারিখ</th>
                <th className="py-3 px-4">কালেকশন অফিসার</th>
                <th className="py-3 px-4">স্ট্যাটাস</th>
                <th className="py-3 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    কোন পেমেন্ট রেকর্ড পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const inv = invoices.find((i) => i.id === p.invoiceId);
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        p.isReversed ? 'bg-red-50/30 dark:bg-red-950/20 opacity-75' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900 dark:text-white block">
                          {p.receiptNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{p.id}</span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {p.customerName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{p.customerId}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`font-black font-mono text-sm tabular-nums ${
                            p.isReversed
                              ? 'line-through text-slate-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          ৳{p.amount.toLocaleString()}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {p.method}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          TrxID: {p.transactionId || 'N/A'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono">
                        {p.paymentDate}
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {p.collectedBy}
                      </td>

                      <td className="py-3 px-4">
                        {p.isReversed ? (
                          <span
                            title={`রিভার্সাল কারণ: ${p.reversedReason}`}
                            className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200"
                          >
                            বাতিল / রিভার্সড
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
                            ভেরিফাইড
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => generatePaymentReceiptPDF(p, inv, settings)}
                          className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
                          title="মানি রসিদ PDF ডাউনলোড"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {!p.isReversed && currentUser?.role === 'admin' && (
                          <button
                            onClick={() => {
                              setReversingPayment(p);
                              setReversalReason('');
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                            title="পেমেন্ট রিভার্সাল / ভুল এন্ট্রি সংশোধন"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Payment Modal */}
      {isCollectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                গ্রাহকের বিল পেমেন্ট গ্রহণ (Payment Collection)
              </h3>
              <button
                onClick={() => setIsCollectModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="mt-4 space-y-3.5">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  গ্রাহক নির্বাচন করুন *
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-600"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id}) - {c.mobile} [বর্তমান বকেয়া: ৳{Math.abs(c.balance)}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  সম্পর্কিত ইনভয়েস নির্বাচন করুন
                </label>
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => {
                    const invId = e.target.value;
                    setSelectedInvoiceId(invId);
                    const inv = invoices.find((i) => i.id === invId);
                    if (inv) setAmount(inv.remainingBalance > 0 ? inv.remainingBalance : inv.currentBill);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                >
                  {store.getInvoicesByCustomer(selectedCustomerId).map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.id} - {inv.billingMonth} [মোট: ৳{inv.totalPayable}, বাকি: ৳{inv.remainingBalance}]
                    </option>
                  ))}
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
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    পেমেন্ট মেথড *
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                  >
                    <option value="Cash">ক্যাশ (Cash)</option>
                    <option value="bKash">বিকাশ (bKash)</option>
                    <option value="Nagad">নগদ (Nagad)</option>
                    <option value="Rocket">রকেট (Rocket)</option>
                    <option value="Bank Transfer">ব্যাংক ট্রান্সফার (Bank)</option>
                    <option value="Other">অন্যান্য</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ট্রানজেকশন আইডি (TrxID)
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="যেমন: BK9A772LK1"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    পেমেন্টের তারিখ *
                  </label>
                  <input
                    type="text"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    placeholder="DD-MM-YYYY"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  নোট / মন্তব্য (Notes)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="অফিস রসিদ বা মন্তব্য"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCollectModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 hover:bg-slate-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20"
                >
                  পেমেন্ট নিশ্চিত করুন ও রসিদ তৈরি করুন
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Payment Reversal Modal */}
      {reversingPayment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              পেমেন্ট রিভার্সাল / বাতিলকরণ
            </h3>
            <p className="text-xs text-slate-500">
              রসিদ নং <strong>{reversingPayment.receiptNumber}</strong> (৳{reversingPayment.amount.toLocaleString()}) বাতিল করা হলে তা গ্রাহকের অ্যাকাউন্টে পুনরায় বকেয়া হিসেবে হিসাবভুক্ত হবে।
            </p>

            <form onSubmit={handleConfirmReversal} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  বাতিলের কারণ (বাধ্যতামূলক) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ভুল গ্রাহকের অ্যাকাউন্টে এন্ট্রি"
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReversingPayment(null)}
                  className="flex-1 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md"
                >
                  রিভার্স নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
