import React, { useState } from 'react';
import { Package } from '../../types';
import { store } from '../../services/store';
import { Wifi, Plus, Edit2, Trash2, Check, Users, Sparkles, X } from 'lucide-react';

export const PackageManagement: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>(store.getPackages());
  const customers = store.getCustomers();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<Package | null>(null);

  const [name, setName] = useState('');
  const [speed, setSpeed] = useState('');
  const [price, setPrice] = useState<number>(700);
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [featuresInput, setFeaturesInput] = useState('24/7 Support, Buffer-Free Streaming, Real IP Speed');

  const refreshList = () => {
    setPackages(store.getPackages());
  };

  const handleOpenAdd = () => {
    setEditingPkg(null);
    setName('');
    setSpeed('25 Mbps');
    setPrice(800);
    setDescription('উচ্চগতির ফাইবার অপটিক ইন্টারনেট সংযোগ।');
    setActive(true);
    setFeaturesInput('24/7 Support, BDIX Ultra Speed, Unlimited Bandwidth');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg: Package) => {
    setEditingPkg(pkg);
    setName(pkg.name);
    setSpeed(pkg.speed);
    setPrice(pkg.price);
    setDescription(pkg.description);
    setActive(pkg.active);
    setFeaturesInput(pkg.features ? pkg.features.join(', ') : '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pkgId = editingPkg?.id || `PKG-${Date.now().toString().slice(-5)}`;
    const featList = featuresInput
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    store.savePackage({
      id: pkgId,
      name,
      speed,
      price: Number(price),
      description,
      active,
      features: featList,
    });

    setIsModalOpen(false);
    refreshList();
  };

  const handleDelete = (id: string) => {
    if (confirm('আপনি কি এই প্যাকেজটি মুছে ফেলতে চান?')) {
      store.deletePackage(id);
      refreshList();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">ইন্টারনেট প্যাকেজ ব্যবস্থাপনা (Packages)</h2>
          <p className="text-xs text-slate-500">
            ব্যান্ডউইথ গতি, মাসিক মূল্য এবং গ্রাহকদের জন্য নতুন স্পিড টিয়ার কনফিগার করুন।
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন প্যাকেজ তৈরি করুন</span>
        </button>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {packages.map((pkg) => {
          const subscriberCount = customers.filter((c) => c.packageId === pkg.id).length;
          return (
            <div
              key={pkg.id}
              className={`rounded-3xl p-5 border transition-all relative flex flex-col justify-between ${
                pkg.active
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md'
                  : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/80 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Wifi className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        pkg.active
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {pkg.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </span>
                    <button
                      onClick={() => handleOpenEdit(pkg)}
                      className="p-1 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                      title="প্যাকেজ সম্পাদনা"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                      title="মুছুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {pkg.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400 tabular-nums">
                      ৳{pkg.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400">/মাসিক</span>
                  </div>
                  <div className="mt-1 text-xs font-semibold text-orange-500">
                    গতি: {pkg.speed}
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {pkg.description}
                </p>

                {/* Features Checklist */}
                {pkg.features && pkg.features.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                    {pkg.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{subscriberCount} জন গ্রাহক</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{pkg.id}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Create/Edit Package */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingPkg ? 'প্যাকেজ সম্পাদনা' : 'নতুন ইন্টারনেট প্যাকেজ'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  প্যাকেজের নাম *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: গোল্ড প্রিমিয়াম (Gold Premium)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ব্যান্ডউইথ স্পিড *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: 30 Mbps"
                    value={speed}
                    onChange={(e) => setSpeed(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    মাসিক ফি (৳ BDT) *
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  সংক্ষিপ্ত বিবরণ (Description)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ব্যবহারকারীর সুবিধার বিবরণ..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ফিচারসমূহ (কমা দিয়ে পৃথক করুন)
                </label>
                <input
                  type="text"
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                  placeholder="যেমন: 24/7 Support, BDIX 100 Mbps, Low Ping"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    এই প্যাকেজটি সক্রিয় রাখুন
                  </span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 hover:bg-slate-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
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
