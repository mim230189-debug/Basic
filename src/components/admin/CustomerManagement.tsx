import React, { useState } from 'react';
import { Customer, Package } from '../../types';
import { store } from '../../services/store';
import {
  Search,
  Plus,
  UserCheck,
  UserX,
  Phone,
  MapPin,
  Calendar,
  Wifi,
  DollarSign,
  Edit2,
  Trash2,
  Eye,
  Key,
  X,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  FileText,
  CreditCard,
} from 'lucide-react';

interface CustomerManagementProps {
  onCollectPaymentForCustomer?: (customerId: string) => void;
}

export const CustomerManagement: React.FC<CustomerManagementProps> = ({
  onCollectPaymentForCustomer,
}) => {
  const [customers, setCustomers] = useState<Customer[]>(store.getCustomers());
  const packages = store.getPackages();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [zoneFilter, setZoneFilter] = useState('all');

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [deleteConfirmCust, setDeleteConfirmCust] = useState<Customer | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [altMobile, setAltMobile] = useState('');
  const [address, setAddress] = useState('');
  const [connectionDate, setConnectionDate] = useState('08-11-2026');
  const [selectedPkgId, setSelectedPkgId] = useState(packages[0]?.id || '');
  const [monthlyBill, setMonthlyBill] = useState(packages[0]?.price || 700);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [zone, setZone] = useState('বনানী জোন (Banani Zone)');
  const [portalEnabled, setPortalEnabled] = useState(true);

  const refreshList = () => {
    setCustomers(store.getCustomers());
  };

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setName('');
    setMobile('');
    setAltMobile('');
    setAddress('');
    setConnectionDate(new Date().toLocaleDateString('en-GB').replace(/\//g, '-'));
    const defaultPkg = packages[0];
    setSelectedPkgId(defaultPkg?.id || '');
    setMonthlyBill(defaultPkg?.price || 700);
    setUsername('');
    setEmail('');
    setNotes('');
    setZone('বনানী জোন (Banani Zone)');
    setPortalEnabled(true);
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setMobile(c.mobile);
    setAltMobile(c.altMobile || '');
    setAddress(c.address);
    setConnectionDate(c.connectionDate);
    setSelectedPkgId(c.packageId);
    setMonthlyBill(c.monthlyBill);
    setUsername(c.username);
    setEmail(c.email || '');
    setNotes(c.notes || '');
    setZone(c.zone || 'বনানী জোন (Banani Zone)');
    setPortalEnabled(c.portalEnabled);
    setIsAddEditOpen(true);
  };

  const handlePackageChangeInForm = (pkgId: string) => {
    setSelectedPkgId(pkgId);
    const pkg = packages.find((p) => p.id === pkgId);
    if (pkg) {
      setMonthlyBill(pkg.price);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pkg = packages.find((p) => p.id === selectedPkgId);
    const packageName = pkg ? `${pkg.name} (${pkg.speed})` : 'Standard Package';

    store.saveCustomer({
      id: editingCustomer?.id,
      name,
      mobile,
      altMobile,
      address,
      connectionDate,
      packageId: selectedPkgId,
      packageName,
      monthlyBill: Number(monthlyBill),
      status: editingCustomer?.status || 'active',
      username: username || mobile,
      email,
      notes,
      portalEnabled,
      zone,
    });

    setIsAddEditOpen(false);
    refreshList();
  };

  const handleToggleStatus = (c: Customer) => {
    const nextStatus = c.status === 'active' ? 'suspended' : 'active';
    store.updateCustomerStatus(c.id, nextStatus);
    refreshList();
    if (viewingCustomer?.id === c.id) {
      setViewingCustomer(store.getCustomer(c.id) || null);
    }
  };

  const handleDelete = (c: Customer) => {
    store.deleteCustomer(c.id);
    setDeleteConfirmCust(null);
    if (viewingCustomer?.id === c.id) setViewingCustomer(null);
    refreshList();
  };

  // Filter customers
  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mobile.includes(searchTerm) ||
      c.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesZone = zoneFilter === 'all' || c.zone === zoneFilter;

    return matchesSearch && matchesStatus && matchesZone;
  });

  return (
    <div className="space-y-5">
      
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">গ্রাহক ব্যবস্থাপনা (Customers)</h2>
          <p className="text-xs text-slate-500">
            আইএসপি ব্যবহারকারী যোগ, বিল ও প্যাকেজ পরিচালনা, এবং কাস্টমার সেলফ-সার্ভিস লগইন অ্যাকাউন্ট।
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন গ্রাহক নিবন্ধন</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          {/* Search box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="গ্রাহকের নাম, কাস্টমার আইডি (WNK-XXXX), মোবাইল বা ঠিকানা খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {(['all', 'active', 'suspended', 'inactive'] as const).map((st) => (
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
                  ? 'সকল গ্রাহক'
                  : st === 'active'
                  ? 'সক্রিয়'
                  : st === 'suspended'
                  ? 'স্থগিত'
                  : 'নিষ্ক্রিয়'}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">আইডি ও গ্রাহকের নাম</th>
                <th className="py-3 px-4">মোবাইল নম্বর</th>
                <th className="py-3 px-4">প্যাকেজ ও স্পিড</th>
                <th className="py-3 px-4">মাসিক বিল</th>
                <th className="py-3 px-4">বর্তমান ব্যালেন্স</th>
                <th className="py-3 px-4">স্ট্যাটাস</th>
                <th className="py-3 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    কোন গ্রাহক পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{c.name}</span>
                        {c.portalEnabled && (
                          <span title="সেলফ-সার্ভিস পোর্টাল সক্রিয়" className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <span>{c.id}</span>
                        <span>·</span>
                        <span className="truncate max-w-[140px]">{c.address}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono text-slate-800 dark:text-slate-200 font-medium">
                        {c.mobile}
                      </div>
                      {c.altMobile && (
                        <div className="font-mono text-[10px] text-slate-400">
                          {c.altMobile}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {c.packageName}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white tabular-nums">
                      ৳{c.monthlyBill.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 font-bold tabular-nums">
                      {c.balance < 0 ? (
                        <span className="text-red-600 dark:text-red-400">
                          বকেয়া: ৳{Math.abs(c.balance).toLocaleString()}
                        </span>
                      ) : c.balance > 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          অগ্রিম: ৳{c.balance.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-slate-500">পরিশোধিত (০)</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          c.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : c.status === 'suspended'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {c.status === 'active' ? 'সক্রিয়' : c.status === 'suspended' ? 'স্থগিত' : 'নিষ্ক্রিয়'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => setViewingCustomer(c)}
                        className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="প্রোফাইল ও বিস্তারিত দেখুন"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                        title="সম্পাদনা করুন"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(c)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          c.status === 'active'
                            ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50'
                            : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                        }`}
                        title={c.status === 'active' ? 'স্থগিত করুন' : 'পুনরায় সক্রিয় করুন'}
                      >
                        {c.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmCust(c)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                        title="মুছুন / আর্কাইভ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingCustomer ? 'গ্রাহকের তথ্য পরিবর্তন' : 'নতুন গ্রাহক নিবন্ধন (Add Customer)'}
              </h3>
              <button
                onClick={() => setIsAddEditOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    গ্রাহকের পুরো নাম *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    মোবাইল নম্বর (লগইন ইউজারনেম) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: 017XXXXXXXX"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    বিকল্প মোবাইল (Alternative Mobile)
                  </label>
                  <input
                    type="text"
                    placeholder="বিকল্প নম্বর"
                    value={altMobile}
                    onChange={(e) => setAltMobile(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ইমেইল ঠিকানা (ঐচ্ছিক)
                  </label>
                  <input
                    type="email"
                    placeholder="customer@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  সংযোগের পূর্ণাঙ্গ ঠিকানা *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="বাড়ি নং, রোড, ব্লক, থানা, জেলা"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ইন্টারনেট প্যাকেজ *
                  </label>
                  <select
                    value={selectedPkgId}
                    onChange={(e) => handlePackageChangeInForm(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-600"
                  >
                    {packages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.speed}) - ৳{p.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    মাসিক বিল (BDT) *
                  </label>
                  <input
                    type="number"
                    required
                    value={monthlyBill}
                    onChange={(e) => setMonthlyBill(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    সংযোগের তারিখ *
                  </label>
                  <input
                    type="text"
                    placeholder="DD-MM-YYYY"
                    value={connectionDate}
                    onChange={(e) => setConnectionDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  এলাকা / জোন (Zone)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: বনানী জোন, উত্তরা জোন, ধানমন্ডি"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  নোট / টেকনিক্যাল বিবরণ (Notes)
                </label>
                <input
                  type="text"
                  placeholder="পোন পোর্ট, বক্স নম্বর বা স্পেশাল ইন্সট্রাকশন"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={portalEnabled}
                    onChange={(e) => setPortalEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    গ্রাহক সেলফ-সার্ভিস মোবাইল পোর্টাল অ্যাক্সেস সক্রিয় করুন
                  </span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
                >
                  {editingCustomer ? 'আপডেট সংরক্ষণ করুন' : 'নিবন্ধন সম্পন্ন করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Profile View Modal / Drawer */}
      {viewingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl my-8 space-y-4">
            
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                    {viewingCustomer.id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      viewingCustomer.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {viewingCustomer.status === 'active' ? 'সক্রিয় সংযোগ' : 'স্থগিত সংযোগ'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {viewingCustomer.name}
                </h3>
              </div>
              <button
                onClick={() => setViewingCustomer(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl">
              <div>
                <span className="text-slate-400 block">মোবাইল নম্বর</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                  {viewingCustomer.mobile}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">ইন্টারনেট প্যাকেজ</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {viewingCustomer.packageName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">মাসিক রেগুলার বিল</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                  ৳{viewingCustomer.monthlyBill.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">বর্তমান ব্যালেন্স</span>
                <span className={`font-bold tabular-nums ${viewingCustomer.balance < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {viewingCustomer.balance < 0 ? `বকেয়া ৳${Math.abs(viewingCustomer.balance)}` : 'পরিশোধিত (০)'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">সংযোগ তারিখ</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {viewingCustomer.connectionDate}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">পোর্টাল ইউজারনেম</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                  {viewingCustomer.username || viewingCustomer.mobile}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-400 block">ঠিকানা:</span>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {viewingCustomer.address}
              </p>
            </div>

            {/* Customer's Billing History */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>বিলিং ও ইনভয়েস হিস্ট্রি:</span>
              </h4>
              <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                {store.getInvoicesByCustomer(viewingCustomer.id).length === 0 ? (
                  <p className="p-3 text-center text-slate-400">কোন ইনভয়েস রেকর্ড নেই</p>
                ) : (
                  store.getInvoicesByCustomer(viewingCustomer.id).map((inv) => (
                    <div key={inv.id} className="p-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {inv.billingMonth}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {inv.id} (মেয়াদ: {inv.dueDate})
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                          ৳{inv.totalPayable.toLocaleString()}
                        </span>
                        <span
                          className={`block text-[10px] font-bold ${
                            inv.status === 'paid' ? 'text-emerald-600' : 'text-red-600'
                          }`}
                        >
                          {inv.status === 'paid' ? 'পরিশোধিত' : `বকেয়া ৳${inv.remainingBalance}`}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions inside profile */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => handleToggleStatus(viewingCustomer)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border ${
                  viewingCustomer.status === 'active'
                    ? 'border-amber-300 text-amber-700 hover:bg-amber-50'
                    : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                {viewingCustomer.status === 'active' ? 'সংযোগ সাময়িক স্থগিত করুন' : 'সংযোগ সক্রিয় করুন'}
              </button>

              <button
                onClick={() => {
                  setViewingCustomer(null);
                  if (onCollectPaymentForCustomer) {
                    onCollectPaymentForCustomer(viewingCustomer.id);
                  }
                }}
                className="px-4 py-1.5 text-xs font-bold rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-sm flex items-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>পেমেন্ট সংগ্রহ করুন</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmCust && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                গ্রাহক আর্কাইভ ও অপসারণ নিশ্চিতকরণ
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                আপনি কি নিশ্চিত যে <strong>{deleteConfirmCust.name} ({deleteConfirmCust.id})</strong>-কে সক্রিয় তালিকা থেকে অপসারণ করতে চান?
                হিসাবরক্ষণের সুবিধার জন্য পূর্বের ইনভয়েস ও পেমেন্ট রেকর্ড ডাটাবেজে সংরক্ষিত থাকবে।
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmCust(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                বাতিল
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmCust)}
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20"
              >
                অপসারণ নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
