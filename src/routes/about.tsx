import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

const copy = {
  en: {
    title: "About Daleel Reporter",
    desc: "Daleel Reporter is a global, multilingual newsroom delivering verified, balanced reporting in English, Arabic, and French.",
    body: [
      "We cover politics, economy, sports, technology, culture, and world affairs with a focus on accuracy, context, and clarity.",
      "Our editors blend on-the-ground reporting with data-driven analysis and AI-assisted research, while keeping human judgement at the centre of every story.",
      "Daleel is independent, reader-first, and committed to ethical journalism.",
    ],
  },
  ar: {
    title: "عن دليل الإخبارية",
    desc: "دليل الإخبارية غرفة أخبار عالمية متعددة اللغات تقدّم تغطيات موثوقة ومتوازنة بالعربية والإنجليزية والفرنسية.",
    body: [
      "نُغطي السياسة والاقتصاد والرياضة والتكنولوجيا والثقافة والشؤون الدولية بتركيز على الدقة والسياق والوضوح.",
      "يجمع محرّرونا بين التغطية الميدانية والتحليل المبني على البيانات والبحث المدعوم بالذكاء الاصطناعي، مع إبقاء الحكم البشري في صميم كل قصة.",
      "دليل منصة مستقلة، منحازة للقارئ، وملتزمة بأخلاقيات المهنة.",
    ],
  },
  fr: {
    title: "À propos de Daleel Le Reporter",
    desc: "Daleel est une rédaction mondiale et multilingue qui propose un journalisme vérifié et équilibré en anglais, arabe et français.",
    body: [
      "Nous couvrons la politique, l'économie, le sport, la technologie, la culture et l'international avec rigueur, contexte et clarté.",
      "Notre rédaction associe le terrain, l'analyse de données et la recherche assistée par IA, tout en gardant le jugement humain au cœur de chaque récit.",
      "Daleel est indépendant, au service du lecteur, et engagé dans une éthique journalistique exigeante.",
    ],
  },
} as const;

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Daleel Reporter" },
      { name: "description", content: "About Daleel Reporter, a global multilingual newsroom in English, Arabic and French." },
      { property: "og:title", content: "About Daleel Reporter" },
      { property: "og:description", content: "Global multilingual newsroom in English, Arabic and French." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { lang } = useI18n();
  const c = copy[lang];
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <h1 className="mb-4 text-3xl md:text-4xl font-bold">{c.title}</h1>
      <p className="mb-6 text-lg text-muted-foreground">{c.desc}</p>
      <div className="space-y-4 text-base leading-relaxed">
        {c.body.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </main>
  );
}
