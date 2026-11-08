export type UserRole = 'admin' | 'employee' | 'customer';

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  mobile: string;
  role: UserRole;
  name: string;
  customerId?: string;
  employeeId?: string;
  active: boolean;
  createdAt: string;
}

export interface Customer {
  id: string; // e.g., 'WNK-1001'
  name: string;
  mobile: string;
  altMobile?: string;
  address: string;
  connectionDate: string; // DD-MM-YYYY
  packageId: string;
  packageName: string;
  monthlyBill: number;
  status: 'active' | 'inactive' | 'suspended';
  username: string;
  email?: string;
  notes?: string;
  balance: number; // Positive = credit advance, negative = due
  portalEnabled: boolean;
  zone?: string;
}

export interface Package {
  id: string;
  name: string;
  speed: string; // e.g. '20 Mbps'
  price: number; // ৳ BDT
  description: string;
  active: boolean;
  features?: string[];
}

export interface Invoice {
  id: string; // e.g., 'INV-202611-1001'
  customerId: string;
  customerName: string;
  customerMobile: string;
  billingMonth: string; // e.g. 'November 2026' or 'নভেম্বর ২০২৬'
  billingMonthKey: string; // '2026-11'
  packageId: string;
  packageName: string;
  previousDue: number;
  currentBill: number;
  discount: number;
  additionalCharges: number;
  totalPayable: number;
  amountPaid: number;
  remainingBalance: number;
  status: 'paid' | 'unpaid' | 'partially_paid' | 'overdue' | 'cancelled';
  billingDate: string; // DD-MM-YYYY
  dueDate: string; // DD-MM-YYYY
  createdAt: string;
}

export interface Payment {
  id: string; // e.g., 'PAY-20261108-01'
  customerId: string;
  customerName: string;
  invoiceId: string;
  amount: number;
  method: 'Cash' | 'bKash' | 'Nagad' | 'Rocket' | 'Bank Transfer' | 'Other';
  transactionId: string;
  paymentDate: string; // DD-MM-YYYY
  collectedBy: string;
  collectedByRole: 'admin' | 'employee' | 'customer_gateway';
  receiptNumber: string;
  notes?: string;
  isReversed?: boolean;
  reversedAt?: string;
  reversedReason?: string;
}

export interface PaymentRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  invoiceId: string;
  amount: number;
  method: 'bKash' | 'Nagad' | 'Rocket' | 'Bank Transfer';
  transactionId: string;
  paymentDate: string;
  screenshotUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  adminNote?: string;
}

export interface Employee {
  id: string;
  name: string;
  mobile: string;
  email: string;
  designation: string;
  joinedDate: string;
  status: 'active' | 'inactive';
  permissions: {
    canAddCustomer: boolean;
    canCollectPayment: boolean;
    canGenerateInvoice: boolean;
    canResolveComplaints: boolean;
    canViewReports: boolean;
  };
  totalCollected: number;
}

export interface Income {
  id: string;
  category: 'Monthly Bill Collection' | 'New Connection Fee' | 'Installation Charge' | 'Equipment Sale' | 'Other Income';
  amount: number;
  date: string; // DD-MM-YYYY
  description: string;
  recordedBy: string;
  relatedInvoiceId?: string;
}

export interface Expense {
  id: string;
  category: 'Bandwidth Costs' | 'Office Rent' | 'Employee Salaries' | 'Electricity & Utility' | 'Equipment Purchases' | 'Fiber & Maintenance' | 'Other Expenses';
  amount: number;
  date: string; // DD-MM-YYYY
  description: string;
  recordedBy: string;
}

export interface Complaint {
  id: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  subject: string;
  category: 'Slow Internet' | 'No Internet' | 'Optical Fiber Cut' | 'Router Issue' | 'Billing Inquiry' | 'Package Upgrade' | 'Other';
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  adminReply?: string;
  resolvedAt?: string;
  assignedTo?: string;
}

export interface AppNotification {
  id: string;
  recipientRole: 'all' | 'admin' | 'employee' | 'customer';
  recipientCustomerId?: string;
  title: string;
  message: string;
  type: 'bill' | 'payment' | 'complaint' | 'system';
  createdAt: string;
  read: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface CompanySettings {
  companyName: string;
  tagline: string;
  address: string;
  contactNumber: string;
  supportNumber: string;
  whatsappNumber: string;
  email: string;
  invoicePrefix: string;
  billingCycleDay: number;
  dueDays: number;
  currency: string;
  bkashMerchant: string;
  nagadMerchant: string;
  rocketMerchant: string;
  bankDetails: string;
  firebaseConfig?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  firebaseConnected: boolean;
}
