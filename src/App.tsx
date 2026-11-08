/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { LoginPage } from './components/auth/LoginPage';
import { AdminPortal } from './components/admin/AdminPortal';
import { EmployeeDashboard } from './components/employee/EmployeeDashboard';
import { CustomerPortal } from './components/customer/CustomerPortal';
import { store } from './services/store';

const MainApp: React.FC = () => {
  const { currentUser, role } = useAuth();
  const [, setTick] = useState(0);

  // Subscribe to central store changes
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Header />

      <div className="flex-1">
        {role === 'admin' && <AdminPortal />}

        {role === 'employee' && (
          <main className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
            <EmployeeDashboard />
          </main>
        )}

        {role === 'customer' && (
          <main className="p-4 sm:p-6 max-w-3xl mx-auto">
            <CustomerPortal />
          </main>
        )}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
