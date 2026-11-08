import React, { useState } from 'react';
import { Employee } from '../../types';
import { store } from '../../services/store';
import {
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Shield,
  CheckCircle2,
  DollarSign,
  X,
} from 'lucide-react';

export const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(store.getEmployees());
  const payments = store.getPayments();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [designation, setDesignation] = useState('বিলিং অফিসার (Billing Officer)');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  // Permissions
  const [canAddCustomer, setCanAddCustomer] = useState(true);
  const [canCollectPayment, setCanCollectPayment] = useState(true);
  const [canGenerateInvoice, setCanGenerateInvoice] = useState(false);
  const [canResolveComplaints, setCanResolveComplaints] = useState(true);
  const [canViewReports, setCanViewReports] = useState(false);

  const refresh = () => {
    setEmployees(store.getEmployees());
  };

  const handleOpenAdd = () => {
    setEditingEmp(null);
    setName('');
    setMobile('');
    setEmail('');
    setDesignation('বিলিং ও ফিল্ড কালেকশন অফিসার');
    setStatus('active');
    setCanAddCustomer(true);
    setCanCollectPayment(true);
    setCanGenerateInvoice(false);
    setCanResolveComplaints(true);
    setCanViewReports(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setName(emp.name);
    setMobile(emp.mobile);
    setEmail(emp.email);
    setDesignation(emp.designation);
    setStatus(emp.status);
    setCanAddCustomer(emp.permissions.canAddCustomer);
    setCanCollectPayment(emp.permissions.canCollectPayment);
    setCanGenerateInvoice(emp.permissions.canGenerateInvoice);
    setCanResolveComplaints(emp.permissions.canResolveComplaints);
    setCanViewReports(emp.permissions.canViewReports);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingEmp?.id || `EMP-0${employees.length + 1}`;

    store.saveEmployee({
      id,
      name,
      mobile,
      email,
      designation,
      joinedDate: editingEmp?.joinedDate || new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      status,
      permissions: {
        canAddCustomer,
        canCollectPayment,
        canGenerateInvoice,
        canResolveComplaints,
        canViewReports,
      },
      totalCollected: editingEmp?.totalCollected || 0,
    });

    setIsModalOpen(false);
    refresh();
  };

  const handleDelete = (id: string) => {
    if (confirm('আপনি কি এই কর্মচারীর অ্যাকাউন্ট অপসারণ করতে চান?')) {
      store.deleteEmployee(id);
      refresh();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">কর্মচারী ব্যবস্থাপনা (Employee Management)</h2>
          <p className="text-xs text-slate-500">
            বিলিং অফিসার, টেকনিশিয়ান ও সাপোর্ট স্টাফদের দায়িত্ব এবং অনুমতি (RBAC) নির্ধারণ।
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন কর্মচারী যোগ করুন</span>
        </button>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {employees.map((emp) => {
          const empPayments = payments.filter((p) => !p.isReversed && p.collectedBy.includes(emp.name));
          const totalCollectedCalculated = empPayments.reduce((s, p) => s + p.amount, 0) || emp.totalCollected;

          return (
            <div
              key={emp.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 font-bold text-base flex items-center justify-center">
                      {emp.name.slice(0, 1)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {emp.name}
                      </h3>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        {emp.designation}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(emp)}
                      className="p-1 rounded text-slate-400 hover:text-blue-600"
                      title="সম্পাদনা"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(emp.id)}
                      className="p-1 rounded text-slate-400 hover:text-red-600"
                      title="মুছুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Contact info */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-2xl">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{emp.mobile}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">যোগদান: </span>
                    <span className="font-mono">{emp.joinedDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">স্ট্যাটাস: </span>
                    <span className="font-bold text-emerald-600">{emp.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</span>
                  </div>
                </div>

                {/* Permissions Badges */}
                <div className="mt-3">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                    অনুমোদিত ক্ষমতা (Assigned Permissions):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {emp.permissions.canCollectPayment && (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold border border-emerald-200">
                        বিল কালেকশন
                      </span>
                    )}
                    {emp.permissions.canAddCustomer && (
                      <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-semibold border border-blue-200">
                        গ্রাহক নিবন্ধন
                      </span>
                    )}
                    {emp.permissions.canResolveComplaints && (
                      <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-semibold border border-amber-200">
                        অভিযোগ সমাধান
                      </span>
                    )}
                    {emp.permissions.canGenerateInvoice && (
                      <span className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-semibold border border-purple-200">
                        ইনভয়েস জেনারেট
                      </span>
                    )}
                    {emp.permissions.canViewReports && (
                      <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold border border-indigo-200">
                        রিপোর্ট ভিউ
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Total collected metric */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500">মোট সংগৃহীত পেমেন্ট:</span>
                <span className="font-black font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                  ৳{totalCollectedCalculated.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingEmp ? 'কর্মচারীর তথ্য পরিবর্তন' : 'নতুন কর্মচারী নিবন্ধন (Add Employee)'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    পদবি (Designation) *
                  </label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    মোবাইল নম্বর *
                  </label>
                  <input
                    type="text"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ইমেইল (লগইনের জন্য) *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>
              </div>

              {/* Permissions Checkboxes */}
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white block mb-2">
                  অনুমতিসমূহ (RBAC Permissions):
                </span>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={canCollectPayment}
                      onChange={(e) => setCanCollectPayment(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>পেমেন্ট সংগ্রহ ও রসিদ তৈরি করতে পারবেন</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={canAddCustomer}
                      onChange={(e) => setCanAddCustomer(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>নতুন গ্রাহক নিবন্ধন ও সম্পাদনা করতে পারবেন</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={canResolveComplaints}
                      onChange={(e) => setCanResolveComplaints(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>গ্রাহক অভিযোগ দেখতে ও সমাধান দিতে পারবেন</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={canGenerateInvoice}
                      onChange={(e) => setCanGenerateInvoice(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>মাসিক বিল জেনারেট করতে পারবেন</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={canViewReports}
                      onChange={(e) => setCanViewReports(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>আর্থিক রিপোর্ট ও বিশ্লেষণ দেখতে পারবেন</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
