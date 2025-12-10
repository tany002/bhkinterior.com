// api/sendEmailOtp.ts
import { otpStore } from "./otpStore";
import { Resend } from "resend";

export default async function handler(req: any, res: any) {
  console.log("📩 [sendEmailOtp] Request received:", req.method, req.body);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
      console.warn("❌ Invalid email:", email);
      return res.status(400).json({ error: "Invalid email address" });
    }

    // Grab API key from environment
    const resendApiKey = process.env.SMS_RESEND_API_KEY || process.env.RESEND_API_KEY;
    console.log("🔑 Resend API key present:", !!resendApiKey);

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    otpStore.set(email, { otp, expiresAt });
    console.log(`🧾 OTP Generated for ${email}: ${otp} (expires in 5 min)`);

    // If API key missing → skip sending email, just simulate
    if (!resendApiKey) {
      console.warn("⚠️ SMS_RESEND_API_KEY missing. Simulating success (no email sent).");
      return res.status(200).json({
        success: true,
        simulated: true,
        message: `OTP generated locally: ${otp}`,
      });
    }

    // Initialize Resend safely
    let resend: Resend;
    try {
      resend = new Resend(resendApiKey);
    } catch (err) {
      console.error("❌ Failed to initialize Resend:", err);
      return res.status(500).json({ error: "Failed to initialize Resend" });
    }

    // Send the OTP email
    const { data, error } = await resend.emails.send({
      from: "BHK Interior <onboarding@resend.dev>",
      to: email,
      subject: "Your Verification Code",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #6E5C54;">BHK Interior Verification</h2>
          <p>Your security code is:</p>
          <h1 style="letter-spacing: 5px; font-size: 32px; color: #000;">${otp}</h1>
          <p>This code expires in 5 minutes.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Resend email error:", error);
      return res.status(500).json({ error: `Email send failed: ${error.message}` });
    }

    console.log("✅ Email sent successfully via Resend:", data?.id || "no-id");
    return res.status(200).json({ success: true, message: "OTP sent successfully" });

  } catch (err: any) {
    console.error("💥 sendEmailOtp internal error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Internal Server Error",
    });
  }
}
