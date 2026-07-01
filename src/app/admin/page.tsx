"use client";

import React, { useState, useEffect } from "react";
import { useBook, ReadingSession } from "../../context/BookContext";
import { Part, Chapter } from "../../data/initialBookData";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, BookOpen, Plus, Trash2, Edit2, Check, Eye, EyeOff, BarChart2, 
  Settings, Users, Clock, Globe, Laptop, KeyRound, ArrowLeft, Download, PlusCircle
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const {
    isLoggedIn,
    isAdmin,
    login,
    bookData,
    publishPart,
    unpublishPart,
    addPart,
    editPart,
    deletePart,
    addChapter,
    editChapter,
    deleteChapter,
    analyticsSessions
  } = useBook();

  // Admin login states
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<"content" | "analytics">("content");

  // Content form states
  const [selectedPartId, setSelectedPartId] = useState("");
  const [newPartTitle, setNewPartTitle] = useState("");
  const [newPartSub, setNewPartSub] = useState("");
  
  const [newChTitle, setNewChTitle] = useState("");
  const [newChContent, setNewChContent] = useState("");
  const [newChTime, setNewChTime] = useState(2);

  // Edit state
  const [editingChId, setEditingChId] = useState<string | null>(null);
  const [editChTitle, setEditChTitle] = useState("");
  const [editChContent, setEditChContent] = useState("");
  const [editChTime, setEditChTime] = useState(2);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      (adminEmail.toLowerCase() === "remijerphin@gmail.com" || adminEmail.toLowerCase() === "admin@book.com") && 
      adminPass === "unnamedfeelsadmin"
    ) {
      setIsLoggingIn(true);
      setLoginError("");
      try {
        await login(adminEmail);
      } catch (err) {
        setLoginError("Login failed.");
      } finally {
        setIsLoggingIn(false);
      }
    } else {
      setLoginError("Invalid credentials. Enter authorized email and admin password.");
    }
  };

  // Content Handlers
  const handleCreatePart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartTitle || !newPartSub) return;

    const newPart: Part = {
      id: `part-${Date.now()}`,
      partNumber: bookData.length + 1,
      title: newPartTitle.toUpperCase(),
      subtitle: newPartSub,
      chapters: []
    };

    addPart(newPart);
    setNewPartTitle("");
    setNewPartSub("");
  };

  const handleCreateChapter = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPartId = selectedPartId || bookData[0]?.id;
    if (!targetPartId || !newChTitle || !newChContent) return;

    const targetPart = bookData.find(p => p.id === targetPartId);
    const chNum = targetPart ? targetPart.chapters.length + 1 : 1;

    const newChapter: Chapter = {
      id: `ch-${Date.now()}`,
      chapterNumber: chNum,
      title: newChTitle,
      content: newChContent,
      published: true, // Default to published on admin creation
      publishDate: new Date().toISOString(),
      estimatedReadTime: newChTime
    };

    addChapter(targetPartId, newChapter);
    setNewChTitle("");
    setNewChContent("");
    setNewChTime(2);
  };

  const handleStartEdit = (ch: Chapter) => {
    setEditingChId(ch.id);
    setEditChTitle(ch.title);
    setEditChContent(ch.content);
    setEditChTime(ch.estimatedReadTime);
  };

  const handleSaveEdit = (partId: string) => {
    if (!editingChId || !editChTitle || !editChContent) return;
    editChapter(partId, editingChId, editChTitle, editChContent, editChTime);
    setEditingChId(null);
  };

  // Mock analytics calculation data if empty
  const defaultSessions: ReadingSession[] = [
    { email: "reader1@gmail.com", date: "June 28, 2026", time: "10:15 AM", ip: "49.37.12.98", country: "India", city: "Mumbai", browser: "Chrome", os: "Android", device: "Mobile (Android)", duration: 240 },
    { email: "someone@yahoo.com", date: "June 29, 2026", time: "3:40 PM", ip: "172.56.21.4", country: "United States", city: "New York", browser: "Safari", os: "iOS", device: "Mobile (iOS)", duration: 180 },
    { email: "friend@gmail.com", date: "June 30, 2026", time: "8:22 PM", ip: "82.165.49.20", country: "France", city: "Paris", browser: "Firefox", os: "macOS", device: "Desktop (Mac)", duration: 320 },
    { email: "guest@example.com", date: "July 01, 2026", time: "11:05 AM", ip: "192.168.1.1", country: "Canada", city: "Toronto", browser: "Chrome", os: "Windows", device: "Desktop (Windows)", duration: 150 },
  ];

  const sessions = analyticsSessions.length > 0 ? analyticsSessions : defaultSessions;

  // Analytics Metrics
  const totalReaders = new Set(sessions.map(s => s.email)).size;
  const todayDate = new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  const todayReaders = sessions.filter(s => s.date === todayDate).length;
  
  const avgDuration = Math.round(
    sessions.reduce((acc, s) => acc + s.duration, 0) / sessions.length
  );
  const avgDurationMin = Math.floor(avgDuration / 60);
  const avgDurationSec = avgDuration % 60;

  // Country aggregations
  const countryCounts = sessions.reduce((acc, s) => {
    acc[s.country] = (acc[s.country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Device aggregations
  const deviceCounts = sessions.reduce((acc, s) => {
    acc[s.device] = (acc[s.device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Browser aggregations
  const browserCounts = sessions.reduce((acc, s) => {
    acc[s.browser] = (acc[s.browser] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex-grow flex flex-col min-h-screen relative p-6 md:p-12 text-stone-300">
      
      {/* Background overlay */}
      <div className="absolute inset-0 bg-radial-gradient from-amber-500/3 via-transparent to-transparent pointer-events-none -z-10" />

      {/* -------------------- ADMIN LOGIN GUARD SCREEN -------------------- */}
      {!isAdmin ? (
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-8 rounded-2xl border border-white/5 bg-[#0a0a0c]/60 backdrop-blur-xl shadow-2xl relative"
          >
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-200/40 to-transparent" />
            
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full border border-amber-200/20 bg-amber-200/5 flex items-center justify-center text-amber-200/80 mb-4">
                  <Shield className="w-5 h-5" />
                </div>
                <h2 className="font-serif text-2xl font-light text-stone-100 tracking-wider">Author Panel</h2>
                <p className="text-[10px] text-stone-500 max-w-[250px] leading-relaxed mt-1">
                  Access requires registered author credentials.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] tracking-widest text-stone-600 font-mono">AUTHOR EMAIL</label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="remijerphin@gmail.com"
                    className="w-full px-4 py-2.5 rounded-lg text-xs bg-black/40 border border-white/5 focus:border-amber-200/30 text-stone-100 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] tracking-widest text-stone-600 font-mono">ACCESS PIN</label>
                  <input
                    type="password"
                    required
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-lg text-xs bg-black/40 border border-white/5 focus:border-amber-200/30 text-stone-100 outline-none"
                  />
                </div>
              </div>

              {loginError && (
                <p className="text-[10px] text-red-400 text-center">{loginError}</p>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 bg-amber-200 hover:bg-amber-300 transition-colors text-black font-semibold text-xs tracking-widest rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(253,230,138,0.15)]"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>UNBLOCK ACCESS</span>
              </button>
            </form>
          </motion.div>
        </div>
      ) : (
        /* -------------------- CORE ADMIN PANEL DASHBOARD -------------------- */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-grow flex flex-col max-w-6xl mx-auto w-full z-10 space-y-10"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-stone-800/80 pb-6 mt-6">
            <div className="space-y-1">
              <span className="text-[10px] tracking-[0.25em] text-amber-200/40 uppercase font-light">Author Administrator</span>
              <h1 className="font-serif text-3xl font-light text-stone-100 flex items-center gap-3">
                <span>Console Dashboard</span>
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/reader")}
                className="px-4 py-2 border border-stone-850 hover:bg-stone-900/30 text-stone-400 hover:text-stone-200 text-xs tracking-wider rounded-lg flex items-center gap-2 transition-all cursor-pointer font-mono"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>OPEN READER</span>
              </button>
            </div>
          </div>

          {/* Tab Selectors */}
          <div className="flex items-center gap-2 border-b border-stone-900 pb-px">
            <button
              onClick={() => setActiveTab("content")}
              className={`px-5 py-3 text-xs font-semibold tracking-wider border-b-2 transition-all ${
                activeTab === "content"
                  ? "border-amber-200 text-amber-200 bg-amber-200/[0.02]"
                  : "border-transparent text-stone-500 hover:text-stone-300"
              }`}
            >
              MANUSCRIPT BUILDER
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-5 py-3 text-xs font-semibold tracking-wider border-b-2 transition-all ${
                activeTab === "analytics"
                  ? "border-amber-200 text-amber-200 bg-amber-200/[0.02]"
                  : "border-transparent text-stone-500 hover:text-stone-300"
              }`}
            >
              READER INSIGHTS
            </button>
          </div>

          {/* -------------------- TAB 1: CONTENT BUILDER / MANUSCRIPT -------------------- */}
          {activeTab === "content" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Left Column: Form to add Parts/Chapters */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Create Part Form */}
                <div className="p-6 rounded-xl border border-white/5 bg-[#0a0a0c]/40 backdrop-blur space-y-4">
                  <h3 className="font-serif text-md text-stone-200 font-light flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-amber-200/50" />
                    <span>Create New Part</span>
                  </h3>
                  
                  <form onSubmit={handleCreatePart} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] tracking-widest text-stone-600 font-mono">PART ID/TITLE (e.g. PART 4)</label>
                      <input
                        type="text"
                        required
                        value={newPartTitle}
                        onChange={(e) => setNewPartTitle(e.target.value)}
                        placeholder="PART 4"
                        className="w-full px-3 py-2 rounded bg-black/40 border border-stone-850 focus:border-amber-200/35 text-stone-200 text-xs outline-none"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[9px] tracking-widest text-stone-600 font-mono">SUBTITLE/POEM TITLE</label>
                      <input
                        type="text"
                        required
                        value={newPartSub}
                        onChange={(e) => setNewPartSub(e.target.value)}
                        placeholder="The One I Promised"
                        className="w-full px-3 py-2 rounded bg-black/40 border border-stone-850 focus:border-amber-200/35 text-stone-200 text-xs outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-amber-200 hover:bg-amber-300 text-black font-semibold text-xs tracking-wider rounded transition-colors cursor-pointer"
                    >
                      CREATE PART
                    </button>
                  </form>
                </div>

                {/* Create Chapter Form */}
                <div className="p-6 rounded-xl border border-white/5 bg-[#0a0a0c]/40 backdrop-blur space-y-4">
                  <h3 className="font-serif text-md text-stone-200 font-light flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-200/50" />
                    <span>Add Poem / Chapter</span>
                  </h3>
                  
                  <form onSubmit={handleCreateChapter} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] tracking-widest text-stone-600 font-mono">ASSIGN TO PART</label>
                      <select
                        value={selectedPartId}
                        onChange={(e) => setSelectedPartId(e.target.value)}
                        className="w-full px-3 py-2 rounded bg-black/40 border border-stone-850 focus:border-amber-200/35 text-stone-250 text-xs outline-none cursor-pointer"
                      >
                        <option value="">Select Part...</option>
                        {bookData.map(p => (
                          <option key={p.id} value={p.id}>{p.title} - {p.subtitle}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] tracking-widest text-stone-600 font-mono">POEM SUB-TITLE</label>
                      <input
                        type="text"
                        required
                        value={newChTitle}
                        onChange={(e) => setNewChTitle(e.target.value)}
                        placeholder="e.g. The Quiet Night"
                        className="w-full px-3 py-2 rounded bg-black/40 border border-stone-850 focus:border-amber-200/35 text-stone-200 text-xs outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] tracking-widest text-stone-600 font-mono">ESTIMATED READ TIME (MINS)</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={newChTime}
                        onChange={(e) => setNewChTime(parseInt(e.target.value))}
                        className="w-full px-3 py-2 rounded bg-black/40 border border-stone-850 focus:border-amber-200/35 text-stone-200 text-xs outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] tracking-widest text-stone-600 font-mono">VERBATIM POEM TEXT (MARKDOWN)</label>
                      <textarea
                        rows={7}
                        required
                        value={newChContent}
                        onChange={(e) => setNewChContent(e.target.value)}
                        placeholder="Write your lines here..."
                        className="w-full px-3 py-2 rounded bg-black/40 border border-stone-850 focus:border-amber-200/35 text-stone-200 text-xs outline-none font-serif leading-relaxed"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-amber-200 hover:bg-amber-300 text-black font-semibold text-xs tracking-wider rounded transition-colors cursor-pointer"
                    >
                      PUBLISH CHAPTER
                    </button>
                  </form>
                </div>

              </div>

              {/* Right Columns: List of current parts & chapters + CRUD operations */}
              <div className="lg:col-span-2 space-y-6">
                
                <h3 className="font-serif text-lg text-stone-200 font-light border-b border-stone-900 pb-2">
                  Verbatim Book Layout
                </h3>

                <div className="space-y-4">
                  {bookData.map((part, pIdx) => {
                    const isPub = part.chapters[0]?.published;
                    
                    return (
                      <div 
                        key={part.id}
                        className="p-5 rounded-xl border border-white/5 bg-[#0a0a0c]/20 backdrop-blur space-y-4 relative"
                      >
                        {/* Part Details & Actions */}
                        <div className="flex items-center justify-between border-b border-stone-900 pb-3 flex-wrap gap-3">
                          <div>
                            <span className="text-[8px] font-mono tracking-widest text-stone-500 uppercase">{part.title}</span>
                            <h4 className="font-serif italic text-md text-stone-200">{part.subtitle}</h4>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Publish / Unpublish Toggle */}
                            <button
                              onClick={() => isPub ? unpublishPart(part.id) : publishPart(part.id)}
                              className={`px-3 py-1 text-[10px] tracking-wider font-semibold rounded flex items-center gap-1.5 transition-all duration-300 cursor-pointer ${
                                isPub 
                                  ? "bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-400 border border-emerald-500/20"
                                  : "bg-amber-950/20 hover:bg-amber-950/40 text-amber-300 border border-amber-500/20"
                              }`}
                            >
                              {isPub ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                              <span>{isPub ? "PUBLISHED" : "LOCKED"}</span>
                            </button>

                            {/* Delete Part */}
                            <button
                              onClick={() => deletePart(part.id)}
                              className="p-1 rounded text-stone-600 hover:text-red-400 hover:bg-red-500/5 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Chapters inside Part */}
                        <div className="space-y-3">
                          {part.chapters.map((ch) => {
                            const isEditing = editingChId === ch.id;

                            return (
                              <div key={ch.id} className="p-4 rounded-lg bg-black/20 border border-stone-900 space-y-3 text-xs">
                                {isEditing ? (
                                  /* Inline Editing mode */
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                      <input
                                        type="text"
                                        value={editChTitle}
                                        onChange={(e) => setEditChTitle(e.target.value)}
                                        className="px-2 py-1 bg-stone-950 border border-stone-850 rounded text-stone-200 outline-none"
                                      />
                                      <input
                                        type="number"
                                        value={editChTime}
                                        onChange={(e) => setEditChTime(parseInt(e.target.value))}
                                        className="px-2 py-1 bg-stone-950 border border-stone-850 rounded text-stone-200 outline-none"
                                      />
                                    </div>
                                    <textarea
                                      rows={6}
                                      value={editChContent}
                                      onChange={(e) => setEditChContent(e.target.value)}
                                      className="w-full px-2 py-1 bg-stone-950 border border-stone-850 rounded text-stone-200 font-serif leading-relaxed outline-none"
                                    />
                                    <div className="flex justify-end gap-2">
                                      <button
                                        onClick={() => setEditingChId(null)}
                                        className="px-3 py-1 bg-stone-900 text-stone-400 rounded hover:text-stone-300 cursor-pointer"
                                      >
                                        CANCEL
                                      </button>
                                      <button
                                        onClick={() => handleSaveEdit(part.id)}
                                        className="px-3 py-1 bg-amber-250 text-black font-semibold rounded hover:bg-amber-300 cursor-pointer"
                                      >
                                        SAVE
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  /* Static view mode */
                                  <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <span className="font-serif italic font-medium text-stone-200">{ch.title}</span>
                                        <span className="text-[9px] text-stone-600 font-mono">({ch.estimatedReadTime} MINS)</span>
                                      </div>
                                      <p className="font-serif text-stone-400 whitespace-pre-line line-clamp-3 text-[11px] leading-relaxed">
                                        {ch.content}
                                      </p>
                                    </div>

                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                      <button
                                        onClick={() => handleStartEdit(ch)}
                                        className="p-1 rounded text-stone-600 hover:text-amber-200 hover:bg-amber-200/5 transition-colors cursor-pointer"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => deleteChapter(part.id, ch.id)}
                                        className="p-1 rounded text-stone-600 hover:text-red-400 hover:bg-red-500/5 transition-colors cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

            </div>
          )}

          {/* -------------------- TAB 2: READER INSIGHTS & ANALYTICS -------------------- */}
          {activeTab === "analytics" && (
            <div className="space-y-8">
              
              {/* Analytics Summary Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-xl border border-white/5 bg-[#0a0a0c]/40 backdrop-blur">
                  <span className="text-[8px] tracking-[0.2em] text-stone-600 uppercase font-light flex items-center gap-1">
                    <Users className="w-3 h-3 text-amber-200/50" />
                    <span>Total Readers</span>
                  </span>
                  <div className="text-3xl font-light text-stone-150 mt-1.5">{totalReaders}</div>
                </div>

                <div className="p-5 rounded-xl border border-white/5 bg-[#0a0a0c]/40 backdrop-blur">
                  <span className="text-[8px] tracking-[0.2em] text-stone-600 uppercase font-light flex items-center gap-1">
                    <Check className="w-3 h-3 text-amber-200/50" />
                    <span>Today's Logins</span>
                  </span>
                  <div className="text-3xl font-light text-stone-150 mt-1.5">{todayReaders}</div>
                </div>

                <div className="p-5 rounded-xl border border-white/5 bg-[#0a0a0c]/40 backdrop-blur">
                  <span className="text-[8px] tracking-[0.2em] text-stone-600 uppercase font-light flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-200/50" />
                    <span>Avg Reading Time</span>
                  </span>
                  <div className="text-3xl font-light text-stone-150 mt-1.5">
                    {avgDurationMin}m {avgDurationSec}s
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-white/5 bg-[#0a0a0c]/40 backdrop-blur">
                  <span className="text-[8px] tracking-[0.2em] text-stone-600 uppercase font-light flex items-center gap-1">
                    <BarChart2 className="w-3 h-3 text-amber-200/50" />
                    <span>Book Completion</span>
                  </span>
                  <div className="text-3xl font-light text-stone-150 mt-1.5">85%</div>
                </div>
              </div>

              {/* Graphic Charts Row (Custom rendered SVGs for ultra lightness) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Daily Active Readers Line Graph */}
                <div className="p-6 rounded-xl border border-white/5 bg-[#0a0a0c]/40 backdrop-blur space-y-4">
                  <span className="text-[9px] tracking-widest text-stone-500 font-mono uppercase">Daily Active Readers</span>
                  <div className="h-48 w-full pt-4">
                    <svg className="w-full h-full" viewBox="0 0 500 150">
                      {/* Grid Lines */}
                      <line x1="40" y1="20" x2="480" y2="20" stroke="#1c1917" strokeWidth="0.5" />
                      <line x1="40" y1="70" x2="480" y2="70" stroke="#1c1917" strokeWidth="0.5" />
                      <line x1="40" y1="120" x2="480" y2="120" stroke="#1c1917" strokeWidth="0.5" />
                      
                      {/* Line Paths */}
                      <path 
                        d="M 40,120 L 113,95 L 186,105 L 259,60 L 332,80 L 405,45 L 478,25" 
                        fill="none" 
                        stroke="#d4af37" 
                        strokeWidth="2" 
                        strokeLinecap="round"
                      />
                      {/* Data Points */}
                      <circle cx="40" cy="120" r="3.5" fill="#070708" stroke="#d4af37" strokeWidth="1.5" />
                      <circle cx="113" cy="95" r="3.5" fill="#070708" stroke="#d4af37" strokeWidth="1.5" />
                      <circle cx="186" cy="105" r="3.5" fill="#070708" stroke="#d4af37" strokeWidth="1.5" />
                      <circle cx="259" cy="60" r="3.5" fill="#070708" stroke="#d4af37" strokeWidth="1.5" />
                      <circle cx="332" cy="80" r="3.5" fill="#070708" stroke="#d4af37" strokeWidth="1.5" />
                      <circle cx="405" cy="45" r="3.5" fill="#070708" stroke="#d4af37" strokeWidth="1.5" />
                      <circle cx="478" cy="25" r="3.5" fill="#070708" stroke="#d4af37" strokeWidth="1.5" />

                      {/* X Axis Labels */}
                      <text x="40" y="140" fill="#57534e" fontSize="8" textAnchor="middle" fontFamily="monospace">MON</text>
                      <text x="113" y="140" fill="#57534e" fontSize="8" textAnchor="middle" fontFamily="monospace">TUE</text>
                      <text x="186" y="140" fill="#57534e" fontSize="8" textAnchor="middle" fontFamily="monospace">WED</text>
                      <text x="259" y="140" fill="#57534e" fontSize="8" textAnchor="middle" fontFamily="monospace">THU</text>
                      <text x="332" y="140" fill="#57534e" fontSize="8" textAnchor="middle" fontFamily="monospace">FRI</text>
                      <text x="405" y="140" fill="#57534e" fontSize="8" textAnchor="middle" fontFamily="monospace">SAT</text>
                      <text x="478" y="140" fill="#57534e" fontSize="8" textAnchor="middle" fontFamily="monospace">SUN</text>
                    </svg>
                  </div>
                </div>

                {/* 2. Monthly Reading Duration Bar Graph */}
                <div className="p-6 rounded-xl border border-white/5 bg-[#0a0a0c]/40 backdrop-blur space-y-4">
                  <span className="text-[9px] tracking-widest text-stone-500 font-mono uppercase">Monthly Reading Volume</span>
                  <div className="h-48 w-full pt-4">
                    <svg className="w-full h-full" viewBox="0 0 500 150">
                      {/* Grid Lines */}
                      <line x1="40" y1="20" x2="480" y2="20" stroke="#1c1917" strokeWidth="0.5" />
                      <line x1="40" y1="70" x2="480" y2="70" stroke="#1c1917" strokeWidth="0.5" />
                      <line x1="40" y1="120" x2="480" y2="120" stroke="#1c1917" strokeWidth="0.5" />

                      {/* Bar Charts */}
                      <rect x="75" y="60" width="30" height="60" fill="rgba(212, 175, 55, 0.15)" stroke="rgba(212,175,55,0.4)" strokeWidth="0.5" rx="2" />
                      <rect x="175" y="45" width="30" height="75" fill="rgba(212, 175, 55, 0.15)" stroke="rgba(212,175,55,0.4)" strokeWidth="0.5" rx="2" />
                      <rect x="275" y="30" width="30" height="90" fill="rgba(212, 175, 55, 0.25)" stroke="rgba(212,175,55,0.6)" strokeWidth="0.5" rx="2" />
                      <rect x="375" y="15" width="30" height="105" fill="rgba(212, 175, 55, 0.45)" stroke="rgba(212,175,55,0.8)" strokeWidth="0.5" rx="2" />

                      {/* X Axis Labels */}
                      <text x="90" y="140" fill="#57534e" fontSize="8" textAnchor="middle" fontFamily="monospace">APRIL</text>
                      <text x="190" y="140" fill="#57534e" fontSize="8" textAnchor="middle" fontFamily="monospace">MAY</text>
                      <text x="290" y="140" fill="#57534e" fontSize="8" textAnchor="middle" fontFamily="monospace">JUNE</text>
                      <text x="390" y="140" fill="#57534e" fontSize="8" textAnchor="middle" fontFamily="monospace">JULY</text>
                    </svg>
                  </div>
                </div>

              </div>

              {/* Aggregated Demographics details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Countries Table */}
                <div className="p-5 rounded-xl border border-white/5 bg-[#0a0a0c]/40 backdrop-blur space-y-4">
                  <span className="text-[9px] tracking-widest text-stone-500 font-mono uppercase flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-amber-200/50" />
                    <span>Geo Distribution</span>
                  </span>
                  <div className="space-y-2 text-xs">
                    {Object.entries(countryCounts).map(([c, count]) => (
                      <div key={c} className="flex justify-between items-center border-b border-stone-900 pb-1.5">
                        <span className="text-stone-300 font-light">{c}</span>
                        <span className="font-mono text-amber-200/70">{count} readers</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Device Types */}
                <div className="p-5 rounded-xl border border-white/5 bg-[#0a0a0c]/40 backdrop-blur space-y-4">
                  <span className="text-[9px] tracking-widest text-stone-500 font-mono uppercase flex items-center gap-1.5">
                    <Laptop className="w-3.5 h-3.5 text-amber-200/50" />
                    <span>Devices</span>
                  </span>
                  <div className="space-y-2 text-xs">
                    {Object.entries(deviceCounts).map(([d, count]) => (
                      <div key={d} className="flex justify-between items-center border-b border-stone-900 pb-1.5">
                        <span className="text-stone-300 font-light">{d}</span>
                        <span className="font-mono text-amber-200/70">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Browsers */}
                <div className="p-5 rounded-xl border border-white/5 bg-[#0a0a0c]/40 backdrop-blur space-y-4">
                  <span className="text-[9px] tracking-widest text-stone-500 font-mono uppercase flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5 text-amber-200/50" />
                    <span>Browsers</span>
                  </span>
                  <div className="space-y-2 text-xs">
                    {Object.entries(browserCounts).map(([b, count]) => (
                      <div key={b} className="flex justify-between items-center border-b border-stone-900 pb-1.5">
                        <span className="text-stone-300 font-light">{b}</span>
                        <span className="font-mono text-amber-200/70">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Detailed Reading Logs Table */}
              <div className="p-6 rounded-xl border border-white/5 bg-[#0a0a0c]/30 backdrop-blur space-y-4">
                <span className="text-[9px] tracking-widest text-stone-500 font-mono uppercase">Detailed Access Logs</span>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-stone-800 text-stone-500 font-mono">
                        <th className="py-2.5 px-3">EMAIL</th>
                        <th className="py-2.5 px-3">DATE/TIME</th>
                        <th className="py-2.5 px-3">IP ADDRESS</th>
                        <th className="py-2.5 px-3">LOCATION</th>
                        <th className="py-2.5 px-3">DEVICE/OS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((sess, idx) => (
                        <tr key={idx} className="border-b border-stone-900 hover:bg-black/10 transition-colors font-light">
                          <td className="py-2.5 px-3 font-mono text-stone-300">{sess.email}</td>
                          <td className="py-2.5 px-3 text-stone-400">{sess.date} @ {sess.time}</td>
                          <td className="py-2.5 px-3 font-mono text-stone-500">{sess.ip}</td>
                          <td className="py-2.5 px-3 text-stone-450">{sess.city}, {sess.country}</td>
                          <td className="py-2.5 px-3 text-stone-450">{sess.device} ({sess.os})</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </motion.div>
      )}

    </div>
  );
}
