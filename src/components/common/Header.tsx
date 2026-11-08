import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { store } from '../../services/store';
import {
  Shield,
  UserCheck,
  Smartphone,
  Sun,
  Moon,
  Bell,
  LogOut,
  ChevronDown,
  Wifi,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser, firebaseUser, loginWithGoogle, role, switchUser, logout, isDarkMode, toggleDarkMode } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const notifications = store.getNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
              <Wifi className="w-5 h-5 text-orange-400 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-blue-900 dark:text-blue-400">
                  WINK<span className="text-orange-500">.</span>NETWORK
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  ISP BILLING
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:block">
                উইঙ্ক নেটওয়ার্ক ইন্টারনেট বিলিং ও কাস্টমার ম্যানেজমেন্ট
              </p>
            </div>
          </div>

          {/* Portal Quick Switcher Tabs (Admin Only) */}
          {role === 'admin' && (
            <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => switchUser('admin')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all bg-blue-600 text-white shadow-sm"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>অ্যাডমিন প্যানেল</span>
              </button>
              <button
                onClick={() => switchUser('employee')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>কর্মচারী প্যানেল</span>
              </button>
              <button
                onClick={() => switchUser('customer')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>গ্রাহক মোবাইল পোর্টাল</span>
              </button>
            </div>
          )}

          {/* Right Controls: Role Badge, Database Status, Notifications, Dark Mode, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {firebaseUser ? (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>ক্লাউড সিঙ্ক সক্রিয় ({firebaseUser.email?.split('@')[0] || 'Admin'})</span>
              </div>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 text-[10px] font-bold text-orange-700 dark:text-orange-300 hover:bg-orange-100 transition-colors shadow-sm"
                title="Google একাউন্ট দিয়ে ফায়ারবেস ক্লাউড সিঙ্ক সক্রিয় করুন"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
                <span>ক্লাউড সিঙ্ক: Google সাইন-ইন</span>
              </button>
            )}
            
            {/* Mobile Portal Selector Dropdown (Admin Only) */}
            {role === 'admin' && (
              <div className="relative lg:hidden">
                <button
                  onClick={() => setShowRoleMenu(!showRoleMenu)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                >
                  <span>অ্যাডমিন</span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>

                {showRoleMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50">
                    <button
                      onClick={() => {
                        switchUser('admin');
                        setShowRoleMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                    >
                      <Shield className="w-3.5 h-3.5 text-blue-600" />
                      <span>অ্যাডমিন প্যানেল</span>
                    </button>
                    <button
                      onClick={() => {
                        switchUser('employee');
                        setShowRoleMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-orange-500" />
                      <span>কর্মচারী প্যানেল</span>
                    </button>
                    <button
                      onClick={() => {
                        switchUser('customer');
                        setShowRoleMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>গ্রাহক মোবাইল পোর্টাল</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifModal(!showNotifModal)}
                className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="বিজ্ঞপ্তি"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Drawer */}
              {showNotifModal && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">বিজ্ঞপ্তিসমূহ</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={() => store.markAllNotificationsRead()}
                          className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          সব পঠিত চিহ্নিত করুন
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotifModal(false)}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 max-h-80 overflow-y-auto space-y-2.5">
                    {notifications.length === 0 ? (
                      <p className="text-center text-xs text-slate-400 py-6">কোন নতুন বিজ্ঞপ্তি নেই</p>
                    ) : (
                      notifications.slice(0, 6).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => store.markNotificationRead(notif.id)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                            notif.read
                              ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                              : 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60 text-slate-900 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {notif.type === 'payment' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            ) : notif.type === 'bill' ? (
                              <Clock className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-semibold leading-tight">{notif.title}</h4>
                              <p className="text-[11px] mt-0.5 opacity-80 leading-normal">{notif.message}</p>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                                {notif.createdAt}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDarkMode ? 'লাইট মোড চালু করুন' : 'ডার্ক মোড চালু করুন'}
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* User Info & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center border border-blue-200 dark:border-blue-700">
                {currentUser?.name?.slice(0, 1) || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
                  {currentUser?.name}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                  {currentUser?.role === 'admin'
                    ? 'অ্যাডমিন'
                    : currentUser?.role === 'employee'
                    ? 'কর্মচারী'
                    : 'গ্রাহক'}
                </p>
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                title="লগআউট"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
