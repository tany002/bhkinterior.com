// utils/userSession.ts

export type PlanTier = 'free' | 'pro' | 'premium' | 'ultra';
export type BillingCycle = 'monthly' | 'half_yearly' | 'yearly';

interface UserSession {
  email?: string;
  phone?: string;
  plan: PlanTier;
  billingCycle?: BillingCycle;
  isPaid: boolean;
  createdAt: number;
  paidAt?: number;
  expiryAt?: number;
}

const STORAGE_KEY = 'bhk_user';

/**
 * Create a new (free) user session
 */
export function createUser(email?: string, phone?: string): UserSession {
  if (!email && !phone) {
    throw new Error('Either email or phone must be provided');
  }

  const userSession: UserSession = {
    email,
    phone,
    plan: 'free',
    isPaid: false,
    createdAt: Date.now(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(userSession));
  return userSession;
}

/**
 * Get current user session
 */
export function getUser(): UserSession | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as UserSession;
  } catch (error) {
    console.error('Error reading user session:', error);
    return null;
  }
}

/**
 * Mark user as paid and calculate expiry based on billing cycle
 */
export function markUserAsPaid(
  plan: PlanTier,
  billingCycle: BillingCycle
): UserSession {
  const currentUser = getUser();
  if (!currentUser) {
    throw new Error('No user session found');
  }

  const now = Date.now();

  let durationMs = 0;
  if (billingCycle === 'monthly') durationMs = 30 * 24 * 60 * 60 * 1000;
  if (billingCycle === 'half_yearly') durationMs = 6 * 30 * 24 * 60 * 60 * 1000;
  if (billingCycle === 'yearly') durationMs = 12 * 30 * 24 * 60 * 60 * 1000;

  const updatedUser: UserSession = {
    ...currentUser,
    plan,
    billingCycle,
    isPaid: true,
    paidAt: now,
    expiryAt: now + durationMs,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
  return updatedUser;
}

/**
 * Check if user is paid AND subscription is valid
 */
export function isPaidUser(): boolean {
  const user = getUser();
  if (!user || !user.isPaid || !user.expiryAt) return false;
  return Date.now() < user.expiryAt;
}

/**
 * Get remaining subscription time (ms)
 */
export function getRemainingTime(): number | null {
  const user = getUser();
  if (!user?.expiryAt) return null;
  return Math.max(user.expiryAt - Date.now(), 0);
}

/**
 * Clear session (logout / expiry)
 */
export function clearUser() {
  localStorage.removeItem(STORAGE_KEY);
}
