import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { NewsCard } from "@/components/site/NewsCard";
import { SectionHeader } from "@/components/site/SectionHeader";
import { useI18n } from "@/lib/i18n";
import { sections, articles as mockArticles, type Section, type Article } from "@/lib/mock-data";
import { fetchPublishedArticles } from "@/lib/articles";
import { UpdatingStatus } from "@/components/site/UpdatingStatus";

const validSections: Section[] = ["politics", "economy", "sports", "tech", "culture", "world"];

export const Route = createFileRoute("/section/$section")({
  loader: ({ params }) => {
    if (!validSections.includes(params.section as Section)) throw notFound();
    return { section: params.section as Section };
  },
  head: ({ loaderData }) => {
    const s = loaderData?.section ?? "world";
    const label = sections[s].en;
    return {
      meta: [
        { title: `${label} — Daleel Reporter` },
        { name: "description", content: `Latest ${label} news, analysis, and live coverage from Daleel Reporter.` },
        { property: "og:title", content: `${label} — Daleel Reporter` },
        { property: "og:description", content: `Latest ${label} news from Daleel Reporter.` },
      ],
    };
  },
  component: SectionPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center text-center p-4">
      <div>
        <h1 className="text-3xl font-extrabold mb-2">Section not found</h1>
        <Link to="/" className="text-primary font-semibold hover:underline">← Home</Link>
      </div>
    </div>
  ),
});

function SectionPage() {
  const { section } = Route.useLoaderData();
  const { lang, t } = useI18n();
  const [tab, setTab] = useState<"all" | "local" | "global" | "opinion">("all");
  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const [updating, setUpdating] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchPublishedArticles()
      .then((a) => { if (!cancelled && a.length > 0) setArticles(a); })
      .finally(() => { if (!cancelled) setUpdating(false); });
    return () => { cancelled = true; };
  }, []);

  const list = articles.filter((a) => a.section === section);
  const featured = list[0];
  const rest = list.slice(1);
  const mostRead = articles.filter((a) => a.section === section).slice(0, 5);
  const mostReadFallback = articles.slice(0, 5);
  const sidebarList = mostRead.length ? mostRead : mostReadFallback;

  const tabs = [
    { id: "all" as const, label: t("section.subAll") },
    { id: "local" as const, label: t("section.subLocal") },
    { id: "global" as const, label: t("section.subGlobal") },
    { id: "opinion" as const, label: t("section.subOpinion") },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10 md:px-6 animate-fade-up">
        <div className="mb-6 flex items-center gap-3 border-b border-border pb-5">
          <span className="block h-8 w-1.5 rounded-full bg-flame" />
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{sections[section as Section][lang as import("@/lib/i18n").Lang]}</h1>
        </div>

        {/* Sub-section tabs */}
        <div className="mb-8 flex gap-1 overflow-x-auto border-b border-border">
          {tabs.map((tb) => (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                tab === tb.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tb.label}
            </button>
          ))}
        </div>

        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-12">
            {featured && <NewsCard article={featured} />}

            {rest.length > 0 && (
              <div>
                <SectionHeader title="More stories" />
                <div className="grid gap-6 sm:grid-cols-2">
                  {rest.map((a) => <NewsCard key={a.id} article={a} />)}
                </div>
              </div>
            )}

            {list.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
                No articles yet in this section.
              </div>
            )}
          </div>

          {/* Sidebar — Most Read in Section */}
          <aside>
            <SectionHeader title={t("section.mostInSection")} accent="flame" />
            <ol className="space-y-5">
              {sidebarList.map((a, i) => (
                <li key={a.id} className="group flex items-start gap-3">
                  <span className="text-3xl font-extrabold text-gradient-flame leading-none w-8 shrink-0">
                    {i + 1}
                  </span>
                  <Link to="/article/$slug" params={{ slug: a.slug }} className="min-w-0 flex-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-flame">
                      {sections[a.section][lang]}
                    </span>
                    <h3 className="text-sm font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {a.title[lang]}
                    </h3>
                  </Link>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </main>
      <Footer />
      <UpdatingStatus show={updating} />
    </div>
  );
}
