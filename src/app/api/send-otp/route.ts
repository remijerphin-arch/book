import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sendOtpEmail } from "../../../lib/email";

// Fallback secret for hashing if environment variable not set
const OTP_SECRET = process.env.OTP_SECRET || "unnamed-feels-default-secret-key-12345";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    // 1. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 2. Set expiration (5 minutes from now)
    const duration = 5 * 60 * 1000;
    const expires = Date.now() + duration;

    // 3. Create cryptographically signed token
    // Formula: email + otp + expiration time signed with our secret
    const data = `${email}:${otp}:${expires}`;
    const hash = crypto.createHmac("sha256", OTP_SECRET).update(data).digest("hex");
    
    // Return token containing email, expiration, and hash signature
    const token = `${email}:${expires}:${hash}`;

    // 4. Send the OTP email
    await sendOtpEmail(email, otp);

    const isSmtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER);

    return NextResponse.json({ 
      success: true, 
      token,
      expires,
      mode: isSmtpConfigured ? "live" : "demo" // help client know if it is mock/demo
    });
  } catch (error: any) {
    console.error("Error in send-otp API:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
