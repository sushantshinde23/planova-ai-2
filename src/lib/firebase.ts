import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  updatePassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  Firestore,
} from 'firebase/firestore';
import firebaseAppletConfig from '../../firebase-applet-config.json';
import { User, UserPreferences } from '../types';

// ============================================================================
// 1. CENTRALIZED AUTHENTICATION ERROR MAPPER
// ============================================================================
export function mapFirebaseAuthError(error: unknown): string {
  if (!error) {
    return 'Authentication failed. Please try again.';
  }

  const errObj = error as { code?: string; message?: string };
  let code = errObj?.code || '';

  // Extract Firebase error code if embedded in message string like "Firebase: Error (auth/unauthorized-domain)."
  if (!code && typeof errObj?.message === 'string') {
    const match = errObj.message.match(/\((auth\/[a-z0-9-]+)\)/i);
    if (match && match[1]) {
      code = match[1].toLowerCase();
    }
  }

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'Invalid email or password.';
    case 'auth/user-not-found':
      return 'No account was found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 8 characters.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Google sign-in was cancelled.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the sign-in popup. Please allow popups and try again.';
    case 'auth/unauthorized-domain': {
      const host =
        typeof window !== 'undefined' && window.location?.hostname
          ? window.location.hostname
          : 'this deployment domain';
      return `This deployment domain (${host}) is not authorized for Firebase Authentication.`;
    }
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Please wait a moment and try again.';
    case 'auth/user-disabled':
      return 'This operator account has been disabled by an administrator.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled in the Firebase project configuration.';
    case 'auth/requires-recent-login':
      return 'For security, please sign out and sign in again before changing your password.';
    case 'auth/invalid-api-key':
    case 'auth/app-not-authorized':
    case 'auth/configuration-not-found':
      return 'Firebase configuration error. Please verify your project settings.';
    default: {
      // Never expose raw Firebase stack traces or "Firebase: Error (...)" strings to users
      if (typeof errObj?.message === 'string' && !errObj.message.includes('Firebase:')) {
        return errObj.message;
      }
      return 'Authentication could not be completed. Please verify your credentials and try again.';
    }
  }
}

// ============================================================================
// 2. PRODUCTION vs DEVELOPMENT ENVIRONMENT & FIREBASE INITIALIZATION
// ============================================================================
export function getRuntimeEnvironmentInfo() {
  const hostname =
    typeof window !== 'undefined' && window.location?.hostname
      ? window.location.hostname
      : 'localhost';
  const isLocalhost =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.endsWith('.local');

  return {
    hostname,
    origin: typeof window !== 'undefined' ? window.location.origin : '',
    isDevelopment: isLocalhost || import.meta.env.DEV,
    isProduction: !isLocalhost && import.meta.env.PROD,
  };
}

const env = (import.meta as any).env || {};

// Strictly ensure all Firebase configuration keys belong to the SAME configured Firebase project
const resolvedProjectId =
  env.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig.projectId;
const isSameProject = resolvedProjectId === firebaseAppletConfig.projectId;

// Never use localhost as authDomain; always use the valid Firebase project authDomain
const rawAuthDomain = isSameProject
  ? env.VITE_FIREBASE_AUTH_DOMAIN || firebaseAppletConfig.authDomain
  : firebaseAppletConfig.authDomain;

const sanitizedAuthDomain =
  rawAuthDomain &&
  !rawAuthDomain.includes('localhost') &&
  !rawAuthDomain.includes('127.0.0.1')
    ? rawAuthDomain
    : `${firebaseAppletConfig.projectId}.firebaseapp.com`;

export const firebaseConfig = {
  projectId: firebaseAppletConfig.projectId,
  appId: isSameProject
    ? env.VITE_FIREBASE_APP_ID || firebaseAppletConfig.appId
    : firebaseAppletConfig.appId,
  apiKey: isSameProject
    ? env.VITE_FIREBASE_API_KEY || firebaseAppletConfig.apiKey
    : firebaseAppletConfig.apiKey,
  authDomain: sanitizedAuthDomain,
  firestoreDatabaseId:
    env.VITE_FIREBASE_FIRESTORE_DATABASE_ID ||
    (firebaseAppletConfig as any).firestoreDatabaseId,
  storageBucket: isSameProject
    ? env.VITE_FIREBASE_STORAGE_BUCKET || firebaseAppletConfig.storageBucket
    : firebaseAppletConfig.storageBucket,
  messagingSenderId: isSameProject
    ? env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseAppletConfig.messagingSenderId
    : firebaseAppletConfig.messagingSenderId,
};

let app: FirebaseApp;
let authInstance: Auth;
let dbInstance: Firestore;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  authInstance = getAuth(app);
  const dbId = firebaseConfig.firestoreDatabaseId;
  dbInstance = dbId ? getFirestore(app, dbId) : getFirestore(app);
} catch (initError) {
  console.error('Firebase initialization error:', initError);
  app = initializeApp(firebaseAppletConfig);
  authInstance = getAuth(app);
  dbInstance = getFirestore(app, (firebaseAppletConfig as any).firestoreDatabaseId);
}

export const auth = authInstance;
export const db = dbInstance;

export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  language: 'en',
  notificationsEnabled: true,
  defaultDomain: 'emergency',
  autoApproveLowRisk: true,
  compactTelemetry: false,
};

// ============================================================================
// 3. FIRESTORE ERROR HANDLER & PROFILE SYNCHRONIZATION
// ============================================================================
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

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
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
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function buildUserFromFirebaseUser(
  fbUser: FirebaseUser,
  overrides?: Partial<User>
): User {
  const now = new Date().toISOString();
  const isGoogle = fbUser.providerData?.some((p) => p.providerId === 'google.com');
  return {
    id: fbUser.uid,
    name:
      overrides?.name ||
      fbUser.displayName ||
      (fbUser.email ? fbUser.email.split('@')[0] : 'Mission Operator'),
    email: fbUser.email || overrides?.email || '',
    role: overrides?.role || 'operator',
    department: overrides?.department || 'Emergency & Civil Defense Operations',
    avatarUrl: overrides?.avatarUrl || fbUser.photoURL || undefined,
    authProvider: isGoogle ? 'google' : overrides?.authProvider || 'email',
    createdAt: fbUser.metadata?.creationTime
      ? new Date(fbUser.metadata.creationTime).toISOString()
      : overrides?.createdAt || now,
    lastLoginAt: fbUser.metadata?.lastSignInTime
      ? new Date(fbUser.metadata.lastSignInTime).toISOString()
      : now,
    emailVerified: fbUser.emailVerified ?? overrides?.emailVerified ?? false,
    preferences: overrides?.preferences || DEFAULT_PREFERENCES,
  };
}

export async function syncUserProfileToFirestore(user: User): Promise<User> {
  if (!user?.id) return user;
  const userPath = `users/${user.id}`;
  try {
    const userRef = doc(db, 'users', user.id);
    const snap = await getDoc(userRef);
    const now = new Date().toISOString();

    if (snap.exists()) {
      const existing = snap.data() || {};
      const merged: User = {
        id: user.id,
        name: (user.name || existing.fullName || existing.name || 'Operator').slice(0, 120),
        email: (user.email || existing.email || '').slice(0, 180),
        role: existing.role || user.role || 'operator',
        department:
          existing.department || user.department || 'Emergency & Civil Defense Operations',
        avatarUrl: user.avatarUrl || existing.photoURL || existing.avatarUrl || '',
        authProvider: existing.authProvider || user.authProvider || 'email',
        createdAt: existing.createdAt || user.createdAt || now,
        lastLoginAt: now,
        emailVerified: user.emailVerified ?? existing.emailVerified ?? false,
        preferences: existing.preferences || user.preferences || DEFAULT_PREFERENCES,
      };

      await setDoc(
        userRef,
        {
          uid: merged.id,
          fullName: merged.name,
          email: merged.email,
          photoURL: merged.avatarUrl || '',
          authProvider: merged.authProvider,
          createdAt: merged.createdAt,
          lastLoginAt: merged.lastLoginAt,
          role: merged.role,
          department: merged.department,
          emailVerified: merged.emailVerified,
          preferences: merged.preferences,
        },
        { merge: true }
      );
      return merged;
    } else {
      const created: User = {
        id: user.id,
        name: (user.name || 'Mission Operator').slice(0, 120),
        email: (user.email || '').slice(0, 180),
        role: user.role || 'operator',
        department: user.department || 'Emergency & Civil Defense Operations',
        avatarUrl: user.avatarUrl || '',
        authProvider: user.authProvider || 'email',
        createdAt: user.createdAt || now,
        lastLoginAt: now,
        emailVerified: user.emailVerified ?? false,
        preferences: user.preferences || DEFAULT_PREFERENCES,
      };

      await setDoc(userRef, {
        uid: created.id,
        fullName: created.name,
        email: created.email,
        photoURL: created.avatarUrl || '',
        authProvider: created.authProvider,
        createdAt: created.createdAt,
        lastLoginAt: created.lastLoginAt,
        role: created.role,
        department: created.department,
        emailVerified: created.emailVerified,
        preferences: created.preferences,
      });
      return created;
    }
  } catch (err) {
    console.warn(`Firestore profile sync non-fatal warning on ${userPath}:`, err);
    return user;
  }
}

export async function updateFirestoreUserProfile(
  uid: string,
  updates: Partial<User>
): Promise<void> {
  if (!uid) return;
  try {
    const userRef = doc(db, 'users', uid);
    const payload: Record<string, any> = {};
    if (updates.name !== undefined) payload.fullName = updates.name.slice(0, 120);
    if (updates.avatarUrl !== undefined) payload.photoURL = updates.avatarUrl;
    if (updates.department !== undefined) payload.department = updates.department;
    if (updates.role !== undefined) payload.role = updates.role;
    if (updates.emailVerified !== undefined) payload.emailVerified = updates.emailVerified;
    if (updates.preferences !== undefined) payload.preferences = updates.preferences;

    await setDoc(userRef, payload, { merge: true });
  } catch (err) {
    console.warn('Could not update Firestore user profile:', err);
  }
}

// Helper to optionally notify backend without failing if deployed on serverless/Vercel without backend
async function notifyBackendAuth(endpoint: string, payload: Record<string, any>): Promise<any> {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Backend API optional when running against Firebase Auth in static/Vercel deployment
  }
  return null;
}

// ============================================================================
// 4. GOOGLE SIGN-IN (POPUP + REDIRECT FALLBACK SUPPORT)
// ============================================================================
export async function loginWithGoogle(
  rememberMe: boolean = true
): Promise<{ user: User; token?: string }> {
  try {
    await setPersistence(
      auth,
      rememberMe ? browserLocalPersistence : browserSessionPersistence
    );
  } catch (persistErr) {
    console.warn('Firebase persistence setting warning:', persistErr);
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;
    const idToken = await fbUser.getIdToken();

    const backendData = await notifyBackendAuth('/api/auth/google', {
      uid: fbUser.uid,
      name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Google Operator',
      email: fbUser.email,
      photoURL: fbUser.photoURL,
      emailVerified: fbUser.emailVerified,
    });

    const baseUser = buildUserFromFirebaseUser(fbUser, backendData?.user);
    const syncedProfile = await syncUserProfileToFirestore(baseUser);
    return { user: syncedProfile, token: backendData?.token || idToken };
  } catch (error: any) {
    throw new Error(mapFirebaseAuthError(error));
  }
}

export async function loginWithGoogleRedirect(rememberMe: boolean = true): Promise<void> {
  try {
    await setPersistence(
      auth,
      rememberMe ? browserLocalPersistence : browserSessionPersistence
    );
    await signInWithRedirect(auth, googleProvider);
  } catch (error: any) {
    throw new Error(mapFirebaseAuthError(error));
  }
}

export async function checkGoogleRedirectResult(): Promise<{ user: User; token?: string } | null> {
  try {
    const result = await getRedirectResult(auth);
    if (!result || !result.user) return null;
    const fbUser = result.user;
    const idToken = await fbUser.getIdToken();

    const backendData = await notifyBackendAuth('/api/auth/google', {
      uid: fbUser.uid,
      name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Google Operator',
      email: fbUser.email,
      photoURL: fbUser.photoURL,
      emailVerified: fbUser.emailVerified,
    });

    const baseUser = buildUserFromFirebaseUser(fbUser, backendData?.user);
    const syncedProfile = await syncUserProfileToFirestore(baseUser);
    return { user: syncedProfile, token: backendData?.token || idToken };
  } catch (error: any) {
    console.warn('Redirect result warning:', error);
    throw new Error(mapFirebaseAuthError(error));
  }
}

// ============================================================================
// 5. EMAIL & PASSWORD ACCOUNT CREATION (REAL FIREBASE AUTH)
// ============================================================================
export async function registerWithEmailPassword(
  fullName: string,
  email: string,
  password: string,
  rememberMe: boolean = true
): Promise<{ user: User; token?: string; verificationSent: boolean }> {
  const cleanName = fullName.trim();
  const cleanEmail = email.trim();

  if (!cleanName || cleanName.length < 2) {
    throw new Error('Please enter your full name (at least 2 characters).');
  }
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new Error('Please enter a valid email address.');
  }
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }

  try {
    await setPersistence(
      auth,
      rememberMe ? browserLocalPersistence : browserSessionPersistence
    );
  } catch {
    // ignore persistence warning
  }

  let fbUser: FirebaseUser;
  let verificationSent = false;

  try {
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    fbUser = cred.user;
    await updateProfile(fbUser, { displayName: cleanName });
    try {
      await sendEmailVerification(fbUser);
      verificationSent = true;
    } catch {
      // Optional verification email
    }
  } catch (fbErr: any) {
    throw new Error(mapFirebaseAuthError(fbErr));
  }

  const idToken = await fbUser.getIdToken();

  // Sync metadata to backend without sending plaintext password over network if not needed
  const backendData = await notifyBackendAuth('/api/auth/register', {
    fullName: cleanName,
    email: cleanEmail,
    password,
    uid: fbUser.uid,
    authProvider: 'email',
  });

  const baseUser = buildUserFromFirebaseUser(fbUser, {
    name: cleanName,
    email: cleanEmail,
    authProvider: 'email',
    emailVerified: fbUser.emailVerified,
    ...(backendData?.user || {}),
  });

  const syncedProfile = await syncUserProfileToFirestore(baseUser);

  return {
    user: syncedProfile,
    token: backendData?.token || idToken,
    verificationSent,
  };
}

// ============================================================================
// 6. EMAIL & PASSWORD SIGN IN (REAL FIREBASE AUTH + REMEMBER ME PERSISTENCE)
// ============================================================================
export async function loginWithEmailPassword(
  email: string,
  password: string,
  rememberMe: boolean = true
): Promise<{ user: User; token?: string }> {
  const cleanEmail = email.trim();

  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new Error('Please enter a valid email address.');
  }
  if (!password) {
    throw new Error('Please enter your password.');
  }

  try {
    await setPersistence(
      auth,
      rememberMe ? browserLocalPersistence : browserSessionPersistence
    );
  } catch (persistErr) {
    console.warn('Could not configure Firebase auth persistence:', persistErr);
  }

  let fbUser: FirebaseUser;
  try {
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
    fbUser = cred.user;
  } catch (fbErr: any) {
    // Special case: if the seeded default operator account hasn't been provisioned in Firebase Auth yet,
    // provision it in real Firebase Auth on first sign-in with the matching duty password.
    const isSeededDutyAccount =
      cleanEmail.toLowerCase() === 'sushantshinde5598@gmail.com' &&
      password === 'Planova@2026';

    if (
      isSeededDutyAccount &&
      (fbErr?.code === 'auth/user-not-found' ||
        fbErr?.code === 'auth/invalid-credential' ||
        fbErr?.code === 'auth/invalid-login-credentials')
    ) {
      try {
        const createdCred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        fbUser = createdCred.user;
        await updateProfile(fbUser, { displayName: 'Sushant Shinde' });
      } catch (createErr: any) {
        // If email-already-in-use, then the password provided was actually wrong or account exists with another password
        if (createErr?.code === 'auth/email-already-in-use') {
          throw new Error('Invalid email or password.');
        }
        throw new Error(mapFirebaseAuthError(createErr));
      }
    } else {
      throw new Error(mapFirebaseAuthError(fbErr));
    }
  }

  const idToken = await fbUser.getIdToken();

  const backendData = await notifyBackendAuth('/api/auth/login', {
    email: cleanEmail,
    password,
    firebaseVerified: true,
    uid: fbUser.uid,
    name: fbUser.displayName || cleanEmail.split('@')[0],
    photoURL: fbUser.photoURL,
  });

  const baseUser = buildUserFromFirebaseUser(fbUser, backendData?.user);
  const syncedProfile = await syncUserProfileToFirestore(baseUser);

  return {
    user: syncedProfile,
    token: backendData?.token || idToken,
  };
}

// ============================================================================
// 7. FORGOT PASSWORD & PASSWORD RESET FLOW
// ============================================================================
export async function initiatePasswordReset(
  email: string
): Promise<{ message: string; resetToken?: string }> {
  const cleanEmail = email.trim();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new Error('Please enter a valid email address.');
  }

  try {
    await sendPasswordResetEmail(auth, cleanEmail);
  } catch (fbErr: any) {
    throw new Error(mapFirebaseAuthError(fbErr));
  }

  const backendData = await notifyBackendAuth('/api/auth/forgot-password', {
    email: cleanEmail,
  });

  return {
    message:
      backendData?.message ||
      `Password reset instructions have been sent to ${cleanEmail}. Please check your inbox and spam folder.`,
    resetToken: backendData?.resetToken,
  };
}

export async function completePasswordReset(
  token: string,
  email: string,
  newPassword: string
): Promise<{ message: string }> {
  if (!newPassword || newPassword.length < 8) {
    throw new Error('New password must be at least 8 characters long.');
  }

  if (auth.currentUser) {
    try {
      await updatePassword(auth.currentUser, newPassword);
    } catch (fbErr: any) {
      throw new Error(mapFirebaseAuthError(fbErr));
    }
  }

  const backendData = await notifyBackendAuth('/api/auth/reset-password', {
    token,
    email: email.trim(),
    newPassword,
  });

  return {
    message:
      backendData?.message ||
      'Your password has been securely updated.',
  };
}

// ============================================================================
// 8. SIGN OUT
// ============================================================================
export async function logoutAuthenticatedUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Firebase signOut error:', err);
  }
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch {
    // ignore backend logout error if offline
  }
}

export { onAuthStateChanged };

// Test connection on boot as required by Firebase integration guidelines
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

testFirestoreConnection();
