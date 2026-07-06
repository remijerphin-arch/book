import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sendLoginNotification } from "../../../lib/email";

const OTP_SECRET = process.env.OTP_SECRET || "unnamed-feels-default-secret-key-12345";

export async function POST(req: NextRequest) {
  try {
    const { email, otp, token, deviceInfo } = await req.json();

    if (!email || !otp || !token) {
      return NextResponse.json(
        { success: false, error: "Email, OTP, and Token are required" },
        { status: 400 }
      );
    }

    const isSmtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER);
    let isValid = false;

    // 1. Allow Bypass Code in Demo Mode
    if (!isSmtpConfigured && otp === "123456") {
      isValid = true;
    } else {
      // 2. Cryptographic Validation
      const parts = token.split(":");
      if (parts.length !== 3) {
        return NextResponse.json({ success: false, error: "Invalid verification token format" }, { status: 400 });
      }

      const [tokenEmail, expiresStr, hashSignature] = parts;
      const expires = parseInt(expiresStr, 10);

      // Verify email matches token
      if (tokenEmail !== email) {
        return NextResponse.json({ success: false, error: "Token email mismatch" }, { status: 400 });
      }

      // Check Expiration
      if (Date.now() > expires) {
        return NextResponse.json({ success: false, error: "Verification code has expired" }, { status: 400 });
      }

      // Recalculate Hash
      const data = `${email}:${otp}:${expires}`;
      const calculatedHash = crypto.createHmac("sha256", OTP_SECRET).update(data).digest("hex");

      if (hashSignature === calculatedHash) {
        isValid = true;
      }
    }

    if (!isValid) {
      return NextResponse.json({ success: false, error: "Incorrect verification code" }, { status: 401 });
    }

    // 3. Trigger Author Login Alert Email on successful OTP verification
    if (deviceInfo) {
      const clientIp = 
        req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
        req.headers.get("x-real-ip") || 
        deviceInfo.ip || 
        "127.0.0.1";

      const payload = {
        email,
        date: deviceInfo.date || new Date().toLocaleDateString(),
        time: deviceInfo.time || new Date().toLocaleTimeString(),
        ip: clientIp,
        country: deviceInfo.country || "Unknown",
        city: deviceInfo.city || "Unknown",
        browser: deviceInfo.browser || "Unknown",
        os: deviceInfo.os || "Unknown",
        device: deviceInfo.device || "Unknown",
      };

      await sendLoginNotification(payload);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in verify-otp API:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
