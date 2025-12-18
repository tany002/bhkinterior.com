// api/verifyPayment.ts
import type { IncomingMessage, ServerResponse } from "http";

// This handler is compatible with Vercel Edge & Node runtimes
export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse) {
  // Collect the request body (for Vercel Node environments)
  let body = "";
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

      const APP_ID = process.env.CASHFREE_APP_ID;
      const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
      const ENV = process.env.CASHFREE_ENV || "sandbox";

      const BASE_URL =
        ENV === "production"
          ? "https://api.cashfree.com/pg/orders"
          : "https://sandbox.cashfree.com/pg/orders";

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

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({
        success: paid,
        status: data.order_status,
        data,
      }));
    } catch (error: any) {
      console.error("💥 verifyPayment Exception:", error);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ success: false, error: error.message }));
    }
  });
}
