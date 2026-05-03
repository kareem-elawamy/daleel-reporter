import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { Mail, Phone, MapPin } from "lucide-react";

const copy = {
  en: { title: "Contact Us", intro: "Send tips, feedback, or partnership requests.", name: "Your name", email: "Email", message: "Message", send: "Send", office: "Newsroom" },
  ar: { title: "تواصل معنا", intro: "أرسل لنا الأخبار والملاحظات وطلبات الشراكة.", name: "الاسم", email: "البريد الإلكتروني", message: "الرسالة", send: "إرسال", office: "غرفة الأخبار" },
  fr: { title: "Nous contacter", intro: "Envoyez vos infos, retours ou demandes de partenariat.", name: "Nom", email: "E-mail", message: "Message", send: "Envoyer", office: "Rédaction" },
} as const;

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Daleel Reporter" },
      { name: "description", content: "Contact the Daleel Reporter newsroom." },
      { property: "og:title", content: "Contact Daleel Reporter" },
      { property: "og:description", content: "Reach the Daleel newsroom: tips, feedback, partnerships." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { lang } = useI18n();
  const c = copy[lang];
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <h1 className="mb-2 text-3xl md:text-4xl font-bold">{c.title}</h1>
      <p className="mb-8 text-lg text-muted-foreground">{c.intro}</p>
      <div className="grid gap-8 md:grid-cols-[1fr_320px]">
        <form
          onSubmit={(e) => { e.preventDefault(); alert(lang === "ar" ? "شكرًا، تم الاستلام." : lang === "fr" ? "Merci, reçu." : "Thanks, message received."); }}
          className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <input required maxLength={120} placeholder={c.name} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          <input required type="email" maxLength={255} placeholder={c.email} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          <textarea required maxLength={2000} rows={5} placeholder={c.message} className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          <button type="submit" className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-deep transition-colors">{c.send}</button>
        </form>
        <aside className="space-y-4 text-sm">
          <h2 className="text-base font-bold uppercase tracking-wide">{c.office}</h2>
          <div className="flex items-start gap-3"><Mail className="h-4 w-4 mt-0.5 text-primary" /><span>news@daleel-reporter.com</span></div>
          <div className="flex items-start gap-3"><Phone className="h-4 w-4 mt-0.5 text-primary" /><span>+971 4 000 0000</span></div>
          <div className="flex items-start gap-3"><MapPin className="h-4 w-4 mt-0.5 text-primary" /><span>Dubai · Cairo · Paris · London</span></div>
        </aside>
      </div>
    </main>
  );
}
