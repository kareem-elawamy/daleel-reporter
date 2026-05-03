import { createFileRoute } from "@tanstack/react-router";

/**
 * Gemini-powered Text-to-Speech.
 * Body: { text: string, lang?: "en"|"ar"|"fr", voice?: string }
 * Returns: audio/wav (16-bit PCM, 24kHz, mono)
 */
export const Route = createFileRoute("/api/voice/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { text, lang, voice } = (await request.json()) as {
            text: string;
            lang?: string;
            voice?: string;
          };
          const clean = (text ?? "").trim();
          if (!clean) {
            return Response.json({ error: "text is required" }, { status: 400 });
          }
          const apiKey = process.env.GEMINI_API_KEY;
          if (!apiKey) {
            return Response.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
          }

          const voiceName = voice || (lang === "ar" ? "Aoede" : "Kore");
          const styled =
            lang === "ar"
              ? `اقرأ هذا الخبر بأسلوب مذيع نشرة موضوعي وواضح: ${clean}`
              : lang === "fr"
                ? `Lis cette information avec le ton calme et neutre d'un présentateur de journal: ${clean}`
                : `Read this in the calm, clear, neutral tone of a news anchor: ${clean}`;

          const upstream = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: styled }] }],
                generationConfig: {
                  responseModalities: ["AUDIO"],
                  speechConfig: {
                    voiceConfig: {
                      prebuiltVoiceConfig: { voiceName },
                    },
                  },
                },
              }),
            },
          );

          if (!upstream.ok) {
            const t = await upstream.text();
            console.error("Gemini TTS error", upstream.status, t);
            return Response.json({ error: "Speech synthesis failed" }, { status: 502 });
          }

          const data = (await upstream.json()) as any;
          const part = data?.candidates?.[0]?.content?.parts?.find(
            (p: any) => p?.inlineData?.data || p?.inline_data?.data,
          );
          const b64 = part?.inlineData?.data || part?.inline_data?.data || "";
          const mime: string =
            part?.inlineData?.mimeType ||
            part?.inline_data?.mime_type ||
            "audio/L16;rate=24000";

          if (!b64) {
            return Response.json({ error: "No audio returned" }, { status: 502 });
          }

          const pcm = Buffer.from(b64, "base64");
          const rateMatch = /rate=(\d+)/i.exec(mime);
          const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
          const wav = pcmToWav(pcm, sampleRate, 1, 16);
          const ab = new ArrayBuffer(wav.byteLength);
          new Uint8Array(ab).set(wav);

          return new Response(ab, {
            headers: {
              "Content-Type": "audio/wav",
              "Cache-Control": "no-store",
            },
          });
        } catch (e) {
          console.error("voice/tts error", e);
          return Response.json(
            { error: e instanceof Error ? e.message : "Unknown error" },
            { status: 500 },
          );
        }
      },
    },
  },
});

function pcmToWav(
  pcm: Buffer,
  sampleRate: number,
  channels: number,
  bitsPerSample: number,
): Buffer {
  const byteRate = (sampleRate * channels * bitsPerSample) / 8;
  const blockAlign = (channels * bitsPerSample) / 8;
  const dataSize = pcm.length;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  pcm.copy(buffer, 44);
  return buffer;
}
