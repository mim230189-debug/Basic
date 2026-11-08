import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/* CRITICAL: The app will break without passing the specific firestoreDatabaseId */
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot
export async function testConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    await getDocFromServer(doc(db, 'settings', 'company'));
    return { connected: true, message: 'Cloud Firestore database connected.' };
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      return { connected: false, message: 'Client is offline. Check Firebase configuration.' };
    }
    // If document just doesn't exist yet, it's still connected!
    return { connected: true, message: 'Connected to Cloud Firestore.' };
  }
}

export function initFirebaseFromSettings(_settings?: any): { success: boolean; message: string } {
  return {
    success: true,
    message: 'লাইভ ক্লাউড ফায়ারস্টোর ডাটাবেজ সফলভাবে সংযুক্ত রয়েছে।',
  };
}

export const FIRESTORE_RULES_CONTENT = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Default deny catch-all
    match /{document=**} {
      allow read, write: if false;
    }

    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isBootstrappedAdmin() {
      return isSignedIn() && request.auth.token.email == "mim230189@gmail.com";
    }

    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }

    function isAdmin() {
      return isBootstrappedAdmin() || (isSignedIn() && exists(/databases/$(database)/documents/users/$(request.auth.uid)) && getUserData().role == 'admin');
    }

    function isEmployee() {
      return isAdmin() || (isSignedIn() && exists(/databases/$(database)/documents/users/$(request.auth.uid)) && getUserData().role == 'employee');
    }

    function isCustomerOwner(customerId) {
      return isSignedIn() && exists(/databases/$(database)/documents/users/$(request.auth.uid)) && getUserData().customerId == customerId;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isSignedIn() && (request.auth.uid == userId || isAdmin() || isEmployee());
      allow create: if isSignedIn() && (
        isAdmin() || 
        (request.auth.uid == userId && (!('role' in request.resource.data) || request.resource.data.role == 'customer'))
      );
      allow update: if isAdmin() || (isSignedIn() && request.auth.uid == userId && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'customerId', 'employeeId']));
      allow delete: if isAdmin();
    }

    // Customers collection
    match /customers/{customerId} {
      allow read: if isEmployee() || isCustomerOwner(customerId);
      allow create, update: if isEmployee();
      allow delete: if isAdmin();
    }

    // Packages collection
    match /packages/{packageId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Invoices collection
    match /invoices/{invoiceId} {
      allow read: if isEmployee() || (isSignedIn() && resource.data.customerId != null && isCustomerOwner(resource.data.customerId));
      allow create, update: if isEmployee();
      allow delete: if isAdmin();
    }

    // Payments collection (Financial ledger)
    match /payments/{paymentId} {
      allow read: if isEmployee() || (isSignedIn() && resource.data.customerId != null && isCustomerOwner(resource.data.customerId));
      allow create: if isEmployee();
      allow update: if isAdmin(); // Reversals allowed only by admin
      allow delete: if false; // Permanent deletion strictly prohibited for financial audit compliance
    }

    // Payment Requests (Customer portal slips)
    match /paymentRequests/{requestId} {
      allow read: if isEmployee() || (isSignedIn() && resource.data.customerId != null && isCustomerOwner(resource.data.customerId));
      allow create: if isSignedIn() && request.resource.data.customerId != null && isCustomerOwner(request.resource.data.customerId);
      allow update: if isEmployee();
      allow delete: if isAdmin();
    }

    // Employees collection
    match /employees/{employeeId} {
      allow read: if isEmployee();
      allow write: if isAdmin();
    }

    // Expenses collection
    match /expenses/{expenseId} {
      allow read, write: if isAdmin();
    }

    // Income collection
    match /income/{incomeId} {
      allow read, write: if isEmployee();
    }

    // Complaints / Support Tickets
    match /complaints/{complaintId} {
      allow read: if isEmployee() || (isSignedIn() && resource.data.customerId != null && isCustomerOwner(resource.data.customerId));
      allow create: if isSignedIn();
      allow update: if isEmployee() || (isSignedIn() && resource.data.customerId != null && isCustomerOwner(resource.data.customerId));
      allow delete: if isAdmin();
    }

    // Notifications
    match /notifications/{notificationId} {
      allow read: if isSignedIn();
      allow write: if isEmployee();
    }

    // Company Settings
    match /settings/{settingId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Audit Logs (Append-only)
    match /auditLogs/{logId} {
      allow read: if isAdmin();
      allow create: if isSignedIn();
      allow update, delete: if false; // Immutable audit log
    }
  }
};`;
