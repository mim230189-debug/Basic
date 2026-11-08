import React from 'react';
import {
  LayoutDashboard,
  Users,
  Wifi,
  CalendarCheck2,
  CreditCard,
  Inbox,
  FileText,
  DollarSign,
  UserCheck,
  MessageSquareWarning,
  BarChart3,
  Settings,
  X,
} from 'lucide-react';
import { store } from '../../services/store';

export type AdminTab =
  | 'dashboard'
  | 'customers'
  | 'packages'
  | 'billing'
  | 'payments'
  | 'requests'
  | 'invoices'
  | 'accounts'
  | 'employees'
  | 'complaints'
  | 'reports'
  | 'settings';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const paymentRequests = store.getPaymentRequests();
  const pendingRequests = paymentRequests.filter((r) => r.status === 'pending').length;

  const complaints = store.getComplaints();
  const pendingComplaints = complaints.filter((c) => c.status === 'pending' || c.status === 'in_progress').length;

  const navItems: { id: AdminTab; label: string; subLabel: string; icon: any; badge?: number }[] = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড', subLabel: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'customers', label: 'গ্রাহক ব্যবস্থাপনা', subLabel: 'Customers & CRM', icon: Users },
    { id: 'packages', label: 'ইন্টারনেট প্যাকেজ', subLabel: 'Speed & Pricing', icon: Wifi },
    { id: 'billing', label: 'মাসিক বিলিং ইঞ্জিন', subLabel: 'Auto Billing Engine', icon: CalendarCheck2 },
    { id: 'payments', label: 'পেমেন্ট কালেকশন', subLabel: 'Cash & Gateway', icon: CreditCard },
    {
      id: 'requests',
      label: 'পেমেন্ট রিকোয়েস্ট',
      subLabel: 'Customer Slips',
      icon: Inbox,
      badge: pendingRequests,
    },
    { id: 'invoices', label: 'ইনভয়েস তালিকা', subLabel: 'Bills & PDF Invoices', icon: FileText },
    { id: 'accounts', label: 'আয় ও ব্যয় হিসাব', subLabel: 'Income & Expenses', icon: DollarSign },
    { id: 'employees', label: 'কর্মচারী ব্যবস্থাপনা', subLabel: 'Staff & Roles', icon: UserCheck },
    {
      id: 'complaints',
      label: 'গ্রাহক অভিযোগ',
      subLabel: 'Support Tickets',
      icon: MessageSquareWarning,
      badge: pendingComplaints,
    },
    { id: 'reports', label: 'রিপোর্ট ও অ্যানালিটিক্স', subLabel: 'Export PDF / CSV', icon: BarChart3 },
    { id: 'settings', label: 'কোম্পানি সেটিংস', subLabel: 'Rules & Firebase', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header in Drawer */}
        <div className="p-4 flex items-center justify-between lg:hidden border-b border-slate-100 dark:border-slate-800">
          <span className="font-bold text-sm text-slate-800 dark:text-slate-100">অ্যাডমিন মেনু</span>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            বিলিং ও ম্যানেজমেন্ট
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                    }`}
                  />
                  <div className="truncate">
                    <p className="text-xs leading-tight truncate">{item.label}</p>
                    <p
                      className={`text-[10px] leading-tight truncate ${
                        isActive ? 'text-blue-100 opacity-80' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {item.subLabel}
                    </p>
                  </div>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                      isActive
                        ? 'bg-white text-blue-700'
                        : 'bg-orange-500 text-white shadow-sm'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer info */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>মুদ্রা: ৳ BDT</span>
            <span className="font-mono text-[10px]">Asia/Dhaka</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-400 text-center">
            WINK NETWORK ISP &copy; 2026
          </div>
        </div>
      </aside>
    </>
  );
};
