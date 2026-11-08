import React, { useState } from 'react';
import { Complaint, Employee } from '../../types';
import { store } from '../../services/store';
import {
  MessageSquareWarning,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  MessageCircle,
  X,
  Phone,
  Send,
  User,
} from 'lucide-react';

export const ComplaintsManagement: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>(store.getComplaints());
  const employees = store.getEmployees();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all');

  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(null);
  const [replyText, setReplyText] = useState('');
  const [assignedEmp, setAssignedEmp] = useState('');
  const [targetStatus, setTargetStatus] = useState<'pending' | 'in_progress' | 'resolved'>('in_progress');

  const refresh = () => {
    setComplaints(store.getComplaints());
  };

  const handleOpenAction = (c: Complaint) => {
    setActiveComplaint(c);
    setReplyText(c.adminReply || '');
    setAssignedEmp(c.assignedTo || employees[0]?.name || '');
    setTargetStatus(c.status === 'resolved' ? 'resolved' : 'in_progress');
  };

  const handleSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComplaint) return;

    store.updateComplaint(activeComplaint.id, {
      status: targetStatus,
      adminReply: replyText,
      assignedTo: assignedEmp,
    });

    setActiveComplaint(null);
    refresh();
  };

  const filtered = complaints.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">গ্রাহক অভিযোগ ও সাপোর্ট টিকিট (Customer Complaints)</h2>
        <p className="text-xs text-slate-500">
          অপটিক্যাল ফাইবার ড্রপ, ইন্টারনেটের গতি সমস্যা ও সাপোর্ট টিকিটের সমাধান এবং টেকনিশিয়ান অ্যাসাইনমেন্ট।
        </p>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="টিকিট নং (TKT-XXX), গ্রাহকের নাম, আইডি বা বিষয় খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto">
          {(['all', 'pending', 'in_progress', 'resolved'] as const).map((st) => (
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
                ? 'সকল টিকিট'
                : st === 'pending'
                ? 'অপেক্ষমাণ'
                : st === 'in_progress'
                ? 'প্রক্রিয়াধীন'
                : 'সমাধানকৃত'}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 p-8 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            কোন সাপোর্ট টিকিট পাওয়া যায়নি
          </div>
        ) : (
          filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                        #{c.id}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {c.createdAt}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                      {c.subject}
                    </h3>
                  </div>

                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      c.status === 'resolved'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200'
                        : c.status === 'in_progress'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 animate-pulse'
                    }`}
                  >
                    {c.status === 'resolved'
                      ? 'সমাধানকৃত'
                      : c.status === 'in_progress'
                      ? 'কাজ চলছে'
                      : 'অপেক্ষমাণ'}
                  </span>
                </div>

                <div className="mt-2.5 bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>গ্রাহক: <strong>{c.customerName}</strong> ({c.customerId})</span>
                    <span className="font-mono">{c.customerMobile}</span>
                  </div>
                  <p className="mt-1 leading-relaxed">{c.description}</p>
                </div>

                {/* Admin Reply if any */}
                {c.adminReply && (
                  <div className="mt-2.5 bg-blue-50/60 dark:bg-blue-950/40 p-2.5 rounded-xl border border-blue-200 dark:border-blue-900 text-xs">
                    <span className="font-bold text-blue-800 dark:text-blue-300 block mb-0.5">
                      অ্যাডমিন / সাপোর্ট ইঞ্জিনিয়ারের উত্তর:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300">{c.adminReply}</p>
                    {c.assignedTo && (
                      <span className="text-[10px] text-blue-600 block mt-1">
                        দায়িত্বপ্রাপ্ত: {c.assignedTo}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">
                  ক্যাটাগরি: {c.category}
                </span>

                <button
                  onClick={() => handleOpenAction(c)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>উত্তর ও সমাধান প্রদান</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Response Modal */}
      {activeComplaint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                অভিযোগের উত্তর ও স্ট্যাটাস আপডেট (#{activeComplaint.id})
              </h3>
              <button onClick={() => setActiveComplaint(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitResponse} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  স্ট্যাটাস নির্ধারণ করুন *
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-medium"
                >
                  <option value="in_progress">প্রক্রিয়াধীন (In Progress)</option>
                  <option value="resolved">সমাধান সম্পন্ন (Resolved)</option>
                  <option value="pending">অপেক্ষমাণ (Pending)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  দায়িত্বপ্রাপ্ত টেকনিশিয়ান / কর্মচারী
                </label>
                <select
                  value={assignedEmp}
                  onChange={(e) => setAssignedEmp(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-medium"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.name}>
                      {e.name} ({e.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  গ্রাহককে উত্তর বার্তা (Admin Reply Message) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="যেমন: আমাদের ফাইবার টিম আপনার এলাকার সংযোগ পরীক্ষা করছে..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveComplaint(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>উত্তর পাঠান ও আপডেট করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
