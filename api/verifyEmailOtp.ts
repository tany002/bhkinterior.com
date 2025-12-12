
// api/verifyEmailOtp.ts
import { otpStore } from "./otpStore.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }

  const record = otpStore.get(email);

  // 1. Check if OTP exists
  if (!record) {
    return res.status(400).json({ verified: false, error: "OTP not found or expired. Request a new one." });
  }

  // 2. Check for expiration
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ verified: false, error: "OTP has expired." });
  }

  // 3. Validate Code
  if (record.otp === otp) {
    // Success - Clear OTP to prevent reuse
    otpStore.delete(email);
    
    console.log(`✅ OTP Verified for ${email}`);
    
    return res.status(200).json({ 
      verified: true,
      message: "Email verified successfully" 
    });
  } else {
    return res.status(400).json({ verified: false, error: "Invalid OTP." });
  }
}
