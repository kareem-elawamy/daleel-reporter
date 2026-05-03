import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { sections, type Article } from "@/lib/mock-data";
import { fetchPublishedArticles } from "@/lib/articles";

const SPEEDS = [
  { label: "1×", duration: "60s" },
  { label: "2×", duration: "30s" },
  { label: "3×", duration: "18s" },
];

export function BreakingTicker() {
  const { t, lang } = useI18n();
  const [speed, setSpeed] = useState(1);
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetchPublishedArticles().then(setArticles);
  }, []);

  // pull a few headlines
  const items = articles.slice(0, 6).map((a) => ({
    title: a.title[lang],
    section: sections[a.section][lang],
  }));

  // duplicate items for seamless loop
  const loop = [...items, ...items];

  return (
    <div className="border-b border-border bg-foreground text-background">
      <div className="mx-auto flex max-w-7xl items-stretch px-4 md:px-6">
        <div className="flex shrink-0 items-center gap-2 bg-flame px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-flame-foreground">
          <span className="h-2 w-2 rounded-full bg-flame-foreground live-pulse" />
          {t("ticker.label")}
        </div>

        <div className="ticker-paused relative flex-1 overflow-hidden">
          <div
            className="animate-ticker flex whitespace-nowrap py-2.5"
            style={{ ["--ticker-duration" as string]: SPEEDS[speed].duration }}
          >
            {loop.map((item, i) => (
              <span key={i} className="mx-6 inline-flex items-center gap-2 text-sm">
                <span className="text-flame">●</span>
                <span className="font-semibold opacity-70">{item.section}</span>
                <span className="opacity-90">{item.title}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="hidden sm:flex shrink-0 items-center gap-1 px-2">
          {SPEEDS.map((s, i) => (
            <button
              key={i}
              onClick={() => setSpeed(i)}
              className={`rounded px-2 py-1 text-xs font-mono transition-colors ${
                speed === i ? "bg-background/15 text-background" : "text-background/60 hover:text-background"
              }`}
              aria-label={`Speed ${s.label}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
