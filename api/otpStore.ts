// api/otpStore.ts
import { Redis } from "@upstash/redis";

// Support both Upstash defaults and your bhk-prefixed variables
const redisUrl =
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.bhk_KV_REST_API_URL ||
  process.env.bhk_REDIS_URL;

const redisToken =
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  process.env.bhk_KV_REST_API_TOKEN;

if (!redisUrl || !redisToken) {
  console.error("❌ Missing Upstash Redis environment variables");
  throw new Error("Upstash Redis not configured properly");
}

export const kv = new Redis({
  url: redisUrl,
  token: redisToken,
});

export const otpStore = {
  async set(email: string, data: { otp: string; expiresAt: number }) {
    await kv.set(email, JSON.stringify(data), { ex: 300 }); // expires in 5 minutes
  },
  async get(email: string) {
    const val = await kv.get<string>(email);
    return val ? JSON.parse(val) : null;
  },
  async delete(email: string) {
    await kv.del(email);
  },
};
