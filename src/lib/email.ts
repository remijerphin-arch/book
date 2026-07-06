import nodemailer from "nodemailer";

export interface EmailSessionPayload {
  email: string;
  date: string;
  time: string;
  ip: string;
  country: string;
  city: string;
  browser: string;
  os: string;
  device: string;
}

/**
 * Sends a notification email to the author when a reader logs in.
 * Operates in Console Logging mode if no mail credentials are set up.
 */
export async function sendLoginNotification(payload: EmailSessionPayload): Promise<boolean> {
  const authorEmail = process.env.EMAIL_TO || "remijerphin@gmail.com";
  
  const subject = `New Reader Opened "Unnamed Feels"`;
  
  const textBody = `
A new reader has entered your book.

Reader Email: ${payload.email}
Date:         ${payload.date}
Time:         ${payload.time}
Location:     ${payload.city}, ${payload.country}
IP Address:   ${payload.ip}
Browser:      ${payload.browser}
OS:           ${payload.os}
Device:       ${payload.device}
`;

  const htmlBody = `
    <div style="font-family: 'Georgia', serif; max-width: 500px; margin: 0 auto; padding: 30px; border: 1px solid #e5e5e5; border-radius: 8px; background-color: #faf9f6; color: #1c1917;">
      <h2 style="font-style: italic; color: #d4af37; border-bottom: 1px solid #e5e5e5; padding-bottom: 15px; margin-bottom: 20px;">
        Unnamed Feels
      </h2>
      <p style="font-size: 15px; line-height: 1.6; color: #44403c;">
        A new reader has entered your book. Here are the access details:
      </p>
      
      <table style="width: 100%; font-size: 13px; border-collapse: collapse; margin-top: 20px;">
        <tr style="border-bottom: 1px solid #f2f0ea;">
          <td style="padding: 8px 0; color: #78716c; font-family: monospace; font-size: 11px; width: 120px;">READER EMAIL</td>
          <td style="padding: 8px 0; font-weight: bold; color: #1c1917;">${payload.email}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f2f0ea;">
          <td style="padding: 8px 0; color: #78716c; font-family: monospace; font-size: 11px;">DATE</td>
          <td style="padding: 8px 0; color: #1c1917;">${payload.date}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f2f0ea;">
          <td style="padding: 8px 0; color: #78716c; font-family: monospace; font-size: 11px;">TIME</td>
          <td style="padding: 8px 0; color: #1c1917;">${payload.time}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f2f0ea;">
          <td style="padding: 8px 0; color: #78716c; font-family: monospace; font-size: 11px;">LOCATION</td>
          <td style="padding: 8px 0; color: #1c1917;">${payload.city}, ${payload.country}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f2f0ea;">
          <td style="padding: 8px 0; color: #78716c; font-family: monospace; font-size: 11px;">IP ADDRESS</td>
          <td style="padding: 8px 0; color: #78716c; font-family: monospace;">${payload.ip}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f2f0ea;">
          <td style="padding: 8px 0; color: #78716c; font-family: monospace; font-size: 11px;">BROWSER</td>
          <td style="padding: 8px 0; color: #1c1917;">${payload.browser}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f2f0ea;">
          <td style="padding: 8px 0; color: #78716c; font-family: monospace; font-size: 11px;">OPERATING SYS</td>
          <td style="padding: 8px 0; color: #1c1917;">${payload.os}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f2f0ea;">
          <td style="padding: 8px 0; color: #78716c; font-family: monospace; font-size: 11px;">DEVICE</td>
          <td style="padding: 8px 0; color: #1c1917;">${payload.device}</td>
        </tr>
      </table>

      <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e5e5; font-size: 10px; color: #a8a29e; text-align: center; font-style: italic;">
        Some feelings are never spoken. Some stories are never named.
      </div>
    </div>
  `;

  // Check if SMTP environment variables are configured
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD;

  const isSmtpConfigured = !!(smtpHost && smtpUser && smtpPass);

  if (isSmtpConfigured) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"Unnamed Feels Alert" <${smtpUser}>`,
        to: authorEmail,
        subject: subject,
        text: textBody,
        html: htmlBody,
      });

      console.log(`Live login notification email successfully sent to ${authorEmail}`);
      return true;
    } catch (error) {
      console.error("Failed to send live email via SMTP:", error);
      // Fall through to console logging on error
    }
  }

  // Fallback / Demo Mode: Log directly to server logs
  console.log("\n=================== MOCK EMAIL NOTIFICATION ===================");
  console.log(`TO:      ${authorEmail}`);
  console.log(`SUBJECT: ${subject}`);
  console.log(`BODY:`);
  console.log(textBody);
  console.log("================================================================\n");
  
  return true;
}

/**
 * Sends a 6-digit OTP code to the reader.
 * Operates in Console Logging mode if no mail credentials are set up.
 */
export async function sendOtpEmail(email: string, otp: string): Promise<boolean> {
  const subject = `Your Verification Code for "Unnamed Feels"`;
  
  const textBody = `
Your verification code is: ${otp}

This code will expire in 5 minutes.
`;

  const htmlBody = `
    <div style="font-family: 'Georgia', serif; max-width: 500px; margin: 0 auto; padding: 30px; border: 1px solid #e5e5e5; border-radius: 8px; background-color: #faf9f6; color: #1c1917;">
      <h2 style="font-style: italic; color: #d4af37; border-bottom: 1px solid #e5e5e5; padding-bottom: 15px; margin-bottom: 20px;">
        Unnamed Feels
      </h2>
      <p style="font-size: 15px; line-height: 1.6; color: #44403c;">
        Please use the verification code below to enter the book:
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 10px 20px; border: 1px solid #d4af37; border-radius: 4px; color: #1c1917; background-color: #ffffff; font-family: monospace;">
          ${otp}
        </span>
      </div>

      <p style="font-size: 12px; color: #78716c; text-align: center;">
        This code is valid for 5 minutes. If you did not request this code, please ignore this email.
      </p>

      <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e5e5; font-size: 10px; color: #a8a29e; text-align: center; font-style: italic;">
        Some feelings are never spoken. Some stories are never named.
      </div>
    </div>
  `;

  // SMTP Check
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD;

  const isSmtpConfigured = !!(smtpHost && smtpUser && smtpPass);

  if (isSmtpConfigured) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"Unnamed Feels Verification" <${smtpUser}>`,
        to: email,
        subject: subject,
        text: textBody,
        html: htmlBody,
      });

      console.log(`OTP verification email sent to ${email}`);
      return true;
    } catch (error) {
      console.error("Failed to send OTP via SMTP:", error);
      // Fall through to console logging on error
    }
  }

  // Fallback / Demo Mode: Log directly to server logs
  console.log("\n=================== MOCK OTP EMAIL SENT ===================");
  console.log(`TO:      ${email}`);
  console.log(`CODE:    ${otp}`);
  console.log("============================================================\n");
  
  return true;
}
