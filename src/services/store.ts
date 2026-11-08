import {
  Customer,
  Package,
  Invoice,
  Payment,
  PaymentRequest,
  Employee,
  Income,
  Expense,
  Complaint,
  AppNotification,
  AuditLog,
  CompanySettings,
  UserAccount,
} from '../types';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  query,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
} from 'firebase/firestore';

// Default initial ISP Data to seed into Firestore if empty
export const INITIAL_PACKAGES: Package[] = [
  {
    id: 'PKG-10M',
    name: 'ব্রোঞ্জ - Bronze Starter',
    speed: '10 Mbps',
    price: 500,
    description: 'দৈনন্দিন ব্রাউজিং, ইউটিউব ও ফেসবুক ব্যবহারের জন্য উপযুক্ত।',
    active: true,
    features: ['10 Mbps Real IP Speed', '24/7 Support', 'Buffer-Free YouTube'],
  },
  {
    id: 'PKG-20M',
    name: 'সিলভার - Silver Home',
    speed: '20 Mbps',
    price: 700,
    description: 'স্মার্ট টিভি, ওয়ার্ক ফ্রম হোম এবং একাধিক ডিভাইসের জন্য জনপ্রিয় প্যাকেজ।',
    active: true,
    features: ['20 Mbps Unlimited', 'BDIX Ultra Speed', 'Free Optical Patch Cord'],
  },
  {
    id: 'PKG-30M',
    name: 'গোল্ড - Gold Premium',
    speed: '30 Mbps',
    price: 900,
    description: '৪K স্ট্রিমিং ও দ্রুত ফাইল ডাউনলোড ও ভিডিও কনফারেন্সিংয়ের জন্য সেরা।',
    active: true,
    features: ['30 Mbps Dedicated', 'Gaming Low Ping', 'BDIX 100 Mbps', 'Priority Support'],
  },
  {
    id: 'PKG-40M',
    name: 'প্লাটিনাম - Platinum Plus',
    speed: '40 Mbps',
    price: 1100,
    description: 'গেমিং এবং ভারী কাজের জন্য নিরবচ্ছিন্ন অপটিক্যাল ফাইবার সংযোগ।',
    active: true,
    features: ['40 Mbps Symmetrical', 'Static Public IP Available', 'Zero Packet Loss'],
  },
  {
    id: 'PKG-50M',
    name: 'টাইটানিয়াম - Titanium Max',
    speed: '50 Mbps',
    price: 1300,
    description: 'ছোট ব্যবসা, ফ্রিল্যান্সার এবং মাল্টিপল ইউজার পরিবারের জন্য।',
    active: true,
    features: ['50 Mbps Dedicated', '99.9% Uptime Guarantee', 'Dual Link Redundancy'],
  },
  {
    id: 'PKG-100M',
    name: 'গিগাবিট আল্ট্রা - Gigabit Enterprise',
    speed: '100 Mbps',
    price: 2000,
    description: 'কর্পোরেট লেভেল গতি, আনলিমিটেড ব্যান্ডউইথ ও প্রিমিয়াম ব্যান্ডউইথ পুল।',
    active: true,
    features: ['100 Mbps Ultra', '24/7 Dedicated Account Manager', 'Custom Routing'],
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'WNK-1001',
    name: 'রাশেদুল ইসলাম (Md. Rashedul Islam)',
    mobile: '01711223344',
    altMobile: '01911223344',
    address: 'হাউস ১২, রোড ৪, ব্লক সি, বনানী, ঢাকা',
    connectionDate: '15-01-2025',
    packageId: 'PKG-30M',
    packageName: 'গোল্ড - Gold Premium (30 Mbps)',
    monthlyBill: 900,
    status: 'active',
    username: 'rashed_wink',
    email: 'rashedul@gmail.com',
    notes: 'ভিআইপি কাস্টমার, নিয়মিত পেমেন্ট করেন।',
    balance: 0,
    portalEnabled: true,
    zone: 'বনানী জোন (Banani Zone)',
  },
  {
    id: 'WNK-1002',
    name: 'তানভীর আহমেদ (Tanvir Ahmed)',
    mobile: '01819988776',
    altMobile: '01619988776',
    address: 'ফ্ল্যাট ৪বি, ড্রিম টাওয়ার, সেক্টর ৭, উত্তরা, ঢাকা',
    connectionDate: '01-03-2025',
    packageId: 'PKG-20M',
    packageName: 'সিলভার - Silver Home (20 Mbps)',
    monthlyBill: 700,
    status: 'active',
    username: 'tanvir_uttara',
    email: 'tanvir.ahmed@yahoo.com',
    notes: 'উত্তরা সাব-হাবের সাথে সংযুক্ত।',
    balance: -700,
    portalEnabled: true,
    zone: 'উত্তরা জোন (Uttara Zone)',
  },
  {
    id: 'WNK-1003',
    name: 'নুসরাত জাহান (Nusrat Jahan)',
    mobile: '01912345678',
    altMobile: '01712345678',
    address: 'বাড়ি ৭/এ, ধানমন্ডি ২৭, ঢাকা',
    connectionDate: '10-06-2025',
    packageId: 'PKG-50M',
    packageName: 'টাইটানিয়াম - Titanium Max (50 Mbps)',
    monthlyBill: 1300,
    status: 'active',
    username: 'nusrat_dhk',
    email: 'nusrat.jahan@gmail.com',
    notes: 'ফ্রিল্যান্সার কাস্টমার। হাই স্পিড প্রায়োরিটি।',
    balance: 0,
    portalEnabled: true,
    zone: 'ধানমন্ডি জোন (Dhanmondi Zone)',
  },
  {
    id: 'WNK-1004',
    name: 'সোহেল রানা (Sohel Rana)',
    mobile: '01733445566',
    address: 'প্লট ৪৫, মিরপুর ১০, সেনপাড়া পর্বতা, ঢাকা',
    connectionDate: '20-08-2025',
    packageId: 'PKG-20M',
    packageName: 'সিলভার - Silver Home (20 Mbps)',
    monthlyBill: 700,
    status: 'active',
    username: 'sohel_mirpur',
    email: 'sohel.rana@gmail.com',
    balance: 0,
    portalEnabled: true,
    zone: 'মিরপুর জোন (Mirpur Zone)',
  },
  {
    id: 'WNK-1005',
    name: 'আব্দুল করিম (Abdul Karim)',
    mobile: '01555667788',
    address: 'রোড ২, লালমাটিয়া ব্লক বি, ঢাকা',
    connectionDate: '05-11-2025',
    packageId: 'PKG-10M',
    packageName: 'ব্রোঞ্জ - Bronze Starter (10 Mbps)',
    monthlyBill: 500,
    status: 'suspended',
    username: 'karim_lalmatia',
    notes: 'কাস্টমার দেশের বাইরে থাকায় সাময়িক স্থগিত।',
    balance: -1000,
    portalEnabled: true,
    zone: 'ধানমন্ডি জোন (Dhanmondi Zone)',
  },
  {
    id: 'WNK-1006',
    name: 'মেসার্স ডেল্টা সলিউশনস (Delta Solutions Ltd.)',
    mobile: '01700998811',
    address: 'লেভেল ৮, কারওয়ান বাজার কমার্শিয়াল এরিয়া, ঢাকা',
    connectionDate: '12-02-2025',
    packageId: 'PKG-100M',
    packageName: 'গিগাবিট আল্ট্রা - Gigabit Enterprise (100 Mbps)',
    monthlyBill: 2000,
    status: 'active',
    username: 'delta_office',
    email: 'admin@deltasolutions.bd',
    notes: 'কর্পোরেট ক্লায়েন্ট। সরাসরি ফাইবার সুইচে সংযুক্ত।',
    balance: 0,
    portalEnabled: true,
    zone: 'কারওয়ান বাজার (Kawran Bazar)',
  },
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'INV-202611-1001',
    customerId: 'WNK-1001',
    customerName: 'রাশেদুল ইসলাম (Md. Rashedul Islam)',
    customerMobile: '01711223344',
    billingMonth: 'নভেম্বর ২০২৬ (November 2026)',
    billingMonthKey: '2026-11',
    packageId: 'PKG-30M',
    packageName: 'গোল্ড - Gold Premium (30 Mbps)',
    previousDue: 0,
    currentBill: 900,
    discount: 0,
    additionalCharges: 0,
    totalPayable: 900,
    amountPaid: 900,
    remainingBalance: 0,
    status: 'paid',
    billingDate: '01-11-2026',
    dueDate: '10-11-2026',
    createdAt: '01-11-2026',
  },
  {
    id: 'INV-202611-1002',
    customerId: 'WNK-1002',
    customerName: 'তানভীর আহমেদ (Tanvir Ahmed)',
    customerMobile: '01819988776',
    billingMonth: 'নভেম্বর ২০২৬ (November 2026)',
    billingMonthKey: '2026-11',
    packageId: 'PKG-20M',
    packageName: 'সিলভার - Silver Home (20 Mbps)',
    previousDue: 0,
    currentBill: 700,
    discount: 0,
    additionalCharges: 0,
    totalPayable: 700,
    amountPaid: 0,
    remainingBalance: 700,
    status: 'unpaid',
    billingDate: '01-11-2026',
    dueDate: '10-11-2026',
    createdAt: '01-11-2026',
  },
  {
    id: 'INV-202611-1003',
    customerId: 'WNK-1003',
    customerName: 'নুসরাত জাহান (Nusrat Jahan)',
    customerMobile: '01912345678',
    billingMonth: 'নভেম্বর ২০২৬ (November 2026)',
    billingMonthKey: '2026-11',
    packageId: 'PKG-50M',
    packageName: 'টাইটানিয়াম - Titanium Max (50 Mbps)',
    previousDue: 0,
    currentBill: 1300,
    discount: 100,
    additionalCharges: 0,
    totalPayable: 1200,
    amountPaid: 1200,
    remainingBalance: 0,
    status: 'paid',
    billingDate: '01-11-2026',
    dueDate: '10-11-2026',
    createdAt: '01-11-2026',
  },
  {
    id: 'INV-202611-1004',
    customerId: 'WNK-1004',
    customerName: 'সোহেল রানা (Sohel Rana)',
    customerMobile: '01733445566',
    billingMonth: 'নভেম্বর ২০২৬ (November 2026)',
    billingMonthKey: '2026-11',
    packageId: 'PKG-20M',
    packageName: 'সিলভার - Silver Home (20 Mbps)',
    previousDue: 0,
    currentBill: 700,
    discount: 0,
    additionalCharges: 0,
    totalPayable: 700,
    amountPaid: 700,
    remainingBalance: 0,
    status: 'paid',
    billingDate: '01-11-2026',
    dueDate: '10-11-2026',
    createdAt: '01-11-2026',
  },
  {
    id: 'INV-202611-1005',
    customerId: 'WNK-1005',
    customerName: 'আব্দুল করিম (Abdul Karim)',
    customerMobile: '01555667788',
    billingMonth: 'নভেম্বর ২০২৬ (November 2026)',
    billingMonthKey: '2026-11',
    packageId: 'PKG-10M',
    packageName: 'ব্রোঞ্জ - Bronze Starter (10 Mbps)',
    previousDue: 500,
    currentBill: 500,
    discount: 0,
    additionalCharges: 0,
    totalPayable: 1000,
    amountPaid: 0,
    remainingBalance: 1000,
    status: 'overdue',
    billingDate: '01-11-2026',
    dueDate: '10-11-2026',
    createdAt: '01-11-2026',
  },
  {
    id: 'INV-202611-1006',
    customerId: 'WNK-1006',
    customerName: 'মেসার্স ডেল্টা সলিউশনস (Delta Solutions Ltd.)',
    customerMobile: '01700998811',
    billingMonth: 'নভেম্বর ২০২৬ (November 2026)',
    billingMonthKey: '2026-11',
    packageId: 'PKG-100M',
    packageName: 'গিগাবিট আল্ট্রা - Gigabit Enterprise (100 Mbps)',
    previousDue: 0,
    currentBill: 2000,
    discount: 0,
    additionalCharges: 0,
    totalPayable: 2000,
    amountPaid: 2000,
    remainingBalance: 0,
    status: 'paid',
    billingDate: '01-11-2026',
    dueDate: '10-11-2026',
    createdAt: '01-11-2026',
  },
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'PAY-20261102-01',
    customerId: 'WNK-1001',
    customerName: 'রাশেদুল ইসলাম (Md. Rashedul Islam)',
    invoiceId: 'INV-202611-1001',
    amount: 900,
    method: 'bKash',
    transactionId: 'BK9A772LK1',
    paymentDate: '02-11-2026',
    collectedBy: 'Customer Gateway',
    collectedByRole: 'customer_gateway',
    receiptNumber: 'REC-9011',
    notes: 'bKash অনলাইন পেমেন্ট সফল হয়েছে।',
  },
  {
    id: 'PAY-20261103-02',
    customerId: 'WNK-1003',
    customerName: 'নুসরাত জাহান (Nusrat Jahan)',
    invoiceId: 'INV-202611-1003',
    amount: 1200,
    method: 'Nagad',
    transactionId: 'NG88912AA4',
    paymentDate: '03-11-2026',
    collectedBy: 'কবির হোসেন (বিলিং অফিসার)',
    collectedByRole: 'employee',
    receiptNumber: 'REC-9012',
    notes: 'নগদ ক্যাশ কালেকশন ভেরিফাইড।',
  },
  {
    id: 'PAY-20261104-03',
    customerId: 'WNK-1004',
    customerName: 'সোহেল রানা (Sohel Rana)',
    invoiceId: 'INV-202611-1004',
    amount: 700,
    method: 'Cash',
    transactionId: 'CASH-MR-104',
    paymentDate: '04-11-2026',
    collectedBy: 'কবির হোসেন (বিলিং অফিসার)',
    collectedByRole: 'employee',
    receiptNumber: 'REC-9013',
    notes: 'মিরপুর ফিল্ড কালেকশন।',
  },
  {
    id: 'PAY-20261105-04',
    customerId: 'WNK-1006',
    customerName: 'মেসার্স ডেল্টা সলিউশনস (Delta Solutions Ltd.)',
    invoiceId: 'INV-202611-1006',
    amount: 2000,
    method: 'Bank Transfer',
    transactionId: 'CITY-EFT-99182',
    paymentDate: '05-11-2026',
    collectedBy: 'অ্যাডমিন ম্যানেজার',
    collectedByRole: 'admin',
    receiptNumber: 'REC-9014',
    notes: 'সিটি ব্যাংক অ্যাকাউন্ট ট্রান্সফার।',
  },
];

export const INITIAL_PAYMENT_REQUESTS: PaymentRequest[] = [
  {
    id: 'PR-101',
    customerId: 'WNK-1002',
    customerName: 'তানভীর আহমেদ (Tanvir Ahmed)',
    customerMobile: '01819988776',
    invoiceId: 'INV-202611-1002',
    amount: 700,
    method: 'bKash',
    transactionId: 'BK7788992X',
    paymentDate: '08-11-2026',
    screenshotUrl: '',
    status: 'pending',
    submittedAt: '08-11-2026 10:15',
    adminNote: '',
  },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'EMP-01',
    name: 'কবির হোসেন (Kabir Hossain)',
    mobile: '01799001122',
    email: 'kabir@winkisp.com',
    designation: 'ফিল্ড কালেকশন ও বিলিং অফিসার',
    joinedDate: '10-01-2024',
    status: 'active',
    permissions: {
      canAddCustomer: true,
      canCollectPayment: true,
      canGenerateInvoice: true,
      canResolveComplaints: true,
      canViewReports: false,
    },
    totalCollected: 1900,
  },
  {
    id: 'EMP-02',
    name: 'মাহমুদুল হাসান (Mahmudul Hasan)',
    mobile: '01855443322',
    email: 'mahmud@winkisp.com',
    designation: 'নেটওয়ার্ক ও ফাইবার সাপোর্ট ইঞ্জিনিয়ার',
    joinedDate: '15-05-2024',
    status: 'active',
    permissions: {
      canAddCustomer: false,
      canCollectPayment: false,
      canGenerateInvoice: false,
      canResolveComplaints: true,
      canViewReports: false,
    },
    totalCollected: 0,
  },
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'EXP-101',
    category: 'Bandwidth Costs',
    amount: 18000,
    date: '02-11-2026',
    description: 'আপস্ট্রিম আইআইজি (IIG) ব্যান্ডউইথ মাসিক চার্জ - ফাইবার অ্যাট হোম',
    recordedBy: 'Admin',
  },
  {
    id: 'EXP-102',
    category: 'Office Rent',
    amount: 12000,
    date: '03-11-2026',
    description: 'বনানী মেইন অফিস এবং সার্ভার রুম মাসিক ভাড়া',
    recordedBy: 'Admin',
  },
  {
    id: 'EXP-103',
    category: 'Electricity & Utility',
    amount: 4500,
    date: '04-11-2026',
    description: 'ডেসকো (DESCO) সার্ভার রুম ও অফিস বিদ্যুৎ বিল',
    recordedBy: 'Admin',
  },
  {
    id: 'EXP-104',
    category: 'Fiber & Maintenance',
    amount: 2200,
    date: '06-11-2026',
    description: 'উত্তরা সেক্টর ৭ ফাইবার জয়েন্টিং ও অপটিক্যাল বক্স পরিবর্তন',
    recordedBy: 'Mahmudul Hasan',
  },
];

export const INITIAL_INCOME: Income[] = [
  {
    id: 'INC-101',
    category: 'Installation Charge',
    amount: 1500,
    date: '02-11-2026',
    description: 'নতুন ফাইবার অপটিক্যাল সংযোগ ও রাউটার সেটআপ ফি (উত্তরা)',
    recordedBy: 'Kabir Hossain',
  },
  {
    id: 'INC-102',
    category: 'New Connection Fee',
    amount: 1000,
    date: '05-11-2026',
    description: 'মিরপুর নতুন সংযোগ রেজিস্ট্রেশন চার্জ',
    recordedBy: 'Kabir Hossain',
  },
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'TKT-201',
    customerId: 'WNK-1002',
    customerName: 'তানভীর আহমেদ (Tanvir Ahmed)',
    customerMobile: '01819988776',
    subject: 'সন্ধ্যায় ইন্টারনেটের গতি কমে যাচ্ছে',
    category: 'Slow Internet',
    description: 'গত দুই দিন ধরে রাত ৮টা থেকে ১০টার মধ্যে গতি কিছুটা ড্রপ করছে। অনুগ্রহ করে ব্যান্ডউইথ চেক করুন।',
    priority: 'medium',
    status: 'in_progress',
    createdAt: '07-11-2026 19:40',
    adminReply: 'আপনার এরিয়া পোন পোর্ট অপটিমাইজেশন চলছে। আজকের মধ্যে ঠিক হয়ে যাবে।',
    assignedTo: 'মাহমুদুল হাসান',
  },
  {
    id: 'TKT-202',
    customerId: 'WNK-1004',
    customerName: 'সোহেল রানা (Sohel Rana)',
    customerMobile: '01733445566',
    subject: 'অপটিক্যাল ফাইবার কেবলে লাল বাতি জ্বলছে',
    category: 'Optical Fiber Cut',
    description: 'রাউটারের LOS রেড লাইট জ্বলছে। ইন্টারনেট আসছে না।',
    priority: 'high',
    status: 'resolved',
    createdAt: '05-11-2026 09:12',
    adminReply: 'আমাদের ফাইবার টিম সেনপাড়া এলাকায় প্যাচ কর্ড রিপ্লেস করে সমাধান করেছে।',
    resolvedAt: '05-11-2026 11:30',
    assignedTo: 'মাহমুদুল হাসান',
  },
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'NOTIF-1',
    recipientRole: 'all',
    title: 'নভেম্বর ২০২৬ মাসিক বিল জেনারেট সম্পন্ন',
    message: 'সকল সক্রিয় গ্রাহকদের নভেম্বর মাসের বিল সফলভাবে জেনারেট করা হয়েছে।',
    type: 'bill',
    createdAt: '01-11-2026 09:00',
    read: true,
  },
  {
    id: 'NOTIF-2',
    recipientRole: 'admin',
    title: 'নতুন পেমেন্ট রিকোয়েস্ট জমা পড়েছে',
    message: 'তানভীর আহমেদ (WNK-1002) বিকাশ মাধ্যমে ৳৭০০ টাকা পেমেন্ট রিকোয়েস্ট পাঠিয়েছে।',
    type: 'payment',
    createdAt: '08-11-2026 10:15',
    read: false,
  },
  {
    id: 'NOTIF-3',
    recipientRole: 'customer',
    recipientCustomerId: 'WNK-1001',
    title: 'পেমেন্ট সফলভাবে গৃহীত হয়েছে',
    message: 'আপনার নভেম্বর ২০২৬ মাসের বিল ৳৯০০ টাকা bKash এর মাধ্যমে গৃহীত হয়েছে। ধন্যবাদ!',
    type: 'payment',
    createdAt: '02-11-2026 14:20',
    read: true,
  },
];

export const INITIAL_SETTINGS: CompanySettings = {
  companyName: 'WINK NETWORK ISP',
  tagline: 'High-Speed Broadband & Optical Fiber Internet Service Provider',
  address: 'হাউস ২২, রোড ১১, ব্লক ডি, বনানী, ঢাকা-১২১৩, বাংলাদেশ',
  contactNumber: '+880 1700-112233',
  supportNumber: '+880 9600-998877',
  whatsappNumber: '+8801700112233',
  email: 'billing@winkisp.com',
  invoicePrefix: 'INV-',
  billingCycleDay: 1,
  dueDays: 10,
  currency: '৳ BDT',
  bkashMerchant: '01700-112233 (মার্চেন্ট)',
  nagadMerchant: '01800-445566 (মার্চেন্ট)',
  rocketMerchant: '01900-778899-2',
  bankDetails: 'WINK NETWORK ISP, City Bank Ltd, Banani Branch, A/C: 1102938481001',
  firebaseConnected: true,
};

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'USR-ADMIN',
    username: 'admin',
    email: 'mim230189@gmail.com',
    mobile: '01700112233',
    role: 'admin',
    name: 'Wink Admin (ম্যানেজিং ডিরেক্টর)',
    active: true,
    createdAt: '01-01-2025',
  },
  {
    id: 'USR-EMP-01',
    username: 'kabir',
    email: 'kabir@winkisp.com',
    mobile: '01799001122',
    role: 'employee',
    employeeId: 'EMP-01',
    name: 'কবির হোসেন (বিলিং অফিসার)',
    active: true,
    createdAt: '10-01-2024',
  },
  {
    id: 'USR-CUST-1001',
    username: '01711223344',
    email: 'rashedul@gmail.com',
    mobile: '01711223344',
    role: 'customer',
    customerId: 'WNK-1001',
    name: 'রাশেদুল ইসলাম',
    active: true,
    createdAt: '15-01-2025',
  },
  {
    id: 'USR-CUST-1002',
    username: '01819988776',
    email: 'tanvir.ahmed@yahoo.com',
    mobile: '01819988776',
    role: 'customer',
    customerId: 'WNK-1002',
    name: 'তানভীর আহমেদ',
    active: true,
    createdAt: '01-03-2025',
  },
  {
    id: 'USR-CUST-1003',
    username: '01912345678',
    email: 'nusrat.jahan@gmail.com',
    mobile: '01912345678',
    role: 'customer',
    customerId: 'WNK-1003',
    name: 'নুসরাত জাহান',
    active: true,
    createdAt: '10-06-2025',
  },
];

type Listener = () => void;

class Store {
  private listeners: Listener[] = [];

  private customers: Customer[] = INITIAL_CUSTOMERS;
  private packages: Package[] = INITIAL_PACKAGES;
  private invoices: Invoice[] = INITIAL_INVOICES;
  private payments: Payment[] = INITIAL_PAYMENTS;
  private paymentRequests: PaymentRequest[] = INITIAL_PAYMENT_REQUESTS;
  private employees: Employee[] = INITIAL_EMPLOYEES;
  private expenses: Expense[] = INITIAL_EXPENSES;
  private income: Income[] = INITIAL_INCOME;
  private complaints: Complaint[] = INITIAL_COMPLAINTS;
  private notifications: AppNotification[] = INITIAL_NOTIFICATIONS;
  private auditLogs: AuditLog[] = [
    {
      id: 'LOG-01',
      userId: 'USR-ADMIN',
      userName: 'Wink Admin',
      action: 'System Bootstrapped',
      details: 'Cloud Firestore database synchronized for WINK NETWORK ISP',
      timestamp: '08-11-2026 09:00',
    },
  ];
  private settings: CompanySettings = INITIAL_SETTINGS;
  private users: UserAccount[] = INITIAL_USERS;

  private unsubs: (() => void)[] = [];
  private isFirestoreSynced = false;

  constructor() {
    this.initPublicSync();
    this.initAuthSync();
  }

  // Always listen to publicly readable collections (packages & settings have 'allow read: if true')
  private initPublicSync() {
    try {
      // 1. Packages (Public)
      onSnapshot(
        collection(db, 'packages'),
        (snapshot) => {
          if (!snapshot.empty) {
            this.packages = snapshot.docs.map((doc) => doc.data() as Package);
            this.notify();
          }
        },
        (error) => handleFirestoreError(error, OperationType.LIST, 'packages')
      );

      // 2. Settings (Public)
      onSnapshot(
        collection(db, 'settings'),
        (snapshot) => {
          if (!snapshot.empty) {
            const companyDoc = snapshot.docs.find((d) => d.id === 'company');
            if (companyDoc) {
              this.settings = companyDoc.data() as CompanySettings;
              this.notify();
            }
          }
        },
        (error) => handleFirestoreError(error, OperationType.LIST, 'settings')
      );
    } catch (e) {
      console.warn('Public collections listener setup notice:', e);
    }
  }

  // React to Firebase Auth state before attaching protected collection listeners
  // As per skill guidelines: "Only attach onSnapshot listeners if auth is ready and user is authenticated."
  private initAuthSync() {
    onAuthStateChanged(auth, async (user) => {
      // Detach any existing protected listeners
      this.unsubs.forEach((unsub) => {
        try {
          unsub();
        } catch {}
      });
      this.unsubs = [];

      if (!user) {
        this.isFirestoreSynced = false;
        this.notify();
        return;
      }

      this.attachProtectedSync(user);
    });
  }

  private async attachProtectedSync(user: FirebaseUser) {
    try {
      const isEmailAdmin = user.email === 'mim230189@gmail.com';
      let userRole: 'admin' | 'employee' | 'customer' = isEmailAdmin ? 'admin' : 'customer';
      let assignedCustomerId: string | undefined;

      // Verify user document in Firestore to ensure role and customerId are authoritative
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const uData = userSnap.data() as UserAccount;
          if (isEmailAdmin) {
            userRole = 'admin';
          } else if (uData.role) {
            userRole = uData.role;
          }
          assignedCustomerId = uData.customerId;
        } else if (isEmailAdmin) {
          // Initialize canonical admin profile in users collection matching authenticated UID
          const adminDoc: UserAccount = {
            id: user.uid,
            username: 'admin',
            email: 'mim230189@gmail.com',
            mobile: '01700112233',
            role: 'admin',
            name: 'Wink Admin (ম্যানেজিং ডিরেক্টর)',
            active: true,
            createdAt: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
          };
          await setDoc(userDocRef, adminDoc);
        }
      } catch (err) {
        console.warn('Could not inspect user doc:', err);
      }

      if (userRole === 'admin') {
        // --- ADMIN SYNC: Full operational and management access ---
        // 1. Customers
        const unsubCustomers = onSnapshot(
          collection(db, 'customers'),
          (snapshot) => {
            if (!snapshot.empty) {
              this.customers = snapshot.docs.map((d) => d.data() as Customer);
              this.notify();
            } else {
              this.seedInitialData();
            }
          },
          (error) => handleFirestoreError(error, OperationType.LIST, 'customers')
        );
        this.unsubs.push(unsubCustomers);

        // 2. Invoices
        const unsubInvoices = onSnapshot(
          collection(db, 'invoices'),
          (snapshot) => {
            if (!snapshot.empty) {
              this.invoices = snapshot.docs.map((d) => d.data() as Invoice);
              this.notify();
            }
          },
          (error) => handleFirestoreError(error, OperationType.LIST, 'invoices')
        );
        this.unsubs.push(unsubInvoices);

        // 3. Payments
        const unsubPayments = onSnapshot(
          collection(db, 'payments'),
          (snapshot) => {
            if (!snapshot.empty) {
              this.payments = snapshot.docs.map((d) => d.data() as Payment);
              this.notify();
            }
          },
          (error) => handleFirestoreError(error, OperationType.LIST, 'payments')
        );
        this.unsubs.push(unsubPayments);

        // 4. Payment Requests
        const unsubPR = onSnapshot(
          collection(db, 'paymentRequests'),
          (snapshot) => {
            if (!snapshot.empty) {
              this.paymentRequests = snapshot.docs.map((d) => d.data() as PaymentRequest);
              this.notify();
            }
          },
          (error) => handleFirestoreError(error, OperationType.LIST, 'paymentRequests')
        );
        this.unsubs.push(unsubPR);

        // 5. Employees
        const unsubEmployees = onSnapshot(
          collection(db, 'employees'),
          (snapshot) => {
            if (!snapshot.empty) {
              this.employees = snapshot.docs.map((d) => d.data() as Employee);
              this.notify();
            }
          },
          (error) => handleFirestoreError(error, OperationType.LIST, 'employees')
        );
        this.unsubs.push(unsubEmployees);

        // 6. Expenses
        const unsubExpenses = onSnapshot(
          collection(db, 'expenses'),
          (snapshot) => {
            if (!snapshot.empty) {
              this.expenses = snapshot.docs.map((d) => d.data() as Expense);
              this.notify();
            }
          },
          (error) => handleFirestoreError(error, OperationType.LIST, 'expenses')
        );
        this.unsubs.push(unsubExpenses);

        // 7. Income
        const unsubIncome = onSnapshot(
          collection(db, 'income'),
          (snapshot) => {
            if (!snapshot.empty) {
              this.income = snapshot.docs.map((d) => d.data() as Income);
              this.notify();
            }
          },
          (error) => handleFirestoreError(error, OperationType.LIST, 'income')
        );
        this.unsubs.push(unsubIncome);

        // 8. Complaints
        const unsubComplaints = onSnapshot(
          collection(db, 'complaints'),
          (snapshot) => {
            if (!snapshot.empty) {
              this.complaints = snapshot.docs.map((d) => d.data() as Complaint);
              this.notify();
            }
          },
          (error) => handleFirestoreError(error, OperationType.LIST, 'complaints')
        );
        this.unsubs.push(unsubComplaints);

        // 9. Users
        const unsubUsers = onSnapshot(
          collection(db, 'users'),
          (snapshot) => {
            if (!snapshot.empty) {
              this.users = snapshot.docs.map((d) => d.data() as UserAccount);
              this.notify();
            }
          },
          (error) => handleFirestoreError(error, OperationType.LIST, 'users')
        );
        this.unsubs.push(unsubUsers);

        // 10. Audit Logs
        const unsubLogs = onSnapshot(
          collection(db, 'auditLogs'),
          (snapshot) => {
            if (!snapshot.empty) {
              this.auditLogs = snapshot.docs.map((d) => d.data() as AuditLog);
              this.notify();
            }
          },
          (error) => handleFirestoreError(error, OperationType.LIST, 'auditLogs')
        );
        this.unsubs.push(unsubLogs);

      } else if (userRole === 'employee') {
        // --- EMPLOYEE SYNC: Operational access, no expenses or system audit logs ---
        // 1. Customers
        const unsubCustomers = onSnapshot(
          collection(db, 'customers'),
          (snapshot) => {
            if (!snapshot.empty) {
              this.customers = snapshot.docs.map((d) => d.data() as Customer);
              this.notify();
            }
          },
          (error) => handleFirestoreError(error, OperationType.LIST, 'customers')
        );
        this.unsubs.push(unsubCustomers);

        // 2. Invoices
        const unsubInvoices = onSnapshot(
          collection(db, 'invoices'),
          (snapshot) => {
            if (!snapshot.empty) {
              this.invoices = snapshot.docs.map((d) => d.data() as Invoice);
              this.notify();
            }
          },
          (error) => handleFirestoreError(error, OperationType.LIST, 'invoices')
        );
        this.unsubs.push(unsubInvoices);

        // 3. Payments
        const unsubPayments = onSnapshot(
          collection(db, 'payments'),
          (snapshot) => {
            if (!snapshot.empty) {
              this.payments = snapshot.docs.map((d) => d.data() as Payment);
              this.notify();
            }
          },
          (error) => handleFirestoreError(error, OperationType.LIST, 'payments')
        );
        this.unsubs.push(unsubPayments);

        // 4. Payment Requests
        const unsubPR = onSnapshot(
          collection(db, 'paymentRequests'),
          (snapshot) => {
            if (!snapshot.empty) {
              this.paymentRequests = snapshot.docs.map((d) => d.data() as PaymentRequest);
              this.notify();
            }
          },
          (error) => handleFirestoreError(error, OperationType.LIST, 'paymentRequests')
        );
        this.unsubs.push(unsubPR);

        // 5. Employees
        const unsubEmployees = onSnapshot(
          collection(db, 'employees'),
          (snapshot) => {
            if (!snapshot.empty) {
              this.employees = snapshot.docs.map((d) => d.data() as Employee);
              this.notify();
            }
          },
          (error) => handleFirestoreError(error, OperationType.LIST, 'employees')
        );
        this.unsubs.push(unsubEmployees);

        // 6. Income
        const unsubIncome = onSnapshot(
          collection(db, 'income'),
          (snapshot) => {
            if (!snapshot.empty) {
              this.income = snapshot.docs.map((d) => d.data() as Income);
              this.notify();
            }
          },
          (error) => handleFirestoreError(error, OperationType.LIST, 'income')
        );
        this.unsubs.push(unsubIncome);

        // 7. Complaints
        const unsubComplaints = onSnapshot(
          collection(db, 'complaints'),
          (snapshot) => {
            if (!snapshot.empty) {
              this.complaints = snapshot.docs.map((d) => d.data() as Complaint);
              this.notify();
            }
          },
          (error) => handleFirestoreError(error, OperationType.LIST, 'complaints')
        );
        this.unsubs.push(unsubComplaints);

        // 8. Users
        const unsubUsers = onSnapshot(
          collection(db, 'users'),
          (snapshot) => {
            if (!snapshot.empty) {
              this.users = snapshot.docs.map((d) => d.data() as UserAccount);
              this.notify();
            }
          },
          (error) => handleFirestoreError(error, OperationType.LIST, 'users')
        );
        this.unsubs.push(unsubUsers);

      } else {
        // --- CUSTOMER SYNC: Strictly isolated to own billing and complaints ---
        const custId = assignedCustomerId;
        if (custId) {
          // 1. Own Customer Record
          const unsubCust = onSnapshot(
            doc(db, 'customers', custId),
            (docSnap) => {
              if (docSnap.exists()) {
                const cdata = docSnap.data() as Customer;
                const idx = this.customers.findIndex((c) => c.id === custId);
                if (idx >= 0) this.customers[idx] = cdata;
                else this.customers.push(cdata);
                this.notify();
              }
            },
            (error) => handleFirestoreError(error, OperationType.GET, `customers/${custId}`)
          );
          this.unsubs.push(unsubCust);

          // 2. Own Invoices only
          const qInvoices = query(collection(db, 'invoices'), where('customerId', '==', custId));
          const unsubInvoices = onSnapshot(
            qInvoices,
            (snapshot) => {
              if (!snapshot.empty) {
                this.invoices = snapshot.docs.map((d) => d.data() as Invoice);
                this.notify();
              }
            },
            (error) => handleFirestoreError(error, OperationType.LIST, 'invoices')
          );
          this.unsubs.push(unsubInvoices);

          // 3. Own Payments only
          const qPayments = query(collection(db, 'payments'), where('customerId', '==', custId));
          const unsubPayments = onSnapshot(
            qPayments,
            (snapshot) => {
              if (!snapshot.empty) {
                this.payments = snapshot.docs.map((d) => d.data() as Payment);
                this.notify();
              }
            },
            (error) => handleFirestoreError(error, OperationType.LIST, 'payments')
          );
          this.unsubs.push(unsubPayments);

          // 4. Own Payment Requests only
          const qPR = query(collection(db, 'paymentRequests'), where('customerId', '==', custId));
          const unsubPR = onSnapshot(
            qPR,
            (snapshot) => {
              if (!snapshot.empty) {
                this.paymentRequests = snapshot.docs.map((d) => d.data() as PaymentRequest);
                this.notify();
              }
            },
            (error) => handleFirestoreError(error, OperationType.LIST, 'paymentRequests')
          );
          this.unsubs.push(unsubPR);

          // 5. Own Complaints only
          const qComplaints = query(collection(db, 'complaints'), where('customerId', '==', custId));
          const unsubComplaints = onSnapshot(
            qComplaints,
            (snapshot) => {
              if (!snapshot.empty) {
                this.complaints = snapshot.docs.map((d) => d.data() as Complaint);
                this.notify();
              }
            },
            (error) => handleFirestoreError(error, OperationType.LIST, 'complaints')
          );
          this.unsubs.push(unsubComplaints);
        }

        // 6. Own User Profile
        const unsubUserDoc = onSnapshot(
          doc(db, 'users', user.uid),
          (docSnap) => {
            if (docSnap.exists()) {
              const udata = docSnap.data() as UserAccount;
              const idx = this.users.findIndex((u) => u.id === user.uid);
              if (idx >= 0) this.users[idx] = udata;
              else this.users.push(udata);
              this.notify();
            }
          },
          (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}`)
        );
        this.unsubs.push(unsubUserDoc);
      }

      this.isFirestoreSynced = true;
      this.notify();
    } catch (e) {
      console.warn('Protected listeners error:', e);
    }
  }

  // Seed default dataset into Cloud Firestore (Admin only)
  public async seedInitialData() {
    if (!auth.currentUser) {
      return;
    }
    try {
      const batch = writeBatch(db);

      // Customers
      INITIAL_CUSTOMERS.forEach((c) => {
        batch.set(doc(db, 'customers', c.id), c);
      });

      // Packages
      INITIAL_PACKAGES.forEach((p) => {
        batch.set(doc(db, 'packages', p.id), p);
      });

      // Invoices
      INITIAL_INVOICES.forEach((i) => {
        batch.set(doc(db, 'invoices', i.id), i);
      });

      // Payments
      INITIAL_PAYMENTS.forEach((p) => {
        batch.set(doc(db, 'payments', p.id), p);
      });

      // Payment Requests
      INITIAL_PAYMENT_REQUESTS.forEach((pr) => {
        batch.set(doc(db, 'paymentRequests', pr.id), pr);
      });

      // Employees
      INITIAL_EMPLOYEES.forEach((e) => {
        batch.set(doc(db, 'employees', e.id), e);
      });

      // Expenses
      INITIAL_EXPENSES.forEach((exp) => {
        batch.set(doc(db, 'expenses', exp.id), exp);
      });

      // Income
      INITIAL_INCOME.forEach((inc) => {
        batch.set(doc(db, 'income', inc.id), inc);
      });

      // Complaints
      INITIAL_COMPLAINTS.forEach((c) => {
        batch.set(doc(db, 'complaints', c.id), c);
      });

      // Notifications
      INITIAL_NOTIFICATIONS.forEach((n) => {
        batch.set(doc(db, 'notifications', n.id), n);
      });

      // Users: map admin to auth.currentUser.uid so the admin doc ID strictly matches the Firebase UID
      INITIAL_USERS.forEach((u) => {
        const docId = (u.role === 'admin' && auth.currentUser) ? auth.currentUser.uid : u.id;
        const userToSave = { ...u, id: docId };
        batch.set(doc(db, 'users', docId), userToSave);
      });

      // Settings
      batch.set(doc(db, 'settings', 'company'), INITIAL_SETTINGS);

      // Audit Log
      batch.set(doc(db, 'auditLogs', 'LOG-INIT'), {
        id: 'LOG-INIT',
        userId: 'SYSTEM',
        userName: 'Wink Cloud Engine',
        action: 'Database Initialized',
        details: 'Initial ISP production dataset seeded into Cloud Firestore',
        timestamp: '08-11-2026 09:00',
      });

      await batch.commit();
      console.log('Cloud Firestore initialized with production seed data successfully.');
    } catch (err) {
      console.warn('Initial seeding note (may already exist or batch committed):', err);
    }
  }

  public subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // --- Customers ---
  getCustomers(): Customer[] {
    return [...this.customers];
  }

  getCustomer(id: string): Customer | undefined {
    return this.customers.find((c) => c.id === id);
  }

  async saveCustomer(customerData: Omit<Customer, 'id' | 'balance'> & { id?: string }): Promise<Customer> {
    let customer: Customer;
    if (customerData.id && this.customers.some((c) => c.id === customerData.id)) {
      const existing = this.customers.find((c) => c.id === customerData.id)!;
      customer = { ...existing, ...customerData };
      this.customers = this.customers.map((c) => (c.id === customer.id ? customer : c));
    } else {
      const nextNum = 1000 + this.customers.length + 1;
      const newId = `WNK-${nextNum}`;
      customer = {
        ...customerData,
        id: newId,
        balance: 0,
        portalEnabled: customerData.portalEnabled ?? true,
      };
      this.customers.unshift(customer);

      // Create portal user account
      const newUser: UserAccount = {
        id: `USR-${newId}`,
        username: customer.mobile,
        email: customer.email || `${customer.username || newId.toLowerCase()}@winkisp.com`,
        mobile: customer.mobile,
        role: 'customer',
        name: customer.name,
        customerId: newId,
        active: true,
        createdAt: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      };
      this.users.push(newUser);
      if (auth.currentUser) {
        try {
          await setDoc(doc(db, 'users', newUser.id), newUser);
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, `users/${newUser.id}`);
        }
      }
    }

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'customers', customer.id), customer);
        this.logAudit('USR-CURR', 'Admin/Staff', 'Customer Saved', `Saved customer ${customer.name} (${customer.id})`);
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `customers/${customer.id}`);
      }
    }

    this.notify();
    return customer;
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const cust = this.customers.find((c) => c.id === id);
    if (!cust) return false;

    this.customers = this.customers.filter((c) => c.id !== id);
    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'customers', id));
        this.logAudit('USR-CURR', 'Admin', 'Customer Removed', `Customer ${cust.name} (${id}) removed from database`);
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `customers/${id}`);
      }
    }

    this.notify();
    return true;
  }

  async updateCustomerStatus(id: string, status: 'active' | 'inactive' | 'suspended'): Promise<boolean> {
    const cust = this.customers.find((c) => c.id === id);
    if (!cust) return false;
    cust.status = status;
    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'customers', id), { status });
        this.logAudit('USR-CURR', 'Admin', 'Customer Status Changed', `Customer ${cust.name} status changed to ${status}`);
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `customers/${id}`);
      }
    }
    this.notify();
    return true;
  }

  // --- Packages ---
  getPackages(): Package[] {
    return [...this.packages];
  }

  async savePackage(pkgData: Package): Promise<void> {
    const idx = this.packages.findIndex((p) => p.id === pkgData.id);
    if (idx >= 0) {
      this.packages[idx] = pkgData;
    } else {
      this.packages.push(pkgData);
    }
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'packages', pkgData.id), pkgData);
        this.logAudit('USR-ADMIN', 'Admin', 'Package Saved', `Package ${pkgData.name} (${pkgData.speed}) ৳${pkgData.price}`);
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `packages/${pkgData.id}`);
      }
    }
    this.notify();
  }

  async deletePackage(id: string): Promise<void> {
    this.packages = this.packages.filter((p) => p.id !== id);
    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'packages', id));
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `packages/${id}`);
      }
    }
    this.notify();
  }

  // --- Invoices & Monthly Billing Engine ---
  getInvoices(): Invoice[] {
    return [...this.invoices];
  }

  getInvoicesByCustomer(customerId: string): Invoice[] {
    return this.invoices.filter((inv) => inv.customerId === customerId);
  }

  async generateMonthlyBills(
    monthKey: string,
    monthName: string,
    dueDate: string,
    issuedBy = 'Admin/Scheduler'
  ): Promise<{ generated: number; skipped: number }> {
    let generated = 0;
    let skipped = 0;
    const today = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    const activeCustomers = this.customers.filter((c) => c.status === 'active');

    for (const cust of activeCustomers) {
      const alreadyExists = this.invoices.some(
        (inv) => inv.customerId === cust.id && inv.billingMonthKey === monthKey && inv.status !== 'cancelled'
      );
      if (alreadyExists) {
        skipped++;
        continue;
      }

      const previousDue = cust.balance < 0 ? Math.abs(cust.balance) : 0;
      const currentBill = cust.monthlyBill;
      const totalPayable = currentBill + previousDue;
      const invoiceId = `INV-${monthKey.replace('-', '')}-${cust.id.replace('WNK-', '')}`;

      const newInvoice: Invoice = {
        id: invoiceId,
        customerId: cust.id,
        customerName: cust.name,
        customerMobile: cust.mobile,
        billingMonth: monthName,
        billingMonthKey: monthKey,
        packageId: cust.packageId,
        packageName: cust.packageName,
        previousDue,
        currentBill,
        discount: 0,
        additionalCharges: 0,
        totalPayable,
        amountPaid: 0,
        remainingBalance: totalPayable,
        status: 'unpaid',
        billingDate: today,
        dueDate,
        createdAt: today,
      };

      this.invoices.unshift(newInvoice);
      cust.balance = -(previousDue + currentBill);

      if (auth.currentUser) {
        try {
          await setDoc(doc(db, 'invoices', newInvoice.id), newInvoice);
          await updateDoc(doc(db, 'customers', cust.id), { balance: cust.balance });
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, `invoices/${newInvoice.id}`);
        }
      }

      generated++;
    }

    this.logAudit('SYSTEM', issuedBy, 'Monthly Billing Engine', `Generated ${generated} bills for ${monthName}.`);
    this.addNotification({
      recipientRole: 'all',
      title: `${monthName} মাসের বিল প্রস্তুত`,
      message: `${generated} জন সক্রিয় গ্রাহকের জন্য মাসিক বিল তৈরি করা হয়েছে। শেষ সময়: ${dueDate}।`,
      type: 'bill',
    });

    this.notify();
    return { generated, skipped };
  }

  // --- Payments & Financial Ledgers ---
  getPayments(): Payment[] {
    return [...this.payments];
  }

  async recordPayment(data: {
    customerId: string;
    invoiceId: string;
    amount: number;
    method: 'Cash' | 'bKash' | 'Nagad' | 'Rocket' | 'Bank Transfer' | 'Other';
    transactionId: string;
    paymentDate: string;
    collectedBy: string;
    collectedByRole: 'admin' | 'employee' | 'customer_gateway';
    notes?: string;
  }): Promise<{ payment: Payment; invoice?: Invoice }> {
    const today = data.paymentDate || new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    const paymentId = `PAY-${Date.now().toString().slice(-8)}`;
    const receiptNum = `REC-${Math.floor(1000 + Math.random() * 9000)}`;

    const cust = this.customers.find((c) => c.id === data.customerId);
    const invoice = this.invoices.find((i) => i.id === data.invoiceId);

    const payment: Payment = {
      id: paymentId,
      customerId: data.customerId,
      customerName: cust?.name || 'Customer',
      invoiceId: data.invoiceId,
      amount: data.amount,
      method: data.method,
      transactionId: data.transactionId,
      paymentDate: today,
      collectedBy: data.collectedBy,
      collectedByRole: data.collectedByRole,
      receiptNumber: receiptNum,
      notes: data.notes,
    };

    this.payments.unshift(payment);

    // Update Invoice
    if (invoice) {
      invoice.amountPaid += data.amount;
      invoice.remainingBalance = Math.max(0, invoice.totalPayable - invoice.amountPaid);
      invoice.status = invoice.remainingBalance <= 0 ? 'paid' : 'partially_paid';
      if (auth.currentUser) {
        try {
          await updateDoc(doc(db, 'invoices', invoice.id), {
            amountPaid: invoice.amountPaid,
            remainingBalance: invoice.remainingBalance,
            status: invoice.status,
          });
        } catch (e) {
          handleFirestoreError(e, OperationType.UPDATE, `invoices/${invoice.id}`);
        }
      }
    }

    // Update Customer Balance
    if (cust) {
      cust.balance += data.amount;
      if (auth.currentUser) {
        try {
          await updateDoc(doc(db, 'customers', cust.id), { balance: cust.balance });
        } catch (e) {
          handleFirestoreError(e, OperationType.UPDATE, `customers/${cust.id}`);
        }
      }
    }

    // Persist Payment
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'payments', payment.id), payment);
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `payments/${payment.id}`);
      }
    }

    // Record Income
    this.addIncome({
      category: 'Monthly Bill Collection',
      amount: data.amount,
      date: today,
      description: `বিল কালেকশন - ${cust?.name} (${cust?.id}), রসিদ: ${receiptNum}, মেথড: ${data.method}`,
      recordedBy: data.collectedBy,
      relatedInvoiceId: data.invoiceId,
    });

    this.logAudit(
      data.collectedBy,
      data.collectedBy,
      'Payment Recorded',
      `Payment of ৳${data.amount} received from ${cust?.name} (${cust?.id}) via ${data.method}`
    );

    this.addNotification({
      recipientRole: 'customer',
      recipientCustomerId: data.customerId,
      title: 'পেমেন্ট রসিদ প্রাপ্তি নিশ্চিত',
      message: `আপনার ৳${data.amount} টাকা পেমেন্ট সফলভাবে সম্পন্ন হয়েছে। রসিদ নং: ${receiptNum}`,
      type: 'payment',
    });

    this.notify();
    return { payment, invoice };
  }

  async reversePayment(paymentId: string, reason: string, reviewer = 'Admin'): Promise<boolean> {
    const payment = this.payments.find((p) => p.id === paymentId);
    if (!payment || payment.isReversed) return false;

    payment.isReversed = true;
    payment.reversedAt = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    payment.reversedReason = reason;

    const invoice = this.invoices.find((i) => i.id === payment.invoiceId);
    if (invoice) {
      invoice.amountPaid = Math.max(0, invoice.amountPaid - payment.amount);
      invoice.remainingBalance = invoice.totalPayable - invoice.amountPaid;
      invoice.status = invoice.amountPaid === 0 ? 'unpaid' : 'partially_paid';
      if (auth.currentUser) {
        try {
          await updateDoc(doc(db, 'invoices', invoice.id), {
            amountPaid: invoice.amountPaid,
            remainingBalance: invoice.remainingBalance,
            status: invoice.status,
          });
        } catch (e) {
          handleFirestoreError(e, OperationType.UPDATE, `invoices/${invoice.id}`);
        }
      }
    }

    const cust = this.customers.find((c) => c.id === payment.customerId);
    if (cust) {
      cust.balance -= payment.amount;
      if (auth.currentUser) {
        try {
          await updateDoc(doc(db, 'customers', cust.id), { balance: cust.balance });
        } catch (e) {
          handleFirestoreError(e, OperationType.UPDATE, `customers/${cust.id}`);
        }
      }
    }

    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'payments', paymentId), {
          isReversed: true,
          reversedAt: payment.reversedAt,
          reversedReason: reason,
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `payments/${paymentId}`);
      }
    }

    this.logAudit(reviewer, reviewer, 'Payment Reversed', `Reversed payment ${paymentId} of ৳${payment.amount}`);
    this.notify();
    return true;
  }

  // --- Payment Requests ---
  getPaymentRequests(): PaymentRequest[] {
    return [...this.paymentRequests];
  }

  async submitPaymentRequest(req: Omit<PaymentRequest, 'id' | 'status' | 'submittedAt'>): Promise<PaymentRequest> {
    const newReq: PaymentRequest = {
      ...req,
      id: `PR-${Date.now().toString().slice(-6)}`,
      status: 'pending',
      submittedAt:
        new Date().toLocaleDateString('en-GB') +
        ' ' +
        new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    };

    this.paymentRequests.unshift(newReq);
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'paymentRequests', newReq.id), newReq);
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `paymentRequests/${newReq.id}`);
      }
    }

    this.addNotification({
      recipientRole: 'admin',
      title: 'নতুন পেমেন্ট রিকোয়েস্ট',
      message: `${req.customerName} (${req.customerId}) ${req.method} মারফত ৳${req.amount} এর পেমেন্ট তথ্য পাঠিয়েছেন।`,
      type: 'payment',
    });

    this.notify();
    return newReq;
  }

  async approvePaymentRequest(requestId: string, adminName: string, adminNote = ''): Promise<boolean> {
    const req = this.paymentRequests.find((r) => r.id === requestId);
    if (!req || req.status !== 'pending') return false;

    await this.recordPayment({
      customerId: req.customerId,
      invoiceId: req.invoiceId,
      amount: req.amount,
      method: req.method,
      transactionId: req.transactionId,
      paymentDate: req.paymentDate,
      collectedBy: adminName,
      collectedByRole: 'admin',
      notes: `Verified from Customer Request: ${adminNote}`,
    });

    req.status = 'approved';
    req.reviewedBy = adminName;
    req.reviewedAt = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    req.adminNote = adminNote;

    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'paymentRequests', requestId), {
          status: 'approved',
          reviewedBy: adminName,
          reviewedAt: req.reviewedAt,
          adminNote,
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `paymentRequests/${requestId}`);
      }
    }

    this.notify();
    return true;
  }

  async rejectPaymentRequest(requestId: string, adminName: string, reason: string): Promise<boolean> {
    const req = this.paymentRequests.find((r) => r.id === requestId);
    if (!req || req.status !== 'pending') return false;

    req.status = 'rejected';
    req.reviewedBy = adminName;
    req.reviewedAt = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    req.adminNote = reason;

    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'paymentRequests', requestId), {
          status: 'rejected',
          reviewedBy: adminName,
          reviewedAt: req.reviewedAt,
          adminNote: reason,
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `paymentRequests/${requestId}`);
      }
    }

    this.notify();
    return true;
  }

  // --- Employees ---
  getEmployees(): Employee[] {
    return [...this.employees];
  }

  async saveEmployee(empData: Employee): Promise<void> {
    const idx = this.employees.findIndex((e) => e.id === empData.id);
    if (idx >= 0) {
      this.employees[idx] = empData;
    } else {
      this.employees.push(empData);
      const newUser: UserAccount = {
        id: `USR-${empData.id}`,
        username: empData.email.split('@')[0],
        email: empData.email,
        mobile: empData.mobile,
        role: 'employee',
        employeeId: empData.id,
        name: empData.name,
        active: true,
        createdAt: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      };
      this.users.push(newUser);
      if (auth.currentUser) {
        try {
          await setDoc(doc(db, 'users', newUser.id), newUser);
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, `users/${newUser.id}`);
        }
      }
    }

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'employees', empData.id), empData);
        this.logAudit('USR-ADMIN', 'Admin', 'Employee Saved', `Saved employee ${empData.name}`);
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `employees/${empData.id}`);
      }
    }

    this.notify();
  }

  async deleteEmployee(id: string): Promise<void> {
    this.employees = this.employees.filter((e) => e.id !== id);
    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'employees', id));
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `employees/${id}`);
      }
    }
    this.notify();
  }

  // --- Expenses & Income ---
  getExpenses(): Expense[] {
    return [...this.expenses];
  }

  async addExpense(exp: Omit<Expense, 'id'>): Promise<Expense> {
    const newExp: Expense = {
      ...exp,
      id: `EXP-${Date.now().toString().slice(-6)}`,
    };
    this.expenses.unshift(newExp);
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'expenses', newExp.id), newExp);
        this.logAudit(exp.recordedBy, exp.recordedBy, 'Expense Added', `৳${exp.amount} for ${exp.category}`);
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `expenses/${newExp.id}`);
      }
    }
    this.notify();
    return newExp;
  }

  async deleteExpense(id: string): Promise<void> {
    this.expenses = this.expenses.filter((e) => e.id !== id);
    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'expenses', id));
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `expenses/${id}`);
      }
    }
    this.notify();
  }

  getIncome(): Income[] {
    return [...this.income];
  }

  async addIncome(inc: Omit<Income, 'id'>): Promise<Income> {
    const newInc: Income = {
      ...inc,
      id: `INC-${Date.now().toString().slice(-6)}`,
    };
    this.income.unshift(newInc);
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'income', newInc.id), newInc);
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `income/${newInc.id}`);
      }
    }
    this.notify();
    return newInc;
  }

  // --- Complaints ---
  getComplaints(): Complaint[] {
    return [...this.complaints];
  }

  async createComplaint(data: Omit<Complaint, 'id' | 'status' | 'createdAt'>): Promise<Complaint> {
    const now = new Date();
    const createdStr = `${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
    const newComplaint: Complaint = {
      ...data,
      id: `TKT-${Math.floor(100 + Math.random() * 900)}`,
      status: 'pending',
      createdAt: createdStr,
    };
    this.complaints.unshift(newComplaint);

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'complaints', newComplaint.id), newComplaint);
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `complaints/${newComplaint.id}`);
      }
    }

    this.addNotification({
      recipientRole: 'admin',
      title: 'নতুন সাপোর্ট টিকিট/অভিযোগ',
      message: `${data.customerName} (${data.customerId}): "${data.subject}"`,
      type: 'complaint',
    });

    this.notify();
    return newComplaint;
  }

  async updateComplaint(
    id: string,
    updates: {
      status?: 'pending' | 'in_progress' | 'resolved' | 'closed';
      adminReply?: string;
      assignedTo?: string;
    }
  ): Promise<void> {
    const comp = this.complaints.find((c) => c.id === id);
    if (!comp) return;

    if (updates.status) comp.status = updates.status;
    if (updates.adminReply !== undefined) comp.adminReply = updates.adminReply;
    if (updates.assignedTo !== undefined) comp.assignedTo = updates.assignedTo;
    if (updates.status === 'resolved' && !comp.resolvedAt) {
      comp.resolvedAt =
        new Date().toLocaleDateString('en-GB') +
        ' ' +
        new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    }

    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'complaints', id), updates);
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `complaints/${id}`);
      }
    }

    this.notify();
  }

  // --- Notifications ---
  getNotifications(): AppNotification[] {
    return [...this.notifications];
  }

  async addNotification(notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): Promise<void> {
    const newNotif: AppNotification = {
      ...notif,
      id: `NOTIF-${Date.now().toString().slice(-6)}`,
      createdAt:
        new Date().toLocaleDateString('en-GB') +
        ' ' +
        new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    this.notifications.unshift(newNotif);
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'notifications', newNotif.id), newNotif);
      } catch (e) {
        // Non-blocking notification
      }
    }
    this.notify();
  }

  async markNotificationRead(id: string): Promise<void> {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      if (auth.currentUser) {
        try {
          await updateDoc(doc(db, 'notifications', id), { read: true });
        } catch (e) {}
      }
      this.notify();
    }
  }

  async markAllNotificationsRead(): Promise<void> {
    this.notifications.forEach((n) => (n.read = true));
    this.notify();
  }

  // --- Audit Logs ---
  getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  async logAudit(userId: string, userName: string, action: string, details: string): Promise<void> {
    const newLog: AuditLog = {
      id: `LOG-${Date.now().toString().slice(-6)}`,
      userId,
      userName,
      action,
      details,
      timestamp:
        new Date().toLocaleDateString('en-GB') +
        ' ' +
        new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    };
    this.auditLogs.unshift(newLog);
    if (this.auditLogs.length > 500) this.auditLogs.pop();

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'auditLogs', newLog.id), newLog);
      } catch (e) {
        // Append-only audit logging
      }
    }
    this.notify();
  }

  // --- Company Settings ---
  getSettings(): CompanySettings {
    return { ...this.settings };
  }

  async updateSettings(newSettings: Partial<CompanySettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'settings', 'company'), this.settings);
        this.logAudit('USR-ADMIN', 'Admin', 'Settings Updated', 'Company billing settings modified in Firestore');
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, 'settings/company');
      }
    }
    this.notify();
  }

  // --- Users ---
  getUsers(): UserAccount[] {
    return [...this.users];
  }

  async saveUser(user: UserAccount): Promise<void> {
    const idx = this.users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      this.users[idx] = user;
    } else {
      this.users.push(user);
    }
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'users', user.id), user);
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `users/${user.id}`);
      }
    }
    this.notify();
  }

  async resetDatabase(): Promise<void> {
    await this.seedInitialData();
    this.notify();
  }
}

export const store = new Store();
