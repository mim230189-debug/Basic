import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { store } from '../../services/store';
import { Customer, Invoice, Payment, PaymentRequest, Complaint } from '../../types';
import {
  Home,
  FileText,
  CreditCard,
  History,
  User,
  Wifi,
  Phone,
  MessageCircle,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Send,
  Upload,
  Calendar,
  Smartphone,
  ShieldCheck,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
  Plus,
} from 'lucide-react';
import { generateInvoicePDF, generatePaymentReceiptPDF } from '../../services/pdfGenerator';

type CustomerNavTab = 'home' | 'bills' | 'payment' | 'history' | 'profile';

export const CustomerPortal: React.FC = () => {
  const { currentUser } = useAuth();
  const settings = store.getSettings();
  const packages = store.getPackages();

  const [activeTab, setActiveTab] = useState<CustomerNavTab>('home');
  const [phoneFrameView, setPhoneFrameView] = useState(false);

  // Active customer data lookup
  const customerId = currentUser?.customerId || 'WNK-1001';
  const customer = store.getCustomer(customerId) || store.getCustomers()[0];
  const invoices = store.getInvoicesByCustomer(customer.id);
  const payments = store.getPayments().filter((p) => p.customerId === customer.id);
  const paymentRequests = store.getPaymentRequests().filter((r) => r.customerId === customer.id);
  const complaints = store.getComplaints().filter((c) => c.customerId === customer.id);

  // Selected invoice for detail modal
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  // Payment Form States
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(invoices[0]?.id || '');
  const [payAmount, setPayAmount] = useState<number>(customer.balance < 0 ? Math.abs(customer.balance) : customer.monthlyBill);
  const [payMethod, setPayMethod] = useState<'bKash' | 'Nagad' | 'Rocket' | 'Bank Transfer'>('bKash');
  const [trxId, setTrxId] = useState('');
  const [paymentDate, setPaymentDate] = useState('08-11-2026');
  const [requestSuccessMsg, setRequestSuccessMsg] = useState('');

  // Complaint Form State
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintCategory, setComplaintCategory] = useState<Complaint['category']>('Slow Internet');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [complaintSuccess, setComplaintSuccess] = useState('');

  // Package Upgrade Request Modal
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [targetUpgradePkg, setTargetUpgradePkg] = useState(packages[2]?.id || '');
  const [upgradeSuccess, setUpgradeSuccess] = useState('');

  // Compute metrics for customer home dashboard
  const currentInvoice = invoices.find((i) => i.billingMonthKey === '2026-11') || invoices[0];
  const totalPaid = payments.filter((p) => !p.isReversed).reduce((s, p) => s + p.amount, 0);
  const lastPayment = payments[0];
  const hasDue = customer.balance < 0;
  const outstandingDue = Math.abs(customer.balance);

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxId.trim() || payAmount <= 0) {
      alert('অনুগ্রহ করে সঠিক ট্রানজেকশন আইডি এবং টাকার পরিমাণ প্রদান করুন।');
      return;
    }

    store.submitPaymentRequest({
      customerId: customer.id,
      customerName: customer.name,
      customerMobile: customer.mobile,
      invoiceId: selectedInvoiceId || (currentInvoice ? currentInvoice.id : 'N/A'),
      amount: Number(payAmount),
      method: payMethod,
      transactionId: trxId.trim().toUpperCase(),
      paymentDate,
    });

    setRequestSuccessMsg('আপনার পেমেন্ট রিকোয়েস্ট সফলভাবে জমা হয়েছে! অ্যাডমিন ভেরিফাই করার সাথে সাথে বিল পরিশোধিত চিহ্নিত হবে।');
    setTrxId('');
    setTimeout(() => setRequestSuccessMsg(''), 5000);
  };

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintSubject.trim() || !complaintDesc.trim()) return;

    store.createComplaint({
      customerId: customer.id,
      customerName: customer.name,
      customerMobile: customer.mobile,
      subject: complaintSubject,
      category: complaintCategory,
      description: complaintDesc,
      priority: 'medium',
    });

    setComplaintSuccess('আপনার অভিযোগ সফলভাবে গ্রহণ করা হয়েছে। আমাদের টেকনিক্যাল টিম দ্রুত যোগাযোগ করবে।');
    setComplaintSubject('');
    setComplaintDesc('');
    setTimeout(() => {
      setComplaintSuccess('');
      setShowComplaintModal(false);
    }, 2500);
  };

  const handleUpgradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pkg = packages.find((p) => p.id === targetUpgradePkg);
    store.createComplaint({
      customerId: customer.id,
      customerName: customer.name,
      customerMobile: customer.mobile,
      subject: `প্যাকেজ পরিবর্তনের আবেদন: ${pkg?.name} (${pkg?.speed})`,
      category: 'Package Upgrade',
      description: `গ্রাহক বর্তমান প্যাকেজ পরিবর্তন করে ${pkg?.name} (${pkg?.speed}) - ৳${pkg?.price}/মাস প্যাকেজে আপগ্রেড করতে আগ্রহী।`,
      priority: 'low',
    });

    setUpgradeSuccess('আপনার প্যাকেজ পরিবর্তনের অনুরোধ সফলভাবে পাঠানো হয়েছে।');
    setTimeout(() => {
      setUpgradeSuccess('');
      setShowUpgradeModal(false);
    }, 2500);
  };

  // Content for the active tab
  const renderContent = () => {
    switch (activeTab) {
      
      // 1. HOME (হোম)
      case 'home':
        return (
          <div className="space-y-4">
            
            {/* Customer Welcome Header */}
            <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-5 text-white shadow-lg shadow-blue-700/20">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-blue-200">আসসালামু আলাইকুম,</span>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                    {customer.name}
                  </h2>
                  <p className="text-[11px] text-blue-200/80 font-mono mt-0.5">
                    আইডি: {customer.id} · {customer.mobile}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Wifi className="w-6 h-6 text-orange-400 stroke-[2.5]" />
                </div>
              </div>

              {/* Live Connection Ribbon */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-semibold text-emerald-300">ইন্টারনেট সংযোগ সক্রিয়</span>
                </div>
                <span className="font-mono text-orange-300 font-bold">{customer.packageName}</span>
              </div>
            </div>

            {/* Outstanding Balance Banner / Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  বর্তমান বকেয়া বিল (Outstanding Balance)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  নভেম্বর ২০২৬
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className={`text-3xl font-black tabular-nums font-mono ${hasDue ? 'text-red-600 dark:text-red-400' : 'text-emerald-600'}`}>
                    ৳{hasDue ? outstandingDue.toLocaleString() : '০'}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    পরিশোধের শেষ সময়: {currentInvoice ? currentInvoice.dueDate : '১০-১১-২০২৬'}
                  </p>
                </div>

                {hasDue ? (
                  <button
                    onClick={() => setActiveTab('payment')}
                    className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>বিল পরিশোধ করুন</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>সকল বিল পরিশোধিত</span>
                  </div>
                )}
              </div>
            </div>

            {/* 3 Quick Cards: Package Speed, Paid Till Date, Last Payment */}
            <div className="grid grid-cols-2 gap-3">
              
              <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[11px] text-slate-400 font-medium block">আমার প্যাকেজ ফি</span>
                <span className="text-lg font-black text-slate-900 dark:text-white tabular-nums font-mono mt-0.5 block">
                  ৳{customer.monthlyBill.toLocaleString()}/মাস
                </span>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-0.5 mt-1"
                >
                  <span>স্পিড আপগ্রেড</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[11px] text-slate-400 font-medium block">সর্বশেষ পরিশোধ</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums font-mono mt-0.5 block">
                  {lastPayment ? `৳${lastPayment.amount.toLocaleString()}` : '৳০'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                  {lastPayment ? `${lastPayment.paymentDate} (${lastPayment.method})` : 'কোন রেকর্ড নেই'}
                </span>
              </div>

            </div>

            {/* Quick Action Buttons */}
            <div className="bg-slate-100 dark:bg-slate-800/60 p-3.5 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-500" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">২৪/৭ কাস্টমার সাপোর্ট</span>
                  <span className="text-[10px] text-slate-400">{settings.supportNumber}</span>
                </div>
              </div>
              <a
                href={`tel:${settings.supportNumber}`}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs"
              >
                কল করুন
              </a>
            </div>

            {/* Current Month Bill Preview */}
            {currentInvoice && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">চলতি মাসের ইনভয়েস</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      currentInvoice.status === 'paid'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {currentInvoice.status === 'paid' ? 'পরিশোধিত' : 'বকেয়া'}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{currentInvoice.billingMonth}</span>
                    <span className="block text-[10px] text-slate-400 font-mono">{currentInvoice.id}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-slate-900 dark:text-white font-mono tabular-nums">
                      ৳{currentInvoice.totalPayable.toLocaleString()}
                    </span>
                    <button
                      onClick={() => generateInvoicePDF(currentInvoice, settings)}
                      className="block text-[10px] text-blue-600 font-bold hover:underline mt-0.5"
                    >
                      PDF ডাউনলোড
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        );

      // 2. MY BILLS (আমার বিল)
      case 'bills':
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">আমার মাসিক বিলসমূহ (My Monthly Bills)</h2>
              <p className="text-xs text-slate-500">আপনার সকল ইন্টারনেট বিলের বিস্তারিত ও স্ট্যাটাস।</p>
            </div>

            <div className="space-y-3">
              {invoices.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200">
                  কোন বিলের তথ্য পাওয়া যায়নি
                </div>
              ) : (
                invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-slate-900 dark:text-white block">
                          {inv.billingMonth}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">{inv.id}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          inv.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200'
                            : inv.status === 'partially_paid'
                            ? 'bg-orange-50 text-orange-700'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {inv.status === 'paid' ? 'PAID' : inv.status === 'partially_paid' ? 'PARTIAL' : 'UNPAID'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl text-[11px]">
                      <div>
                        <span className="text-slate-400 block">মাসিক ফি</span>
                        <span className="font-bold font-mono">৳{inv.currentBill}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">পূর্বের বকেয়া</span>
                        <span className="font-bold font-mono text-red-500">৳{inv.previousDue}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">মোট প্রদেয়</span>
                        <span className="font-bold font-mono text-blue-600">৳{inv.totalPayable}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500 font-mono">
                        মেয়াদ: {inv.dueDate}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewInvoice(inv)}
                          className="text-xs text-slate-600 dark:text-slate-300 font-semibold hover:underline"
                        >
                          বিস্তারিত
                        </button>
                        <button
                          onClick={() => generateInvoicePDF(inv, settings)}
                          className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF বিল</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      // 3. PAYMENT (পেমেন্ট)
      case 'payment':
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">অনলাইন পেমেন্ট সাবমিশন (Pay Bill)</h2>
              <p className="text-xs text-slate-500">বিকাশ, নগদ, রকেট বা ব্যাংকে টাকা পাঠিয়ে তথ্য সাবমিট করুন।</p>
            </div>

            {/* Merchant Payment Instruction Cards */}
            <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-3xl p-4.5 space-y-3">
              <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider block">
                অফিসিয়াল পেমেন্ট মার্চেন্ট নম্বর
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
                  <span className="font-bold text-pink-400">bKash Merchant:</span>
                  <span className="font-mono font-bold">{settings.bkashMerchant}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
                  <span className="font-bold text-orange-400">Nagad Merchant:</span>
                  <span className="font-mono font-bold">{settings.nagadMerchant}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
                  <span className="font-bold text-purple-400">Rocket:</span>
                  <span className="font-mono font-bold">{settings.rocketMerchant}</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                * বিকাশ/নগদ অ্যাপে গিয়ে <strong>Payment</strong> অপশন সিলেক্ট করে মার্চেন্ট নম্বরে পরিশোধ করুন। এরপর প্রাপ্ত Transaction ID নিচে লিখে সাবমিট করুন।
              </p>
            </div>

            {/* Payment Submission Form */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-xs text-slate-900 dark:text-white mb-3">
                পেমেন্ট তথ্য ফরম (Payment Submission Form)
              </h3>

              {requestSuccessMsg && (
                <div className="mb-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p>{requestSuccessMsg}</p>
                </div>
              )}

              <form onSubmit={handlePaymentSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    পেমেন্ট মেথড নির্বাচন করুন *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['bKash', 'Nagad', 'Rocket'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPayMethod(m)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                          payMethod === m
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      পরিশোধকৃত টাকা (BDT) *
                    </label>
                    <input
                      type="number"
                      required
                      value={payAmount}
                      onChange={(e) => setPayAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono font-bold"
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
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ট্রানজেকশন আইডি (Transaction ID / TrxID) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: BK9A772LK1 বা 98452109"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono uppercase font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    পেমেন্ট স্ক্রিনশট / প্রমাণপত্র (ঐচ্ছিক)
                  </label>
                  <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                    <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                    <span className="text-[11px] text-slate-500 block">গ্যালারি থেকে স্ক্রিনশট সিলেক্ট করুন</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>পেমেন্ট রিকোয়েস্ট পাঠান (Submit)</span>
                </button>
              </form>
            </div>

            {/* Pending Requests Status Tracker */}
            {paymentRequests.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  আপনার পাঠানো পেমেন্ট রিকোয়েস্ট ট্র্যাকিং:
                </h4>
                {paymentRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {req.method} - ৳{req.amount}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-mono">
                        TrxID: {req.transactionId} ({req.submittedAt})
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        req.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800 animate-pulse'
                      }`}
                    >
                      {req.status === 'approved' ? 'অনুমোদিত' : req.status === 'rejected' ? 'বাতিল' : 'যাচাই চলছে'}
                    </span>
                  </div>
                ))}
              </div>
            )}

          </div>
        );

      // 4. BILLING HISTORY (বিলের ইতিহাস)
      case 'history':
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">পরিশোধ ও রসিদের ইতিহাস (Payment History)</h2>
              <p className="text-xs text-slate-500">আপনার পরিশোধিত সকল বিল ও মানি রসিদ ডাউনলোড করুন।</p>
            </div>

            <div className="space-y-3">
              {payments.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200">
                  কোন পূর্ববর্তী পেমেন্ট রেকর্ড নেই
                </div>
              ) : (
                payments.map((p) => {
                  const inv = invoices.find((i) => i.id === p.invoiceId);
                  return (
                    <div
                      key={p.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            ৳{p.amount.toLocaleString()}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-emerald-50 text-emerald-700">
                            সফল
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {p.paymentDate} · {p.method} (TrxID: {p.transactionId})
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          রসিদ নং: {p.receiptNumber}
                        </span>
                      </div>

                      <button
                        onClick={() => generatePaymentReceiptPDF(p, inv, settings)}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-xs border border-blue-200 dark:border-blue-900 flex items-center gap-1 shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>রসিদ</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );

      // 5. PROFILE & SUPPORT (প্রোফাইল)
      case 'profile':
        return (
          <div className="space-y-4">
            
            {/* Customer Details Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center">
                  {customer.name.slice(0, 1)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {customer.name}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    কাস্টমার আইডি: {customer.id}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-2xl text-xs">
                <div>
                  <span className="text-slate-400 block">মোবাইল</span>
                  <span className="font-mono font-bold">{customer.mobile}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">সংযোগ তারিখ</span>
                  <span className="font-bold">{customer.connectionDate}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block">ঠিকানা</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{customer.address}</span>
                </div>
              </div>
            </div>

            {/* Package Details */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">বর্তমান ইন্টারনেট প্যাকেজ</span>
                <span className="text-xs font-bold text-blue-600 font-mono">৳{customer.monthlyBill}/মাস</span>
              </div>
              <p className="text-sm font-black text-slate-800 dark:text-slate-200">{customer.packageName}</p>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="w-full py-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold text-xs hover:bg-blue-100 transition-colors"
              >
                প্যাকেজ পরিবর্তন বা স্পিড আপগ্রেড আবেদন
              </button>
            </div>

            {/* Customer Support Hub */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                হেল্পলাইন ও কাস্টমার সাপোর্ট
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${settings.supportNumber}`}
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>হটলাইন কল</span>
                </a>
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>হোয়াটসঅ্যাপ</span>
                </a>
              </div>

              <button
                onClick={() => setShowComplaintModal(true)}
                className="w-full py-2.5 rounded-xl border border-orange-300 dark:border-orange-800 text-orange-600 dark:text-orange-400 font-bold text-xs hover:bg-orange-50 dark:hover:bg-orange-950/40 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন অভিযোগ বা টিকিট দায়ের করুন</span>
              </button>
            </div>

            {/* Complaint History */}
            {complaints.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  আমার পূর্ববর্তী অভিযোগসমূহ:
                </span>
                {complaints.map((c) => (
                  <div key={c.id} className="p-2.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{c.subject}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${c.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {c.status === 'resolved' ? 'সমাধানকৃত' : 'প্রক্রিয়াধীন'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{c.description}</p>
                    {c.adminReply && (
                      <p className="text-[11px] text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/40 p-1.5 rounded-lg mt-1">
                        উত্তর: {c.adminReply}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-24">
      
      {/* Top Mobile Viewport Toggle Bar */}
      <div className="flex items-center justify-between px-3 py-2 mb-2 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-900/60 text-xs">
        <div className="flex items-center gap-1.5 text-blue-900 dark:text-blue-300 font-semibold">
          <Smartphone className="w-4 h-4 text-orange-500" />
          <span>গ্রাহক সেলফ-সার্ভিস মোবাইল পোর্টাল</span>
        </div>
        <button
          onClick={() => setPhoneFrameView(!phoneFrameView)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800 text-[11px] hover:shadow-sm"
        >
          {phoneFrameView ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          <span>{phoneFrameView ? 'ফুল স্ক্রিন ভিউ' : 'স্মার্টফোন ফ্রেম ভিউ'}</span>
        </button>
      </div>

      {/* Main Container - either standard responsive or wrapped in phone frame */}
      <div
        className={`transition-all duration-300 ${
          phoneFrameView
            ? 'max-w-[420px] mx-auto bg-slate-50 dark:bg-slate-950 rounded-[40px] p-4 border-[10px] border-slate-800 shadow-2xl relative min-h-[740px]'
            : 'w-full'
        }`}
      >
        {phoneFrameView && (
          <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-4" />
        )}

        {/* Tab Content */}
        {renderContent()}

        {/* Bottom Fixed Navigation Bar (5 Sections in Bengali) */}
        <nav
          className={`fixed bottom-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 ${
            phoneFrameView
              ? 'absolute bottom-2 left-2 right-2 rounded-3xl shadow-xl'
              : 'left-0 right-0'
          }`}
        >
          <div className="max-w-md mx-auto grid grid-cols-5 h-16 items-center px-1">
            
            {/* 1. হোম */}
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center justify-center py-1 transition-all ${
                activeTab === 'home'
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Home className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[11px] mt-0.5">হোম</span>
            </button>

            {/* 2. আমার বিল */}
            <button
              onClick={() => setActiveTab('bills')}
              className={`flex flex-col items-center justify-center py-1 transition-all ${
                activeTab === 'bills'
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <FileText className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[11px] mt-0.5">আমার বিল</span>
            </button>

            {/* 3. পেমেন্ট (Center Highlighted) */}
            <button
              onClick={() => setActiveTab('payment')}
              className="flex flex-col items-center justify-center -mt-4 group"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 ${
                  activeTab === 'payment'
                    ? 'bg-orange-500 shadow-orange-500/40 ring-4 ring-orange-200 dark:ring-orange-950'
                    : 'bg-blue-600 shadow-blue-600/30'
                }`}
              >
                <CreditCard className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span
                className={`text-[10px] mt-1 font-bold ${
                  activeTab === 'payment' ? 'text-orange-500' : 'text-slate-400'
                }`}
              >
                পেমেন্ট
              </span>
            </button>

            {/* 4. বিলের ইতিহাস */}
            <button
              onClick={() => setActiveTab('history')}
              className={`flex flex-col items-center justify-center py-1 transition-all ${
                activeTab === 'history'
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <History className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[11px] mt-0.5">ইতিহাস</span>
            </button>

            {/* 5. প্রোফাইল */}
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center justify-center py-1 transition-all ${
                activeTab === 'profile'
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <User className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[11px] mt-0.5">প্রোফাইল</span>
            </button>

          </div>
        </nav>
      </div>

      {/* Invoice Detail Modal */}
      {viewInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-xs text-slate-900 dark:text-white">{viewInvoice.billingMonth}</span>
              <button onClick={() => setViewInvoice(null)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">ইনভয়েস আইডি:</span>
                <span className="font-mono">{viewInvoice.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">প্যাকেজ ফি:</span>
                <span className="font-mono">৳{viewInvoice.currentBill}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">পূর্বের বকেয়া:</span>
                <span className="font-mono text-red-500">৳{viewInvoice.previousDue}</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-100">
                <span>মোট প্রদেয়:</span>
                <span className="font-mono text-blue-600">৳{viewInvoice.totalPayable}</span>
              </div>
            </div>
            <button
              onClick={() => generateInvoicePDF(viewInvoice, settings)}
              className="w-full py-2 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF ইনভয়েস ডাউনলোড করুন</span>
            </button>
          </div>
        </div>
      )}

      {/* Complaint Submit Modal */}
      {showComplaintModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">নতুন অভিযোগ বা টিকিট</h3>
              <button onClick={() => setShowComplaintModal(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {complaintSuccess ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs">{complaintSuccess}</div>
            ) : (
              <form onSubmit={handleComplaintSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">সমস্যার ধরন *</label>
                  <select
                    value={complaintCategory}
                    onChange={(e) => setComplaintCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                  >
                    <option value="Slow Internet">ধীরগতির ইন্টারনেট (Slow Internet)</option>
                    <option value="No Internet">ইন্টারনেট সংযোগ সম্পূর্ণ বিচ্ছিন্ন (No Internet)</option>
                    <option value="Optical Fiber Cut">অপটিক্যাল ফাইবার ড্রপ বা লাল বাতি</option>
                    <option value="Router Issue">রাউটার কনফিগারেশন সমস্যা</option>
                    <option value="Billing Inquiry">বিল সংক্রান্ত জিজ্ঞাসা</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">শিরোনাম *</label>
                  <input
                    type="text"
                    required
                    placeholder="সংক্ষেপে সমস্যার বিষয় লিখুন"
                    value={complaintSubject}
                    onChange={(e) => setComplaintSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">বিস্তারিত বিবরণ *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="কখন থেকে সমস্যা হচ্ছে এবং বিস্তারিত..."
                    value={complaintDesc}
                    onChange={(e) => setComplaintDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
                >
                  অভিযোগ সাবমিট করুন
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Package Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">প্যাকেজ পরিবর্তনের আবেদন</h3>
              <button onClick={() => setShowUpgradeModal(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {upgradeSuccess ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs">{upgradeSuccess}</div>
            ) : (
              <form onSubmit={handleUpgradeSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">কাঙ্ক্ষিত প্যাকেজ নির্বাচন করুন *</label>
                  <select
                    value={targetUpgradePkg}
                    onChange={(e) => setTargetUpgradePkg(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-medium"
                  >
                    {packages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.speed}) - ৳{p.price}/মাস
                      </option>
                    ))}
                  </select>
                </div>

                <p className="text-[11px] text-slate-500">
                  অনুরোধ প্রেরণের পর আমাদের টেকনিক্যাল টিম লাইন অপটিমাইজ করে প্যাকেজ স্থানান্তর নিশ্চিত করবে।
                </p>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs"
                >
                  আবেদন পাঠান
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
