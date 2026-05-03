import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

const copy = {
  en: {
    title: "Privacy Policy",
    updated: "Last updated: April 2026",
    sections: [
      { h: "What we collect", p: "We collect minimal data needed to operate the platform: language preference, device/browser info, and aggregated analytics. We do not sell personal data." },
      { h: "Cookies", p: "We use a small number of functional cookies (language, theme, voice mute) and privacy-respecting analytics." },
      { h: "AI assistant", p: "Messages sent to the assistant are processed by our AI provider to generate replies and are not used to train models." },
      { h: "Your rights", p: "You can request access, correction, or deletion of your data at privacy@daleel-reporter.com." },
    ],
  },
  ar: {
    title: "سياسة الخصوصية",
    updated: "آخر تحديث: أبريل 2026",
    sections: [
      { h: "ما الذي نجمعه", p: "نجمع الحد الأدنى من البيانات اللازمة لتشغيل المنصة: تفضيل اللغة، معلومات الجهاز/المتصفح، والتحليلات المجمّعة. لا نبيع البيانات الشخصية." },
      { h: "ملفات تعريف الارتباط", p: "نستخدم عددًا قليلاً من الكوكيز الوظيفية (اللغة، السمة، كتم الصوت) وتحليلات تحترم الخصوصية." },
      { h: "المساعد الذكي", p: "تُعالَج الرسائل المرسلة إلى المساعد بواسطة مزود الذكاء الاصطناعي لتوليد الردود فقط، ولا تُستخدم لتدريب النماذج." },
      { h: "حقوقك", p: "يمكنك طلب الوصول إلى بياناتك أو تصحيحها أو حذفها عبر privacy@daleel-reporter.com." },
    ],
  },
  fr: {
    title: "Politique de confidentialité",
    updated: "Dernière mise à jour : avril 2026",
    sections: [
      { h: "Ce que nous collectons", p: "Données minimales nécessaires au fonctionnement : langue, informations appareil/navigateur, analyses agrégées. Nous ne vendons aucune donnée personnelle." },
      { h: "Cookies", p: "Quelques cookies fonctionnels (langue, thème, sourdine voix) et des analyses respectueuses de la vie privée." },
      { h: "Assistant IA", p: "Les messages envoyés à l'assistant sont traités par notre fournisseur d'IA pour générer des réponses et ne servent pas à entraîner les modèles." },
      { h: "Vos droits", p: "Accès, rectification ou suppression : privacy@daleel-reporter.com." },
    ],
  },
} as const;

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — Daleel Reporter" },
      { name: "description", content: "How Daleel Reporter handles your data and privacy." },
      { property: "og:title", content: "Privacy Policy — Daleel Reporter" },
      { property: "og:description", content: "How Daleel Reporter handles your data and privacy." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
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
