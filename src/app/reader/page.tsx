"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useBook, Theme, FontSize, ReadingWidth, LineHeight, Bookmark } from "../../context/BookContext";
import { 
  BookOpen, Bookmark as BookmarkIcon, Settings, ArrowLeft, ArrowRight, 
  Menu, X, Sun, Moon, Maximize, Minimize, LogOut, ChevronRight, Lock, 
  LayoutDashboard, Volume2, Music, CheckCircle2
} from "lucide-react";

export default function ReaderPage() {
  const router = useRouter();
  const {
    userEmail,
    isLoggedIn,
    logout,
    bookData,
    theme,
    setTheme,
    fontSize,
    setFontSize,
    readingWidth,
    setReadingWidth,
    lineHeight,
    setLineHeight,
    bookmarks,
    toggleBookmark,
    isBookmarked,
    lastRead,
    setLastRead,
    completedChapters,
    markChapterComplete,
    getCompletionPercentage,
    activeMusic,
    setActiveMusic
  } = useBook();

  // Navigation and layout states
  const [viewMode, setViewMode] = useState<"dashboard" | "reading">("dashboard");
  const [activePartIdx, setActivePartIdx] = useState(0);
  const [activeChIdx, setActiveChIdx] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pageDirection, setPageDirection] = useState(0); // -1 for prev, 1 for next

  const readingAreaRef = useRef<HTMLDivElement>(null);

  // 1. Auth Guard Redirect
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, router]);

  // Load last read chapter on entry
  useEffect(() => {
    if (lastRead && bookData.length > 0) {
      const partIdx = bookData.findIndex(p => p.id === lastRead.partId);
      if (partIdx !== -1) {
        const chIdx = bookData[partIdx].chapters.findIndex(c => c.id === lastRead.chapterId);
        if (chIdx !== -1) {
          setActivePartIdx(partIdx);
          setActiveChIdx(chIdx);
        }
      }
    }
  }, [lastRead, bookData]);

  // Auto-save reading position and mark read on active chapter change
  useEffect(() => {
    if (viewMode === "reading" && bookData.length > 0) {
      const currentPart = bookData[activePartIdx];
      const currentCh = currentPart.chapters[activeChIdx];
      
      if (currentPart && currentCh) {
        setLastRead(currentPart.id, currentCh.id);
        
        // Auto-complete chapter if published
        if (currentCh.published) {
          markChapterComplete(currentCh.id);
        }
      }
    }
  }, [activePartIdx, activeChIdx, viewMode, bookData]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== "reading") return;

      if (e.key === "ArrowRight") {
        handleNextChapter();
      } else if (e.key === "ArrowLeft") {
        handlePrevChapter();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePartIdx, activeChIdx, viewMode, bookData]);

  if (!isLoggedIn || bookData.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-screen bg-black text-stone-300">
        <div className="animate-pulse tracking-widest text-xs uppercase">Loading book...</div>
      </div>
    );
  }

  const currentPart = bookData[activePartIdx];
  const currentCh = currentPart?.chapters[activeChIdx];

  // Handlers for changing chapters
  const navigateToChapter = (partIdx: number, chIdx: number) => {
    setPageDirection(partIdx > activePartIdx || (partIdx === activePartIdx && chIdx > activeChIdx) ? 1 : -1);
    setActivePartIdx(partIdx);
    setActiveChIdx(chIdx);
    setIsSidebarOpen(false);
    setViewMode("reading");
    if (readingAreaRef.current) {
      readingAreaRef.current.scrollTo(0, 0);
    }
  };

  const handleNextChapter = () => {
    const currentPartData = bookData[activePartIdx];
    if (activeChIdx < currentPartData.chapters.length - 1) {
      setPageDirection(1);
      setActiveChIdx(activeChIdx + 1);
    } else if (activePartIdx < bookData.length - 1) {
      setPageDirection(1);
      setActivePartIdx(activePartIdx + 1);
      setActiveChIdx(0);
    }
  };

  const handlePrevChapter = () => {
    if (activeChIdx > 0) {
      setPageDirection(-1);
      setActiveChIdx(activeChIdx - 1);
    } else if (activePartIdx > 0) {
      setPageDirection(-1);
      const prevPartIdx = activePartIdx - 1;
      setActivePartIdx(prevPartIdx);
      setActiveChIdx(bookData[prevPartIdx].chapters.length - 1);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false));
      }
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Typography Class Mapping
  const fontSizeClasses: Record<FontSize, string> = {
    sm: "text-sm md:text-base",
    base: "text-base md:text-lg",
    lg: "text-lg md:text-xl",
    xl: "text-xl md:text-2xl",
    "2xl": "text-2xl md:text-3xl",
  };

  const readingWidthClasses: Record<ReadingWidth, string> = {
    narrow: "max-w-md",
    normal: "max-w-xl",
    wide: "max-w-3xl",
  };

  const lineHeightClasses: Record<LineHeight, string> = {
    snug: "leading-snug",
    normal: "leading-normal",
    relaxed: "leading-relaxed",
    loose: "leading-loose",
  };

  // Page animation settings (Framer Motion)
  const pageVariants = {
    enter: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? 80 : -80,
    }),
    center: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" as const }
    },
    exit: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? -80 : 80,
      transition: { duration: 0.4, ease: "easeIn" as const }
    })
  };

  return (
    <div className={`flex-1 flex flex-col min-h-screen relative text-stone-100 dark:text-stone-100 light:text-stone-900 ${theme === 'light' ? 'bg-[#fcfbfa]' : 'bg-[#070708]'}`}>
      
      {/* -------------------- VIEW 1: READER DASHBOARD -------------------- */}
      {viewMode === "dashboard" && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex-1 flex flex-col p-6 md:p-12 max-w-5xl mx-auto w-full z-10 space-y-12 select-none"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-stone-800 pb-8 mt-6">
            <div className="space-y-1">
              <span className="text-[10px] tracking-[0.25em] text-amber-200/50 uppercase font-light">Reader Workspace</span>
              <h1 className="font-serif text-3xl font-light text-stone-100 flex items-center gap-3">
                Welcome
              </h1>
              <p className="text-xs text-stone-500 font-mono font-light">{userEmail}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={handleLogout}
                className="px-4 py-2 border border-white/5 bg-[#0a0a0c]/40 hover:bg-stone-900/30 text-stone-400 hover:text-stone-200 text-xs tracking-wider rounded-lg flex items-center gap-2 transition-all duration-300 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>SIGN OUT</span>
              </button>
            </div>
          </div>

          {/* Core Analytics Cards & Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Completion Percentage */}
            <div className="p-6 rounded-xl border border-white/5 bg-[#0b0b0d]/50 backdrop-blur flex flex-col justify-between h-40">
              <span className="text-[9px] tracking-[0.2em] text-stone-500 uppercase font-light">Reading Progress</span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-light text-amber-200">{getCompletionPercentage()}%</span>
                <span className="text-xs text-stone-600">COMPLETED</span>
              </div>
              <div className="w-full bg-stone-900 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-200 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${getCompletionPercentage()}%` }}
                />
              </div>
            </div>

            {/* Continue Reading Shortcut */}
            <div className="p-6 rounded-xl border border-white/5 bg-[#0b0b0d]/50 backdrop-blur flex flex-col justify-between h-40">
              <span className="text-[9px] tracking-[0.2em] text-stone-500 uppercase font-light">Last Opened</span>
              <div>
                {lastRead ? (
                  <>
                    <h3 className="font-serif italic text-lg text-stone-200 line-clamp-1">
                      {bookData.find(p => p.id === lastRead.partId)?.subtitle || "Untitled"}
                    </h3>
                    <p className="text-[10px] text-stone-500 font-light mt-1">
                      {bookData.find(p => p.id === lastRead.partId)?.title}
                    </p>
                  </>
                ) : (
                  <h3 className="font-serif italic text-lg text-stone-500">Not started yet</h3>
                )}
              </div>
              <button
                onClick={() => {
                  if (lastRead) {
                    const pIdx = bookData.findIndex(p => p.id === lastRead.partId);
                    const cIdx = pIdx !== -1 ? bookData[pIdx].chapters.findIndex(c => c.id === lastRead.chapterId) : 0;
                    navigateToChapter(pIdx !== -1 ? pIdx : 0, cIdx !== -1 ? cIdx : 0);
                  } else {
                    navigateToChapter(0, 0); // start from beginning
                  }
                }}
                className="w-full py-2 bg-amber-200 text-black text-xs font-semibold tracking-widest rounded-lg flex items-center justify-center gap-1.5 hover:bg-amber-300 transition-colors cursor-pointer"
              >
                <span>{lastRead ? "RESUME READING" : "BEGIN READING"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bookmarks count / list */}
            <div className="p-6 rounded-xl border border-white/5 bg-[#0b0b0d]/50 backdrop-blur flex flex-col justify-between h-40">
              <span className="text-[9px] tracking-[0.2em] text-stone-500 uppercase font-light">Saved Bookmarks</span>
              <div className="flex items-center gap-3">
                <BookmarkIcon className="w-8 h-8 text-amber-200/40" />
                <span className="text-4xl font-light text-stone-200">{bookmarks.length}</span>
                <span className="text-xs text-stone-600">BOOKMARKS</span>
              </div>
              <p className="text-[10px] text-stone-500 leading-snug truncate">
                {bookmarks.length > 0 
                  ? `Last saved: "${bookmarks[bookmarks.length-1].previewText}"`
                  : "Bookmarks let you save pages."}
              </p>
            </div>

          </div>

          {/* Book Index Outline */}
          <div className="space-y-6">
            <h2 className="font-serif text-xl text-amber-100/80 font-light border-b border-stone-900 pb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-200/30" />
              <span>Table of Contents</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookData.map((part, pIdx) => {
                const isPublished = part.chapters[0]?.published;
                
                return (
                  <div 
                    key={part.id}
                    onClick={() => navigateToChapter(pIdx, 0)}
                    className="p-5 rounded-xl border border-white/5 bg-[#08080a]/30 hover:bg-[#0c0c0f]/80 hover:border-amber-200/10 transition-all duration-300 flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      {/* Status indicator */}
                      <div className="mt-1">
                        {!isPublished ? (
                          <Lock className="w-4 h-4 text-stone-700" />
                        ) : completedChapters.includes(part.chapters[0]?.id) ? (
                          <CheckCircle2 className="w-4 h-4 text-amber-200/50" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-stone-800 group-hover:border-amber-200/30 transition-colors" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] tracking-widest text-stone-500 font-mono">{part.title}</span>
                        <h4 className={`font-serif italic text-md group-hover:text-amber-200 transition-colors ${isPublished ? 'text-stone-300' : 'text-stone-600'}`}>
                          {part.subtitle}
                        </h4>
                        {!isPublished && (
                          <span className="text-[9px] text-amber-200/40 uppercase tracking-widest font-mono">Not Published</span>
                        )}
                      </div>
                    </div>

                    {isPublished && (
                      <ChevronRight className="w-4 h-4 text-stone-600 group-hover:translate-x-1 transition-transform" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bookmarks Section details */}
          {bookmarks.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-serif text-lg text-stone-400 font-light border-b border-stone-900 pb-2">Your Bookmarks</h2>
              <div className="flex flex-col gap-2 max-w-3xl">
                {bookmarks.map((bm, idx) => {
                  const partIdx = bookData.findIndex(p => p.id === bm.partId);
                  const chIdx = partIdx !== -1 ? bookData[partIdx].chapters.findIndex(c => c.id === bm.chapterId) : 0;
                  const partTitle = bookData[partIdx]?.title || "Part";
                  const partSub = bookData[partIdx]?.subtitle || "Untitled";

                  return (
                    <div 
                      key={idx}
                      onClick={() => navigateToChapter(partIdx !== -1 ? partIdx : 0, chIdx !== -1 ? chIdx : 0)}
                      className="p-3.5 rounded-lg border border-stone-900/60 bg-black/10 hover:bg-black/30 flex items-center justify-between text-xs cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <BookmarkIcon className="w-3.5 h-3.5 text-amber-200/60 flex-shrink-0" />
                        <span className="text-stone-400 font-mono text-[10px] tracking-wider">{partTitle}:</span>
                        <span className="text-stone-300 italic truncate font-serif font-light">{bm.previewText}</span>
                      </div>
                      <span className="text-[10px] text-stone-600 font-mono flex-shrink-0 group-hover:text-amber-200 transition-colors ml-4 uppercase">
                        GO TO PAGE →
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* -------------------- VIEW 2: ACTIVE READING INTERFACE -------------------- */}
      {viewMode === "reading" && (
        <div className="flex-1 flex overflow-hidden h-screen select-text relative">
          
          {/* Collapsible Outline Sidebar */}
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "tween", duration: 0.3 }}
                className="fixed md:relative z-30 inset-y-0 left-0 w-[280px] bg-[#09090b] border-r border-stone-900 flex flex-col justify-between"
              >
                {/* Sidebar Header */}
                <div className="p-5 flex items-center justify-between border-b border-stone-900">
                  <div className="font-serif italic text-stone-300 tracking-wide">Unnamed Feels</div>
                  <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1 rounded text-stone-500 hover:text-stone-300 hover:bg-stone-900 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Sidebar Chapters List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-5">
                  {bookData.map((part, pIdx) => (
                    <div key={part.id} className="space-y-1.5">
                      <div className="text-[9px] font-mono tracking-widest text-stone-600 uppercase pl-3">
                        {part.title}
                      </div>
                      
                      {part.chapters.map((ch, cIdx) => {
                        const isCurrent = pIdx === activePartIdx && cIdx === activeChIdx;
                        const isPub = ch.published;

                        return (
                          <button
                            key={ch.id}
                            onClick={() => isPub && navigateToChapter(pIdx, cIdx)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-all ${
                              isCurrent
                                ? "bg-amber-200/10 text-amber-200 border border-amber-200/10"
                                : isPub
                                ? "text-stone-400 hover:bg-stone-900/50 hover:text-stone-200 border border-transparent"
                                : "text-stone-700 cursor-not-allowed border border-transparent"
                            }`}
                          >
                            <span className="font-serif italic truncate">{ch.title}</span>
                            {!isPub && <Lock className="w-3 h-3 text-stone-800" />}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-stone-900 flex items-center justify-between">
                  <button
                    onClick={() => setViewMode("dashboard")}
                    className="text-[10px] tracking-widest text-amber-200/70 hover:text-amber-200 font-mono uppercase"
                  >
                    ← Dashboard
                  </button>
                  <span className="text-[10px] text-stone-600 font-mono">BY JR</span>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main Reading Canvas Area */}
          <div className="flex-1 flex flex-col justify-between overflow-hidden relative">
            
            {/* Top Reader Controls Header */}
            <header className="p-4 border-b border-stone-900/50 flex items-center justify-between z-20 backdrop-blur-md bg-transparent relative">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 rounded-lg hover:bg-stone-900/50 transition-colors text-stone-400 hover:text-stone-200 cursor-pointer"
                >
                  <Menu className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("dashboard")}
                  className="hidden md:flex items-center gap-1 text-[10px] tracking-widest text-stone-400 hover:text-stone-200 uppercase font-mono transition-colors cursor-pointer"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-stone-500" />
                  <span>Dashboard</span>
                </button>
              </div>

              {/* Title details */}
              <div className="text-center select-none space-y-0.5">
                <span className="text-[8px] font-mono tracking-widest text-amber-200/40 uppercase">{currentPart?.title}</span>
                <h2 className="font-serif italic text-sm text-stone-300 font-light">{currentCh?.title}</h2>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 relative">
                {/* Bookmark Toggle */}
                {currentCh?.published && (
                  <button
                    onClick={() => toggleBookmark(currentPart.id, currentCh.id, currentCh.content)}
                    className="p-2 rounded-lg hover:bg-stone-900/50 transition-colors text-stone-400 hover:text-amber-200 cursor-pointer"
                  >
                    <BookmarkIcon 
                      className={`w-4 h-4 ${isBookmarked(currentPart.id, currentCh.id) ? "fill-amber-200 text-amber-200" : ""}`} 
                    />
                  </button>
                )}

                {/* Settings Toggle Button */}
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="p-2 rounded-lg hover:bg-stone-900/50 transition-colors text-stone-400 hover:text-stone-200 cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {/* Fullscreen Toggle */}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-lg hover:bg-stone-900/50 transition-colors text-stone-400 hover:text-stone-200 cursor-pointer"
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>

                {/* Dropdown Reader Settings Drawer/Box */}
                <AnimatePresence>
                  {isSettingsOpen && (
                    <>
                      {/* Backdrop to close settings */}
                      <div className="fixed inset-0 z-10" onClick={() => setIsSettingsOpen(false)} />
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-12 w-64 p-5 rounded-xl border border-stone-800 bg-[#0a0a0c] shadow-2xl z-20 space-y-5 select-none"
                      >
                        <h4 className="text-[10px] tracking-widest text-stone-500 font-mono uppercase pb-1.5 border-b border-stone-900">
                          Reading Preferences
                        </h4>

                        {/* Theme setting */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-stone-600 font-mono">THEME</label>
                          <div className="grid grid-cols-2 gap-1 bg-black/40 p-0.5 rounded-lg border border-stone-900">
                            <button
                              onClick={() => setTheme("dark")}
                              className={`py-1.5 text-[10px] rounded flex items-center justify-center gap-1.5 transition-colors ${
                                theme === "dark" ? "bg-stone-900 text-stone-200" : "text-stone-500 hover:text-stone-300"
                              }`}
                            >
                              <Moon className="w-3 h-3" />
                              <span>DARK</span>
                            </button>
                            <button
                              onClick={() => setTheme("light")}
                              className={`py-1.5 text-[10px] rounded flex items-center justify-center gap-1.5 transition-colors ${
                                theme === "light" ? "bg-stone-200 text-black" : "text-stone-500 hover:text-stone-300"
                              }`}
                            >
                              <Sun className="w-3 h-3" />
                              <span>LIGHT</span>
                            </button>
                          </div>
                        </div>

                        {/* Font size setting */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-stone-600 font-mono">FONT SIZE</label>
                          <div className="flex items-center justify-between gap-1">
                            {(["sm", "base", "lg", "xl", "2xl"] as FontSize[]).map((size) => (
                              <button
                                key={size}
                                onClick={() => setFontSize(size)}
                                className={`flex-1 py-1 rounded text-[10px] border transition-colors ${
                                  fontSize === size
                                    ? "bg-amber-200/10 text-amber-200 border-amber-200/25 font-bold"
                                    : "border-transparent text-stone-500 hover:text-stone-300"
                                }`}
                              >
                                {size.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Reading width setting */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-stone-600 font-mono">COLUMN WIDTH</label>
                          <div className="flex items-center justify-between gap-1">
                            {(["narrow", "normal", "wide"] as ReadingWidth[]).map((widthVal) => (
                              <button
                                key={widthVal}
                                onClick={() => setReadingWidth(widthVal)}
                                className={`flex-1 py-1 rounded text-[10px] border transition-colors ${
                                  readingWidth === widthVal
                                    ? "bg-amber-200/10 text-amber-200 border-amber-200/25"
                                    : "border-transparent text-stone-500 hover:text-stone-300"
                                }`}
                              >
                                {widthVal.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Line height setting */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-stone-600 font-mono">LINE HEIGHT</label>
                          <div className="flex items-center justify-between gap-1">
                            {(["snug", "normal", "relaxed", "loose"] as LineHeight[]).map((heightVal) => (
                              <button
                                key={heightVal}
                                onClick={() => setLineHeight(heightVal)}
                                className={`flex-1 py-1 rounded text-[10px] border transition-colors ${
                                  lineHeight === heightVal
                                    ? "bg-amber-200/10 text-amber-200 border-amber-200/25"
                                    : "border-transparent text-stone-500 hover:text-stone-300"
                                }`}
                              >
                                {heightVal.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </header>

            {/* Core Manuscript Text Reading Area */}
            <div 
              ref={readingAreaRef}
              className="flex-grow overflow-y-auto px-6 py-12 md:py-16 flex justify-center items-start min-h-0 relative select-text"
            >
              {/* Parallax cover background overlay reflection */}
              <div className="absolute inset-0 bg-radial-gradient from-amber-500/2 via-transparent to-transparent pointer-events-none" />

              <div className={`w-full ${readingWidthClasses[readingWidth]} flex flex-col relative`}>
                <AnimatePresence mode="wait" custom={pageDirection}>
                  <motion.div
                    key={currentCh?.id}
                    custom={pageDirection}
                    variants={pageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="w-full flex flex-col space-y-10"
                  >
                    
                    {/* Chapter Header details */}
                    <div className="space-y-2 select-none">
                      <span className="text-[10px] font-mono tracking-[0.25em] text-amber-200/50 uppercase font-light">
                        {currentPart?.title}
                      </span>
                      <h1 className="font-serif italic text-3xl md:text-4xl text-stone-100 font-light drop-shadow-sm">
                        {currentCh?.title}
                      </h1>
                      <div className="flex items-center gap-3 text-[10px] text-stone-600 font-mono pt-1">
                        <span>EST. READ: {currentCh?.estimatedReadTime} MIN</span>
                        <span>•</span>
                        <span>PART {currentPart?.partNumber}</span>
                      </div>
                    </div>

                    {/* Chapter Verbatim Content */}
                    <div className="relative">
                      {currentCh?.published ? (
                        /* Published view: verbatim display */
                        <p 
                          className={`font-serif whitespace-pre-wrap ${fontSizeClasses[fontSize]} ${lineHeightClasses[lineHeight]} text-stone-300 font-reading tracking-wide selection:bg-amber-200/20`}
                          style={{
                            fontVariantLigatures: "common-ligatures",
                          }}
                        >
                          {currentCh.content}
                        </p>
                      ) : (
                        /* Chapter Release System: locked overlay screen */
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="py-16 px-8 rounded-xl border border-dashed border-stone-800 bg-[#0a0a0c]/40 backdrop-blur-sm flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto select-none"
                        >
                          <div className="w-10 h-10 rounded-full border border-stone-800 bg-black/40 flex items-center justify-center text-stone-500">
                            <Lock className="w-4 h-4 text-stone-500" />
                          </div>
                          
                          <h4 className="font-serif italic text-lg text-stone-300">This part is not yet released</h4>
                          <p className="text-xs text-stone-500 leading-relaxed max-w-[280px]">
                            This part has already been written by the author but has not yet been published. Stay tuned for its release.
                          </p>
                        </motion.div>
                      )}
                    </div>

                    {/* Verbatim signature for published chapters */}
                    {currentCh?.published && (
                      <div className="pt-8 border-t border-stone-900/60 select-none">
                        <div className="font-serif italic text-xs tracking-widest text-amber-100/40">
                          - JR
                        </div>
                      </div>
                    )}

                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Bottom Book Navigation Bar */}
            <footer className="p-4 border-t border-stone-900/50 flex flex-col items-center gap-3 bg-[#070708] z-20 select-none">
              
              {/* Prev / Next buttons */}
              <div className="w-full flex items-center justify-between max-w-4xl px-2">
                <button
                  onClick={handlePrevChapter}
                  disabled={activePartIdx === 0 && activeChIdx === 0}
                  className="px-4 py-2 border border-stone-900 text-stone-400 hover:text-stone-200 hover:bg-stone-900/30 text-xs tracking-wider rounded-lg flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>PREV</span>
                </button>

                <button
                  onClick={handleNextChapter}
                  disabled={
                    activePartIdx === bookData.length - 1 &&
                    activeChIdx === bookData[activePartIdx].chapters.length - 1
                  }
                  className="px-4 py-2 border border-stone-900 text-stone-400 hover:text-stone-200 hover:bg-stone-900/30 text-xs tracking-wider rounded-lg flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <span>NEXT</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Progress track */}
              <div className="w-full max-w-3xl flex items-center gap-3">
                <div className="text-[9px] font-mono text-stone-600">
                  {activePartIdx + 1}.{activeChIdx + 1}
                </div>
                <div className="flex-grow bg-stone-950 h-[3px] rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-200/60 h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${((activePartIdx * 5 + activeChIdx + 1) / (bookData.length * 5)) * 100}%` 
                    }}
                  />
                </div>
                <div className="text-[9px] font-mono text-stone-600">
                  {bookData.length}.{bookData[bookData.length-1].chapters.length}
                </div>
              </div>
            </footer>

          </div>
        </div>
      )}
    </div>
  );
}
