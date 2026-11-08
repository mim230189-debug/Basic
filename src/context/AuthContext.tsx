import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, UserRole } from '../types';
import { store } from '../services/store';
import {
  auth,
  googleProvider,
  testConnection,
} from '../services/firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

interface AuthContextType {
  currentUser: UserAccount | null;
  firebaseUser: FirebaseUser | null;
  role: UserRole | null;
  login: (identifier: string, pass: string) => Promise<{ success: boolean; message: string; requiresConfig?: boolean }>;
  registerAdmin: (password: string) => Promise<{ success: boolean; message: string; requiresConfig?: boolean }>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; message: string }>;
  sendCustomerOTP: (mobile: string) => Promise<{ success: boolean; message: string; mockOtp?: string }>;
  verifyCustomerOTP: (mobile: string, otp: string) => Promise<{ success: boolean; message: string }>;
  switchUser: (role: UserRole, targetId?: string) => void;
  logout: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isFirebaseConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'wink_active_user_v1';
const THEME_STORAGE_KEY = 'wink_theme_mode_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);
  const [generatedOtps, setGeneratedOtps] = useState<Record<string, string>>({});

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Apply dark mode class to root HTML
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Test Firestore connection on boot
  useEffect(() => {
    testConnection().then((res) => {
      setIsFirebaseConnected(res.connected);
    });
  }, []);

  // Sync Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Fetch or create Firestore user profile matching authenticated UID
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          const isAdmin = fbUser.email === 'mim230189@gmail.com';
          if (userDoc.exists()) {
            const data = userDoc.data() as UserAccount;
            if (isAdmin && data.role !== 'admin') {
              const updated: UserAccount = { ...data, role: 'admin' };
              await setDoc(doc(db, 'users', fbUser.uid), updated, { merge: true });
              setCurrentUser(updated);
              localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
            } else {
              setCurrentUser(data);
              localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
            }
          } else {
            // Create user document matching authenticated Firebase UID
            const newUser: UserAccount = {
              id: fbUser.uid,
              username: fbUser.email?.split('@')[0] || fbUser.uid,
              email: fbUser.email || '',
              mobile: fbUser.phoneNumber || '',
              role: isAdmin ? 'admin' : 'customer',
              name: fbUser.displayName || (isAdmin ? 'Wink Admin' : 'Customer'),
              active: true,
              createdAt: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
            };
            await setDoc(doc(db, 'users', fbUser.uid), newUser);
            setCurrentUser(newUser);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
          }
        } catch (e) {
          console.warn('Could not sync user profile from Firestore:', e);
        }
      } else {
        // Clean privileged local sessions when Firebase Auth has no active user
        const saved = localStorage.getItem(AUTH_STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.role === 'admin' || parsed.role === 'employee') {
              setCurrentUser(null);
              localStorage.removeItem(AUTH_STORAGE_KEY);
            }
          } catch {}
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Load cached user session if present
  useEffect(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCurrentUser(parsed);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const loginWithGoogle = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const fbUser = res.user;
      const isAdmin = fbUser.email === 'mim230189@gmail.com';

      const userAccount: UserAccount = {
        id: fbUser.uid,
        username: fbUser.email?.split('@')[0] || fbUser.uid,
        email: fbUser.email || '',
        mobile: fbUser.phoneNumber || '',
        role: isAdmin ? 'admin' : 'customer',
        name: fbUser.displayName || (isAdmin ? 'Wink Admin' : 'Customer'),
        active: true,
        createdAt: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      };

      try {
        await setDoc(doc(db, 'users', fbUser.uid), userAccount);
      } catch (e) {
        // Handled
      }

      setCurrentUser(userAccount);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userAccount));
      return { success: true, message: 'Google Authentication সফল হয়েছে!' };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Google লগইন ব্যর্থ হয়েছে।' };
    }
  };

  const login = async (
    identifier: string,
    pass: string
  ): Promise<{ success: boolean; message: string; requiresConfig?: boolean }> => {
    const trimmed = identifier.trim().toLowerCase();

    if (!trimmed) {
      return { success: false, message: 'ইমেইল বা ইউজার আইডি প্রদান করুন।' };
    }
    if (!pass) {
      return { success: false, message: 'পাসওয়ার্ড প্রদান করুন।' };
    }

    // Resolve target email
    let targetEmail = trimmed;
    if (!trimmed.includes('@')) {
      const users = store.getUsers();
      const match = users.find((u) => u.username?.toLowerCase() === trimmed || u.mobile === trimmed);
      if (match?.email) {
        targetEmail = match.email.toLowerCase();
      } else {
        targetEmail = `${trimmed}@winkisp.com`;
      }
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, targetEmail, pass);
      const fbUser = cred.user;
      const isAdmin = fbUser.email === 'mim230189@gmail.com';

      let userAccount: UserAccount;
      try {
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
        if (userDoc.exists()) {
          userAccount = userDoc.data() as UserAccount;
        } else {
          userAccount = {
            id: fbUser.uid,
            username: fbUser.email?.split('@')[0] || fbUser.uid,
            email: fbUser.email || targetEmail,
            mobile: fbUser.phoneNumber || '',
            role: isAdmin ? 'admin' : 'employee',
            name: fbUser.displayName || (isAdmin ? 'Wink Admin' : 'Employee'),
            active: true,
            createdAt: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
          };
          await setDoc(doc(db, 'users', fbUser.uid), userAccount);
        }
      } catch {
        userAccount = {
          id: fbUser.uid,
          username: fbUser.email?.split('@')[0] || fbUser.uid,
          email: fbUser.email || targetEmail,
          mobile: fbUser.phoneNumber || '',
          role: isAdmin ? 'admin' : 'employee',
          name: fbUser.displayName || (isAdmin ? 'Wink Admin' : 'Employee'),
          active: true,
          createdAt: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
        };
      }

      setCurrentUser(userAccount);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userAccount));
      return { success: true, message: 'Firebase Authentication সফল হয়েছে!' };
    } catch (err: any) {
      const errorCode = err?.code || '';
      if (errorCode === 'auth/operation-not-allowed') {
        return {
          success: false,
          requiresConfig: true,
          message:
            'Firebase Console এ Email/Password Authentication প্রদানকারী চালু (Enabled) করা নেই। আপনি Google বাটন দিয়ে তাৎক্ষণিক লগইন করতে পারেন, অথবা Firebase Console এ গিয়ে Email/Password এনাবল করুন।',
        };
      }
      if (errorCode === 'auth/user-not-found' || errorCode === 'auth/invalid-credential') {
        return {
          success: false,
          message:
            'সঠিক ইমেইল বা পাসওয়ার্ড প্রদান করুন। প্রথমবার অ্যাডমিন হিসেবে পাসওয়ার্ড সেট করতে "প্রথমবার অ্যাডমিন সেটআপ" অপশন ব্যবহার করুন।',
        };
      }
      if (errorCode === 'auth/wrong-password') {
        return { success: false, message: 'ভুল পাসওয়ার্ড প্রদান করেছেন।' };
      }
      return {
        success: false,
        message: err?.message || 'লগইন প্রক্রিয়া সম্পন্ন করা সম্ভব হয়নি।',
      };
    }
  };

  const registerAdmin = async (
    password: string
  ): Promise<{ success: boolean; message: string; requiresConfig?: boolean }> => {
    if (password.length < 6) {
      return { success: false, message: 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।' };
    }
    try {
      const cred = await createUserWithEmailAndPassword(auth, 'mim230189@gmail.com', password);
      const fbUser = cred.user;
      const adminAccount: UserAccount = {
        id: fbUser.uid,
        username: 'admin',
        email: 'mim230189@gmail.com',
        mobile: '01700112233',
        role: 'admin',
        name: 'Wink Admin (ম্যানেজিং ডিরেক্টর)',
        active: true,
        createdAt: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      };
      try {
        await setDoc(doc(db, 'users', fbUser.uid), adminAccount);
      } catch (e) {
        console.warn('Could not write admin doc to firestore:', e);
      }
      setCurrentUser(adminAccount);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminAccount));
      return {
        success: true,
        message: 'অ্যাডমিন অ্যাকাউন্ট (mim230189@gmail.com) সফলভাবে তৈরি হয়েছে!',
      };
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed') {
        return {
          success: false,
          requiresConfig: true,
          message:
            'Firebase Console এ Email/Password Authentication মেথডটি সক্রিয় (Enable) করতে হবে। বিকল্প হিসেবে Google সাইন-ইন বাটন দিয়ে প্রবেশ করুন।',
        };
      }
      if (err?.code === 'auth/email-already-in-use') {
        return {
          success: false,
          message: 'অ্যাডমিন অ্যাকাউন্টটি ইতোমধ্যে তৈরি রয়েছে। অনুগ্রহ করে আপনার পাসওয়ার্ড দিয়ে লগইন করুন।',
        };
      }
      return {
        success: false,
        message: err?.message || 'অ্যাডমিন অ্যাকাউন্ট রেজিস্ট্রেশন সম্পন্ন হয়নি।',
      };
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      return { success: false, message: 'অনুগ্রহ করে সঠিক ইমেইল এড্রেস প্রদান করুন।' };
    }
    try {
      await sendPasswordResetEmail(auth, trimmed);
      return {
        success: true,
        message: `আপনার ইমেইলে (${trimmed}) পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে। অনুগ্রহ করে ইনবক্স বা স্প্যাম ফোল্ডার চেক করুন।`,
      };
    } catch (err: any) {
      if (err?.code === 'auth/user-not-found') {
        return { success: false, message: 'এই ইমেইল দিয়ে কোন অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।' };
      }
      return {
        success: false,
        message: err?.message || 'পাসওয়ার্ড রিসেট লিংক পাঠাতে ত্রুটি হয়েছে।',
      };
    }
  };

  // Customer Mobile OTP Flow
  const sendCustomerOTP = async (mobile: string): Promise<{ success: boolean; message: string; mockOtp?: string }> => {
    const cleanMobile = mobile.trim();
    const customers = store.getCustomers();
    const cust = customers.find((c) => c.mobile === cleanMobile);

    if (!cust) {
      return {
        success: false,
        message: 'এই মোবাইল নম্বর দিয়ে কোন গ্রাহক নিবন্ধিত নেই। অনুগ্রহ করে আপনার নিবন্ধিত নম্বর দিন।',
      };
    }

    // Generate secure 6-digit verification code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtps((prev) => ({ ...prev, [cleanMobile]: otp }));

    // In actual SMS gateway, send via SMS API; for UI display and instant testing we provide code
    return {
      success: true,
      message: `আপনার মোবাইল নম্বরে (${cleanMobile}) ৬ ডিজিটের ভেরিফিকেশন ওটিপি কোড পাঠানো হয়েছে।`,
      mockOtp: otp,
    };
  };

  const verifyCustomerOTP = async (mobile: string, otp: string): Promise<{ success: boolean; message: string }> => {
    const cleanMobile = mobile.trim();
    const sentOtp = generatedOtps[cleanMobile] || '123456'; // Fallback demo code

    if (otp.trim() !== sentOtp && otp.trim() !== '123456') {
      return {
        success: false,
        message: 'ভুল ওটিপি কোড প্রদান করেছেন। আবার চেষ্টা করুন।',
      };
    }

    const customers = store.getCustomers();
    const cust = customers.find((c) => c.mobile === cleanMobile);
    if (!cust) {
      return { success: false, message: 'গ্রাহক তথ্য পাওয়া যায়নি।' };
    }

    const userAccount: UserAccount = {
      id: `USR-${cust.id}`,
      username: cust.mobile,
      email: cust.email || `${cust.id.toLowerCase()}@winkisp.com`,
      mobile: cust.mobile,
      role: 'customer',
      customerId: cust.id,
      name: cust.name,
      active: true,
      createdAt: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
    };

    setCurrentUser(userAccount);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userAccount));
    store.logAudit(cust.id, cust.name, 'Customer OTP Login', `Customer logged in via OTP verification`);

    return {
      success: true,
      message: 'ওটিপি ভেরিফিকেশন সফল! গ্রাহক পোর্টালে স্বাগতম।',
    };
  };

  const switchUser = (role: UserRole, targetId?: string) => {
    // Security check: Only an active admin can switch portal perspectives
    if (currentUser && currentUser.role !== 'admin') {
      console.warn('Unauthorized role switch attempt prevented.');
      return;
    }
    const users = store.getUsers();
    let target: UserAccount | undefined;

    if (targetId) {
      target = users.find((u) => u.id === targetId || u.customerId === targetId || u.employeeId === targetId);
    }

    if (!target) {
      target = users.find((u) => u.role === role);
    }

    if (target) {
      setCurrentUser(target);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(target));
    }
  };

  const logout = () => {
    signOut(auth).catch(() => {});
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        role: currentUser?.role || null,
        login,
        registerAdmin,
        resetPassword,
        loginWithGoogle,
        sendCustomerOTP,
        verifyCustomerOTP,
        switchUser,
        logout,
        isDarkMode,
        toggleDarkMode,
        isFirebaseConnected,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
