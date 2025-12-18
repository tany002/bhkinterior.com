// /api/verifyPayment.ts
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orderId } = req.body;
  if (!orderId) return res.status(400).json({ error: "Missing orderId" });

  const APP_ID = process.env.CASHFREE_APP_ID;
  const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
  const ENV = process.env.CASHFREE_ENV || "sandbox";

  const BASE_URL =
    ENV === "production"
      ? "https://api.cashfree.com/pg/orders"
      : "https://sandbox.cashfree.com/pg/orders";

  try {
    // 🔍 Fetch order details from Cashfree
    const resp = await fetch(`${BASE_URL}/${orderId}`, {
      method: "GET",
      headers: {
        "x-api-version": "2023-08-01",
        "x-client-id": APP_ID!,
        "x-client-secret": SECRET_KEY!,
      },
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error("❌ Payment verify error:", data);
      return res.status(resp.status).json({ success: false, data });
    }

    const paid = data.order_status === "PAID";

    // 🧠 Extract metadata safely (email, plan, billing cycle)
    let email = null;
    let plan = null;
    let billingCycle = null;

    try {
      if (data.order_meta?.payment_notes) {
        const notes =
          typeof data.order_meta.payment_notes === "string"
            ? JSON.parse(data.order_meta.payment_notes)
            : data.order_meta.payment_notes;

        email = notes?.email || data.customer_details?.customer_email || null;
        plan = notes?.plan || "unknown";
        billingCycle = notes?.billingCycle || "monthly";
      } else {
        email = data.customer_details?.customer_email || null;
      }
    } catch (e) {
      console.warn("⚠️ Could not parse payment notes:", e);
    }

    // ✅ Return clean structured data
    return res.status(200).json({
      success: paid,
      status: data.order_status,
      email,
      plan,
      billingCycle,
      data,
    });
  } catch (err: any) {
    console.error("💥 VerifyPayment Exception:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
