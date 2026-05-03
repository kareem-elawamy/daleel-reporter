import { createFileRoute, Link } from "@tanstack/react-router";
import { Twitter, Linkedin, Globe, Mail } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { NewsCard } from "@/components/site/NewsCard";
import { useI18n } from "@/lib/i18n";
import { articles } from "@/lib/mock-data";

export const Route = createFileRoute("/author/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Author — Daleel Reporter` },
      { name: "description", content: `Articles published by ${params.slug.replace(/-/g, " ")} on Daleel Reporter.` },
      { property: "og:title", content: `Author profile — Daleel Reporter` },
      { property: "og:description", content: `Articles by ${params.slug.replace(/-/g, " ")}.` },
    ],
  }),
  component: AuthorPage,
});

function AuthorPage() {
  const { slug } = Route.useParams();
  const { lang, t } = useI18n();

  const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, "-");
  const authorArticles = articles.filter((a) => slugify(a.author.name.en) === slug);
  const author = authorArticles[0]?.author ?? articles[0].author;
  const displayName = author.name[lang];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="animate-fade-up">
        {/* Profile header */}
        <div className="bg-gradient-to-br from-primary/10 via-background to-flame/5 border-b border-border">
          <div className="mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-16">
            <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-end md:text-start">
              <img
                src={author.avatar.replace("120", "200")}
                alt={displayName}
                className="h-32 w-32 rounded-full border-4 border-card object-cover shadow-elegant"
              />
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-flame mb-1">{t("article.by")}</p>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{displayName}</h1>
                <p className="mt-3 max-w-2xl text-muted-foreground">
                  Senior correspondent covering global affairs, with bylines across politics, economy, and culture desks.
                </p>
                <div className="mt-4 flex justify-center gap-1 md:justify-start">
                  {[Twitter, Linkedin, Globe, Mail].map((Icon, i) => (
                    <a
                      key={i}
                      href="#"
                      aria-label="social"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-primary transition-colors"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card px-5 py-3 text-center">
                <div className="text-2xl font-extrabold text-primary">{authorArticles.length}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">articles</div>
              </div>
            </div>
          </div>
        </div>

        <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
          {authorArticles.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <p className="text-muted-foreground">No articles found for this author.</p>
              <Link to="/" className="mt-3 inline-block text-primary font-semibold hover:underline">← Home</Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {authorArticles.map((a) => <NewsCard key={a.id} article={a} />)}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
