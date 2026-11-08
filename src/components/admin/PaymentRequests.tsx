import React, { useState } from 'react';
import { PaymentRequest } from '../../types';
import { store } from '../../services/store';
import { useAuth } from '../../context/AuthContext';
import {
  Inbox,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter,
  Check,
  X,
  FileCheck2,
} from 'lucide-react';

export const PaymentRequests: React.FC = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<PaymentRequest[]>(store.getPaymentRequests());
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Approval/Rejection action state
  const [activeReq, setActiveReq] = useState<PaymentRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [adminNote, setAdminNote] = useState('');

  const refresh = () => {
    setRequests(store.getPaymentRequests());
  };

  const handleOpenAction = (req: PaymentRequest, type: 'approve' | 'reject') => {
    setActiveReq(req);
    setActionType(type);
    setAdminNote(type === 'approve' ? 'বিকাশ স্টেটমেন্ট মিলিয়ে ভেরিফাই করা হয়েছে।' : 'ভুল ট্রানজেকশন আইডি দেওয়া হয়েছে।');
  };

  const handleConfirmAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReq || !actionType) return;

    const reviewer = currentUser?.name || 'Admin';

    if (actionType === 'approve') {
      store.approvePaymentRequest(activeReq.id, reviewer, adminNote);
    } else {
      store.rejectPaymentRequest(activeReq.id, reviewer, adminNote);
    }

    setActiveReq(null);
    setActionType(null);
    refresh();
  };

  const filtered = requests.filter((r) => {
    const matchesSearch =
      r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.invoiceId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">গ্রাহক পেমেন্ট রিকোয়েস্ট যাচাই (Payment Requests)</h2>
        <p className="text-xs text-slate-500">
          গ্রাহকদের মোবাইল সেলফ-সার্ভিস পোর্টাল থেকে প্রেরিত পেমেন্ট স্লিপ ও ট্রানজেকশন আইডি ভেরিফিকেশন।
        </p>
      </div>

      {/* Security Disclaimer */}
      <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
        <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>সুরক্ষা নীতি:</strong> গ্রাহক কর্তৃক পাঠানো পেমেন্ট রিকোয়েস্ট অটোমেটিক বকেয়া কমায় না। অ্যাডমিন বা বিলিং অফিসার কর্তৃক অনুমোদন পেলেই কেবল ইনভয়েসের ব্যালেন্স আপডেট হয় এবং মানি রসিদ ইস্যু করা হয়।
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="গ্রাহকের নাম, আইডি, TrxID বা ইনভয়েস নং দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {st === 'all'
                ? 'সকল রিকোয়েস্ট'
                : st === 'pending'
                ? 'অপেক্ষমাণ (Pending)'
                : st === 'approved'
                ? 'অনুমোদিত'
                : 'বাতিল'}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">আইডি ও সময়</th>
                <th className="py-3 px-4">গ্রাহক ও মোবাইল</th>
                <th className="py-3 px-4">ইনভয়েস রেফারেন্স</th>
                <th className="py-3 px-4">পেমেন্ট মেথড</th>
                <th className="py-3 px-4">ট্রানজেকশন আইডি (TrxID)</th>
                <th className="py-3 px-4">টাকার পরিমাণ</th>
                <th className="py-3 px-4">স্ট্যাটাস</th>
                <th className="py-3 px-4 text-right">যাচাইকরণ অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    কোন পেমেন্ট রিকোয়েস্ট পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900 dark:text-white block">
                        {req.id}
                      </span>
                      <span className="text-[10px] text-slate-400">{req.submittedAt}</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {req.customerName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {req.customerId} · {req.customerMobile}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                      {req.invoiceId || 'N/A'}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-blue-700 dark:text-blue-300">
                        {req.method}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {req.transactionId}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-black text-sm text-emerald-600 dark:text-emerald-400 tabular-nums">
                      ৳{req.amount.toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          req.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                            : req.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        }`}
                      >
                        {req.status === 'pending'
                          ? 'অপেক্ষমাণ'
                          : req.status === 'approved'
                          ? 'অনুমোদিত'
                          : 'প্রত্যাখ্যাত'}
                      </span>
                      {req.adminNote && (
                        <p className="text-[10px] text-slate-400 mt-0.5 max-w-[140px] truncate" title={req.adminNote}>
                          {req.adminNote}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {req.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenAction(req, 'approve')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm"
                            title="অনুমোদন করুন"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>অনুমোদন</span>
                          </button>
                          <button
                            onClick={() => handleOpenAction(req, 'reject')}
                            className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm"
                            title="বাতিল করুন"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>বাতিল</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          যাচাইকারী: {req.reviewedBy || 'Admin'}
                        </span>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification Confirmation Modal */}
      {activeReq && actionType && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {actionType === 'approve' ? 'পেমেন্ট অনুমোদন ও ইনভয়েস আপডেট' : 'পেমেন্ট রিকোয়েস্ট প্রত্যাখ্যান'}
            </h3>
            
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs space-y-1">
              <p>গ্রাহক: <strong>{activeReq.customerName}</strong> ({activeReq.customerId})</p>
              <p>পরিমাণ: <strong className="text-emerald-600 font-mono">৳{activeReq.amount.toLocaleString()}</strong></p>
              <p>মেথড: <strong>{activeReq.method}</strong> (TrxID: <span className="font-mono">{activeReq.transactionId}</span>)</p>
            </div>

            <form onSubmit={handleConfirmAction} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  অ্যাডমিন মন্তব্য / ভেরিফিকেশন নোট
                </label>
                <input
                  type="text"
                  required
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveReq(null);
                    setActionType(null);
                  }}
                  className="flex-1 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2 text-xs font-bold rounded-xl text-white shadow-md ${
                    actionType === 'approve'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {actionType === 'approve' ? 'অনুমোদন নিশ্চিত করুন' : 'প্রত্যাখ্যান নিশ্চিত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
