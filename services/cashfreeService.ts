
/**
 * Cashfree Payment Service
 * Handles SDK loading, order creation via backend, and checkout execution.
 */

declare global {
  interface Window {
    Cashfree: any;
  }
}

let cashfreeInstance: any = null;

// 1. Load Script
const loadCashfreeScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Cashfree) return resolve(true);

    if (document.querySelector('script[src="https://sdk.cashfree.com/js/v3/cashfree.js"]')) {
      return resolve(true);
    }

    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("Failed to load Cashfree SDK");
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// 2. Initialize SDK
export const initializeCashfree = async (): Promise<boolean> => {
  const envMode = process.env.NEXT_PUBLIC_CASHFREE_ENV?.trim() === "production" ? "production" : "sandbox";

  if (cashfreeInstance) return true;

  const loaded = await loadCashfreeScript();
  if (!loaded) return false;

  // Tiny delay to ensure window.Cashfree is ready
  if (!window.Cashfree) await new Promise(r => setTimeout(r, 200));

  if (window.Cashfree) {
    try {
      cashfreeInstance = new window.Cashfree({ mode: envMode });
      console.log(`✅ Cashfree initialized (${envMode})`);
      return true;
    } catch (e) {
      console.error("Cashfree Init Error", e);
      return false;
    }
  }
  return false;
};

// 3. Create Order
export const createOrder = async (
  amount: number,
  customer: { phone: string; email: string },
  currency: string = "INR"
): Promise<{
  success: boolean;
  paymentSessionId?: string;
  orderId?: string;
  error?: string;
}> => {
  try {
    const response = await fetch("/api/createOrder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, customer, currency }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return { success: false, error: data.error || "Failed to create order" };
    }

    return {
      success: true,
      paymentSessionId: data.paymentSessionId,
      orderId: data.orderId,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// 4. Execute Payment
export const doPayment = async (paymentSessionId: string): Promise<void> => {
  if (!paymentSessionId) {
    alert("Invalid payment session");
    return;
  }

  // MOCK MODE HANDLING (For dev testing without keys)
  if (paymentSessionId.startsWith("session_mock_")) {
    console.log("🟢 Executing Mock Payment...");
    await new Promise(r => setTimeout(r, 1500)); // Simulate processing delay
    const baseUrl = window.location.href.split("?")[0];
    window.location.replace(`${baseUrl}?status=success&order_id=${paymentSessionId}`);
    return;
  }

  // REAL MODE
  if (!cashfreeInstance) {
    const success = await initializeCashfree();
    if (!success) {
      alert("Payment gateway failed to load");
      return;
    }
  }

  try {
    await cashfreeInstance.checkout({
      paymentSessionId,
      redirectTarget: "_self",
    });
  } catch (err) {
    console.error("Checkout Error", err);
    alert("Payment failed to launch");
  }
};
