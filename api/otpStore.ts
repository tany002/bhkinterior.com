// api/otpStore.ts
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.bhk_KV_REST_API_URL!,
  token: process.env.bhk_KV_REST_API_TOKEN!,
});

interface OtpRecord {
  otp: string;
  expiresAt: number;
}

export async function setOtp(email: string, otp: string) {
  const record: OtpRecord = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };
  // Store it as a JSON string for consistency
  await redis.set(`otp:${email}`, JSON.stringify(record), { ex: 300 });
  console.log(`✅ Stored OTP for ${email}`);
}

export async function getOtp(email: string): Promise<OtpRecord | null> {
  const data = await redis.get(`otp:${email}`);
  
  if (!data) return null;

  // Handle both JSON string and direct object
  if (typeof data === "string") {
    return JSON.parse(data) as OtpRecord;
  }

  if (typeof data === "object" && "otp" in data && "expiresAt" in data) {
    return data as OtpRecord;
  }

  console.warn("⚠️ Unexpected OTP data format:", data);
  return null;
}

export async function deleteOtp(email: string) {
  await redis.del(`otp:${email}`);
  console.log(`🧹 Deleted OTP for ${email}`);
}
