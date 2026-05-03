import { createFileRoute, Link } from "@tanstack/react-router";
import { Share2, Twitter, Facebook, Linkedin, Tag, ArrowLeft } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { NewsCard } from "@/components/site/NewsCard";
import { SectionHeader } from "@/components/site/SectionHeader";
import { ClientDate } from "@/components/site/ClientDate";
import { BookmarkButton } from "@/components/site/BookmarkButton";
import { useI18n } from "@/lib/i18n";
import { useArticleBySlugQuery, usePublishedArticlesQuery } from "@/hooks/api/useArticleHooks";
import type { Lang } from "@/lib/i18n";
import { sections } from "@/lib/mock-data";

export const Route = createFileRoute("/article/$slug")({
  head: () => ({ meta: [{ title: "Article — Daleel Reporter" }] }),
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const { lang, t } = useI18n();
  const { data: article, isLoading, isError } = useArticleBySlugQuery(slug);
  const { data: relatedData } = usePublishedArticlesQuery(1, 3);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="animate-pulse">
          <div className="relative aspect-[16/9] md:aspect-[21/9] max-h-[60vh] w-full bg-muted" />
          <article className="mx-auto max-w-3xl px-4 -mt-16 md:-mt-24 relative md:px-6">
            <div className="rounded-xl bg-card p-6 md:p-10 shadow-elegant space-y-4">
              <div className="h-4 w-24 bg-muted rounded-full" />
              <div className="h-10 w-3/4 bg-muted rounded-md" />
              <div className="h-6 w-full bg-muted rounded-md mt-4" />
              <div className="h-6 w-5/6 bg-muted rounded-md" />
              <div className="my-8 h-px bg-border" />
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 w-5/6 bg-muted rounded" />
              </div>
            </div>
          </article>
        </main>
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4 text-center">
          <div>
            <h1 className="text-3xl font-extrabold mb-2 text-foreground">Article not found</h1>
            <p className="text-muted-foreground mb-6">The article you are looking for does not exist or could not be loaded.</p>
            <Link to="/" className="rounded-md bg-primary px-6 py-2.5 text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
              ← Back home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Safe mapping for related articles
  const relatedList = relatedData?.items.filter(a => a.id !== article.id).map(dto => ({
    id: dto.id,
    slug: dto.slug,
    section: ((sections as any)[dto.sectionId] ? dto.sectionId : "world") as any,
    image: dto.coverImageUrl || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&h=800&q=80",
    publishedAt: dto.publishedAt || dto.updatedAt,
    readTime: 5,
    author: {
      name: { en: dto.authorName || "Editorial", ar: dto.authorName || "التحرير", fr: dto.authorName || "Editorial" },
      avatar: "https://i.pravatar.cc/120?img=1"
    },
    title: dto.title as Record<Lang, string>,
    excerpt: dto.summary as Record<Lang, string>,
    body: { en: [""], ar: [""], fr: [""] },
    tags: { en: dto.tags || [], ar: dto.tags || [], fr: dto.tags || [] }
  })) || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="animate-fade-up">
        {/* Hero image */}
        <div className="relative">
          <div className="aspect-[16/9] md:aspect-[21/9] max-h-[60vh] w-full overflow-hidden bg-muted">
            <img src={article.coverImageUrl || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&h=800&q=80"} alt={article.title[lang as Lang] || "Cover"} className="h-full w-full object-cover" />
          </div>
        </div>

        <article className="mx-auto max-w-3xl px-4 -mt-16 md:-mt-24 relative md:px-6">
          <div className="rounded-xl bg-card p-6 md:p-10 shadow-elegant">
            <Link to="/" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline mb-4">
              <ArrowLeft className="h-3.5 w-3.5 rtl-flip" /> Daleel
            </Link>

            <span className="inline-block rounded-full bg-flame/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-flame">
              {(sections as any)[article.sectionId]?.[lang as Lang] || article.sectionId || "World"}
            </span>

            <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-foreground">
              {article.title[lang as Lang]}
            </h1>

            <p className="mt-4 text-lg md:text-xl text-muted-foreground leading-relaxed">
              {article.summary[lang as Lang]}
            </p>

            {/* Meta */}
            <div className="mt-6 flex flex-wrap items-center gap-4 border-y border-border py-4">
              <div className="flex items-center gap-3">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(article.authorDisplayName || 'E')}&background=random`} alt={article.authorDisplayName || "Editorial"} className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <p className="text-xs text-muted-foreground">{t("article.by")}</p>
                  <span className="text-sm font-bold text-foreground">
                    {article.authorDisplayName || "Editorial Team"}
                  </span>
                </div>
              </div>
              <ClientDate iso={article.publishedAt || article.createdAt} variant="long" className="text-sm text-muted-foreground" />
              <div className="ms-auto flex items-center gap-1">
                <BookmarkButton articleId={article.id} />
                <span className="text-xs text-muted-foreground me-1 ms-2 inline-flex items-center gap-1">
                  <Share2 className="h-3.5 w-3.5" /> {t("article.share")}
                </span>
                <ShareBtn icon={<Twitter className="h-4 w-4" />} label="Twitter" />
                <ShareBtn icon={<Facebook className="h-4 w-4" />} label="Facebook" />
                <ShareBtn icon={<Linkedin className="h-4 w-4" />} label="LinkedIn" />
              </div>
            </div>

            {/* Body */}
            <div
              className="prose-article mt-8 space-y-5 text-base md:text-lg leading-relaxed text-foreground/90"
              dangerouslySetInnerHTML={{ __html: article.body[lang as Lang] || "" }}
            />

            {/* Tags */}
            <div className="mt-12 flex flex-wrap items-center gap-2 border-t border-border pt-6">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {article.tags?.map((tag: string) => (
                <span key={tag} className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold hover:bg-accent transition-colors cursor-pointer text-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </article>

        {/* Related */}
        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <SectionHeader title={t("article.related")} accent="primary" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedList.map((a) => (
              <NewsCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function ShareBtn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-primary transition-colors"
    >
      {icon}
    </button>
  );
}
