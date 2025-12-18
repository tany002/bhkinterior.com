// Inside /api/verifyPayment.ts, right before the final res.status(200).json(...)

const paid = data.order_status === "PAID";

let email = null;
let plan = null;
let billingCycle = null;
let expiry = null;
let verifiedAt = Date.now();

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

  // Calculate expiry in milliseconds
  const durationDays =
    billingCycle === "monthly" ? 30 :
    billingCycle === "6month" ? 180 :
    billingCycle === "yearly" ? 365 : 30;

  expiry = verifiedAt + durationDays * 24 * 60 * 60 * 1000;

} catch (e) {
  console.warn("⚠️ Could not parse payment notes:", e);
}

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
