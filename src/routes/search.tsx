import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { NewsCard } from "@/components/site/NewsCard";
import { useI18n } from "@/lib/i18n";
import { sections, type Section, type Article } from "@/lib/mock-data";
import { fetchPublishedArticles } from "@/lib/articles";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search — Daleel Reporter" },
      { name: "description", content: "Search Daleel Reporter articles by keyword, section, and date." },
      { property: "og:title", content: "Search — Daleel Reporter" },
      { property: "og:description", content: "Advanced search across the Daleel archive." },
    ],
  }),
  component: SearchPage,
});

const dateRanges = ["all", "24h", "7d", "30d"] as const;
type Range = typeof dateRanges[number];

function SearchPage() {
  const { t, lang } = useI18n();
  const [keyword, setKeyword] = useState("");
  const [section, setSection] = useState<"all" | Section>("all");
  const [range, setRange] = useState<Range>("all");
  const [articles, setArticles] = useState<Article[]>([]);
  useEffect(() => { fetchPublishedArticles().then(setArticles); }, []);

  const results = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    const cutoff = (() => {
      const now = Date.now();
      if (range === "24h") return now - 86400_000;
      if (range === "7d") return now - 7 * 86400_000;
      if (range === "30d") return now - 30 * 86400_000;
      return 0;
    })();

    return articles.filter((a) => {
      if (section !== "all" && a.section !== section) return false;
      if (cutoff && new Date(a.publishedAt).getTime() < cutoff) return false;
      if (kw) {
        const haystack = [
          a.title.en, a.title.ar, a.title.fr,
          a.excerpt.en, a.excerpt.ar, a.excerpt.fr,
          ...a.tags.en, ...a.tags.ar, ...a.tags.fr,
        ].join(" ").toLowerCase();
        if (!haystack.includes(kw)) return false;
      }
      return true;
    });
  }, [keyword, section, range, articles]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-6 animate-fade-up">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t("search.title")}</h1>
        </div>

        {/* Search box */}
        <div className="rounded-xl border border-border bg-card p-5 md:p-6 shadow-card mb-8">
          <div className="relative">
            <SearchIcon className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={t("search.placeholder")}
              className="h-14 w-full rounded-lg border border-input bg-background ps-12 pe-12 text-base font-medium outline-none focus:border-primary transition-colors"
              aria-label={t("search.keyword")}
            />
            {keyword && (
              <button
                onClick={() => setKeyword("")}
                aria-label="Clear"
                className="absolute end-3 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
                {t("search.section")}
              </label>
              <div className="flex flex-wrap gap-2">
                <Chip active={section === "all"} onClick={() => setSection("all")}>{t("search.all")}</Chip>
                {(Object.keys(sections) as Section[]).map((s) => (
                  <Chip key={s} active={section === s} onClick={() => setSection(s)}>
                    {sections[s][lang]}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
                {t("search.date")}
              </label>
              <div className="flex flex-wrap gap-2">
                {dateRanges.map((r) => (
                  <Chip key={r} active={range === r} onClick={() => setRange(r)}>
                    {r === "all" ? t("search.all") : r}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-bold">
            {results.length} {t("search.results")}
          </h2>
        </div>

        {results.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">No results match your filters.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((a) => (
              <NewsCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-secondary text-secondary-foreground hover:bg-accent"
      }`}
    >
      {children}
    </button>
  );
}
