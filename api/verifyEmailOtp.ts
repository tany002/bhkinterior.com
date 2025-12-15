// api/verifyEmailOtp.ts
import { getOtp, deleteOtp } from "./otpStore.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }

  try {
    const record = await getOtp(email);

    // 1️⃣ OTP not found
    if (!record) {
      return res.status(400).json({
        verified: false,
        error: "OTP not found or expired. Request a new one.",
      });
    }

    // 2️⃣ OTP expired
    if (Date.now() > record.expiresAt) {
      await deleteOtp(email);
      return res.status(400).json({
        verified: false,
        error: "OTP has expired.",
      });
    }

    // 3️⃣ OTP match
    if (record.otp === otp) {
      await deleteOtp(email);
      console.log(`✅ OTP Verified for ${email}`);

      return res.status(200).json({
        verified: true,
        message: "Email verified successfully",
      });
    } else {
      return res.status(400).json({
        verified: false,
        error: "Invalid OTP.",
      });
    }
  } catch (error) {
    console.error("❌ verifyEmailOtp Error:", error);
    return res.status(500).json({
      verified: false,
      error: "Internal server error. Please try again.",
    });
  }
}
