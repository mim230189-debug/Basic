import React, { useState } from 'react';
import { AdminSidebar, AdminTab } from './AdminSidebar';
import { AdminDashboard } from './AdminDashboard';
import { CustomerManagement } from './CustomerManagement';
import { PackageManagement } from './PackageManagement';
import { MonthlyBillingEngine } from './MonthlyBillingEngine';
import { PaymentManagement } from './PaymentManagement';
import { PaymentRequests } from './PaymentRequests';
import { InvoiceList } from './InvoiceList';
import { AccountsManagement } from './AccountsManagement';
import { EmployeeManagement } from './EmployeeManagement';
import { ComplaintsManagement } from './ComplaintsManagement';
import { ReportsAnalytics } from './ReportsAnalytics';
import { SettingsFirebase } from './SettingsFirebase';
import { Menu } from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [selectedCustomerIdForPayment, setSelectedCustomerIdForPayment] = useState<string | undefined>();

  // Modals triggered from dashboard
  const handleOpenPayment = (customerId?: string) => {
    setSelectedCustomerIdForPayment(customerId);
    setCurrentTab('payments');
  };

  const handleOpenCustomerAdd = () => {
    setCurrentTab('customers');
  };

  const handleOpenBilling = () => {
    setCurrentTab('billing');
  };

  const handleOpenExpense = () => {
    setCurrentTab('accounts');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors">
      
      {/* Sidebar Navigation */}
      <AdminSidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setSelectedCustomerIdForPayment(undefined);
        }}
        isOpenMobile={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        
        {/* Mobile Sub-Header Trigger for Sidebar */}
        <div className="lg:hidden p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setIsMobileNavOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
          >
            <Menu className="w-4 h-4 text-blue-600" />
            <span>অ্যাডমিন মেনু খুলুন</span>
          </button>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {currentTab === 'dashboard'
              ? 'ড্যাশবোর্ড'
              : currentTab === 'customers'
              ? 'গ্রাহক ব্যবস্থাপনা'
              : currentTab === 'billing'
              ? 'মাসিক বিলিং ইঞ্জিন'
              : currentTab === 'payments'
              ? 'পেমেন্ট কালেকশন'
              : currentTab === 'requests'
              ? 'পেমেন্ট রিকোয়েস্ট'
              : currentTab === 'invoices'
              ? 'ইনভয়েস তালিকা'
              : currentTab === 'accounts'
              ? 'আয় ও ব্যয় হিসাব'
              : currentTab === 'employees'
              ? 'কর্মচারী ব্যবস্থাপনা'
              : currentTab === 'complaints'
              ? 'গ্রাহক অভিযোগ'
              : currentTab === 'reports'
              ? 'রিপোর্ট'
              : 'সেটিংস'}
          </span>
        </div>

        {/* Viewport Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <AdminDashboard
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenPaymentModal={() => handleOpenPayment()}
              onOpenCustomerModal={() => handleOpenCustomerAdd()}
              onOpenBillingModal={() => handleOpenBilling()}
              onOpenExpenseModal={() => handleOpenExpense()}
            />
          )}

          {currentTab === 'customers' && (
            <CustomerManagement
              onCollectPaymentForCustomer={(id) => handleOpenPayment(id)}
            />
          )}

          {currentTab === 'packages' && <PackageManagement />}

          {currentTab === 'billing' && <MonthlyBillingEngine />}

          {currentTab === 'payments' && (
            <PaymentManagement initialCustomerId={selectedCustomerIdForPayment} />
          )}

          {currentTab === 'requests' && <PaymentRequests />}

          {currentTab === 'invoices' && <InvoiceList />}

          {currentTab === 'accounts' && <AccountsManagement />}

          {currentTab === 'employees' && <EmployeeManagement />}

          {currentTab === 'complaints' && <ComplaintsManagement />}

          {currentTab === 'reports' && <ReportsAnalytics />}

          {currentTab === 'settings' && <SettingsFirebase />}
        </main>
      </div>

    </div>
  );
};
