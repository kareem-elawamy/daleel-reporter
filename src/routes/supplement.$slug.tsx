import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { NewsCard } from "@/components/site/NewsCard";
import { SectionHeader } from "@/components/site/SectionHeader";
import { useI18n } from "@/lib/i18n";
import { articles } from "@/lib/mock-data";

interface SupplementTheme {
  hue: string; // background gradient stops
  accent: string;
  ring: string;
  label: { en: string; ar: string; fr: string };
  tagline: { en: string; ar: string; fr: string };
}

const themes: Record<string, SupplementTheme> = {
  ramadan: {
    hue: "from-emerald-900 via-emerald-800 to-amber-900",
    accent: "bg-amber-400 text-emerald-950",
    ring: "ring-amber-400/40",
    label: { en: "Ramadan Special", ar: "خاص رمضان", fr: "Spécial Ramadan" },
    tagline: { en: "Reflections, recipes, and reportage from a sacred month.", ar: "تأملات ووصفات وتقارير من شهرٍ مبارك.", fr: "Réflexions, recettes et reportages d'un mois sacré." },
  },
  worldcup: {
    hue: "from-emerald-700 via-teal-800 to-blue-900",
    accent: "bg-yellow-300 text-emerald-950",
    ring: "ring-yellow-300/40",
    label: { en: "World Cup 2026", ar: "كأس العالم 2026", fr: "Coupe du Monde 2026" },
    tagline: { en: "Every match, every nation, every story.", ar: "كل مباراة، كل أمة، كل قصة.", fr: "Chaque match, chaque nation, chaque histoire." },
  },
  default: {
    hue: "from-primary via-primary-deep to-flame",
    accent: "bg-flame text-flame-foreground",
    ring: "ring-flame/40",
    label: { en: "Special Supplement", ar: "ملحق خاص", fr: "Supplément spécial" },
    tagline: { en: "An immersive editorial package from Daleel.", ar: "حزمة تحريرية شاملة من دليل.", fr: "Un dossier éditorial immersif de Daleel." },
  },
};

export const Route = createFileRoute("/supplement/$slug")({
  head: ({ params }) => {
    const t = themes[params.slug] ?? themes.default;
    return {
      meta: [
        { title: `${t.label.en} — Daleel Reporter` },
        { name: "description", content: t.tagline.en },
        { property: "og:title", content: `${t.label.en} — Daleel Reporter` },
        { property: "og:description", content: t.tagline.en },
      ],
    };
  },
  component: SupplementPage,
});

function SupplementPage() {
  const { slug } = Route.useParams();
  const { lang, t } = useI18n();
  const theme = themes[slug] ?? themes.default;

  const lead = articles[0];
  const grid = articles.slice(1, 7);
  const subnav = ["Stories", "Photos", "Videos", "Voices"];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Themed hero */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${theme.hue} text-white`}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)", backgroundSize: "40px 40px, 60px 60px" }} />
        <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider ${theme.accent}`}>
            <Sparkles className="h-3.5 w-3.5" /> {theme.label[lang]}
          </div>
          <h1 className="mt-5 text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl">{theme.label[lang]}</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">{theme.tagline[lang]}</p>

          {/* Sub-nav */}
          <nav className="mt-8 flex flex-wrap gap-2" aria-label="Supplement sections">
            {subnav.map((item, i) => (
              <a
                key={i}
                href={`#${item.toLowerCase()}`}
                className={`rounded-full border border-white/30 px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors hover:bg-white/15 ${i === 0 ? "bg-white/15" : ""}`}
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-12 md:px-6 animate-fade-up">
        {/* Lead */}
        <Link
          to="/article/$slug"
          params={{ slug: lead.slug }}
          className="group card-lift mb-12 block overflow-hidden rounded-xl bg-card shadow-card"
        >
          <div className="grid md:grid-cols-2">
            <div className="img-zoom aspect-[4/3] md:aspect-auto overflow-hidden bg-muted">
              <img src={lead.image} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="p-6 md:p-8 flex flex-col justify-center">
              <span className={`inline-block rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider w-fit ${theme.accent}`}>
                Featured
              </span>
              <h2 className="mt-3 text-2xl md:text-3xl font-extrabold leading-tight group-hover:text-primary transition-colors">
                {lead.title[lang]}
              </h2>
              <p className="mt-3 text-muted-foreground">{lead.excerpt[lang]}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                {t("common.readMore")} <ArrowRight className="h-4 w-4 rtl-flip" />
              </span>
            </div>
          </div>
        </Link>

        {/* Stories grid */}
        <SectionHeader title="Stories" accent="flame" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {grid.map((a) => <NewsCard key={a.id} article={a} />)}
        </div>

        {/* Cross-link to portal */}
        <div className="mt-12 rounded-xl border border-border bg-secondary p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Looking for the rest of the newsroom?
          </p>
          <Link to="/" className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
            Back to Daleel Reporter <ArrowRight className="h-4 w-4 rtl-flip" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
