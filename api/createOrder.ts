
// /api/createOrder.ts
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // 1. Load Credentials
  const APP_ID = process.env.CASHFREE_APP_ID;
  const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
  const ENV = process.env.CASHFREE_ENV || "sandbox";

  // 2. Mock Fallback for Development (if keys are missing)
  if (!APP_ID || !SECRET_KEY) {
    console.warn("⚠️ Cashfree keys missing. Using MOCK session for testing.");
    const { amount, currency } = req.body;
    return res.status(200).json({
      success: true,
      paymentSessionId: `session_mock_${Date.now()}`,
      orderId: `order_mock_${Date.now()}`,
      convertedAmount: amount,
      currency: currency || 'USD',
      note: "Mock Mode Active"
    });
  }

  const BASE_URL =
    ENV === "production"
      ? "https://api.cashfree.com/pg/orders"
      : "https://sandbox.cashfree.com/pg/orders";

  try {
    const { amount: baseAmountUSD, customer, currency: targetCurrency = "USD" } = req.body;

    if (!baseAmountUSD || !customer) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 🔹 Step 3: Fetch live exchange rate with TIMEOUT
    let convertedAmount = baseAmountUSD;
    let conversionRate = 1;

    if (targetCurrency !== 'USD') {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

            let rateRes = await fetch(`https://api.exchangerate.host/latest?base=USD&symbols=${targetCurrency}`, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            const contentType = rateRes.headers.get("content-type");
            if (!rateRes.ok || !contentType || !contentType.includes("application/json")) {
                 const controller2 = new AbortController();
                 const timeoutId2 = setTimeout(() => controller2.abort(), 3000);
                 rateRes = await fetch(`https://open.er-api.com/v6/latest/USD`, { signal: controller2.signal });
                 clearTimeout(timeoutId2);
            }

            const rateData = await rateRes.json();
            conversionRate = rateData?.rates?.[targetCurrency];
            
            if (!conversionRate) {
                // Hardcoded fallback if API fails
                const HARDCODED_RATES: Record<string, number> = { 
                    'INR': 83.5, 'EUR': 0.92, 'GBP': 0.79, 'AED': 3.67, 'AUD': 1.52, 'CAD': 1.36 
                };
                conversionRate = HARDCODED_RATES[targetCurrency] || 1;
            }

            convertedAmount = parseFloat((baseAmountUSD * conversionRate).toFixed(2));
        } catch (err) {
            console.error("Exchange rate fetch failed (using USD):", err);
            convertedAmount = baseAmountUSD;
        }
    }

    // 🔹 Step 4: Prepare Order Data
    const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Sanitize phone (Cashfree usually expects 10 digits for INR, but allows more for intl)
    let phone = customer.phone ? customer.phone.replace(/\D/g, "") : "9999999999";
    if (targetCurrency === 'INR' && phone.length > 10) phone = phone.slice(-10);
    
    const email = customer.email || "guest@example.com";

    // Dynamic Return URL: Detects if on localhost or production
    const proto = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers["host"] || "localhost:3000";
    const origin = process.env.NEXT_PUBLIC_SITE_URL || `${proto}://${host}`;
    const returnUrl = `${origin}?status=success&order_id=${orderId}`;

    console.log(`💱 Creating Order: ${convertedAmount} ${targetCurrency} (Return: ${returnUrl})`);

    const payload = {
      order_id: orderId,
      order_amount: convertedAmount,
      order_currency: targetCurrency,
      customer_details: {
        customer_id: `cust_${Date.now()}`,
        customer_phone: phone,
        customer_name: "BHK Customer",
        customer_email: email,
      },
      order_meta: {
        return_url: returnUrl,
      },
    };

    // 🔹 Step 5: Call Cashfree API
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
      });
    }

    return res.status(200).json({
      success: true,
      paymentSessionId: data.payment_session_id,
      orderId: orderId,
      convertedAmount,
      rate: conversionRate,
      currency: targetCurrency,
    });

  } catch (error: any) {
    console.error("💥 CreateOrder Exception:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal Server Error",
    });
  }
}
