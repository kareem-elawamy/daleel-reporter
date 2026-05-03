import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Radio, Clock } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useI18n } from "@/lib/i18n";
import { liveUpdates } from "@/lib/mock-data";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "Live Coverage — Daleel Reporter" },
      { name: "description", content: "Real-time chronological updates and breaking coverage from the Daleel newsroom." },
      { property: "og:title", content: "Live Coverage — Daleel Reporter" },
      { property: "og:description", content: "Real-time updates from the Daleel newsroom." },
    ],
  }),
  component: LivePage,
});

function LivePage() {
  const { t, lang } = useI18n();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const fmtTime = (iso: string) => {
    if (!now) return "";
    const d = new Date(iso);
    const diffMin = Math.floor((now.getTime() - d.getTime()) / 60_000);
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    return d.toLocaleTimeString({ en: "en-US", ar: "ar", fr: "fr-FR" }[lang] ?? "en-US", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-10 md:px-6 animate-fade-up">
        {/* Live header */}
        <div className="mb-8 rounded-xl border border-live/20 bg-gradient-to-br from-live/5 to-flame/5 p-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-live px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-live-foreground">
              <span className="h-2 w-2 rounded-full bg-live-foreground live-pulse" />
              {t("live.badge")}
            </span>
            <Radio className="h-5 w-5 text-live" />
          </div>
          <h1 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight">
            {t("live.title")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {liveUpdates.length} {t("live.updates")} · auto-refresh
          </p>
        </div>

        {/* Timeline */}
        <ol className="relative">
          {/* vertical line */}
          <span className="absolute top-2 bottom-2 start-[11px] w-0.5 bg-gradient-to-b from-live via-flame to-transparent" aria-hidden />

          {liveUpdates.map((update, i) => (
            <li key={update.id} className="relative ps-10 pb-8 last:pb-0 animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
              <span className="absolute start-0 top-1 flex h-6 w-6 items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-live/30 live-pulse" />
                <span className="relative h-3 w-3 rounded-full bg-live ring-4 ring-background" />
              </span>

              <div className="rounded-lg border border-border bg-card p-5 shadow-card hover:shadow-elegant transition-shadow">
                <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-2">
                  <Clock className="h-3.5 w-3.5" />
                  <time dateTime={update.timestamp} suppressHydrationWarning>{fmtTime(update.timestamp)}</time>
                  {i === 0 && (
                    <span className="ms-auto inline-flex items-center gap-1 rounded-full bg-live/10 px-2 py-0.5 text-[10px] font-bold uppercase text-live">
                      <span className="h-1.5 w-1.5 rounded-full bg-live live-pulse" />
                      latest
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-extrabold leading-snug">{update.title[lang]}</h3>
                <p className="mt-2 text-sm md:text-base text-foreground/85 leading-relaxed">{update.body[lang]}</p>
                {update.media && (
                  <div className="mt-4 overflow-hidden rounded-md bg-muted img-zoom">
                    <img src={update.media} alt="" className="w-full object-cover" />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </main>

      <Footer />
    </div>
  );
}
