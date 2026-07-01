"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useBook } from "../../context/BookContext";
import { Mail, ArrowRight, Loader2, Sparkles, BookOpen } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoggedIn } = useBook();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      router.push("/reader");
    }
  }, [isLoggedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setIsError(true);
      return;
    }

    setIsError(false);
    setIsLoading(true);

    const loadingStages = [
      "Opening the pages...",
      "Preparing memories...",
      "Entering the silence...",
    ];

    let stageIdx = 0;
    setStatusMessage(loadingStages[stageIdx]);

    const stageInterval = setInterval(() => {
      stageIdx++;
      if (stageIdx < loadingStages.length) {
        setStatusMessage(loadingStages[stageIdx]);
      }
    }, 900);

    try {
      // Execute context login (triggers geolocation lookup & API notification email)
      await login(email);
      clearInterval(stageInterval);
      setStatusMessage("Welcome to Unnamed Feels.");
      
      // Delay routing slightly to let the welcome message sink in
      setTimeout(() => {
        router.push("/reader");
      }, 1000);
    } catch (err) {
      clearInterval(stageInterval);
      setIsLoading(false);
      setIsError(true);
      setStatusMessage("Failed to log in. Please try again.");
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
            <BookOpen className="w-5 h-5" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-3xl font-light text-stone-100 tracking-wide">
              Enter the Book
            </h2>
            <p className="text-xs text-stone-500 max-w-[280px] leading-relaxed">
              Provide your email to open the pages and begin your journey.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-5 pt-2">
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
                    ? "border-red-950 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20" 
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
                  <span>READ BOOK</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Error text */}
          <AnimatePresence>
            {isError && !isLoading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-400 text-xs text-center"
              >
                Please enter a valid email address.
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="pt-4 flex items-center justify-center gap-1.5 text-[10px] text-stone-600 font-light">
            <Sparkles className="w-3 h-3 text-amber-200/30" />
            <span>Secure session authentication enabled.</span>
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
