// api/sendEmailOtp.ts
import { otpStore } from "./otpStore.js";
import { Resend } from "resend";

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { email } = req.body;
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    const resendApiKey = process.env.SMS_RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("⚠️ Missing SMS_RESEND_API_KEY in environment variables");
      return res.status(500).json({ error: "Server misconfiguration: Missing API key" });
    }

    // Generate OTP and store
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });
    console.log(`🔐 OTP generated for ${email}: ${otp}`);

    // Send via Resend
    const resend = new Resend(resendApiKey);
    const { error } = await resend.emails.send({
      from: "BHK Interior <no-reply@bhkinterior.com>",
      to: email,
      subject: "Your Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #6E5C54;">BHK Interior Verification</h2>
          <p>Your security code is:</p>
          <h1 style="letter-spacing: 5px; font-size: 32px;">${otp}</h1>
          <p>This code expires in 5 minutes.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      return res.status(500).json({ error: "Failed to send email" });
    }

    return res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (err: any) {
    console.error("❌ Server error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
