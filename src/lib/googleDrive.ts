import { GoogleAuthProvider, signInWithPopup, User, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

export const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

const driveProvider = new GoogleAuthProvider();
SCOPES.forEach((scope) => driveProvider.addScope(scope));

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initDriveAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn && onAuthFailure) {
        onAuthFailure();
      }
    }
  });
};

export const signInWithGoogleDrive = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, driveProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google Drive OAuth access token.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Drive authentication error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getDriveAccessToken = (): string | null => {
  return cachedAccessToken;
};

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
  thumbnailLink?: string;
}

export const fetchGoogleDriveFiles = async (token?: string): Promise<GoogleDriveFile[]> => {
  const activeToken = token || cachedAccessToken;
  if (!activeToken) {
    throw new Error('Google Drive access token is not available.');
  }

  const response = await fetch(
    'https://www.googleapis.com/drive/v3/files?pageSize=30&fields=files(id,name,mimeType,size,modifiedTime,webViewLink,thumbnailLink)&orderBy=modifiedTime desc',
    {
      headers: {
        Authorization: `Bearer ${activeToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Drive API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.files || [];
};
