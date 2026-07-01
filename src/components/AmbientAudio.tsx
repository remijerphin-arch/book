"use client";

import React, { useEffect, useRef } from "react";
import { useBook } from "../context/BookContext";

export const AmbientAudio: React.FC = () => {
  const { activeMusic, musicVolume } = useBook();
  
  // Audio Nodes refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterVolumeRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioNode | null>(null);
  const pianoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cricketTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to create brown noise (used for rain & waves)
  const createBrownNoise = (ctx: AudioContext): AudioNode => {
    const bufferSize = 10 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Brown noise integration formula
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Gain compensation
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    noiseSource.start(0);

    return noiseSource;
  };

  // Helper to play a single piano note
  const playPianoNote = (ctx: AudioContext, frequency: number, time: number, duration: number) => {
    if (!masterVolumeRef.current) return;

    // 1. Oscillator (Triangle wave for Rhodes-like warmth)
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(frequency, time);

    // 2. Vintage Tape Vibrato (LFO pitch modulation)
    const vibrato = ctx.createOscillator();
    const vibratoGain = ctx.createGain();
    vibrato.frequency.setValueAtTime(5.8, time); // 5.8Hz vibrato
    vibratoGain.gain.setValueAtTime(1.8, time);  // slight detune
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);

    // 3. Note Enveloping (Gain Node)
    const noteGain = ctx.createGain();
    noteGain.gain.setValueAtTime(0, time);
    noteGain.gain.linearRampToValueAtTime(0.08, time + 0.08); // attack
    noteGain.gain.exponentialRampToValueAtTime(0.0001, time + duration); // decay/release

    // 4. Low-pass Filter (removes digital brightness)
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(600, time);
    filter.Q.setValueAtTime(1, time);

    // 5. Cinematic Space Echo (Delay with feedback)
    const delay = ctx.createDelay();
    delay.delayTime.setValueAtTime(0.4, time); // 400ms echo
    
    const delayFeedback = ctx.createGain();
    delayFeedback.gain.setValueAtTime(0.42, time); // echo volume feedback

    // Connections
    osc.connect(noteGain);
    noteGain.connect(filter);
    
    // Direct dry route to master
    filter.connect(masterVolumeRef.current);

    // Wet route through feedback delay
    filter.connect(delay);
    delay.connect(delayFeedback);
    delayFeedback.connect(delay); // feedback loop
    delay.connect(masterVolumeRef.current);

    // Start / Stop
    osc.start(time);
    vibrato.start(time);
    
    osc.stop(time + duration + 0.5);
    vibrato.stop(time + duration + 0.5);
  };

  // Play a beautiful ambient piano chord progression
  const playPianoChordProgression = (ctx: AudioContext) => {
    // Chords defined by midi frequencies
    // Cm9, Fm9, Bb9, Abmaj9
    const progressions = [
      [130.81, 196.00, 293.66, 311.13, 466.16], // C3, G3, D4, Eb4, Bb4
      [174.61, 261.63, 311.13, 392.00, 415.30], // F3, C4, Eb4, G4, Ab4
      [116.54, 174.61, 261.63, 293.66, 440.00], // Bb2, F3, C4, D4, A4
      [103.83, 155.56, 233.08, 261.63, 392.00], // Ab2, Eb3, Bb3, C4, G4
    ];

    let chordIdx = 0;
    
    const playChord = () => {
      if (!audioCtxRef.current || activeMusic !== "piano") return;
      const now = ctx.currentTime;
      const chord = progressions[chordIdx];

      // Arpeggiate chord slightly for emotional realism
      chord.forEach((freq, idx) => {
        const arpeggioDelay = idx * 0.12 + Math.random() * 0.05;
        playPianoNote(ctx, freq, now + arpeggioDelay, 4.5);
      });

      chordIdx = (chordIdx + 1) % progressions.length;
      
      // Schedule next chord in 6 seconds
      pianoTimerRef.current = setTimeout(playChord, 6200);
    };

    playChord();
  };

  // Helper to start Crickets sound effect
  const startCrickets = (ctx: AudioContext) => {
    if (!masterVolumeRef.current) return;

    const playChirp = () => {
      if (!audioCtxRef.current || activeMusic !== "nature" || !masterVolumeRef.current) return;
      
      const now = ctx.currentTime;
      const duration = 0.6;
      
      // Cricket chirp is a high frequency oscillator (4500Hz) modulated by a fast tremolo LFO (35Hz)
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(4200 + Math.random() * 200, now);

      const tremolo = ctx.createOscillator();
      const tremoloGain = ctx.createGain();
      tremolo.frequency.setValueAtTime(32, now); // 32Hz tremolo speed
      tremoloGain.gain.setValueAtTime(0.5, now);
      
      const chirpGain = ctx.createGain();
      chirpGain.gain.setValueAtTime(0, now);
      chirpGain.gain.linearRampToValueAtTime(0.012, now + 0.05); // quick attack
      chirpGain.gain.linearRampToValueAtTime(0.012, now + duration - 0.1);
      chirpGain.gain.exponentialRampToValueAtTime(0.0001, now + duration); // decay

      // Connections
      tremolo.connect(tremoloGain);
      tremoloGain.connect(chirpGain.gain); // modulate note gain
      
      osc.connect(chirpGain);
      chirpGain.connect(masterVolumeRef.current);

      osc.start(now);
      tremolo.start(now);
      osc.stop(now + duration + 0.1);
      tremolo.stop(now + duration + 0.1);

      // Schedule next chirp randomly between 1.5 to 3 seconds
      cricketTimerRef.current = setTimeout(playChirp, 1500 + Math.random() * 2000);
    };

    // Soft constant wind background noise for crickets
    const wind = createBrownNoise(ctx);
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = "bandpass";
    windFilter.frequency.setValueAtTime(250, ctx.currentTime);
    windFilter.Q.setValueAtTime(1.5, ctx.currentTime);

    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0.04, ctx.currentTime);

    wind.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(masterVolumeRef.current);

    noiseSourceRef.current = wind; // store so we can clean up wind too

    playChirp();
  };

  // Main Audio setup trigger
  useEffect(() => {
    // Clean up previous soundscape timers/nodes
    const cleanup = () => {
      if (pianoTimerRef.current) clearTimeout(pianoTimerRef.current);
      if (cricketTimerRef.current) clearTimeout(cricketTimerRef.current);
      if (noiseSourceRef.current) {
        try { (noiseSourceRef.current as any).stop(); } catch (e) {}
        noiseSourceRef.current = null;
      }
    };

    cleanup();

    if (activeMusic === "none") {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
        masterVolumeRef.current = null;
      }
      return;
    }

    // Initialize AudioContext on user interaction
    const initAudio = () => {
      if (!audioCtxRef.current) {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtxClass();
        
        masterVolumeRef.current = audioCtxRef.current.createGain();
        masterVolumeRef.current.gain.setValueAtTime(musicVolume, audioCtxRef.current.currentTime);
        masterVolumeRef.current.connect(audioCtxRef.current.destination);
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      cleanup(); // clear nodes/timers before rebuilding

      // 1. Play Soft Piano
      if (activeMusic === "piano") {
        playPianoChordProgression(ctx);
      }

      // 2. Play Rain
      else if (activeMusic === "rain") {
        const rainSource = createBrownNoise(ctx);
        
        // Filter to make it sound like rain (low pass & band pass combo)
        const rainFilter = ctx.createBiquadFilter();
        rainFilter.type = "lowpass";
        rainFilter.frequency.setValueAtTime(1200, ctx.currentTime);

        const rainGain = ctx.createGain();
        rainGain.gain.setValueAtTime(0.12, ctx.currentTime);

        rainSource.connect(rainFilter);
        rainFilter.connect(rainGain);
        rainGain.connect(masterVolumeRef.current!);

        noiseSourceRef.current = rainSource;
      }

      // 3. Play Ocean Waves
      else if (activeMusic === "ocean") {
        const waveSource = createBrownNoise(ctx);

        // Lowpass filter whose cutoff frequency rises and falls
        const waveFilter = ctx.createBiquadFilter();
        waveFilter.type = "lowpass";
        waveFilter.frequency.setValueAtTime(300, ctx.currentTime);

        // Wave Swell Modulator (LFO)
        const swellLfo = ctx.createOscillator();
        swellLfo.type = "sine";
        swellLfo.frequency.setValueAtTime(0.08, ctx.currentTime); // 12-second wave cycles

        const swellLfoGain = ctx.createGain();
        swellLfoGain.gain.setValueAtTime(250, ctx.currentTime); // sweep range

        const waveGain = ctx.createGain();
        waveGain.gain.setValueAtTime(0.18, ctx.currentTime);

        // Connect LFO to filter frequency
        swellLfo.connect(swellLfoGain);
        swellLfoGain.connect(waveFilter.frequency);

        // Connect noise through filter to master
        waveSource.connect(waveFilter);
        waveFilter.connect(waveGain);
        waveGain.connect(masterVolumeRef.current!);

        swellLfo.start(0);
        noiseSourceRef.current = waveSource;
      }

      // 4. Play Nature
      else if (activeMusic === "nature") {
        startCrickets(ctx);
      }
    };

    initAudio();

    return cleanup;
  }, [activeMusic]);

  // Handle master volume adjustments in real-time
  useEffect(() => {
    if (masterVolumeRef.current && audioCtxRef.current) {
      masterVolumeRef.current.gain.linearRampToValueAtTime(
        musicVolume,
        audioCtxRef.current.currentTime + 0.1
      );
    }
  }, [musicVolume]);

  return null; // Headless component
};
