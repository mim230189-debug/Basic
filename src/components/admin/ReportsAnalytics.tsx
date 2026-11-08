import React, { useState } from 'react';
import { store } from '../../services/store';
import { jsPDF } from 'jspdf';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Calendar,
  Filter,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
} from 'lucide-react';

export const ReportsAnalytics: React.FC = () => {
  const customers = store.getCustomers();
  const invoices = store.getInvoices();
  const payments = store.getPayments();
  const expenses = store.getExpenses();
  const employees = store.getEmployees();
  const settings = store.getSettings();

  const [reportType, setReportType] = useState<
    'collection' | 'billing' | 'customers' | 'expenses' | 'profit_loss'
  >('collection');

  // Export CSV
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (reportType === 'collection') {
      csvContent += 'Receipt,Payment ID,Customer ID,Customer Name,Amount (BDT),Method,TrxID,Date,Collected By,Status\n';
      payments.forEach((p) => {
        csvContent += `"${p.receiptNumber}","${p.id}","${p.customerId}","${p.customerName}",${p.amount},"${p.method}","${p.transactionId}","${p.paymentDate}","${p.collectedBy}","${p.isReversed ? 'Reversed' : 'Paid'}"\n`;
      });
    } else if (reportType === 'billing') {
      csvContent += 'Invoice ID,Customer ID,Customer Name,Month,Package,Current Bill,Previous Due,Total Payable,Amount Paid,Remaining Balance,Status\n';
      invoices.forEach((i) => {
        csvContent += `"${i.id}","${i.customerId}","${i.customerName}","${i.billingMonth}","${i.packageName}",${i.currentBill},${i.previousDue},${i.totalPayable},${i.amountPaid},${i.remainingBalance},"${i.status}"\n`;
      });
    } else if (reportType === 'customers') {
      csvContent += 'Customer ID,Name,Mobile,Address,Package,Monthly Bill,Balance,Status,Connection Date\n';
      customers.forEach((c) => {
        csvContent += `"${c.id}","${c.name}","${c.mobile}","${c.address.replace(/"/g, '""')}","${c.packageName}",${c.monthlyBill},${c.balance},"${c.status}","${c.connectionDate}"\n`;
      });
    } else if (reportType === 'expenses') {
      csvContent += 'Voucher ID,Category,Amount (BDT),Date,Description,Recorded By\n';
      expenses.forEach((e) => {
        csvContent += `"${e.id}","${e.category}",${e.amount},"${e.date}","${e.description.replace(/"/g, '""')}","${e.recordedBy}"\n`;
      });
    } else {
      csvContent += 'Financial Metric,Value (BDT)\n';
      const totalCollected = payments.filter((p) => !p.isReversed).reduce((s, p) => s + p.amount, 0);
      const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
      const netProfit = totalCollected - totalExpenses;
      csvContent += `"Total Cash Collected",${totalCollected}\n`;
      csvContent += `"Total Expenses",${totalExpenses}\n`;
      csvContent += `"Net Cash Profit",${netProfit}\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Wink_Report_${reportType}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF Report
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, 210, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(settings.companyName || 'WINK NETWORK ISP', 14, 16);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Official Executive Management Report: ${reportType.toUpperCase()}`, 14, 24);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.text(`Generated on: 08-11-2026 | Currency: BDT (Bangladeshi Taka)`, 14, 40);

    let y = 52;
    if (reportType === 'collection') {
      doc.setFont('helvetica', 'bold');
      doc.text('PAYMENT COLLECTION SUMMARY', 14, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      payments.slice(0, 20).forEach((p) => {
        doc.text(`${p.paymentDate} | ${p.receiptNumber} | ${p.customerName} (${p.customerId}) | ${p.method} | BDT ${p.amount.toLocaleString()}`, 14, y);
        y += 6;
      });
    } else if (reportType === 'profit_loss') {
      const totalCollected = payments.filter((p) => !p.isReversed).reduce((s, p) => s + p.amount, 0);
      const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
      const netProfit = totalCollected - totalExpenses;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('PROFIT & LOSS STATEMENT (BDT)', 14, y);
      y += 12;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`1. Total Actual Cash Revenue Collected: BDT ${totalCollected.toLocaleString()}`, 14, y);
      y += 8;
      doc.text(`2. Total Operational Expenses (Bandwidth, Rent, Salary): BDT ${totalExpenses.toLocaleString()}`, 14, y);
      y += 10;
      doc.setFont('helvetica', 'bold');
      doc.text(`3. Net Cash Profit (Loss): BDT ${netProfit.toLocaleString()}`, 14, y);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.text(`Summary count: ${customers.length} Customers, ${invoices.length} Invoices`, 14, y);
    }

    doc.save(`Wink_Report_${reportType}.pdf`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">রিপোর্ট ও ব্যবসায়িক অ্যানালিটিক্স (Reports)</h2>
          <p className="text-xs text-slate-500">
            কালেকশন, বকেয়া বিল, গ্রাহক বৃদ্ধি এবং লাভ-ক্ষতি সংক্রান্ত প্রতিবেদন এক্সপোর্ট করুন।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>CSV এক্সপোর্ট</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>PDF রিপোর্ট ডাউনলোড</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
        {[
          { id: 'collection', label: 'পেমেন্ট কালেকশন রিপোর্ট' },
          { id: 'billing', label: 'মাসিক বিলিং ও বকেয়া রিপোর্ট' },
          { id: 'customers', label: 'গ্রাহক রিপোর্ট' },
          { id: 'expenses', label: 'খরচের খতিয়ান রিপোর্ট' },
          { id: 'profit_loss', label: 'লাভ-ক্ষতি বিবরণী (P&L)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id as any)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              reportType === tab.id
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Render Selected Report View */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        
        {reportType === 'profit_loss' && (
          <div className="space-y-6">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              লাভ ও ক্ষতি বিবরণী (Profit & Loss Statement)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200">
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">মোট ক্যাশ রাজস্ব</span>
                <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1 tabular-nums">
                  ৳{payments.filter((p) => !p.isReversed).reduce((s, p) => s + p.amount, 0).toLocaleString()}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200">
                <span className="text-xs font-semibold text-red-800 dark:text-red-300">মোট অপারেশনাল খরচ</span>
                <p className="text-2xl font-black text-red-700 dark:text-red-300 mt-1 tabular-nums">
                  ৳{expenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200">
                <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">প্রকৃত নিট লাভ</span>
                <p className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1 tabular-nums">
                  ৳{(payments.filter((p) => !p.isReversed).reduce((s, p) => s + p.amount, 0) - expenses.reduce((s, e) => s + e.amount, 0)).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-950/60 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">হিসাবের খাত</th>
                    <th className="py-2.5 px-4 text-right">টাকার পরিমাণ (BDT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="py-2 px-4 font-semibold text-emerald-700">১. ব্রডব্যান্ড বিল কালেকশন (Cash Inflow)</td>
                    <td className="py-2 px-4 text-right font-mono font-bold text-emerald-600">
                      +৳{payments.filter((p) => !p.isReversed).reduce((s, p) => s + p.amount, 0).toLocaleString()}
                    </td>
                  </tr>
                  {expenses.map((e) => (
                    <tr key={e.id}>
                      <td className="py-2 px-4 text-slate-600 dark:text-slate-400">ব্যয়: {e.description} ({e.category})</td>
                      <td className="py-2 px-4 text-right font-mono text-red-600">
                        -৳{e.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 dark:bg-slate-800/60 font-bold text-sm">
                    <td className="py-3 px-4">সর্বশেষ নিট উদ্বৃত্ত / লাভ (Net Cash Margin)</td>
                    <td className="py-3 px-4 text-right font-mono text-blue-600">
                      ৳{(payments.filter((p) => !p.isReversed).reduce((s, p) => s + p.amount, 0) - expenses.reduce((s, e) => s + e.amount, 0)).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'collection' && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              পেমেন্ট কালেকশন অডিট রিপোর্ট ({payments.length} টি ট্রানজেকশন)
            </h3>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-950 font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">রসিদ নং</th>
                    <th className="py-2 px-3">গ্রাহক</th>
                    <th className="py-2 px-3">মেথড</th>
                    <th className="py-2 px-3">পরিমাণ</th>
                    <th className="py-2 px-3">তারিখ</th>
                    <th className="py-2 px-3">কালেকশন অফিসার</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2 px-3 font-mono font-bold text-blue-600">{p.receiptNumber}</td>
                      <td className="py-2 px-3">{p.customerName} ({p.customerId})</td>
                      <td className="py-2 px-3 font-semibold">{p.method}</td>
                      <td className="py-2 px-3 font-mono font-bold text-emerald-600 tabular-nums">৳{p.amount.toLocaleString()}</td>
                      <td className="py-2 px-3 font-mono">{p.paymentDate}</td>
                      <td className="py-2 px-3">{p.collectedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'billing' && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              মাসিক বিলিং ও বকেয়া রিপোর্ট ({invoices.length} টি ইনভয়েস)
            </h3>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-950 font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">ইনভয়েস</th>
                    <th className="py-2 px-3">গ্রাহক</th>
                    <th className="py-2 px-3">বিলিং মাস</th>
                    <th className="py-2 px-3">মোট দাবি</th>
                    <th className="py-2 px-3">আদায়</th>
                    <th className="py-2 px-3">অবশিষ্ট বকেয়া</th>
                    <th className="py-2 px-3">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {invoices.map((i) => (
                    <tr key={i.id}>
                      <td className="py-2 px-3 font-mono font-bold text-blue-600">{i.id}</td>
                      <td className="py-2 px-3">{i.customerName}</td>
                      <td className="py-2 px-3">{i.billingMonth}</td>
                      <td className="py-2 px-3 font-mono tabular-nums">৳{i.totalPayable.toLocaleString()}</td>
                      <td className="py-2 px-3 font-mono text-emerald-600 tabular-nums">৳{i.amountPaid.toLocaleString()}</td>
                      <td className="py-2 px-3 font-mono font-bold text-red-600 tabular-nums">৳{i.remainingBalance.toLocaleString()}</td>
                      <td className="py-2 px-3 font-bold uppercase text-[10px]">{i.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'customers' && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              গ্রাহক তালিকা ও স্ট্যাটাস রিপোর্ট ({customers.length} জন)
            </h3>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-950 font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">আইডি</th>
                    <th className="py-2 px-3">নাম</th>
                    <th className="py-2 px-3">মোবাইল</th>
                    <th className="py-2 px-3">প্যাকেজ</th>
                    <th className="py-2 px-3">মাসিক বিল</th>
                    <th className="py-2 px-3">ব্যালেন্স</th>
                    <th className="py-2 px-3">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {customers.map((c) => (
                    <tr key={c.id}>
                      <td className="py-2 px-3 font-mono font-bold text-blue-600">{c.id}</td>
                      <td className="py-2 px-3">{c.name}</td>
                      <td className="py-2 px-3 font-mono">{c.mobile}</td>
                      <td className="py-2 px-3">{c.packageName}</td>
                      <td className="py-2 px-3 font-mono tabular-nums">৳{c.monthlyBill.toLocaleString()}</td>
                      <td className="py-2 px-3 font-mono tabular-nums">{c.balance < 0 ? `বকেয়া ৳${Math.abs(c.balance)}` : 'পরিশোধিত'}</td>
                      <td className="py-2 px-3 font-bold uppercase text-[10px]">{c.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'expenses' && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              খরচ বিবরণী রিপোর্ট ({expenses.length} টি রেকর্ড)
            </h3>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-950 font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">ভাউচার</th>
                    <th className="py-2 px-3">খাত</th>
                    <th className="py-2 px-3">পরিমাণ</th>
                    <th className="py-2 px-3">তারিখ</th>
                    <th className="py-2 px-3">বিবরণ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {expenses.map((e) => (
                    <tr key={e.id}>
                      <td className="py-2 px-3 font-mono font-bold text-slate-700">{e.id}</td>
                      <td className="py-2 px-3 font-semibold">{e.category}</td>
                      <td className="py-2 px-3 font-mono font-bold text-red-600 tabular-nums">৳{e.amount.toLocaleString()}</td>
                      <td className="py-2 px-3 font-mono">{e.date}</td>
                      <td className="py-2 px-3">{e.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
