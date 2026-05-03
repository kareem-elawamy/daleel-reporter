# Plan: Real Live Voice Agent via Gemini Live API

Replace the current STT → chat → TTS pipeline with a true bidirectional voice channel using the **Gemini Live API** (WebSocket, native audio).

## What you'll get

- **Real-time speech-to-speech**: you speak, Gemini hears your raw audio and replies with natural spoken audio — no separate STT/TTS hops.
- **Natural turn-taking + barge-in** handled by Gemini's server-side VAD.
- **Trilingual** (EN / AR / FR) with the same news anchor persona.
- **Live transcript** (user + assistant) saved to the existing `chat_conversations` / `chat_messages` tables for logged-in users.
- **Secure**: your API key never reaches the browser. The browser gets a short-lived ephemeral token from our server.

## What I need from you

1. A **Google AI Gemini API key** with Live API access — from https://aistudio.google.com/apikey
2. I will store it as a server secret named `GEMINI_API_KEY` (you'll be prompted to paste it in once I request the secret).

That's the only manual step.

## Build steps

1. **Server function — ephemeral token** (`src/server/gemini-live.functions.ts`)
   - `POST /createLiveToken` → calls `https://generativelanguage.googleapis.com/v1beta/auth_tokens:create` with `GEMINI_API_KEY`
   - Returns a single-use, short-lived (~60s) token to the browser
   - Configures `liveConnectConstraints` to lock the model + system instruction server-side so the token can't be misused

2. **Live client hook** (`src/lib/useGeminiLive.ts`)
   - Opens a WebSocket to `wss://generativelanguage.googleapis.com/ws/.../BidiGenerateContent` using the ephemeral token
   - Captures mic via `AudioWorklet` → resamples to 16 kHz PCM → streams to Gemini
   - Plays back received 24 kHz PCM audio chunks via `AudioContext` queue (with barge-in: cancels playback when user starts talking)
   - Exposes: `connect()`, `disconnect()`, `state` (`idle | connecting | listening | speaking | thinking`), `transcript` (live), `messages` (final turns)

3. **Chatbot UI** (`src/components/site/NewsChatbot.tsx`)
   - "Live" button now opens the Gemini Live session instead of browser SpeechRecognition
   - Shows live waveform / state indicator
   - Falls back to typed chat (existing `/api/chat`) when Live is unavailable
   - Persists each finalized user + assistant turn to `chat_messages` for signed-in users

4. **i18n strings** added for the new live states (connecting, reconnecting, mic blocked).

5. **Cleanup**: remove the now-unused browser SpeechRecognition + Gemini TTS path from the live flow (kept as fallback only).

## Technical details

- **Endpoint**: `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?access_token=<EPHEMERAL>`
- **Model**: `models/gemini-2.5-flash-preview-native-audio-dialog`
- **Audio in**: 16 kHz mono PCM16, base64-encoded `realtimeInput.audio` frames (~100 ms each)
- **Audio out**: 24 kHz mono PCM16, queued and played sequentially
- **System instruction** (server-side, locked into the token):
  - Persona: "Daleel AI Live News Anchor", trilingual, neutral & factual
  - Reply in the language the user speaks
  - Suggest `/live` for unverified breaking events
- **Barge-in**: on `serverContent.interrupted=true` → flush playback queue
- **Transcripts**: `outputAudioTranscription` + `inputTranscription` enabled in setup → write each finalized turn into `chat_messages` (RLS already scopes to `auth.uid()`)

```text
 Browser                 Our Server                   Google
   │                        │                           │
   │  POST /createLiveToken │                           │
   ├───────────────────────▶│  POST auth_tokens:create  │
   │                        ├──────────────────────────▶│
   │  ◀── ephemeral token ──┤  ◀───── token ────────────┤
   │                                                    │
   │  WSS BidiGenerateContent (ephemeral token)         │
   ├───────────────────────────────────────────────────▶│
   │  ◀────── audio + transcript stream ───────────────▶│
```

## Out of scope (this turn)

- Function calling / tool use inside the live session
- Video / screen-share input
- Saved-session resume across page reloads (each open = fresh session)

Once you approve, I'll request the `GEMINI_API_KEY` secret and implement everything above.
