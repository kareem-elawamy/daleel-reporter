import { createFileRoute, Link } from "@tanstack/react-router";
import { TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { NewsCard } from "@/components/site/NewsCard";
import { SectionHeader } from "@/components/site/SectionHeader";
import { ClientDate } from "@/components/site/ClientDate";
import { useI18n } from "@/lib/i18n";
import { articles } from "@/lib/mock-data";

export const Route = createFileRoute("/trend/$slug")({
  head: ({ params }) => {
    const topic = params.slug.replace(/-/g, " ");
    return {
      meta: [
        { title: `${topic} — Trend coverage — Daleel Reporter` },
        { name: "description", content: `Full coverage and timeline of ${topic} from Daleel Reporter.` },
        { property: "og:title", content: `${topic} — Daleel Reporter` },
        { property: "og:description", content: `Full coverage of ${topic}.` },
      ],
    };
  },
  component: TrendPage,
});

function TrendPage() {
  const { slug } = Route.useParams();
  const { lang } = useI18n();
  const topic = slug.replace(/-/g, " ");

  const stories = articles.slice(0, 6);
  const lead = stories[0];
  const facts = lang === "ar"
    ? ["174 دولة شاركت في المفاوضات", "صندوق بقيمة 300 مليار دولار", "خفض الانبعاثات إلى النصف بحلول 2035", "أول آلية ملزمة لتسعير الكربون"]
    : lang === "fr"
    ? ["174 pays aux négociations", "Fonds de 300 milliards $", "Réduction de moitié des émissions d'ici 2035", "Premier mécanisme exécutoire de tarification carbone"]
    : ["174 nations at the table", "$300 billion adaptation fund", "Halving emissions by 2035", "First enforceable carbon-pricing mechanism"];

  const suggested = articles.slice(2, 6);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-10 md:px-6 animate-fade-up">
        <div className="mb-8 flex items-center gap-3 border-b border-border pb-5">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-flame text-flame-foreground">
            <TrendingUp className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-flame">Trending Now</p>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight capitalize">{topic}</h1>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-10">
            {/* Summary intro */}
            <section>
              <p className="text-lg leading-relaxed text-foreground/85">
                {lead.excerpt[lang]} Our newsroom is tracking every angle of this evolving story with on-the-ground reporters,
                expert analysis, and interactive timelines updated as events develop.
              </p>
            </section>

            {/* Linked stories */}
            <section>
              <SectionHeader title="Coverage" accent="flame" />
              <div className="space-y-6">
                {stories.map((a) => (
                  <Link
                    key={a.id}
                    to="/article/$slug"
                    params={{ slug: a.slug }}
                    className="group flex gap-5 items-start border-b border-border pb-6 last:border-0"
                  >
                    <div className="img-zoom h-28 w-40 shrink-0 overflow-hidden rounded-md bg-muted">
                      <img src={a.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base md:text-lg font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {a.title[lang]}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{a.excerpt[lang]}</p>
                      <p className="mt-2 text-xs text-muted-foreground inline-flex items-center gap-2">
                        <ClientDate iso={a.publishedAt} />
                        <span>·</span>
                        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {a.readTime} min</span>
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Timeline teaser */}
            <section>
              <SectionHeader title="Timeline" accent="primary" />
              <ol className="relative ps-6 border-s-2 border-primary/30 space-y-5">
                {stories.slice(0, 4).map((a) => (
                  <li key={a.id} className="relative">
                    <span className="absolute -start-[31px] top-1 h-4 w-4 rounded-full bg-primary ring-4 ring-background" />
                    <div className="text-xs font-mono text-flame font-bold uppercase">
                      <ClientDate iso={a.publishedAt} variant="long" />
                    </div>
                    <h4 className="text-sm font-bold mt-1">{a.title[lang]}</h4>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            <section className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-flame mb-3">Key Facts</h3>
              <ul className="space-y-3">
                {facts.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <SectionHeader title="Suggested" accent="primary" />
              <div className="space-y-5">
                {suggested.map((a) => (
                  <NewsCard key={a.id} article={a} variant="horizontal" />
                ))}
              </div>
            </section>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
