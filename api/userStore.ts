// /api/userStore.ts
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface UserProfile {
  email: string;
  plan: string;
  billingCycle: string;
  paymentDate: number;
  expiryDate: number;
}

export async function saveUserProfile(profile: UserProfile) {
  await redis.set(`user:${profile.email}`, JSON.stringify(profile));
}

export async function getUserProfile(email: string): Promise<UserProfile | null> {
  const data = await redis.get<string>(`user:${email}`);
  return data ? JSON.parse(data) : null;
}
