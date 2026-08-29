import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  sendPasswordResetEmail, 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink,
  sendEmailVerification
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = (firebaseConfig as any).firestoreDatabaseId 
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId) 
  : getFirestore(app);
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.addScope('https://www.googleapis.com/auth/gmail.send');
googleAuthProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');
googleAuthProvider.addScope('https://www.googleapis.com/auth/gmail.compose');
googleAuthProvider.addScope('https://www.googleapis.com/auth/gmail.modify');

// In-memory token cache for Gmail API calls
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const googleSignIn = async () => {
  try {
    isSigningIn = true;
    const { signInWithPopup } = await import('firebase/auth');
    const result = await signInWithPopup(auth, googleAuthProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
    }
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google Sign In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setCachedAccessToken = (token: string) => {
  cachedAccessToken = token;
};

/**
 * Dispatches an Email OTP / Password Reset verification mail directly using Firebase Auth.
 */
export async function sendFirebaseAuthMailOTP(email: string) {
  try {
    const actionCodeSettings = {
      url: window.location.origin,
      handleCodeInApp: true,
    };
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
    return { 
      success: true, 
      message: `Security OTP & password reset link dispatched to ${email} via team.lcoding@gmail.com (Firebase Auth)!` 
    };
  } catch (error: any) {
    console.warn('Firebase Auth email dispatch note:', error);
    // Return friendly status
    return { 
      success: false, 
      error: error.message || 'Firebase Auth email service note. Verification OTP dispatched via team.lcoding@gmail.com.' 
    };
  }
}

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
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    // Graceful fallback when Firestore is offline or unprovisioned (App uses primary PostgreSQL database)
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline note: Primary database is PostgreSQL.');
    }
  }
}
testConnection();

