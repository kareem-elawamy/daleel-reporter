import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Play, Search as SearchIcon, Film, Clock } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useI18n } from "@/lib/i18n";
import { sections, articles as mockArticles, type Section, type Article } from "@/lib/mock-data";
import { fetchPublishedArticles } from "@/lib/articles";
import { UpdatingStatus } from "@/components/site/UpdatingStatus";

export const Route = createFileRoute("/video")({
  head: () => ({
    meta: [
      { title: "Video Library — Daleel Reporter" },
      { name: "description", content: "Featured videos, documentaries and live streams from the Daleel newsroom." },
      { property: "og:title", content: "Video Library — Daleel Reporter" },
      { property: "og:description", content: "Featured videos and documentaries." },
    ],
  }),
  component: VideoPage,
});

function VideoPage() {
  const { t, lang } = useI18n();
  const [filter, setFilter] = useState<"all" | Section>("all");
  const [query, setQuery] = useState("");
  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const [updating, setUpdating] = useState(true);
  useEffect(() => {
    let cancelled = false;
    fetchPublishedArticles()
      .then((a) => { if (!cancelled && a.length > 0) setArticles(a); })
      .finally(() => { if (!cancelled) setUpdating(false); });
    return () => { cancelled = true; };
  }, []);

  const featured = articles[0];
  const list = articles.filter((a) => {
    if (filter !== "all" && a.section !== filter) return false;
    if (query && !a.title[lang].toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10 md:px-6 animate-fade-up">
        <div className="mb-6 flex items-center gap-3">
          <Film className="h-7 w-7 text-flame" />
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t("section.videos")}</h1>
        </div>

        {/* Featured player */}
        <div className="mb-10 overflow-hidden rounded-xl bg-foreground shadow-elegant">
          <div className="relative aspect-video bg-muted">
            <img src={featured.image} alt="" className="h-full w-full object-cover opacity-80" />
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/40">
              <button
                aria-label="Play featured video"
                className="group flex h-20 w-20 items-center justify-center rounded-full bg-flame text-flame-foreground shadow-flame transition-transform hover:scale-110"
              >
                <Play className="h-9 w-9 fill-current ms-1" />
              </button>
            </div>
            <span className="absolute top-4 start-4 inline-flex items-center gap-1.5 rounded-full bg-live px-3 py-1 text-xs font-extrabold uppercase text-live-foreground">
              <span className="h-2 w-2 rounded-full bg-live-foreground live-pulse" />
              FEATURED
            </span>
          </div>
          <div className="p-5 md:p-6 text-background">
            <span className="text-[11px] font-bold uppercase tracking-wider text-flame">
              {sections[featured.section][lang]}
            </span>
            <h2 className="mt-1 text-xl md:text-2xl font-extrabold">{featured.title[lang]}</h2>
            <p className="mt-2 text-sm text-background/80 line-clamp-2">{featured.excerpt[lang]}</p>
          </div>
        </div>

        {/* Search + filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <SearchIcon className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search.placeholder")}
              className="h-11 w-full rounded-lg border border-input bg-card ps-10 pe-4 text-sm font-medium outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
        <div className="mb-8 flex flex-wrap gap-2">
          <Chip active={filter === "all"} onClick={() => setFilter("all")}>{t("search.all")}</Chip>
          {(Object.keys(sections) as Section[]).map((s) => (
            <Chip key={s} active={filter === s} onClick={() => setFilter(s)}>
              {sections[s][lang]}
            </Chip>
          ))}
        </div>

        {/* Archive grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((a) => (
            <article key={a.id} className="card-lift group cursor-pointer overflow-hidden rounded-lg border border-border bg-card shadow-card">
              <div className="img-zoom relative aspect-video overflow-hidden bg-muted">
                <img src={a.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-foreground/25 group-hover:bg-foreground/45 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-background/95 text-primary shadow transition-transform group-hover:scale-110">
                    <Play className="h-6 w-6 fill-current ms-0.5" />
                  </span>
                </div>
                <span className="absolute bottom-2 end-2 inline-flex items-center gap-1 rounded bg-foreground/80 px-2 py-0.5 text-[11px] font-mono font-bold text-background">
                  <Clock className="h-3 w-3" /> {a.readTime}:24
                </span>
              </div>
              <div className="p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-flame">{sections[a.section][lang]}</span>
                <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug group-hover:text-primary transition-colors">
                  {a.title[lang]}
                </h3>
              </div>
            </article>
          ))}
        </div>
        {list.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No videos match your filters.
          </div>
        )}
      </main>
      <Footer />
      <UpdatingStatus show={updating} />
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
        active ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-secondary-foreground hover:bg-accent"
      }`}
    >
      {children}
    </button>
  );
}
