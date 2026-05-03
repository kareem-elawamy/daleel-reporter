import { createFileRoute, Link, useLocation } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowRight, Play, Images } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BreakingTicker } from "@/components/site/BreakingTicker";
import { NewsCard } from "@/components/site/NewsCard";
import { SectionHeader } from "@/components/site/SectionHeader";
import { UtilityWidgets } from "@/components/site/UtilityWidgets";
import { UpdatingStatus } from "@/components/site/UpdatingStatus";
import { useI18n, type Lang } from "@/lib/i18n";
import { sections, articles as mockArticles, type Article } from "@/lib/mock-data";
import { usePublishedArticlesQuery } from "@/hooks/api/useArticleHooks";
import { useSectionsQuery } from "@/hooks/api/useSectionHooks";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Daleel Reporter — Global Newsroom" },
      { name: "description", content: "Breaking news, analysis, and live coverage from Daleel Reporter." },
      { property: "og:title", content: "Daleel Reporter — Global Newsroom" },
      { property: "og:description", content: "Breaking news, analysis, and live coverage from Daleel Reporter." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { t, lang } = useI18n();
  
  // Reactively read section filter from URL on every navigation
  const location = useLocation();
  const activeSectionSlug = useMemo(() => {
    const params = new URLSearchParams(location.searchStr);
    return params.get("section");
  }, [location.searchStr]);
  
  // Try API first, but fallback to rich mock data for presentation
  const { data } = usePublishedArticlesQuery(1, 50);
  const { data: sectionsData } = useSectionsQuery();

  // Use API data if available, otherwise use premium mock data
  const hasApiData = data?.items && data.items.length > 0;

  const articles: Article[] = hasApiData
    ? data.items.map((dto) => {
        const section = sectionsData?.find(s => s.id === dto.sectionId);
        return {
          id: dto.id,
          slug: dto.slug,
          section: (section?.slug || "world") as any,
          sectionName: section?.name[lang] || section?.name["en"] || "World",
          image: dto.coverImageUrl || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&h=800&q=80",
          publishedAt: dto.publishedAt || dto.updatedAt,
          readTime: Math.max(3, Math.floor(Math.random() * 8)),
          author: {
            name: { en: dto.authorName || "Editorial", ar: dto.authorName || "التحرير", fr: dto.authorName || "Editorial" },
            avatar: "https://i.pravatar.cc/120?img=1"
          },
          title: dto.title as Record<Lang, string>,
          excerpt: dto.summary as Record<Lang, string>,
          body: { en: [""], ar: [""], fr: [""] },
          tags: { en: dto.tags || [], ar: dto.tags || [], fr: dto.tags || [] }
        };
      }).filter(a => activeSectionSlug ? a.section === activeSectionSlug : true)
    : mockArticles.filter(a => activeSectionSlug ? a.section === activeSectionSlug : true).map(a => ({
        ...a,
        sectionName: sections[a.section][lang],
      }));

  const hero = articles[0];
  const subHero = articles.slice(1, 4);
  const mostRead = articles.slice(2, 7);
  const editors = articles.slice(3, 7);
  const politics = articles.filter((a) => a.section === "politics");
  const economy = articles.filter((a) => a.section === "economy");
  const sports = articles.filter((a) => a.section === "sports");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <BreakingTicker />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 animate-fade-up">
        {/* HERO */}
        <section className="mb-12 grid gap-6 lg:grid-cols-3">
          <Link
            to="/article/$slug"
            params={{ slug: hero.slug }}
            className="group card-lift relative col-span-2 block overflow-hidden rounded-xl bg-card shadow-card"
          >
            <div className="img-zoom relative aspect-[16/10] md:aspect-[16/9] overflow-hidden bg-muted">
              <img src={hero.image} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 gradient-hero-overlay" />
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-8 text-background">
                <span className="inline-block rounded-full bg-flame px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-flame-foreground">
                  {t("hero.tag")} · {(hero as any).sectionName || sections[hero.section]?.[lang] || hero.section}
                </span>
                <h1 className="mt-3 text-2xl md:text-4xl lg:text-5xl font-extrabold leading-tight drop-shadow">
                  {hero.title[lang]}
                </h1>
                <p className="mt-3 hidden md:block max-w-2xl text-sm md:text-base text-background/85">
                  {hero.excerpt[lang]}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">
                  {t("common.readMore")} <ArrowRight className="h-4 w-4 rtl-flip" />
                </span>
              </div>
            </div>
          </Link>

          <div className="flex flex-col gap-4">
            {subHero.map((a) => (
              <NewsCard key={a.id} article={a} variant="horizontal" />
            ))}
          </div>
        </section>

        {/* MOST READ + EDITOR'S PICKS */}
        <section className="mb-14 grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SectionHeader title={t("section.editorsPick")} accent="primary" />
            <div className="grid gap-6 sm:grid-cols-2">
              {editors.map((a) => (
                <NewsCard key={a.id} article={a} />
              ))}
            </div>
          </div>

          <aside>
            <SectionHeader title={t("section.mostRead")} accent="flame" />
            <ol className="space-y-5">
              {mostRead.map((a, i) => (
                <li key={a.id} className="group flex items-start gap-3">
                  <span className="text-3xl font-extrabold text-gradient-flame leading-none w-8 shrink-0">
                    {i + 1}
                  </span>
                  <Link to="/article/$slug" params={{ slug: a.slug }} className="min-w-0 flex-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-flame">
                      {(a as any).sectionName || sections[a.section]?.[lang] || a.section}
                    </span>
                    <h3 className="text-sm font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {a.title[lang]}
                    </h3>
                  </Link>
                </li>
              ))}
            </ol>
          </aside>
        </section>

        {/* WIDGETS */}
        <section className="mb-14">
          <UtilityWidgets />
        </section>

        {/* SECTION GRIDS */}
        <SectionGrid title={sections.politics[lang]} articles={politics} />
        <SectionGrid title={sections.economy[lang]} articles={economy} />
        <SectionGrid title={sections.sports[lang]} articles={sports} />

        {/* TRENDING TOPICS */}
        <section className="mb-14">
          <SectionHeader title="Trending Topics" accent="flame" />
          <div className="flex flex-wrap gap-3">
            {[
              { slug: "climate-accord", label: "Climate Accord" },
              { slug: "ai-infrastructure", label: "AI Infrastructure" },
              { slug: "champions-league", label: "Champions League" },
              { slug: "elections-2026", label: "Elections 2026" },
              { slug: "opec-meeting", label: "OPEC Meeting" },
            ].map((tt) => (
              <Link
                key={tt.slug}
                to="/trend/$slug"
                params={{ slug: tt.slug }}
                className="group rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:border-flame hover:text-flame transition-colors"
              >
                #{tt.label}
              </Link>
            ))}
          </div>
        </section>

        {/* SUPPLEMENT BANNER */}
        <section className="mb-14">
          <Link
            to="/supplement/$slug"
            params={{ slug: "worldcup" }}
            className="card-lift block overflow-hidden rounded-xl bg-gradient-to-br from-emerald-700 via-teal-800 to-blue-900 p-8 text-white shadow-elegant"
          >
            <span className="inline-block rounded-full bg-yellow-300 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-emerald-950">
              Special Supplement
            </span>
            <h3 className="mt-3 text-2xl md:text-3xl font-extrabold">World Cup 2026 — Full Coverage</h3>
            <p className="mt-2 text-sm md:text-base text-white/80 max-w-xl">
              Every match, every nation, every story — from qualifiers to the final whistle.
            </p>
          </Link>
        </section>

        {/* MULTIMEDIA */}
        <section className="mb-14">
          <SectionHeader title={t("section.multimedia")} accent="flame" href="/video" />
          <div className="grid gap-6 md:grid-cols-2">
            {articles[3] && (
              <MediaTeaser
                to="/video"
                kind="video"
                image={articles[3].image}
                label={t("section.videos")}
                title={articles[3].title[lang]}
              />
            )}
            {articles[4] && (
              <MediaTeaser
                to="/gallery"
                kind="gallery"
                image={articles[4].image}
                label={t("section.gallery")}
                title={articles[4].title[lang]}
                count={24}
              />
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function SectionGrid({ title, articles: list }: { title: string; articles: Article[] }) {
  if (list.length === 0) return null;
  return (
    <section className="mb-14">
      <SectionHeader title={title} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.slice(0, 3).map((a) => (
          <NewsCard key={a.id} article={a} />
        ))}
      </div>
    </section>
  );
}

function MediaTeaser({ to, kind, image, label, title, count }: { to: "/video" | "/gallery"; kind: "video" | "gallery"; image: string; label: string; title: string; count?: number }) {
  return (
    <Link to={to} className="card-lift group relative block overflow-hidden rounded-xl bg-card shadow-card">
      <div className="img-zoom relative aspect-video overflow-hidden">
        <img src={image} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-foreground/30 group-hover:bg-foreground/45 transition-colors" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background/95 text-primary shadow-elegant transition-transform group-hover:scale-110">
            {kind === "video" ? <Play className="h-7 w-7 fill-current" /> : <Images className="h-7 w-7" />}
          </div>
        </div>
        {count && (
          <span className="absolute top-3 end-3 rounded-full bg-foreground/70 px-3 py-1 text-xs font-bold text-background">
            {count} 📷
          </span>
        )}
      </div>
      <div className="p-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-flame">{label}</span>
        <h3 className="mt-1 line-clamp-2 text-base md:text-lg font-bold">{title}</h3>
      </div>
    </Link>
  );
}
