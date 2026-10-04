import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { User, UserPreferences } from '../types';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
const dbId = (firebaseConfig as any).firestoreDatabaseId;
export const db = dbId ? getFirestore(app, dbId) : getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
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

// Save or update user profile in Firestore /users/{userId}
export async function syncUserProfileToFirestore(user: User): Promise<User> {
  try {
    const userRef = doc(db, 'users', user.id);
    const snap = await getDoc(userRef);
    const now = new Date().toISOString();

    if (snap.exists()) {
      const existing = snap.data();
      const merged: User = {
        id: user.id,
        name: user.name || existing.fullName || existing.name || 'Operator',
        email: user.email || existing.email,
        role: existing.role || user.role || 'operator',
        department: existing.department || user.department || 'Emergency & Civil Defense Operations',
        avatarUrl: user.avatarUrl || existing.photoURL || existing.avatarUrl,
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
        name: user.name || 'Mission Operator',
        email: user.email,
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
    console.warn('Firestore profile sync warning:', err);
    return user;
  }
}

export async function updateFirestoreUserProfile(
  uid: string,
  updates: Partial<User>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    const payload: Record<string, any> = {};
    if (updates.name !== undefined) payload.fullName = updates.name;
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

// Official Google OAuth 2.0 / OpenID Connect flow
export async function loginWithGoogle(): Promise<{ user: User; token?: string }> {
  const result = await signInWithPopup(auth, googleProvider);
  const fbUser = result.user;

  const res = await fetch('/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      uid: fbUser.uid,
      name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Google Operator',
      email: fbUser.email,
      photoURL: fbUser.photoURL,
      emailVerified: fbUser.emailVerified,
    }),
  });
  const data = await res.json();

  const baseUser: User = {
    id: fbUser.uid,
    name: fbUser.displayName || data.user?.name || 'Operator',
    email: fbUser.email || data.user?.email || '',
    role: data.user?.role || 'operator',
    department: data.user?.department || 'Emergency & Civil Defense Operations',
    avatarUrl: fbUser.photoURL || data.user?.avatarUrl,
    authProvider: 'google',
    createdAt: data.user?.createdAt || new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    emailVerified: fbUser.emailVerified || true,
    preferences: data.user?.preferences || DEFAULT_PREFERENCES,
  };

  const syncedProfile = await syncUserProfileToFirestore(baseUser);
  return { user: syncedProfile, token: data.token };
}

// Email & Password Registration
export async function registerWithEmailPassword(
  fullName: string,
  email: string,
  password: string
): Promise<{ user: User; token?: string; verificationSent: boolean }> {
  let fbUid: string | undefined;
  let verificationSent = false;

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    fbUid = cred.user.uid;
    await updateProfile(cred.user, { displayName: fullName });
    try {
      await sendEmailVerification(cred.user);
      verificationSent = true;
    } catch {
      // verification email optional if SMTP not custom configured
    }
  } catch (fbErr: any) {
    if (fbErr?.code === 'auth/email-already-in-use') {
      throw new Error('An account with this email address already exists. Please sign in instead.');
    }
    if (fbErr?.code === 'auth/weak-password') {
      throw new Error('Password is too weak. Please use at least 8 characters with mixed complexity.');
    }
    // If auth/operation-not-allowed in Firebase console, continue with cryptographic server registration + Firestore profile
  }

  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName,
      email,
      password,
      uid: fbUid,
      authProvider: 'email',
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Registration failed. Please check your details.');
  }

  const syncedProfile = await syncUserProfileToFirestore({
    ...data.user,
    id: fbUid || data.user.id,
    authProvider: 'email',
    emailVerified: verificationSent ? false : data.user.emailVerified,
  });

  return {
    user: syncedProfile,
    token: data.token,
    verificationSent: true,
  };
}

// Email & Password Sign In
export async function loginWithEmailPassword(
  email: string,
  password: string,
  rememberMe: boolean = true
): Promise<{ user: User; token?: string }> {
  try {
    await setPersistence(
      auth,
      rememberMe ? browserLocalPersistence : browserSessionPersistence
    );
  } catch {
    // ignore persistence warning
  }

  let fbUser: FirebaseUser | null = null;
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    fbUser = cred.user;
  } catch (fbErr: any) {
    if (fbErr?.code === 'auth/wrong-password' || fbErr?.code === 'auth/invalid-credential') {
      // Let backend verify or record brute-force attempt
    }
  }

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      firebaseVerified: !!fbUser,
      uid: fbUser?.uid,
      name: fbUser?.displayName,
      photoURL: fbUser?.photoURL,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Invalid email or password.');
  }

  const syncedProfile = await syncUserProfileToFirestore({
    ...data.user,
    id: fbUser?.uid || data.user.id,
    emailVerified: fbUser ? fbUser.emailVerified : data.user.emailVerified,
  });

  return {
    user: syncedProfile,
    token: data.token,
  };
}

// Password Reset Flow
export async function initiatePasswordReset(email: string): Promise<{ message: string; resetToken?: string }> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch {
    // Do not expose account enumeration errors
  }

  const res = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Unable to process password reset request.');
  }
  return {
    message: data.message,
    resetToken: data.resetToken,
  };
}

export async function completePasswordReset(
  token: string,
  email: string,
  newPassword: string
): Promise<{ message: string }> {
  const res = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, email, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to reset password.');
  }
  return { message: data.message };
}

export async function logoutAuthenticatedUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch {}
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch {}
}

export { onAuthStateChanged };

// Test connection as instructed in firebase skill
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, check connection.');
    }
  }
}

testFirestoreConnection();
