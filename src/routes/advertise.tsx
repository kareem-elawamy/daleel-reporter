import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { Megaphone, Globe2, Users } from "lucide-react";

const copy = {
  en: {
    title: "Advertise with Daleel",
    intro: "Reach a trilingual, premium audience across MENA, Europe and the Americas.",
    cards: [
      { h: "Premium display", p: "High-impact placements on home, sections, and articles.", Icon: Megaphone },
      { h: "Branded content", p: "Editorial-quality storytelling produced with our studio.", Icon: Globe2 },
      { h: "Audience targeting", p: "Language, geography, section and topic-level targeting.", Icon: Users },
    ],
    cta: "Request media kit",
  },
  ar: {
    title: "أعلن مع دليل",
    intro: "اصِل إلى جمهور ثلاثي اللغة في الشرق الأوسط وأوروبا والأمريكتين.",
    cards: [
      { h: "إعلانات مميزة", p: "مساحات عالية التأثير في الصفحة الرئيسية والأقسام والمقالات.", Icon: Megaphone },
      { h: "محتوى مموَّل", p: "سرد قصصي بجودة تحريرية بإنتاج استوديو دليل.", Icon: Globe2 },
      { h: "استهداف الجمهور", p: "استهداف حسب اللغة والجغرافيا والقسم والموضوع.", Icon: Users },
    ],
    cta: "اطلب الباقة الإعلانية",
  },
  fr: {
    title: "Annoncer avec Daleel",
    intro: "Touchez une audience premium trilingue en MENA, Europe et Amériques.",
    cards: [
      { h: "Display premium", p: "Emplacements à fort impact sur la home, rubriques et articles.", Icon: Megaphone },
      { h: "Brand content", p: "Storytelling éditorial produit par notre studio.", Icon: Globe2 },
      { h: "Ciblage audience", p: "Langue, géographie, rubrique et sujet.", Icon: Users },
    ],
    cta: "Demander le media kit",
  },
} as const;

export const Route = createFileRoute("/advertise")({
  head: () => ({
    meta: [
      { title: "Advertise — Daleel Reporter" },
      { name: "description", content: "Advertise with Daleel Reporter — reach a trilingual premium audience." },
      { property: "og:title", content: "Advertise with Daleel" },
      { property: "og:description", content: "Reach a trilingual premium audience across MENA, Europe and the Americas." },
    ],
  }),
  component: AdvertisePage,
});

function AdvertisePage() {
  const { lang } = useI18n();
  const c = copy[lang];
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 md:py-16">
      <h1 className="mb-3 text-3xl md:text-4xl font-bold">{c.title}</h1>
      <p className="mb-10 text-lg text-muted-foreground">{c.intro}</p>
      <div className="grid gap-6 md:grid-cols-3 mb-10">
        {c.cards.map(({ h, p, Icon }, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <Icon className="h-6 w-6 text-primary mb-3" />
            <h3 className="mb-2 text-lg font-bold">{h}</h3>
            <p className="text-sm text-muted-foreground">{p}</p>
          </div>
        ))}
      </div>
      <a
        href="mailto:ads@daleel-reporter.com"
        className="inline-flex items-center rounded-lg gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant hover:scale-[1.02] transition-transform"
      >
        {c.cta}
      </a>
    </main>
  );
}
