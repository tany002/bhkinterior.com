import { kv } from "@vercel/kv";

export const otpStore = {
  async set(email: string, data: { otp: string; expiresAt: number }) {
    await kv.set(`otp:${email}`, data, { ex: 300 }); // expires in 5 min
  },
  async get(email: string) {
    return await kv.get<{ otp: string; expiresAt: number }>(`otp:${email}`);
  },
  async delete(email: string) {
    await kv.del(`otp:${email}`);
  },
};
