
// api/otpStore.ts

// Global in-memory store for OTPs.
// In a serverless environment (like Vercel), this works for "warm" lambda instances.
// For production scale, use Redis or a database.

interface OtpRecord {
  otp: string;
  expiresAt: number;
}

// Attach to global scope to persist across hot reloads in development
const globalStore = global as unknown as { otpStore: Map<string, OtpRecord> };

if (!globalStore.otpStore) {
  globalStore.otpStore = new Map();
}

export const otpStore = globalStore.otpStore;
