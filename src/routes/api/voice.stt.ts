import { createFileRoute } from "@tanstack/react-router";

/**
 * Gemini-powered Speech-to-Text.
 * Body: { audio: base64, mimeType: "audio/webm" | "audio/ogg" | "audio/wav" | "audio/mp4", lang?: "en"|"ar"|"fr" }
 * Returns: { text: string }
 */
export const Route = createFileRoute("/api/voice/stt")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { audio, mimeType, lang } = (await request.json()) as {
            audio: string;
            mimeType: string;
            lang?: string;
          };
          if (!audio || !mimeType) {
            return Response.json({ error: "audio and mimeType are required" }, { status: 400 });
          }
          const apiKey = process.env.GEMINI_API_KEY;
          if (!apiKey) {
            return Response.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
          }

          const prompt =
            lang === "ar"
              ? "فرّغ هذا التسجيل الصوتي إلى نص عربي. أعد النص فقط دون أي تعليق."
              : lang === "fr"
                ? "Transcris cet enregistrement audio en français. Renvoie uniquement le texte, sans commentaire."
                : "Transcribe this audio recording. Return ONLY the transcript text, no commentary, no quotes, no labels. If the audio is silent or unintelligible, return an empty string.";

          const upstream = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  {
                    role: "user",
                    parts: [
                      { text: prompt },
                      { inline_data: { mime_type: mimeType, data: audio } },
                    ],
                  },
                ],
                generationConfig: { temperature: 0, maxOutputTokens: 256, candidateCount: 1 },
              }),
            },
          );

          if (!upstream.ok) {
            const t = await upstream.text();
            console.error("Gemini STT error", upstream.status, t);
            return Response.json({ error: "Transcription failed" }, { status: 502 });
          }
          const data = (await upstream.json()) as any;
          const text: string =
            data?.candidates?.[0]?.content?.parts
              ?.map((p: any) => p?.text ?? "")
              .join("")
              .trim() ?? "";
          return Response.json({ text });
        } catch (e) {
          console.error("voice/stt error", e);
          return Response.json(
            { error: e instanceof Error ? e.message : "Unknown error" },
            { status: 500 },
          );
        }
      },
    },
  },
});
