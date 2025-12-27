// api/checkUserPayment.ts
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.bhk_KV_REST_API_URL || process.env.KV_REST_API_URL!,
  token: process.env.bhk_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN!,
});

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Missing email" });
    }

    // Look up user record in KV (from your syncPaidUsers.ts script)
    const userData = await redis.hgetall<Record<string, string>>(`user:${email}`);

    if (!userData || !userData.plan) {
      return res.status(200).json({ paid: false });
    }

    const now = Date.now();
    const expiry = new Date(userData.expiry).getTime();
    const isActive = expiry > now;

    return res.status(200).json({
      paid: isActive,
      email: userData.email,
      plan: userData.plan,
      billingCycle: userData.billingCycle,
      expiry: userData.expiry,
    });
  } catch (err: any) {
    console.error("💥 checkUserPayment error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
