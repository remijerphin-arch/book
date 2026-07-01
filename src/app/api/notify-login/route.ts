import { NextRequest, NextResponse } from "next/server";
import { sendLoginNotification } from "../../../lib/email";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // Secure IP address on the server side if forwarded by Vercel/proxies
    const clientIp = 
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
      req.headers.get("x-real-ip") || 
      payload.ip || 
      "127.0.0.1";

    const updatedPayload = {
      ...payload,
      ip: clientIp,
    };

    // Trigger the email sending service
    await sendLoginNotification(updatedPayload);

    return NextResponse.json({ success: true, mode: process.env.SMTP_USER ? "live" : "demo" });
  } catch (error: any) {
    console.error("Error in notify-login serverless function:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
