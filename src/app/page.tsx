"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useBook, MusicProfile } from "../context/BookContext";
import { Volume2, VolumeX, Music, Shield, BookOpen } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { 
    isLoggedIn, 
    activeMusic, 
    setActiveMusic, 
    musicVolume, 
    setMusicVolume 
  } = useBook();
  
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Handle cursor parallax on book cover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    setMousePosition({ x: x / 10, y: y / 10 });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  const handleBeginReading = () => {
    if (isLoggedIn) {
      router.push("/reader");
    } else {
      router.push("/login");
    }
  };

  const soundscapeNames: Record<MusicProfile, string> = {
    none: "Mute",
    piano: "Soft Piano",
    rain: "Rain",
    ocean: "Ocean Waves",
    nature: "Nature Sounds"
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between min-h-screen relative p-6 md:p-12 select-none overflow-hidden">
      
      {/* Top Navigation */}
      <header className="w-full flex items-center justify-between max-w-6xl z-10">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-serif tracking-widest text-sm text-amber-200/50 flex items-center gap-2"
        >
          <BookOpen className="w-4 h-4 text-amber-200/40" />
          <span>UNNAMED FEELS</span>
        </motion.div>
        
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          onClick={() => router.push("/admin")}
          className="text-stone-400 hover:text-amber-200/80 transition-colors flex items-center gap-1.5 text-xs tracking-wider"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>AUTHOR LOGIN</span>
        </motion.button>
      </header>

      {/* Main Core Content */}
      <main className="flex-1 flex flex-col md:flex-row items-center justify-center max-w-5xl w-full gap-12 lg:gap-24 my-12 z-10">
        
        {/* Left Hand: Floating 3D Book Cover Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="w-64 h-96 md:w-72 md:h-[430px] rounded-lg shadow-2xl relative page-flip-container cursor-pointer select-none group"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleBeginReading}
          style={{
            transform: `perspective(1000px) rotateY(${mousePosition.x}deg) rotateX(${-mousePosition.y}deg)`,
            transition: "transform 0.1s ease-out",
          }}
        >
          {/* Book spine simulation */}
          <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-amber-950/20 rounded-l shadow-inner z-20 border-r border-white/5" />
          
          {/* Inner Cover Design */}
          <div className="absolute inset-0 bg-[#070708] rounded-lg overflow-hidden border border-amber-500/10 flex flex-col items-center justify-between p-8 text-center bg-gradient-to-b from-[#131110] via-[#070708] to-[#0d0d0f] shadow-inner">
            
            {/* Top Tagline */}
            <div className="text-[10px] uppercase tracking-[0.25em] text-amber-200/40 font-light mt-4">
              Sometimes, the loudest feelings<br />
              are the ones left unsaid
            </div>

            {/* Core Cover Title */}
            <div className="my-auto py-8">
              <h2 className="font-serif italic text-4xl md:text-5xl text-amber-200/95 font-normal tracking-wide drop-shadow-md select-none">
                Unnamed
                <span className="block mt-1 font-light text-3xl md:text-4xl text-amber-100/90 font-serif">
                  Feels
                </span>
              </h2>
            </div>

            {/* Bottom Credit */}
            <div className="mb-4">
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-amber-200/30 to-transparent mx-auto mb-3" />
              <div className="font-serif italic text-xs tracking-widest text-amber-100/60 font-light select-none">
                - BY JR
              </div>
            </div>

            {/* Premium Gold Spark/Light effect overlay */}
            <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 via-transparent to-transparent pointer-events-none opacity-50 group-hover:opacity-80 transition-opacity duration-700" />
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out pointer-events-none" />
          </div>
        </motion.div>

        {/* Right Hand: Text details & Action Button */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-8 max-w-md md:max-w-lg">
          
          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 0.2 }}
              className="font-serif text-5xl md:text-6xl font-light text-stone-100 tracking-wide"
            >
              Unnamed Feels
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 0.4 }}
              className="font-serif italic text-lg md:text-xl text-amber-100/70 font-light leading-relaxed pl-1"
            >
              &ldquo;Some feelings are never spoken.<br />
              Some stories are never named.&rdquo;
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            {/* Glowing Action Button */}
            <button
              onClick={handleBeginReading}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="relative px-8 py-3.5 rounded-full text-black font-semibold text-sm tracking-widest bg-amber-200 hover:bg-amber-300 transition-all duration-300 shadow-[0_0_15px_rgba(253,230,138,0.2)] hover:shadow-[0_0_25px_rgba(253,230,138,0.45)] hover:scale-105 active:scale-98 w-full sm:w-64 cursor-pointer"
            >
              BEGIN READING
              {/* Internal glow border simulation */}
              <div className="absolute inset-0.5 rounded-full border border-white/20 pointer-events-none" />
            </button>
          </motion.div>

        </div>
      </main>

      {/* Bottom Panel: Interactive Music Controls */}
      <footer className="w-full max-w-4xl z-10 flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-white/5 mt-auto">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1.0 }}
          className="flex flex-col gap-2 items-center sm:items-start"
        >
          <div className="flex items-center gap-2 text-stone-400">
            <Music className="w-3.5 h-3.5 text-amber-200/50" />
            <span className="text-[10px] tracking-[0.2em] font-light">SOUNDSCAPE</span>
            {activeMusic !== "none" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200/10 text-amber-200 font-mono">
                {soundscapeNames[activeMusic].toUpperCase()}
              </span>
            )}
          </div>
          
          {/* Music Profile Selectors */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {(["none", "piano", "rain", "ocean", "nature"] as MusicProfile[]).map((prof) => (
              <button
                key={prof}
                onClick={() => setActiveMusic(prof)}
                className={`px-3 py-1 rounded-full text-[10px] tracking-wider transition-all duration-300 ${
                  activeMusic === prof
                    ? "bg-amber-200/15 text-amber-200 border border-amber-200/20 font-medium"
                    : "text-stone-500 hover:text-stone-300 border border-transparent"
                }`}
              >
                {prof === "none" ? "MUTE" : prof.toUpperCase()}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Volume controls */}
        {activeMusic !== "none" && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <button 
              onClick={() => setMusicVolume(musicVolume === 0 ? 0.3 : 0)}
              className="text-stone-400 hover:text-amber-200 transition-colors"
            >
              {musicVolume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05"
              value={musicVolume}
              onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
              className="w-24 md:w-32 accent-amber-200 bg-stone-800 h-1 rounded-lg appearance-none cursor-pointer"
            />
          </motion.div>
        )}
      </footer>

      {/* Full layout subtle light shade glow */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent pointer-events-none -z-10" />
    </div>
  );
}
