// /api/verifyPayment.ts

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orderId } = req.body;
  if (!orderId) {
    return res.status(400).json({ error: "Missing orderId" });
  }

  const APP_ID = process.env.CASHFREE_APP_ID;
  const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
  const ENV = process.env.CASHFREE_ENV || "sandbox";

  const BASE_URL =
    ENV === "production"
      ? "https://api.cashfree.com/pg/orders"
      : "https://sandbox.cashfree.com/pg/orders";

  try {
    const resp = await fetch(`${BASE_URL}/${orderId}`, {
      method: "GET",
      headers: {
        "x-api-version": "2023-08-01",
        "x-client-id": APP_ID || "",
        "x-client-secret": SECRET_KEY || "",
      },
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error("❌ Payment verify error:", data);
      return res.status(resp.status).json({ success: false, data });
    }

    const paid = data.order_status === "PAID";

    const email = data.customer_details?.customer_email || null;
    const plan =
      data.order_meta?.payment_notes?.plan ||
      data.order_meta?.payment_notes?.PLAN ||
      "pro";
    const billingCycle =
      data.order_meta?.payment_notes?.billingCycle ||
      data.order_meta?.payment_notes?.BILLINGCYCLE ||
      "monthly";

    const verifiedAt = Date.now();
    const days =
      billingCycle === "monthly"
        ? 30
        : billingCycle === "half_yearly"
        ? 180
        : 365;
    const expiry = verifiedAt + days * 24 * 60 * 60 * 1000;

    return res.status(200).json({
      success: paid,
      status: data.order_status,
      email,
      plan,
      billingCycle,
      verifiedAt,
      expiry,
      data,
    });
  } catch (err: any) {
    console.error("💥 VerifyPayment Exception:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
