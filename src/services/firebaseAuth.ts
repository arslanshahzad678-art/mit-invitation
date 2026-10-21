import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  linkWithCredential,
  User,
  AuthError
} from 'firebase/auth';
import { 
  auth, 
  googleProvider, 
  AUTHORIZED_ADMIN_EMAILS, 
  OWNER_EMAIL,
  isFirebaseConfigured 
} from '../config/firebase';

/**
 * Check if an email is in the authorized admin allow-list
 */
export function isAuthorizedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return AUTHORIZED_ADMIN_EMAILS.some(
    (allowed) => allowed.trim().toLowerCase() === normalized
  );
}

/**
 * Convert Firebase auth error codes to clear, friendly user messages
 */
export function getFriendlyAuthErrorMessage(error: any): string {
  if (!error) return 'An unexpected authentication error occurred.';
  
  const code = (error as AuthError)?.code || '';
  const message = error?.message || '';

  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials') {
    return 'Incorrect password. Please check your credentials or click "Forgot password?" to reset it.';
  }
  if (code === 'auth/user-not-found') {
    return `No administrator account found for this email. Please check your email or sign up.`;
  }
  if (code === 'auth/email-already-in-use') {
    return 'An account with this email address already exists. Please sign in instead.';
  }
  if (code === 'auth/too-many-requests') {
    return 'Too many unsuccessful attempts. Access has been temporarily restricted for security. Please wait a few minutes or reset your password.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Network connection issue. Please check your internet connection and verify your Firebase project is reachable.';
  }
  if (code === 'auth/popup-closed-by-user') {
    return 'Google sign-in popup was closed before completion.';
  }
  if (code === 'auth/popup-blocked') {
    return 'Sign-in popup was blocked by your browser. Please allow popups for this domain to sign in with Google.';
  }
  if (code === 'auth/requires-recent-login') {
    return 'For security, please sign out and sign in again before updating your password.';
  }
  if (code === 'auth/weak-password') {
    return 'Password is too weak. Please use at least 8 characters with a mix of letters and numbers.';
  }
  if (code === 'auth/account-not-authorized') {
    return 'This Google account is not authorized to access the Admin Studio.';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'This sign-in provider is not enabled in your Firebase Console. Please enable Email/Password or Google under Authentication > Sign-in method.';
  }
  if (code === 'auth/unauthorized-domain') {
    return 'This domain is not authorized in Firebase. Please add this URL domain in the Firebase Console under Authentication > Settings > Authorized domains.';
  }

  return message || 'Authentication failed. Please verify your Firebase project configuration.';
}

/**
 * Sign in with email and password for admin
 */
export async function loginWithEmail(email: string, password: string): Promise<User> {
  if (!isAuthorizedEmail(email)) {
    const error = new Error('This account is not authorized.');
    (error as any).code = 'auth/account-not-authorized';
    throw error;
  }

  const credential = await signInWithEmailAndPassword(auth, email, password);
  
  if (!isAuthorizedEmail(credential.user.email)) {
    await signOut(auth);
    const error = new Error('This account is not authorized.');
    (error as any).code = 'auth/account-not-authorized';
    throw error;
  }

  return credential.user;
}

/**
 * Sign in with Google Popup for admin. Immediately signs out if email is not authorized.
 */
export async function loginWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  if (!isAuthorizedEmail(user.email)) {
    await signOut(auth);
    const error = new Error('This account is not authorized.');
    (error as any).code = 'auth/account-not-authorized';
    throw error;
  }

  return user;
}

/**
 * Send password reset email
 */
export async function requestPasswordReset(email: string = OWNER_EMAIL): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Change administrator password (re-authenticates with current password first)
 */
export async function changeAdminPassword(currentPassword: string, newPassword: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error('No administrator user currently logged in.');
  }

  // Check if user has a password provider
  const hasPasswordProvider = user.providerData.some((p) => p.providerId === 'password');

  if (hasPasswordProvider) {
    // Re-authenticate
    const cred = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, cred);
    // Update password
    await updatePassword(user, newPassword);
  } else {
    // If user signed in via Google and wants to set their first password:
    const cred = EmailAuthProvider.credential(user.email, newPassword);
    await linkWithCredential(user, cred);
  }
}

/**
 * Link an email/password credential to a Google-only account
 */
export async function setPasswordForGoogleAccount(newPassword: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error('No administrator user currently logged in.');
  }

  const cred = EmailAuthProvider.credential(user.email, newPassword);
  await linkWithCredential(user, cred);
}

/**
 * Sign out administrator
 */
export async function logoutAdminFirebase(): Promise<void> {
  await signOut(auth);
}

// ==========================================
// CLIENT PORTAL AUTHENTICATION
// (For couples logging in to manage invitations & guest RSVPs)
// ==========================================

export async function clientLoginWithEmail(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  return cred.user;
}

export async function clientSignUpWithEmail(email: string, password: string): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  return cred.user;
}

export async function clientLoginWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function clientLogout(): Promise<void> {
  await signOut(auth);
}

