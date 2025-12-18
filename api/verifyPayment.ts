// /api/verifyPayment.ts
import type { IncomingMessage, ServerResponse } from "http";
import { saveUserProfile } from "./userStore";

export default async function handler(
  req: IncomingMessage & { body?: any },
  res: ServerResponse
) {
  let body = "";

  // Collect request body (needed in Node runtime)
  req.on("data", chunk => (body += chunk));
  req.on("end", async () => {
    try {
      const parsedBody = body ? JSON.parse(body) : {};
      const { orderId } = parsedBody;

      if (!orderId) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Missing orderId" }));
        return;
      }

      // ✅ Env config
      const APP_ID = process.env.CASHFREE_APP_ID;
      const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
      const ENV = process.env.CASHFREE_ENV || "sandbox";

      const BASE_URL =
        ENV === "production"
          ? "https://api.cashfree.com/pg/orders"
          : "https://sandbox.cashfree.com/pg/orders";

      // ✅ Fetch order status from Cashfree
      const response = await fetch(`${BASE_URL}/${orderId}`, {
        method: "GET",
        headers: {
          "x-api-version": "2023-08-01",
          "x-client-id": APP_ID || "",
          "x-client-secret": SECRET_KEY || "",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ Payment verification failed:", data);
        res.statusCode = response.status;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ success: false, data }));
        return;
      }

      const paid = data.order_status === "PAID";

      // 🧠 Extract stored payment details from order_meta
      let userMeta: any = {};
      try {
        const notes = data.order_meta?.payment_notes;
        if (notes) userMeta = JSON.parse(notes);
      } catch {
        userMeta = {};
      }

      const verifiedAt = Date.now();
      let expiry = verifiedAt;

      // ⏳ Calculate plan expiry
      const cycle = userMeta.billingCycle || "monthly";
      if (cycle === "monthly") expiry += 30 * 24 * 60 * 60 * 1000;
      else if (cycle === "half_yearly") expiry += 180 * 24 * 60 * 60 * 1000;
      else if (cycle === "yearly") expiry += 365 * 24 * 60 * 60 * 1000;

      // ✅ If payment is successful, save user profile in Redis
      if (paid) {
        const profile = {
          email: userMeta.email || "unknown",
          plan: userMeta.plan || "unknown",
          billingCycle: cycle,
          paymentDate: verifiedAt,
          expiryDate: expiry,
        };

        try {
          await saveUserProfile(profile);
          console.log(`✅ Saved profile for ${profile.email}`);
        } catch (err) {
          console.error("⚠️ Failed to save user profile:", err);
        }
      }

      // ✅ Respond to frontend
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: paid,
          status: data.order_status,
          email: userMeta.email || "unknown",
          plan: userMeta.plan || "unknown",
          billingCycle: cycle,
          verifiedAt,
          expiry,
        })
      );
    } catch (error: any) {
      console.error("💥 verifyPayment Exception:", error);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({ success: false, error: error.message || "Server error" })
      );
    }
  });
}
