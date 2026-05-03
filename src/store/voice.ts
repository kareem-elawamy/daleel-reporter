import { useEffect, useState } from "react";

export type VoiceLang = "auto" | "en" | "ar" | "fr";
export type GeminiVoice = "Kore" | "Aoede" | "Puck" | "Charon" | "Fenrir";

export const GEMINI_VOICES: { id: GeminiVoice; label: string; hint: string }[] = [
  { id: "Kore", label: "Kore", hint: "Warm, neutral (default EN/FR)" },
  { id: "Aoede", label: "Aoede", hint: "Soft, expressive (default AR)" },
  { id: "Puck", label: "Puck", hint: "Bright, friendly" },
  { id: "Charon", label: "Charon", hint: "Deep, calm" },
  { id: "Fenrir", label: "Fenrir", hint: "Confident, energetic" },
];

const KEY = "daleel-voice-v1";

export type TtsEngine = "browser" | "gemini";

type Stored = { lang: VoiceLang; voice: GeminiVoice; engine: TtsEngine };

const DEFAULTS: Stored = { lang: "auto", voice: "Kore", engine: "browser" };

function read(): Stored {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULTS;
}

export function useVoice() {
  const [state, setState] = useState<Stored>(() => read());
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }, [state]);
  return {
    lang: state.lang,
    voice: state.voice,
    engine: state.engine,
    setLang: (lang: VoiceLang) => setState((s) => ({ ...s, lang })),
    setVoice: (voice: GeminiVoice) => setState((s) => ({ ...s, voice })),
    setEngine: (engine: TtsEngine) => setState((s) => ({ ...s, engine })),
  };
}
