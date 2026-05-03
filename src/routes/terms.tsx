import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

const copy = {
  en: {
    title: "Terms of Use",
    updated: "Last updated: April 2026",
    sections: [
      { h: "Acceptance", p: "By using Daleel Reporter you agree to these terms. If you don't agree, please don't use the service." },
      { h: "Content & copyright", p: "Articles, images, video and audio are owned by Daleel or its licensors. You may share short excerpts with attribution and a link back." },
      { h: "User conduct", p: "Don't misuse the service, attempt to disrupt it, or use it for unlawful purposes. The AI assistant is for informational use; verify important facts independently." },
      { h: "Disclaimer", p: "The platform is provided 'as is' without warranties. Daleel is not liable for decisions made based on its content." },
    ],
  },
  ar: {
    title: "شروط الاستخدام",
    updated: "آخر تحديث: أبريل 2026",
    sections: [
      { h: "القبول", p: "باستخدامك دليل الإخبارية فإنك توافق على هذه الشروط. إن لم توافق، يرجى عدم استخدام الخدمة." },
      { h: "المحتوى وحقوق النشر", p: "المقالات والصور والفيديو والصوت ملك لدليل أو المرخّصين. يمكنك مشاركة مقتطفات قصيرة مع الإسناد ورابط للمصدر." },
      { h: "سلوك المستخدم", p: "يُمنع إساءة استخدام الخدمة أو تعطيلها أو استخدامها لأغراض غير قانونية. المساعد الذكي للمعلومات؛ تحقّق من الحقائق المهمة بنفسك." },
      { h: "إخلاء المسؤولية", p: "تُقدَّم المنصة 'كما هي' دون ضمانات. لا تتحمّل دليل المسؤولية عن قرارات مبنية على محتواها." },
    ],
  },
  fr: {
    title: "Conditions d'utilisation",
    updated: "Dernière mise à jour : avril 2026",
    sections: [
      { h: "Acceptation", p: "L'utilisation de Daleel Reporter vaut acceptation de ces conditions." },
      { h: "Contenu & droits", p: "Articles, images, vidéos et audios appartiennent à Daleel ou à ses ayants droit. Vous pouvez partager de courts extraits avec attribution et lien." },
      { h: "Conduite", p: "Pas d'usage abusif, perturbateur ou illégal. L'assistant IA est informatif ; vérifiez les faits importants." },
      { h: "Avertissement", p: "Service fourni 'en l'état' sans garanties. Daleel n'est pas responsable des décisions prises sur la base de son contenu." },
    ],
  },
} as const;

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms — Daleel Reporter" },
      { name: "description", content: "Terms of use for Daleel Reporter." },
      { property: "og:title", content: "Terms of Use — Daleel Reporter" },
      { property: "og:description", content: "Terms of use for Daleel Reporter." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const { lang } = useI18n();
  const c = copy[lang];
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <h1 className="mb-2 text-3xl md:text-4xl font-bold">{c.title}</h1>
      <p className="mb-8 text-sm text-muted-foreground">{c.updated}</p>
      <div className="space-y-6">
        {c.sections.map((s, i) => (
          <section key={i}>
            <h2 className="mb-2 text-xl font-bold">{s.h}</h2>
            <p className="text-base leading-relaxed text-muted-foreground">{s.p}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
