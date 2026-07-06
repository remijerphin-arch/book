"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useBook } from "../../context/BookContext";
import { Mail, ArrowRight, Loader2, Sparkles, BookOpen, KeyRound, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoggedIn } = useBook();
  
  // Stages: "email" or "otp"
  const [stage, setStage] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  
  // Verification states
  const [token, setToken] = useState("");
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  // Loading & error states
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      router.push("/reader");
    }
  }, [isLoggedIn, router]);

  // Resend Countdown Timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Client-side Device & Location detection helper
  const detectDeviceInfo = async () => {
    let ip = "127.0.0.1";
    let country = "Unknown";
    let city = "Unknown";
    let browser = "Unknown";
    let os = "Unknown";
    let device = "Desktop";

    try {
      const geoRes = await fetch("https://ipapi.co/json/").then(res => res.json());
      if (geoRes && geoRes.ip) {
        ip = geoRes.ip;
        country = geoRes.country_name || "Unknown";
        city = geoRes.city || "Unknown";
      }
    } catch (e) {
      console.warn("Geolocator request failed.");
    }

    const ua = navigator.userAgent;
    if (/android/i.test(ua)) {
      device = "Mobile (Android)";
      os = "Android";
    } else if (/iPad|iPhone|iPod/.test(ua)) {
      device = "Mobile (iOS)";
      os = "iOS";
    } else if (/Macintosh/.test(ua)) {
      device = "Desktop (Mac)";
      os = "macOS";
    } else if (/Windows/.test(ua)) {
      device = "Desktop (Windows)";
      os = "Windows";
    } else if (/Linux/.test(ua)) {
      device = "Desktop (Linux)";
      os = "Linux";
    }

    if (/chrome|crios/i.test(ua)) {
      browser = "Chrome";
    } else if (/firefox|fxios/i.test(ua)) {
      browser = "Firefox";
    } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
      browser = "Safari";
    } else if (/edge/i.test(ua)) {
      browser = "Edge";
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
    const formattedTime = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

    return {
      ip,
      country,
      city,
      browser,
      os,
      device,
      date: formattedDate,
      time: formattedTime
    };
  };

  // Step 1: Send OTP to Email
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email.trim())) {
      setIsError(true);
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsError(false);
    setIsLoading(true);
    setStatusMessage("Sending code...");

    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setToken(data.token);
        setIsDemoMode(data.mode === "demo");
        setStage("otp");
        setCountdown(60); // 60s cooldown for resend
        setIsLoading(false);
        setOtpCode("");
      } else {
        throw new Error(data.error || "Failed to dispatch verification code.");
      }
    } catch (err: any) {
      setIsLoading(false);
      setIsError(true);
      setErrorMessage(err?.message || "Failed to send code. Please try again.");
    }
  };

  // Step 2: Verify OTP and log in
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setIsError(true);
      setErrorMessage("Please enter the 6-digit code.");
      return;
    }

    setIsError(false);
    setIsLoading(true);
    setStatusMessage("Verifying code...");

    try {
      // Get device log info to send to author alert
      const deviceInfo = await detectDeviceInfo();

      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp: otpCode.trim(),
          token,
          deviceInfo
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatusMessage("Verified successfully.");
        // Call local state login helper (skipNotify=true because verify-otp already emailed the author)
        await login(email.trim(), true);
        
        setTimeout(() => {
          router.push("/reader");
        }, 1000);
      } else {
        throw new Error(data.error || "Incorrect verification code.");
      }
    } catch (err: any) {
      setIsLoading(false);
      setIsError(true);
      setErrorMessage(err?.message || "Verification failed. Please try again.");
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen relative p-6 select-none">
      
      {/* Background radial gold glow */}
      <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 via-transparent to-transparent pointer-events-none -z-10" />

      {/* Main glassmorphism login card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, ease: "easeOut" }}
        className="w-full max-w-md p-8 md:p-10 rounded-2xl border border-white/5 bg-[#0a0a0c]/60 backdrop-blur-xl shadow-2xl relative overflow-hidden"
      >
        {/* Subtle top ambient gold line */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-200/40 to-transparent" />

        <div className="flex flex-col items-center text-center space-y-6">
          {/* Brand Icon */}
          <div className="w-12 h-12 rounded-full border border-amber-200/20 bg-amber-200/5 flex items-center justify-center text-amber-200/70 shadow-[0_0_15px_rgba(253,230,138,0.05)]">
            {stage === "email" ? <BookOpen className="w-5 h-5" /> : <KeyRound className="w-5 h-5 text-amber-200" />}
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-3xl font-light text-stone-100 tracking-wide">
              {stage === "email" ? "Enter the Book" : "Verification"}
            </h2>
            <p className="text-xs text-stone-500 max-w-[280px] leading-relaxed">
              {stage === "email" 
                ? "Provide your email to receive a secure access code." 
                : `We sent a 6-digit code to ${email}.`}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {stage === "email" ? (
              /* STAGE 1: EMAIL REQUEST FORM */
              <motion.form
                key="email-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleRequestOtp}
                className="w-full space-y-5 pt-2"
              >
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-600">
                    <Mail className="w-4 h-4" />
                  </span>
                  
                  <input
                    type="email"
                    required
                    disabled={isLoading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg text-sm bg-black/40 border text-stone-100 placeholder-stone-600 focus:outline-none transition-all duration-300 ${
                      isError 
                        ? "border-red-950/70 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20" 
                        : "border-white/5 focus:border-amber-200/30 focus:ring-1 focus:ring-amber-200/10"
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg font-medium text-xs tracking-widest text-black bg-amber-200 hover:bg-amber-300 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(253,230,138,0.2)] active:scale-98"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span className="font-mono text-[10px] tracking-widest uppercase">
                        {statusMessage.toUpperCase()}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>GET CODE</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              /* STAGE 2: OTP VERIFICATION FORM */
              <motion.form
                key="otp-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleVerifyOtp}
                className="w-full space-y-5 pt-2"
              >
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    disabled={isLoading}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))} // Only numbers
                    placeholder="0 0 0 0 0 0"
                    className={`w-full py-3 rounded-lg text-center font-mono text-lg tracking-[0.6em] bg-black/40 border text-stone-100 placeholder-stone-700 focus:outline-none transition-all duration-300 ${
                      isError 
                        ? "border-red-950/70 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20" 
                        : "border-white/5 focus:border-amber-200/30 focus:ring-1 focus:ring-amber-200/10"
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg font-medium text-xs tracking-widest text-black bg-amber-200 hover:bg-amber-300 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(253,230,138,0.2)] active:scale-98"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span className="font-mono text-[10px] tracking-widest uppercase">
                        {statusMessage.toUpperCase()}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>VERIFY CODE</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                {/* Back to change email & Resend timer */}
                <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1 select-none">
                  <button
                    type="button"
                    onClick={() => {
                      setStage("email");
                      setIsError(false);
                    }}
                    className="hover:text-stone-300 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Change Email</span>
                  </button>

                  {countdown > 0 ? (
                    <span>Resend in {countdown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      className="text-amber-200/70 hover:text-amber-250 hover:underline transition-all cursor-pointer font-medium"
                    >
                      Resend Code
                    </button>
                  )}
                </div>

                {/* Demo Mode bypass helper */}
                {isDemoMode && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    className="p-3 rounded-lg border border-amber-500/10 bg-amber-500/[0.02] text-amber-200/60 text-[10px] text-center leading-normal"
                  >
                    <strong>Demo Mode Active:</strong> SMTP credentials are not configured. Use the bypass code <span className="text-amber-200 font-mono font-bold">123456</span> to enter, or inspect the terminal console logs.
                  </motion.div>
                )}
              </motion.form>
            )}
          </AnimatePresence>

          {/* Error text */}
          <AnimatePresence>
            {isError && !isLoading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-400 text-xs text-center font-light leading-relaxed"
              >
                {errorMessage}
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="pt-4 flex items-center justify-center gap-1.5 text-[10px] text-stone-600 font-light">
            <Sparkles className="w-3 h-3 text-amber-200/30" />
            <span>Secure OTP session authentication enabled.</span>
          </div>
        </div>

        {/* Dynamic ambient hover particle glow */}
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-amber-500/5 rounded-full filter blur-xl pointer-events-none" />
      </motion.div>

      {/* Floating back button to landing page */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        whileHover={{ opacity: 0.9 }}
        onClick={() => router.push("/")}
        className="absolute bottom-8 text-[10px] tracking-[0.25em] text-stone-500 hover:text-stone-300 transition-colors uppercase"
      >
        ← BACK TO COVER
      </motion.button>
    </div>
  );
}
