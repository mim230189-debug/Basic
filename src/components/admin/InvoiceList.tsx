import React, { useState } from 'react';
import { Invoice } from '../../types';
import { store } from '../../services/store';
import { generateInvoicePDF } from '../../services/pdfGenerator';
import {
  FileText,
  Search,
  Download,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Printer,
} from 'lucide-react';

export const InvoiceList: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(store.getInvoices());
  const settings = store.getSettings();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid' | 'partially_paid' | 'overdue'>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const filtered = invoices.filter((i) => {
    const matchesSearch =
      i.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.customerMobile.includes(searchTerm) ||
      i.customerId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">ইনভয়েস তালিকা ও বিল ব্যবস্থাপনা (Invoices)</h2>
          <p className="text-xs text-slate-500">
            সকল গ্রাহকের মাসিক বিল, বকেয়া বিবরণ এবং ব্র্যান্ডেড PDF ইনভয়েস ডাউনলোড।
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ইনভয়েস নং (INV-XXXX), গ্রাহকের নাম, মোবাইল বা আইডি খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {(['all', 'unpaid', 'partially_paid', 'paid', 'overdue'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-colors ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {st === 'all'
                ? 'সকল ইনভয়েস'
                : st === 'unpaid'
                ? 'বকেয়া'
                : st === 'partially_paid'
                ? 'আংশিক পরিশোধ'
                : st === 'paid'
                ? 'পরিশোধিত'
                : 'মেয়াদোত্তীর্ণ'}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">ইনভয়েস নম্বর</th>
                <th className="py-3 px-4">গ্রাহকের নাম ও আইডি</th>
                <th className="py-3 px-4">বিলিং মাস</th>
                <th className="py-3 px-4">বর্তমান বিল</th>
                <th className="py-3 px-4">পূর্বের বকেয়া</th>
                <th className="py-3 px-4">মোট প্রদেয়</th>
                <th className="py-3 px-4">পরিশোধ</th>
                <th className="py-3 px-4">অবশিষ্ট বকেয়া</th>
                <th className="py-3 px-4">স্ট্যাটাস</th>
                <th className="py-3 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    কোন ইনভয়েস পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {inv.id}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{inv.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{inv.customerId} · {inv.customerMobile}</div>
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

                    <td className="py-3 px-4 font-mono font-bold text-red-600 tabular-nums">
                      ৳{inv.remainingBalance.toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          inv.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200'
                            : inv.status === 'partially_paid'
                            ? 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border border-orange-200'
                            : inv.status === 'overdue'
                            ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200'
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

                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="ইনভয়েস বিস্তারিত দেখুন"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => generateInvoicePDF(inv, settings)}
                        className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
                        title="ডাউনলোড ইনভয়েস (PDF)"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 my-8">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600">{selectedInvoice.id}</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  মাসিক ইন্টারনেট বিল বিবরণী ({selectedInvoice.billingMonth})
                </h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer Details */}
            <div className="bg-slate-50 dark:bg-slate-950/50 p-3.5 rounded-2xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">গ্রাহক:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedInvoice.customerName} ({selectedInvoice.customerId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">মোবাইল:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{selectedInvoice.customerMobile}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">প্যাকেজ:</span>
                <span className="font-semibold text-blue-600">{selectedInvoice.packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">বিলিং তারিখ ও শেষ সময়:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{selectedInvoice.billingDate} থেকে {selectedInvoice.dueDate}</span>
              </div>
            </div>

            {/* Financial Ledger Breakdown */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">চলতি মাসের প্যাকেজ ফি:</span>
                <span className="font-mono tabular-nums font-semibold">৳{selectedInvoice.currentBill.toLocaleString()}</span>
              </div>
              {selectedInvoice.additionalCharges > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">অতিরিক্ত / সংযোগ ফি:</span>
                  <span className="font-mono tabular-nums font-semibold">+৳{selectedInvoice.additionalCharges.toLocaleString()}</span>
                </div>
              )}
              {selectedInvoice.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>ডিসকাউন্ট:</span>
                  <span className="font-mono tabular-nums font-semibold">-৳{selectedInvoice.discount.toLocaleString()}</span>
                </div>
              )}
              {selectedInvoice.previousDue > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>পূর্বের অপরিশোধিত বকেয়া (Arrears):</span>
                  <span className="font-mono tabular-nums font-semibold">+৳{selectedInvoice.previousDue.toLocaleString()}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between font-bold text-sm">
                <span>সর্বমোট প্রদেয় টাকা:</span>
                <span className="font-mono text-blue-600">৳{selectedInvoice.totalPayable.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>পরিশোধিত টাকা:</span>
                <span className="font-mono tabular-nums">৳{selectedInvoice.amountPaid.toLocaleString()}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-bold flex justify-between">
                <span>অবশিষ্ট বাকি টাকা (Remaining Due):</span>
                <span className="font-mono text-base">৳{selectedInvoice.remainingBalance.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 hover:bg-slate-50"
              >
                বন্ধ করুন
              </button>
              <button
                type="button"
                onClick={() => generateInvoicePDF(selectedInvoice, settings)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF ইনভয়েস ডাউনলোড</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
