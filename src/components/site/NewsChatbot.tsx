import { useEffect, useMemo, useRef, useState } from "react";
import { API_BASE_URL } from "@/lib/api/axiosClient";
import {
  Headphones,
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Loader2,
  CheckCheck,
  Settings as SettingsIcon,
  Check,
  Newspaper,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useI18n } from "@/lib/i18n";
import { useVoice, GEMINI_VOICES, type GeminiVoice, type VoiceLang, type TtsEngine } from "@/store/voice";

type Msg = {
  role: "user" | "assistant";
  content: string;
  ts: number;
  status?: "sending" | "sent" | "seen";
};

const QUICK = {
  en: ["Top stories today", "Latest on the economy", "Breaking sports news", "Explain this headline"],
  fr: ["À la une aujourd'hui", "Actu économique", "Sport en direct", "Explique ce titre"],
  ar: ["أبرز عناوين اليوم", "أخبار الاقتصاد", "آخر الرياضة", "اشرح لي هذا الخبر"],
};

function fmtTime(ts: number) {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function pickMime(): { mime: string; ext: string } | null {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") return null;
  const candidates: { mime: string; ext: string }[] = [
    { mime: "audio/webm;codecs=opus", ext: "webm" },
    { mime: "audio/webm", ext: "webm" },
    { mime: "audio/ogg;codecs=opus", ext: "ogg" },
    { mime: "audio/mp4", ext: "mp4" },
  ];
  for (const c of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(c.mime)) return c;
    } catch {}
  }
  return { mime: "", ext: "webm" };
}

async function blobToBase64(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function NewsChatbot() {
  const { lang: locale } = useI18n();
  const { lang: voiceLang, voice: voiceName, engine: ttsEngine, setLang: setVoiceLangPref, setVoice: setVoicePref, setEngine: setTtsEngine } = useVoice();
  const effLang: "en" | "ar" | "fr" =
    voiceLang === "auto" ? (locale === "ar" ? "ar" : locale === "fr" ? "fr" : "en") : voiceLang;

  const [showSettings, setShowSettings] = useState(false);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [liveMode, setLiveMode] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [micLevel, setMicLevel] = useState(0);

  const liveModeRef = useRef(false);
  const isLoadingRef = useRef(false);
  const speakingRef = useRef(false);
  const listeningRef = useRef(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recorderMimeRef = useRef<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const ttsAbortRef = useRef<AbortController | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const audioQueueRef = useRef<string[]>([]);
  const spokenIdxRef = useRef(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const meterRafRef = useRef<number | null>(null);
  const speechStartedRef = useRef(false);
  const speechStartAtRef = useRef(0);
  const lastVoiceAtRef = useRef(0);
  const silenceTimerRef = useRef<number | null>(null);
  const noiseFloorRef = useRef(0.01);
  const noiseFloorReadyRef = useRef(false);
  const noiseSamplesRef = useRef<number[]>([]);

  // WebSocket live voice refs
  const voiceWsRef = useRef<WebSocket | null>(null);
  const livePlaybackCtxRef = useRef<AudioContext | null>(null);
  const nextPlayTimeRef = useRef(0);
  const liveProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const liveMicStreamRef = useRef<MediaStream | null>(null);
  const liveAudioCtxRef = useRef<AudioContext | null>(null);
  const liveTranscriptRef = useRef("");

  useEffect(() => { liveModeRef.current = liveMode; }, [liveMode]);
  useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);
  useEffect(() => { listeningRef.current = listening; }, [listening]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ok = !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined";
    setVoiceSupported(ok);
  }, []);

  // ===== TTS =====
  function ensureAudioEl() {
    if (audioElRef.current) return audioElRef.current;
    const a = new Audio();
    a.preload = "auto";
    a.onplay = () => { speakingRef.current = true; setSpeaking(true); };
    a.onended = () => {
      speakingRef.current = false;
      if (a.src && a.src.startsWith("blob:")) URL.revokeObjectURL(a.src);
      const next = audioQueueRef.current.shift();
      if (next) {
        a.src = next;
        a.play().catch(() => {});
      } else {
        setSpeaking(false);
        if (liveModeRef.current && !isLoadingRef.current && !listeningRef.current) {
          startListening();
        }
      }
    };
    a.onerror = () => { speakingRef.current = false; setSpeaking(false); };
    audioElRef.current = a;
    return a;
  }

  function stopSpeaking() {
    ttsAbortRef.current?.abort();
    ttsAbortRef.current = null;
    const a = audioElRef.current;
    if (a) {
      try { a.pause(); } catch {}
      if (a.src && a.src.startsWith("blob:")) URL.revokeObjectURL(a.src);
      a.removeAttribute("src");
      try { a.load(); } catch {}
    }
    for (const url of audioQueueRef.current) {
      try { URL.revokeObjectURL(url); } catch {}
    }
    audioQueueRef.current = [];
    // Cancel browser speech synthesis
    if (typeof window !== "undefined" && window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch {}
    }
    speakingRef.current = false;
    setSpeaking(false);
  }

  function pickBrowserVoice(lang: "en" | "ar" | "fr"): SpeechSynthesisVoice | null {
    if (typeof window === "undefined" || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;
    const target = lang === "ar" ? "ar" : lang === "fr" ? "fr" : "en";
    // Prefer high-quality voices
    const exact = voices.find((v) => v.lang.toLowerCase().startsWith(target) && /google|natural|premium|enhanced/i.test(v.name));
    if (exact) return exact;
    const any = voices.find((v) => v.lang.toLowerCase().startsWith(target));
    return any ?? voices[0];
  }

  async function speakWithBrowser(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        resolve();
        return;
      }
      const u = new SpeechSynthesisUtterance(text);
      const v = pickBrowserVoice(effLang);
      if (v) u.voice = v;
      u.lang = effLang === "ar" ? "ar-SA" : effLang === "fr" ? "fr-FR" : "en-US";
      u.rate = 1.05;
      u.pitch = 1;
      u.onstart = () => { speakingRef.current = true; setSpeaking(true); };
      u.onend = () => {
        speakingRef.current = false;
        setSpeaking(false);
        if (liveModeRef.current && !isLoadingRef.current && !listeningRef.current) {
          startListening();
        }
        resolve();
      };
      u.onerror = () => { speakingRef.current = false; setSpeaking(false); resolve(); };
      window.speechSynthesis.speak(u);
    });
  }

  async function enqueueTts(text: string) {
    if (!voiceEnabled) return;
    const clean = text
      .replace(/[*_`#>]+/g, "")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/\s+/g, " ")
      .trim();
    if (!clean) return;

    // Browser speechSynthesis: instant, zero network round-trip
    if (ttsEngine === "browser") {
      speakWithBrowser(clean);
      return;
    }

    // Gemini premium voice (slower, network round-trip)
    const controller = new AbortController();
    ttsAbortRef.current = controller;
    try {
      const resp = await fetch(`${API_BASE_URL}/voice/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: clean, lang: effLang, voice: voiceName }),
        signal: controller.signal,
      });
      if (!resp.ok) {
        console.warn("TTS failed", resp.status);
        return;
      }
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = ensureAudioEl();
      if (a.paused && !a.src) {
        a.src = url;
        try {
          await a.play();
        } catch {
          audioQueueRef.current.unshift(url);
        }
      } else {
        audioQueueRef.current.push(url);
      }
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") console.warn("TTS error", e);
    }
  }

  useEffect(() => {
    if (!voiceEnabled) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") return;
    const content = last.content || "";
    if (content.length <= spokenIdxRef.current) return;
    const pending = content.slice(spokenIdxRef.current);
    const firstChunk = spokenIdxRef.current === 0;
    // For the very first chunk, flush ASAP at the earliest light boundary
    // (comma, dash, space after ~12 chars) so audio can start within ~1s
    // instead of waiting for a full sentence (which makes Gemini TTS take 10–15s).
    const earlyRegex = /[\.!\?…,;:\n\-—]|[\u061F\u060C\u06D4]/g;
    const boundaryRegex = /[\.!\?…\n]|[\u061F\u06D4]/g;
    const regex = firstChunk ? earlyRegex : boundaryRegex;
    let lastBoundary = -1;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(pending)) !== null) lastBoundary = m.index;
    let upTo = -1;
    if (firstChunk && lastBoundary >= 0 && lastBoundary + 1 >= 12) upTo = lastBoundary + 1;
    else if (firstChunk && pending.length >= 40) upTo = pending.length; // fallback flush
    else if (lastBoundary >= 0) upTo = lastBoundary + 1;
    else if (!isLoading) upTo = pending.length;
    if (upTo > 0) {
      const chunk = pending.slice(0, upTo).trim();
      spokenIdxRef.current += upTo;
      if (chunk) enqueueTts(chunk);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isLoading, voiceEnabled]);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.role === "user") spokenIdxRef.current = 0;
  }, [messages]);

  // ===== Mic / VAD =====
  function stopMeter() {
    if (meterRafRef.current) cancelAnimationFrame(meterRafRef.current);
    meterRafRef.current = null;
    setMicLevel(0);
  }
  function teardownMic() {
    stopMeter();
    try { micStreamRef.current?.getTracks().forEach((tr) => tr.stop()); } catch {}
    micStreamRef.current = null;
    try { audioCtxRef.current?.close(); } catch {}
    audioCtxRef.current = null;
    analyserRef.current = null;
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }
  async function ensureMicAndAnalyser() {
    if (micStreamRef.current && audioCtxRef.current && analyserRef.current) return;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
    micStreamRef.current = stream;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;
    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    src.connect(analyser);
    analyserRef.current = analyser;
  }
  function startMeter(onTick?: (rms: number) => void) {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const buf = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / buf.length);
      setMicLevel(Math.min(1, rms * 3));
      onTick?.(rms);
      meterRafRef.current = requestAnimationFrame(tick);
    };
    tick();
  }

  async function startListening() {
    if (recorderRef.current && recorderRef.current.state === "recording") return;
    setError(null);
    if (speakingRef.current) stopSpeaking();
    try {
      await ensureMicAndAnalyser();
    } catch {
      setError(locale === "ar" ? "لا يمكن الوصول إلى الميكروفون." : locale === "fr" ? "Accès au micro refusé." : "Microphone access denied.");
      return;
    }
    const picked = pickMime();
    if (!picked) {
      setError(locale === "ar" ? "تسجيل الصوت غير مدعوم." : locale === "fr" ? "Enregistrement audio non supporté." : "Audio recording not supported.");
      return;
    }
    recordedChunksRef.current = [];
    recorderMimeRef.current = picked.mime;
    let rec: MediaRecorder;
    try {
      rec = picked.mime
        ? new MediaRecorder(micStreamRef.current!, { mimeType: picked.mime })
        : new MediaRecorder(micStreamRef.current!);
    } catch {
      rec = new MediaRecorder(micStreamRef.current!);
    }
    recorderRef.current = rec;
    speechStartedRef.current = false;
    speechStartAtRef.current = 0;
    lastVoiceAtRef.current = 0;
    noiseFloorRef.current = 0.01;
    noiseFloorReadyRef.current = false;
    noiseSamplesRef.current = [];

    rec.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) recordedChunksRef.current.push(ev.data);
    };
    rec.onstop = async () => {
      const chunks = recordedChunksRef.current;
      recordedChunksRef.current = [];
      const mime = rec.mimeType || recorderMimeRef.current || "audio/webm";
      const blob = new Blob(chunks, { type: mime });
      setListening(false);
      if (!speechStartedRef.current || blob.size < 2000) {
        if (liveModeRef.current && !isLoadingRef.current && !speakingRef.current) {
          window.setTimeout(() => startListening(), 200);
        }
        return;
      }
      await transcribeAndSend(blob, mime);
    };

    try {
      rec.start(250);
    } catch {
      setError(locale === "ar" ? "تعذّر بدء التسجيل." : locale === "fr" ? "Impossible de démarrer." : "Could not start recording.");
      return;
    }
    setListening(true);

    const CALIBRATION_MS = 400;
    const SPEECH_RATIO = 2.6;
    const ABSOLUTE_FLOOR = 0.025;
    const RELEASE_RATIO = 1.6;
    const SILENCE_MS = 650;
    const MIN_SPEECH_MS = 250;
    const MAX_RECORDING_MS = 15000;
    const NOISE_DECAY = 0.05;
    const startedAt = Date.now();
    startMeter((rms) => {
      const now = Date.now();
      const elapsed = now - startedAt;
      if (!noiseFloorReadyRef.current) {
        noiseSamplesRef.current.push(rms);
        if (elapsed >= CALIBRATION_MS) {
          const samples = noiseSamplesRef.current.slice().sort((a, b) => a - b);
          const median = samples[Math.floor(samples.length / 2)] ?? 0.01;
          noiseFloorRef.current = Math.max(0.005, median);
          noiseFloorReadyRef.current = true;
        }
        return;
      }
      const speechThreshold = Math.max(noiseFloorRef.current * SPEECH_RATIO, ABSOLUTE_FLOOR);
      const releaseThreshold = Math.max(noiseFloorRef.current * RELEASE_RATIO, ABSOLUTE_FLOOR * 0.7);
      if (rms > speechThreshold) {
        if (!speechStartedRef.current) {
          speechStartedRef.current = true;
          speechStartAtRef.current = now;
        }
        lastVoiceAtRef.current = now;
      } else if (!speechStartedRef.current && rms < releaseThreshold) {
        noiseFloorRef.current = noiseFloorRef.current * (1 - NOISE_DECAY) + rms * NOISE_DECAY;
      }
      if (
        speechStartedRef.current &&
        lastVoiceAtRef.current > 0 &&
        now - speechStartAtRef.current >= MIN_SPEECH_MS &&
        now - lastVoiceAtRef.current > SILENCE_MS &&
        rec.state === "recording"
      ) {
        try { rec.stop(); } catch {}
      } else if (elapsed > MAX_RECORDING_MS && rec.state === "recording") {
        try { rec.stop(); } catch {}
      }
    });
  }

  function stopListening() {
    const rec = recorderRef.current;
    if (rec && rec.state === "recording") {
      try { rec.stop(); } catch {}
    }
    setListening(false);
  }

  async function transcribeAndSend(blob: Blob, mime: string) {
    setTranscribing(true);
    // Auto-enable voice replies when user speaks via mic
    setVoiceEnabled(true);
    try {
      const audioB64 = await blobToBase64(blob);
      const cleanMime = (mime.split(";")[0] || "audio/webm").trim();
      const resp = await fetch(`${API_BASE_URL}/voice/stt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: audioB64, mimeType: cleanMime, lang: effLang }),
      });
      const data = await resp.json().catch(() => ({}));
      const text: string = (data?.text ?? "").trim();
      if (!resp.ok) {
        setError(data?.error ?? "Transcription failed");
        return;
      }
      if (!text) {
        if (liveModeRef.current && !speakingRef.current && !isLoadingRef.current) {
          startListening();
        }
        return;
      }
      await sendText(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transcription error");
    } finally {
      setTranscribing(false);
    }
  }

  async function toggleLive() {
    if (liveMode) {
      // Stop live voice
      setLiveMode(false);
      stopLiveVoice();
      return;
    }
    setLiveMode(true);
    setVoiceEnabled(true);
    setListening(true);
    setError(null);

    try {
      // Build WebSocket URL from API_BASE_URL
      // API_BASE_URL examples: http://localhost:5249/api, https://localhost:7198
      const url = new URL(API_BASE_URL);
      const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${url.host}/ws/chat`;
      console.log('[Voice] Connecting to:', wsUrl);

      const ws = new WebSocket(wsUrl);
      voiceWsRef.current = ws;

      ws.onopen = () => console.log('[Voice] WS connected');

      ws.onmessage = async (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.type === 'voiceReady') {
            console.log('[Voice] Session ready, starting mic capture');
            await startLiveAudioCapture(ws);
          } else if (msg.type === 'audio') {
            playPcmChunk(msg.data, 24000);
            setSpeaking(true);
            speakingRef.current = true;
          } else if (msg.type === 'voiceTranscript') {
            if (msg.sender === 'ai') {
              liveTranscriptRef.current += msg.text;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last && last.role === 'assistant' && last.content !== undefined) {
                  return [...prev.slice(0, -1), { ...last, content: liveTranscriptRef.current }];
                }
                return [...prev, { role: 'assistant' as const, content: liveTranscriptRef.current, ts: Date.now(), status: 'sent' as const }];
              });
            } else if (msg.sender === 'user') {
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last && last.role === 'user' && (Date.now() - last.ts) < 5000) {
                  return [...prev.slice(0, -1), { ...last, content: last.content + msg.text }];
                }
                return [...prev, { role: 'user' as const, content: msg.text, ts: Date.now(), status: 'sent' as const }];
              });
            }
          } else if (msg.type === 'turnComplete') {
            speakingRef.current = false;
            setSpeaking(false);
            liveTranscriptRef.current = '';
          } else if (msg.type === 'error') {
            setError(msg.text || 'Voice connection error');
          }
        } catch (e) {
          console.error('[Voice] Message parse error', e);
        }
      };

      ws.onerror = () => {
        setError('Voice connection failed');
        setLiveMode(false);
        setListening(false);
      };

      ws.onclose = () => {
        console.log('[Voice] WS closed');
        if (liveModeRef.current) {
          setLiveMode(false);
          setListening(false);
          stopLiveVoice();
        }
      };
    } catch (e) {
      console.error('[Voice] Failed to connect', e);
      setError('Could not connect to voice service');
      setLiveMode(false);
      setListening(false);
    }
  }

  async function startLiveAudioCapture(ws: WebSocket) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, sampleRate: 16000 },
      });
      liveMicStreamRef.current = stream;

      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      liveAudioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);

      // Also set up analyser for mic level meter
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);
      analyserRef.current = analyser;

      const processor = ctx.createScriptProcessor(4096, 1, 1);
      liveProcessorRef.current = processor;

      source.connect(processor);
      processor.connect(ctx.destination);

      processor.onaudioprocess = (e) => {
        if (ws.readyState !== WebSocket.OPEN) return;
        const float32 = e.inputBuffer.getChannelData(0);
        // Convert float32 to 16-bit PCM
        const int16 = new Int16Array(float32.length);
        for (let i = 0; i < float32.length; i++) {
          const s = Math.max(-1, Math.min(1, float32[i]));
          int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        // Convert to base64
        const bytes = new Uint8Array(int16.buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        const b64 = btoa(binary);
        ws.send(JSON.stringify({ type: 'audio', data: b64 }));

        // Update mic level meter
        let sum = 0;
        for (let i = 0; i < float32.length; i++) sum += float32[i] * float32[i];
        const rms = Math.sqrt(sum / float32.length);
        setMicLevel(Math.min(1, rms * 3));
      };
    } catch (e) {
      console.error('[Voice] Mic capture failed', e);
      setError('Microphone access denied');
      stopLiveVoice();
    }
  }

  function playPcmChunk(b64: string, sampleRate: number) {
    try {
      if (!livePlaybackCtxRef.current) {
        livePlaybackCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });
        nextPlayTimeRef.current = 0;
      }
      const ctx = livePlaybackCtxRef.current;
      const raw = atob(b64);
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768;

      const buffer = ctx.createBuffer(1, float32.length, sampleRate);
      buffer.getChannelData(0).set(float32);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);

      const now = ctx.currentTime;
      const startAt = Math.max(now, nextPlayTimeRef.current);
      source.start(startAt);
      nextPlayTimeRef.current = startAt + buffer.duration;
    } catch (e) {
      console.error('[Voice] Playback error', e);
    }
  }

  function stopLiveVoice() {
    // Close WebSocket
    if (voiceWsRef.current) {
      try { voiceWsRef.current.close(); } catch {}
      voiceWsRef.current = null;
    }
    // Stop mic capture
    if (liveProcessorRef.current) {
      try { liveProcessorRef.current.disconnect(); } catch {}
      liveProcessorRef.current = null;
    }
    if (liveMicStreamRef.current) {
      try { liveMicStreamRef.current.getTracks().forEach(t => t.stop()); } catch {}
      liveMicStreamRef.current = null;
    }
    if (liveAudioCtxRef.current) {
      try { liveAudioCtxRef.current.close(); } catch {}
      liveAudioCtxRef.current = null;
    }
    // Stop playback
    if (livePlaybackCtxRef.current) {
      try { livePlaybackCtxRef.current.close(); } catch {}
      livePlaybackCtxRef.current = null;
    }
    nextPlayTimeRef.current = 0;
    liveTranscriptRef.current = '';
    setListening(false);
    setSpeaking(false);
    speakingRef.current = false;
    setMicLevel(0);
  }

  useEffect(() => () => {
    abortRef.current?.abort();
    ttsAbortRef.current?.abort();
    try { recorderRef.current?.stop(); } catch {}
    teardownMic();
    stopSpeaking();
    stopLiveVoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          ts: Date.now(),
          content:
            locale === "ar"
              ? "مرحبًا! أنا مساعد دليل الإخباري. اسألني عن أي خبر، أو اضغط زر المكالمة المباشرة لنتحدث صوتيًا. ✨"
              : locale === "fr"
                ? "Bonjour ! Je suis l'assistant Daleel. Posez-moi une question d'actualité — ou cliquez l'appel direct pour parler. ✨"
                : "Hi! I'm the Daleel news assistant. Ask me anything in the news — or tap the call button to talk live. ✨",
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  async function send() {
    await sendText(input);
  }

  async function sendText(rawText: string) {
    const text = rawText.trim();
    if (!text || isLoading) return;
    setError(null);
    setInput("");
    if (listening) stopListening();
    stopSpeaking();

    const userMsg: Msg = { role: "user", content: text, ts: Date.now(), status: "sent" };
    const next = [...messages, userMsg];
    setMessages(next);
    setIsLoading(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    let assistantSoFar = "";
    let pending = false;
    let assistantPushed = false;
    const flush = () => {
      pending = false;
      const snapshot = assistantSoFar;
      setMessages((prev) => {
        if (!assistantPushed) return prev;
        const lastIdx = prev.length - 1;
        if (lastIdx < 0 || prev[lastIdx].role !== "assistant") return prev;
        if (prev[lastIdx].content === snapshot) return prev;
        const copy = prev.slice();
        copy[lastIdx] = { ...copy[lastIdx], content: snapshot };
        return copy;
      });
    };
    const schedule = () => {
      if (pending) return;
      pending = true;
      if (typeof window !== "undefined" && window.requestAnimationFrame) {
        window.requestAnimationFrame(flush);
      } else {
        setTimeout(flush, 16);
      }
    };

    const handleData = (json: string): boolean => {
      if (json === "[DONE]") return true;
      try {
        const parsed = JSON.parse(json);
        const delta: string | undefined = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          if (!assistantPushed) {
            assistantPushed = true;
            spokenIdxRef.current = 0;
            setMessages((prev) => [...prev, { role: "assistant", content: "", ts: Date.now() }]);
          }
          assistantSoFar += delta;
          schedule();
        }
      } catch {}
      return false;
    };
    const handleEvent = (block: string): boolean => {
      const dataParts: string[] = [];
      for (let raw of block.split("\n")) {
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (!raw || raw.startsWith(":")) continue;
        if (raw.startsWith("data:")) dataParts.push(raw.slice(5).replace(/^ /, ""));
      }
      if (dataParts.length === 0) return false;
      return handleData(dataParts.join("\n").trim());
    };

    try {
      const resp = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map(({ role, content }) => ({ role, content })) }),
        signal: controller.signal,
      });
      if (!resp.ok || !resp.body) {
        const data = await resp.json().catch(() => ({ error: "Request failed" }));
        throw new Error(data.error ?? "Request failed");
      }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finished = false;
      while (!finished) {
        const { value, done: streamDone } = await reader.read();
        if (streamDone) break;
        buffer += decoder.decode(value, { stream: true });
        let sepIdx: number;
        buffer = buffer.replace(/\r\n/g, "\n");
        while ((sepIdx = buffer.indexOf("\n\n")) !== -1) {
          const block = buffer.slice(0, sepIdx);
          buffer = buffer.slice(sepIdx + 2);
          if (handleEvent(block)) { finished = true; break; }
        }
      }
      buffer += decoder.decode();
      if (!finished && buffer.trim()) handleEvent(buffer);
      flush();
      setMessages((prev) => prev.map((m, i) =>
        m.role === "user" && i === prev.length - 2 ? { ...m, status: "seen" } : m,
      ));
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return;
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setError(msg);
      if (!assistantSoFar) {
        setMessages((prev) =>
          prev.length && prev[prev.length - 1].role === "assistant" && prev[prev.length - 1].content === ""
            ? prev.slice(0, -1)
            : prev,
        );
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setIsLoading(false);
      if (liveModeRef.current && !voiceEnabled) {
        window.setTimeout(() => {
          if (liveModeRef.current && !listeningRef.current) startListening();
        }, 300);
      }
    }
  }

  const placeholder = listening
    ? (locale === "ar" ? "أستمع إليك…" : locale === "fr" ? "Je vous écoute…" : "Listening…")
    : transcribing
      ? (locale === "ar" ? "أحوّل صوتك إلى نص…" : locale === "fr" ? "Transcription…" : "Transcribing…")
      : (locale === "ar" ? "اسأل المساعد عن أي خبر…" : locale === "fr" ? "Posez une question d'actu…" : "Ask the news assistant…");

  const quickReplies = useMemo(() => QUICK[locale] ?? QUICK.en, [locale]);

  const statusLabel = liveMode
    ? speaking
      ? (locale === "ar" ? "يتحدث الآن…" : locale === "fr" ? "Parle…" : "Speaking…")
      : transcribing
        ? (locale === "ar" ? "أحوّل صوتك…" : locale === "fr" ? "Transcription…" : "Transcribing…")
        : listening
          ? (locale === "ar" ? "يستمع إليك" : locale === "fr" ? "À l'écoute" : "Listening to you")
          : isLoading
            ? (locale === "ar" ? "يكتب…" : locale === "fr" ? "Réfléchit…" : "Thinking…")
            : (locale === "ar" ? "متصل" : "Live")
    : isLoading
      ? (locale === "ar" ? "يكتب…" : locale === "fr" ? "Écrit…" : "Typing…")
      : (locale === "ar" ? "متصل الآن" : locale === "fr" ? "En ligne" : "Online now");

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open Daleel news assistant"
        className="fixed bottom-5 end-5 z-[60] inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-deep text-primary-foreground shadow-lg shadow-primary/30 transition hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : <Newspaper className="h-6 w-6" />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 end-5 z-[60] flex h-[min(78vh,640px)] w-[min(94vw,420px)] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
          <header className="relative flex items-center gap-3 border-b border-border bg-gradient-to-br from-primary to-primary-deep px-4 py-3 text-primary-foreground">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur ring-2 ring-white/30">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className={`absolute -bottom-0.5 -end-0.5 h-3 w-3 rounded-full ring-2 ring-primary ${liveMode ? "bg-emerald-400 animate-pulse" : "bg-emerald-400"}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold leading-tight">
                Daleel AI · <span className="opacity-85 font-normal">
                  {locale === "ar" ? "المساعد الإخباري" : locale === "fr" ? "Assistant news" : "News assistant"}
                </span>
              </p>
              <p className="text-[11px] opacity-90 flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-300" />
                {statusLabel}
                <span className="ms-1 inline-flex items-center gap-1 rounded-full bg-white/15 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide">
                  <Sparkles className="h-2.5 w-2.5" /> AI
                </span>
              </p>
            </div>
            {voiceSupported && (
              <button
                type="button"
                onClick={() => {
                  setVoiceEnabled((v) => {
                    if (v) stopSpeaking();
                    return !v;
                  });
                }}
                aria-label={voiceEnabled ? "Mute voice replies" : "Enable voice replies"}
                title={voiceEnabled ? "Voice replies on" : "Voice replies off"}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25"
              >
                {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowSettings((v) => !v)}
              aria-label="Voice settings"
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition ${
                showSettings ? "bg-white text-primary" : "bg-white/15 hover:bg-white/25"
              }`}
            >
              <SettingsIcon className="h-4 w-4" />
            </button>
            {voiceSupported && (
              <button
                type="button"
                onClick={toggleLive}
                aria-label={liveMode ? "End live call" : "Start live call"}
                title={liveMode ? "End live call" : "Start live call"}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition ${
                  liveMode ? "bg-red-500 text-white hover:bg-red-600" : "bg-white text-primary hover:bg-white/90"
                }`}
              >
                {liveMode ? <PhoneOff className="h-4 w-4" /> : <PhoneCall className="h-4 w-4" />}
              </button>
            )}
          </header>

          {/* Settings */}
          {showSettings && (
            <div className="border-b border-border bg-card px-4 py-3 text-sm">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold">
                  {locale === "ar" ? "إعدادات الصوت" : locale === "fr" ? "Paramètres vocaux" : "Voice settings"}
                </p>
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="rounded-full p-1 text-muted-foreground hover:bg-secondary"
                  aria-label="Close settings"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mb-4">
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {locale === "ar" ? "اللغة" : locale === "fr" ? "Langue" : "Language"}
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {([
                    { id: "auto", label: locale === "ar" ? "تلقائي" : locale === "fr" ? "Auto" : "Auto" },
                    { id: "en", label: "EN" },
                    { id: "fr", label: "FR" },
                    { id: "ar", label: "AR" },
                  ] as { id: VoiceLang; label: string }[]).map((opt) => {
                    const active = voiceLang === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setVoiceLangPref(opt.id)}
                        className={`rounded-full border px-2.5 py-1.5 text-xs font-medium transition ${
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-secondary/50 text-foreground hover:bg-secondary"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {locale === "ar" ? "محرّك الصوت" : locale === "fr" ? "Moteur vocal" : "Voice engine"}
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {([
                    {
                      id: "browser" as TtsEngine,
                      title: locale === "ar" ? "فوري (المتصفح)" : locale === "fr" ? "Instantané" : "Instant",
                      hint: locale === "ar" ? "بدون تأخير" : locale === "fr" ? "Aucun délai réseau" : "No network delay",
                    },
                    {
                      id: "gemini" as TtsEngine,
                      title: locale === "ar" ? "صوت فاخر" : locale === "fr" ? "Voix premium" : "Premium voice",
                      hint: locale === "ar" ? "أبطأ، أعلى جودة" : locale === "fr" ? "Plus lent, plus naturel" : "Slower, richer voice",
                    },
                  ]).map((opt) => {
                    const active = ttsEngine === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => { setTtsEngine(opt.id); stopSpeaking(); }}
                        className={`flex flex-col items-start rounded-lg border px-3 py-2 text-left transition ${
                          active
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-secondary/50"
                        }`}
                      >
                        <span className="text-sm font-medium">{opt.title}</span>
                        <span className="text-[10px] text-muted-foreground">{opt.hint}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={ttsEngine === "browser" ? "opacity-50 pointer-events-none" : ""}>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {locale === "ar" ? "اختيار الصوت" : locale === "fr" ? "Choix de voix" : "Voice selection"}
                </label>
                <div className="grid grid-cols-1 gap-1">
                  {GEMINI_VOICES.map((v) => {
                    const active = voiceName === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setVoicePref(v.id as GeminiVoice);
                          stopSpeaking();
                        }}
                        className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left transition ${
                          active ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/50"
                        }`}
                      >
                        <span>
                          <span className="block text-sm font-medium">{v.label}</span>
                          <span className="block text-[10px] text-muted-foreground">{v.hint}</span>
                        </span>
                        {active && <Check className="h-4 w-4 text-primary" />}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setVoiceEnabled(true);
                    await enqueueTts(
                      locale === "ar"
                        ? `مرحبًا، هذا صوت ${voiceName}.`
                        : locale === "fr"
                          ? `Bonjour, voici la voix ${voiceName}.`
                          : `Hi, this is the ${voiceName} voice.`,
                    );
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-3 py-1 text-[11px] font-medium text-foreground transition hover:bg-secondary"
                >
                  <Volume2 className="h-3 w-3" />
                  {locale === "ar" ? "استمع لعينة" : locale === "fr" ? "Écouter un aperçu" : "Preview voice"}
                </button>
              </div>
            </div>
          )}

          {/* Live banner */}
          {liveMode && (
            <div className="flex items-center gap-3 border-b border-border bg-gradient-to-r from-emerald-500/10 via-primary/5 to-primary/10 px-4 py-2.5">
              <Headphones className="h-4 w-4 text-emerald-600" />
              <p className="flex-1 text-xs text-foreground/80">
                {locale === "ar"
                  ? "وضع المكالمة المباشرة — تكلم بشكل طبيعي وسيردّ المساعد فورًا."
                  : locale === "fr"
                    ? "Mode appel direct — parlez naturellement, l'assistant répond aussitôt."
                    : "Live call mode — speak naturally; the assistant replies right away."}
              </p>
              <div className="flex h-5 items-end gap-0.5">
                {[0, 1, 2, 3, 4].map((i) => {
                  const threshold = (i + 1) / 5;
                  const active = micLevel >= threshold * 0.4;
                  const h = 6 + Math.min(14, Math.round(micLevel * 14 * (1 - i * 0.08)));
                  return (
                    <span
                      key={i}
                      style={{ height: active ? h : 4 }}
                      className={`w-1 rounded-sm transition-all ${
                        active ? "bg-emerald-500" : "bg-muted-foreground/30"
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-secondary/30 px-3 py-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className="flex max-w-[85%] flex-col gap-1">
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-foreground text-background rounded-br-md"
                        : "border border-border bg-card text-foreground rounded-bl-md"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-ol:my-1">
                        <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    )}
                  </div>
                  <div className={`flex items-center gap-1 text-[10px] text-muted-foreground ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <span>{fmtTime(m.ts)}</span>
                    {m.role === "user" && (
                      <CheckCheck className={`h-3 w-3 ${m.status === "seen" ? "text-primary" : ""}`} />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-border bg-card px-3.5 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
                </div>
              </div>
            )}

            {transcribing && (
              <div className="flex justify-end">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {locale === "ar" ? "جاري تحويل صوتك…" : locale === "fr" ? "Transcription en cours…" : "Transcribing…"}
                </div>
              </div>
            )}

            {speaking && !isLoading && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-700 dark:text-emerald-300">
                  <Volume2 className="h-3 w-3" />
                  {locale === "ar" ? "المساعد يتحدث…" : locale === "fr" ? "L'assistant parle…" : "Assistant speaking…"}
                  <button
                    type="button"
                    onClick={() => { stopSpeaking(); if (liveModeRef.current) startListening(); }}
                    className="ms-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-medium text-white hover:bg-emerald-700"
                  >
                    {locale === "ar" ? "قاطع" : locale === "fr" ? "Couper" : "Interrupt"}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}
          </div>

          {messages.length <= 2 && !isLoading && (
            <div className="flex flex-wrap gap-1.5 border-t border-border bg-card px-3 pt-2">
              {quickReplies.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendText(q)}
                  className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-foreground transition hover:bg-secondary"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="flex items-center gap-2 border-t border-border bg-card p-3"
          >
            <div className="relative flex-1">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={placeholder}
                disabled={isLoading || transcribing}
                className="h-10 w-full rounded-full border border-border bg-secondary/50 ps-4 pe-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            {voiceSupported && !liveMode && (
              <button
                type="button"
                onClick={listening ? stopListening : () => startListening()}
                disabled={isLoading || transcribing}
                aria-label={listening ? "Stop voice input" : "Start voice input"}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition ${
                  listening ? "bg-destructive text-white animate-pulse" : "bg-secondary text-foreground hover:bg-secondary/70"
                }`}
              >
                {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-deep text-primary-foreground transition disabled:opacity-50"
              aria-label="Send"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 rtl:rotate-180" />}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
