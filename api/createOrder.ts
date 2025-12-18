// /api/createOrder.ts
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const APP_ID = process.env.CASHFREE_APP_ID;
  const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
  const ENV = process.env.CASHFREE_ENV || "sandbox";

  // 🧩 Mock fallback if missing credentials (useful for local testing)
  if (!APP_ID || !SECRET_KEY) {
    console.warn("⚠️ Cashfree keys missing. Using MOCK session for testing.");
    const { amount } = req.body;
    return res.status(200).json({
      success: true,
      paymentSessionId: `session_mock_${Date.now()}`,
      orderId: `order_mock_${Date.now()}`,
      amount,
      currency: "INR",
      note: "Mock Mode Active",
    });
  }

  const BASE_URL =
    ENV === "production"
      ? "https://api.cashfree.com/pg/orders"
      : "https://sandbox.cashfree.com/pg/orders";

  try {
    const { amount, customer, plan, billingCycle } = req.body;

    if (!amount || !customer) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Step 1: INR-only system
    const orderAmountINR = Math.round(Number(amount));
    const currency = "INR";

    // ✅ Step 2: Validate against Cashfree’s max order limit
    const MAX_ORDER_AMOUNT = 50000; // ₹50,000 default limit
    if (orderAmountINR > MAX_ORDER_AMOUNT) {
      console.warn(
        `⚠️ Order amount ₹${orderAmountINR} exceeds Cashfree limit ₹${MAX_ORDER_AMOUNT}`
      );
      return res.status(400).json({
        success: false,
        error: `Order amount exceeds Cashfree limit of ₹${MAX_ORDER_AMOUNT}.`,
        orderAmountINR,
      });
    }

    // ✅ Step 3: Prepare order identifiers & sanitize user data
    const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    let phone = customer.phone?.replace(/\D/g, "") || "9999999999";
    if (phone.length > 10) phone = phone.slice(-10);
    const email = customer.email || "guest@example.com";

    // ✅ Step 4: Prepare return and notify URLs
    const proto = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers["host"] || "bhkinterior.com";
    const origin = process.env.NEXT_PUBLIC_SITE_URL || `${proto}://${host}`;

    const returnUrl = `${origin}?status=success&order_id=${orderId}`;
    const notifyUrl = `${origin}/api/verifyPayment`;

    console.log(
      `💰 Creating Cashfree order: ₹${orderAmountINR} ${currency} for ${email} (${plan || "unknown"} plan)`
    );

    // ✅ Step 5: Prepare payload for Cashfree API
    const payload = {
      order_id: orderId,
      order_amount: orderAmountINR,
      order_currency: currency,
      customer_details: {
        customer_id: email,
        customer_phone: phone,
        customer_name: "BHK Customer",
        customer_email: email,
      },
      order_meta: {
        return_url: returnUrl,
        notify_url: notifyUrl,
        payment_notes: JSON.stringify({
          email,
          plan: plan || "unknown",
          billingCycle: billingCycle || "monthly",
        }),
      },
    };

    // ✅ Step 6: Create order via Cashfree API
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": APP_ID,
        "x-client-secret": SECRET_KEY,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Cashfree API Error:", data);
      return res.status(response.status).json({
        success: false,
        error: data.message || data.reason || "Payment Gateway Error",
        details: data,
      });
    }

    // ✅ Step 7: Return payment session to frontend
    return res.status(200).json({
      success: true,
      paymentSessionId: data.payment_session_id,
      orderId,
      amount: orderAmountINR,
      currency,
    });
  } catch (err: any) {
    console.error("💥 CreateOrder Exception:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Internal Server Error",
    });
  }
}
