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
  await redis.set(`otp:${email}`, JSON.stringify(record), { ex: 300 });
  console.log(`✅ Stored OTP for ${email}`);
}

export async function getOtp(email: string): Promise<OtpRecord | null> {
  const data = await redis.get<string>(`otp:${email}`);
  return data ? (JSON.parse(data) as OtpRecord) : null;
}

export async function deleteOtp(email: string) {
  await redis.del(`otp:${email}`);
  console.log(`🧹 Deleted OTP for ${email}`);
}
