import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { Logo } from "@/components/site/Logo";
import { NewsletterForm } from "@/components/site/NewsletterForm";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-12 pb-24 md:pb-12 sm:grid-cols-2 md:grid-cols-4 md:px-6">
        <div className="sm:col-span-2">
          <Logo size="lg" className="mb-3" />
          <p className="mb-5 max-w-md text-sm text-muted-foreground">
            {t("brand.tag")} — {new Date().getFullYear()}
          </p>
          <NewsletterForm />
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wide">{t("footer.company")}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-primary">{t("footer.about")}</Link></li>
            <li><Link to="/authors" className="hover:text-primary">{t("authors.title")}</Link></li>
            <li><Link to="/contact" className="hover:text-primary">{t("footer.contact")}</Link></li>
            <li><Link to="/advertise" className="hover:text-primary">{t("footer.advertise")}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wide">{t("footer.legal")}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/privacy" className="hover:text-primary">{t("footer.privacy")}</Link></li>
            <li><Link to="/terms" className="hover:text-primary">{t("footer.terms")}</Link></li>
            <li><Link to="/bookmarks" className="hover:text-primary">{t("bookmarks.title")}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-4 text-xs text-muted-foreground md:px-6">
          © {new Date().getFullYear()} Daleel Reporter. {t("footer.rights")}.
        </div>
      </div>
    </footer>
  );
}
