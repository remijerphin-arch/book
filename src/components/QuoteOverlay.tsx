"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { quotes } from "../data/initialBookData";

interface QuoteOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
}

export const QuoteOverlay: React.FC<QuoteOverlayProps> = ({ isVisible, onComplete }) => {
  const [currentQuote, setCurrentQuote] = useState("");

  // Select a random quote whenever the overlay becomes visible
  useEffect(() => {
    if (isVisible) {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setCurrentQuote(quotes[randomIndex]);
      
      // Auto-trigger completion after 3.2 seconds
      const timer = setTimeout(() => {
        onComplete();
      }, 3400);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 text-stone-100 p-8 md:p-16 select-none"
        >
          {/* Subtle gold light background glow */}
          <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 via-transparent to-transparent pointer-events-none" />
          
          <div className="max-w-2xl text-center space-y-6">
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ delay: 0.4, duration: 1.0, ease: "easeOut" }}
              className="font-serif italic text-2xl md:text-3xl lg:text-4xl text-amber-100/90 leading-relaxed font-light drop-shadow-sm"
            >
              &ldquo;{currentQuote.split("\n").map((line, idx) => (
                <span key={idx} className="block mt-2">
                  {line}
                </span>
              ))}&rdquo;
            </motion.p>
            
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 0.3 }}
              exit={{ scaleX: 0, opacity: 0 }}
              transition={{ delay: 1.0, duration: 0.8 }}
              className="h-[1px] w-24 bg-gradient-to-r from-transparent via-amber-200 to-transparent mx-auto mt-8"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
