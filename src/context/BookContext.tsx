"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { initialBookData, Part, Chapter } from "../data/initialBookData";

export interface Bookmark {
  partId: string;
  chapterId: string;
  timestamp: number;
  previewText: string;
}

export interface ReadingSession {
  email: string;
  date: string;
  time: string;
  ip: string;
  country: string;
  city: string;
  browser: string;
  os: string;
  device: string;
  duration: number; // in seconds
}

export type Theme = "dark" | "light";
export type FontSize = "sm" | "base" | "lg" | "xl" | "2xl";
export type ReadingWidth = "narrow" | "normal" | "wide";
export type LineHeight = "snug" | "normal" | "relaxed" | "loose";
export type MusicProfile = "none" | "piano" | "rain" | "ocean" | "nature";

interface BookContextType {
  // Auth state
  userEmail: string | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (email: string) => Promise<boolean>;
  logout: () => void;

  // Book Content state
  bookData: Part[];
  updateBookData: (data: Part[]) => void;
  publishPart: (partId: string) => void;
  unpublishPart: (partId: string) => void;
  addPart: (part: Part) => void;
  editPart: (partId: string, subtitle: string) => void;
  deletePart: (partId: string) => void;
  
  // Chapter CRUD
  addChapter: (partId: string, chapter: Chapter) => void;
  editChapter: (partId: string, chapterId: string, title: string, content: string, readTime: number) => void;
  deleteChapter: (partId: string, chapterId: string) => void;

  // Reader Settings
  theme: Theme;
  setTheme: (theme: Theme) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  readingWidth: ReadingWidth;
  setReadingWidth: (width: ReadingWidth) => void;
  lineHeight: LineHeight;
  setLineHeight: (height: LineHeight) => void;

  // Reader Progress
  bookmarks: Bookmark[];
  toggleBookmark: (partId: string, chapterId: string, previewText: string) => void;
  isBookmarked: (partId: string, chapterId: string) => boolean;
  lastRead: { partId: string; chapterId: string } | null;
  setLastRead: (partId: string, chapterId: string) => void;
  completedChapters: string[]; // array of chapterIds
  markChapterComplete: (chapterId: string) => void;
  getCompletionPercentage: () => number;

  // Background Music
  activeMusic: MusicProfile;
  setActiveMusic: (profile: MusicProfile) => void;
  musicVolume: number;
  setMusicVolume: (volume: number) => void;

  // Mock Analytics Logs (Admin only)
  analyticsSessions: ReadingSession[];
  logSession: (session: Omit<ReadingSession, "duration">) => void;
  updateSessionDuration: (duration: number) => void;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Book content
  const [bookData, setBookData] = useState<Part[]>(initialBookData);

  // Settings
  const [theme, setThemeState] = useState<Theme>("dark");
  const [fontSize, setFontSizeState] = useState<FontSize>("lg");
  const [readingWidth, setReadingWidthState] = useState<ReadingWidth>("normal");
  const [lineHeight, setLineHeightState] = useState<LineHeight>("relaxed");

  // Progress
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [lastRead, setLastReadState] = useState<{ partId: string; chapterId: string } | null>(null);
  const [completedChapters, setCompletedChapters] = useState<string[]>([]);
  
  // Music
  const [activeMusic, setActiveMusicState] = useState<MusicProfile>("none");
  const [musicVolume, setMusicVolumeState] = useState<number>(0.3);

  // Analytics
  const [analyticsSessions, setAnalyticsSessions] = useState<ReadingSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);

  // Initialize from LocalStorage
  useEffect(() => {
    // Load Book Data
    const storedBook = localStorage.getItem("uf_book_data");
    if (storedBook) {
      try { setBookData(JSON.parse(storedBook)); } catch (e) { console.error(e); }
    }

    // Load Settings
    const storedTheme = localStorage.getItem("uf_theme") as Theme;
    if (storedTheme) setThemeState(storedTheme);
    const storedFontSize = localStorage.getItem("uf_font_size") as FontSize;
    if (storedFontSize) setFontSizeState(storedFontSize);
    const storedWidth = localStorage.getItem("uf_reading_width") as ReadingWidth;
    if (storedWidth) setReadingWidthState(storedWidth);
    const storedLineHeight = localStorage.getItem("uf_line_height") as LineHeight;
    if (storedLineHeight) setLineHeightState(storedLineHeight);

    // Load User
    const storedEmail = localStorage.getItem("uf_user_email");
    if (storedEmail) {
      setUserEmail(storedEmail);
      setIsLoggedIn(true);
      setIsAdmin(storedEmail.toLowerCase().includes("remijerphin@gmail.com") || storedEmail.toLowerCase() === "admin@book.com");
    }

    // Load Bookmarks
    const storedBookmarks = localStorage.getItem("uf_bookmarks");
    if (storedBookmarks) {
      try { setBookmarks(JSON.parse(storedBookmarks)); } catch (e) { console.error(e); }
    }

    // Load Completed Chapters
    const storedCompleted = localStorage.getItem("uf_completed_chapters");
    if (storedCompleted) {
      try { setCompletedChapters(JSON.parse(storedCompleted)); } catch (e) { console.error(e); }
    }

    // Load last read
    const storedLastRead = localStorage.getItem("uf_last_read");
    if (storedLastRead) {
      try { setLastReadState(JSON.parse(storedLastRead)); } catch (e) { console.error(e); }
    }

    // Load Analytics
    const storedAnalytics = localStorage.getItem("uf_analytics");
    if (storedAnalytics) {
      try { setAnalyticsSessions(JSON.parse(storedAnalytics)); } catch (e) { console.error(e); }
    }
  }, []);

  // Watch Theme Changes to apply CSS class to document root
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("uf_theme", theme);
  }, [theme]);

  // Auth Operations
  const login = async (email: string) => {
    setUserEmail(email);
    setIsLoggedIn(true);
    const isAuthor = email.toLowerCase() === "remijerphin@gmail.com" || email.toLowerCase() === "admin@book.com";
    setIsAdmin(isAuthor);
    localStorage.setItem("uf_user_email", email);

    // Generate location and client details for log
    let ip = "127.0.0.1";
    let country = "Unknown";
    let city = "Unknown";
    let browser = "Chrome";
    let os = "Windows";
    let device = "Desktop";

    // Call geolocation API for demo details if online
    try {
      const geoRes = await fetch("https://ipapi.co/json/").then(res => res.json());
      if (geoRes && geoRes.ip) {
        ip = geoRes.ip;
        country = geoRes.country_name || "Unknown";
        city = geoRes.city || "Unknown";
      }
    } catch (e) {
      console.warn("Geolocator request failed. Using mock details.");
    }

    // Simple user-agent parser
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

    const newSession: Omit<ReadingSession, "duration"> = {
      email,
      date: formattedDate,
      time: formattedTime,
      ip,
      country,
      city,
      browser,
      os,
      device,
    };

    // Log analytics
    logSession(newSession);

    // Call secure backend route to trigger email notification to author
    try {
      await fetch("/api/notify-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSession),
      });
    } catch (e) {
      console.error("Login notification failed:", e);
    }

    return true;
  };

  const logout = () => {
    setUserEmail(null);
    setIsLoggedIn(false);
    setIsAdmin(false);
    setCurrentSessionId(null);
    localStorage.removeItem("uf_user_email");
  };

  // Helper to save book data
  const saveBookData = (newData: Part[]) => {
    setBookData(newData);
    localStorage.setItem("uf_book_data", JSON.stringify(newData));
  };

  // Content Operations
  const publishPart = (partId: string) => {
    const updated = bookData.map(p => {
      if (p.id === partId) {
        return {
          ...p,
          chapters: p.chapters.map(c => ({ ...c, published: true, publishDate: new Date().toISOString() }))
        };
      }
      return p;
    });
    saveBookData(updated);
  };

  const unpublishPart = (partId: string) => {
    const updated = bookData.map(p => {
      if (p.id === partId) {
        return {
          ...p,
          chapters: p.chapters.map(c => ({ ...c, published: false, publishDate: null }))
        };
      }
      return p;
    });
    saveBookData(updated);
  };

  const addPart = (part: Part) => {
    const updated = [...bookData, part];
    saveBookData(updated);
  };

  const editPart = (partId: string, subtitle: string) => {
    const updated = bookData.map(p => {
      if (p.id === partId) {
        return { ...p, subtitle };
      }
      return p;
    });
    saveBookData(updated);
  };

  const deletePart = (partId: string) => {
    const updated = bookData.filter(p => p.id !== partId);
    saveBookData(updated);
  };

  // Chapter CRUD Operations
  const addChapter = (partId: string, chapter: Chapter) => {
    const updated = bookData.map(p => {
      if (p.id === partId) {
        return {
          ...p,
          chapters: [...p.chapters, chapter]
        };
      }
      return p;
    });
    saveBookData(updated);
  };

  const editChapter = (partId: string, chapterId: string, title: string, content: string, readTime: number) => {
    const updated = bookData.map(p => {
      if (p.id === partId) {
        return {
          ...p,
          chapters: p.chapters.map(c => {
            if (c.id === chapterId) {
              return { ...c, title, content, estimatedReadTime: readTime };
            }
            return c;
          })
        };
      }
      return p;
    });
    saveBookData(updated);
  };

  const deleteChapter = (partId: string, chapterId: string) => {
    const updated = bookData.map(p => {
      if (p.id === partId) {
        return {
          ...p,
          chapters: p.chapters.filter(c => c.id !== chapterId)
        };
      }
      return p;
    });
    saveBookData(updated);
  };

  // Settings
  const setTheme = (t: Theme) => setThemeState(t);
  const setFontSize = (s: FontSize) => {
    setFontSizeState(s);
    localStorage.setItem("uf_font_size", s);
  };
  const setReadingWidth = (w: ReadingWidth) => {
    setReadingWidthState(w);
    localStorage.setItem("uf_reading_width", w);
  };
  const setLineHeight = (h: LineHeight) => {
    setLineHeightState(h);
    localStorage.setItem("uf_line_height", h);
  };

  // Bookmarks
  const toggleBookmark = (partId: string, chapterId: string, previewText: string) => {
    let newBookmarks = [...bookmarks];
    const index = bookmarks.findIndex(b => b.partId === partId && b.chapterId === chapterId);
    
    if (index >= 0) {
      newBookmarks.splice(index, 1);
    } else {
      newBookmarks.push({
        partId,
        chapterId,
        timestamp: Date.now(),
        previewText: previewText.slice(0, 60) + (previewText.length > 60 ? "..." : "")
      });
    }

    setBookmarks(newBookmarks);
    localStorage.setItem("uf_bookmarks", JSON.stringify(newBookmarks));
  };

  const isBookmarked = (partId: string, chapterId: string) => {
    return bookmarks.some(b => b.partId === partId && b.chapterId === chapterId);
  };

  // Last Read Position
  const setLastRead = (partId: string, chapterId: string) => {
    const newLR = { partId, chapterId };
    setLastReadState(newLR);
    localStorage.setItem("uf_last_read", JSON.stringify(newLR));
  };

  // Chapter Completion
  const markChapterComplete = (chapterId: string) => {
    if (!completedChapters.includes(chapterId)) {
      const updated = [...completedChapters, chapterId];
      setCompletedChapters(updated);
      localStorage.setItem("uf_completed_chapters", JSON.stringify(updated));
    }
  };

  const getCompletionPercentage = () => {
    // Only count published chapters in the denominator
    const totalPublished = bookData.reduce((acc, part) => {
      const publishedInPart = part.chapters.filter(ch => ch.published).length;
      return acc + publishedInPart;
    }, 0);

    if (totalPublished === 0) return 0;
    
    // Intersection of completed chapters that are actually published
    const completedPublishedCount = bookData.reduce((acc, part) => {
      const completedPublishedInPart = part.chapters.filter(ch => ch.published && completedChapters.includes(ch.id)).length;
      return acc + completedPublishedInPart;
    }, 0);

    return Math.round((completedPublishedCount / totalPublished) * 100);
  };

  // Music Config
  const setActiveMusic = (profile: MusicProfile) => {
    setActiveMusicState(profile);
  };
  const setMusicVolume = (v: number) => {
    setMusicVolumeState(v);
  };

  // Analytics logging
  const logSession = (session: Omit<ReadingSession, "duration">) => {
    const sessionId = Date.now();
    setCurrentSessionId(sessionId);

    const fullSession: ReadingSession = {
      ...session,
      duration: 0,
    };

    setAnalyticsSessions(prev => {
      const updated = [fullSession, ...prev];
      localStorage.setItem("uf_analytics", JSON.stringify(updated));
      return updated;
    });
  };

  const updateSessionDuration = (durationSec: number) => {
    if (!currentSessionId) return;
    
    setAnalyticsSessions(prev => {
      const updated = prev.map((sess, idx) => {
        // Since we prepend sessions, the first one matches our current session
        if (idx === 0) {
          return { ...sess, duration: sess.duration + durationSec };
        }
        return sess;
      });
      localStorage.setItem("uf_analytics", JSON.stringify(updated));
      return updated;
    });
  };

  // Increment reader time in background
  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      updateSessionDuration(10); // Update duration by 10s intervals
    }, 10000);

    return () => clearInterval(interval);
  }, [isLoggedIn, currentSessionId]);

  return (
    <BookContext.Provider
      value={{
        userEmail,
        isLoggedIn,
        isAdmin,
        login,
        logout,
        bookData,
        updateBookData: saveBookData,
        publishPart,
        unpublishPart,
        addPart,
        editPart,
        deletePart,
        addChapter,
        editChapter,
        deleteChapter,
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
        setActiveMusic,
        musicVolume,
        setMusicVolume,
        analyticsSessions,
        logSession,
        updateSessionDuration,
      }}
    >
      {children}
    </BookContext.Provider>
  );
};

export const useBook = () => {
  const context = useContext(BookContext);
  if (context === undefined) {
    throw new Error("useBook must be used within a BookProvider");
  }
  return context;
};
