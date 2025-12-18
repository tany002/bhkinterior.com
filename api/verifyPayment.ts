// /api/verifyPayment.ts

export default async function handler(req: any, res: any) {
  // ✅ Only allow POST
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ error: "Method not allowed" }));
  }

  try {
    // ✅ Parse input
    const { orderId } = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (!orderId) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ error: "Missing orderId" }));
    }

    // ✅ Load environment variables
    const APP_ID = process.env.CASHFREE_APP_ID;
    const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
    const ENV = process.env.CASHFREE_ENV || "sandbox";

    const BASE_URL =
      ENV === "production"
        ? "https://api.cashfree.com/pg/orders"
        : "https://sandbox.cashfree.com/pg/orders";

    // ✅ Call Cashfree API
    const resp = await fetch(`${BASE_URL}/${orderId}`, {
      method: "GET",
      headers: {
        "x-api-version": "2023-08-01",
        "x-client-id": APP_ID || "",
        "x-client-secret": SECRET_KEY || "",
      },
    });

    const data = await resp.json();

    // Handle API errors
    if (!resp.ok) {
      console.error("❌ Cashfree Verify API Error:", data);
      res.statusCode = resp.status;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ success: false, data }));
    }

    // ✅ Extract key details
    const paid = data.order_status === "PAID";
    const email = data.customer_details?.customer_email || null;
    const phone = data.customer_details?.customer_phone || null;
    const plan = data.order_meta?.payment_notes?.plan || "pro";
    const billingCycle = data.order_meta?.payment_notes?.billingCycle || "monthly";

    // ✅ Compute expiry date based on billing cycle
    const now = Date.now();
    const days =
      billingCycle === "monthly"
        ? 30
        : billingCycle === "half_yearly"
        ? 180
        : 365;
    const expiry = now + days * 24 * 60 * 60 * 1000;

    // ✅ Optional: persist verified payment to Redis (disabled by default)
    /*
    try {
      const redisKey = `paid_user:${email}`;
      await fetch(process.env.UPSTASH_REDIS_REST_URL!, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          command: ["SET", redisKey, JSON.stringify({ email, phone, plan, billingCycle, expiry })],
        }),
      });
    } catch (err) {
      console.warn("⚠️ Could not store payment data in Redis:", err);
    }
    */

    // ✅ Send verification result
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    return res.end(
      JSON.stringify({
        success: paid,
        status: data.order_status,
        email,
        phone,
        plan,
        billingCycle,
        expiry,
        data,
      })
    );
  } catch (err: any) {
    console.error("💥 VerifyPayment Exception:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    return res.end(
      JSON.stringify({
        success: false,
        error: err.message || "Internal Server Error",
      })
    );
  }
}

// /api/verifyPayment.ts

export default async function handler(req: any, res: any) {
  // ✅ Only allow POST
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ error: "Method not allowed" }));
  }

  try {
    // ✅ Parse input
    const { orderId } = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (!orderId) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ error: "Missing orderId" }));
    }

    // ✅ Load environment variables
    const APP_ID = process.env.CASHFREE_APP_ID;
    const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
    const ENV = process.env.CASHFREE_ENV || "sandbox";

    const BASE_URL =
      ENV === "production"
        ? "https://api.cashfree.com/pg/orders"
        : "https://sandbox.cashfree.com/pg/orders";

    // ✅ Call Cashfree API
    const resp = await fetch(`${BASE_URL}/${orderId}`, {
      method: "GET",
      headers: {
        "x-api-version": "2023-08-01",
        "x-client-id": APP_ID || "",
        "x-client-secret": SECRET_KEY || "",
      },
    });

    const data = await resp.json();

    // Handle API errors
    if (!resp.ok) {
      console.error("❌ Cashfree Verify API Error:", data);
      res.statusCode = resp.status;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ success: false, data }));
    }

    // ✅ Extract key details
    const paid = data.order_status === "PAID";
    const email = data.customer_details?.customer_email || null;
    const phone = data.customer_details?.customer_phone || null;
    const plan = data.order_meta?.payment_notes?.plan || "pro";
    const billingCycle = data.order_meta?.payment_notes?.billingCycle || "monthly";

    // ✅ Compute expiry date based on billing cycle
    const now = Date.now();
    const days =
      billingCycle === "monthly"
        ? 30
        : billingCycle === "half_yearly"
        ? 180
        : 365;
    const expiry = now + days * 24 * 60 * 60 * 1000;

    // ✅ Optional: persist verified payment to Redis (disabled by default)
    /*
    try {
      const redisKey = `paid_user:${email}`;
      await fetch(process.env.UPSTASH_REDIS_REST_URL!, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          command: ["SET", redisKey, JSON.stringify({ email, phone, plan, billingCycle, expiry })],
        }),
      });
    } catch (err) {
      console.warn("⚠️ Could not store payment data in Redis:", err);
    }
    */

    // ✅ Send verification result
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    return res.end(
      JSON.stringify({
        success: paid,
        status: data.order_status,
        email,
        phone,
        plan,
        billingCycle,
        expiry,
        data,
      })
    );
  } catch (err: any) {
    console.error("💥 VerifyPayment Exception:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    return res.end(
      JSON.stringify({
        success: false,
        error: err.message || "Internal Server Error",
      })
    );
  }
}
