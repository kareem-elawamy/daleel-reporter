import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { sections, type Article } from "@/lib/mock-data";
import { ClientDate } from "./ClientDate";

interface NewsCardProps {
  article: Article;
  variant?: "default" | "compact" | "horizontal";
}

export function NewsCard({ article, variant = "default" }: NewsCardProps) {
  const { lang, t } = useI18n();
  const sectionLabel = sections[article.section][lang];

  if (variant === "compact") {
    return (
      <Link
        to="/article/$slug"
        params={{ slug: article.slug }}
        className="group block"
      >
        <div className="img-zoom mb-2 aspect-video overflow-hidden rounded-md bg-muted">
          <img src={article.image} alt="" loading="lazy" className="h-full w-full object-cover" />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-flame">{sectionLabel}</span>
        <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug group-hover:text-primary transition-colors">
          {article.title[lang]}
        </h3>
      </Link>
    );
  }

  if (variant === "horizontal") {
    return (
      <Link
        to="/article/$slug"
        params={{ slug: article.slug }}
        className="group flex gap-4 items-start"
      >
        <div className="img-zoom h-20 w-28 shrink-0 overflow-hidden rounded-md bg-muted">
          <img src={article.image} alt="" loading="lazy" className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-flame">{sectionLabel}</span>
          <h3 className="line-clamp-2 text-sm font-bold leading-snug group-hover:text-primary transition-colors">
            {article.title[lang]}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {article.readTime} {t("common.minRead")}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to="/article/$slug"
      params={{ slug: article.slug }}
      className="group card-lift block overflow-hidden rounded-lg border border-border bg-card shadow-card"
    >
      <div className="img-zoom aspect-[16/10] overflow-hidden bg-muted">
        <img src={article.image} alt="" loading="lazy" className="h-full w-full object-cover" />
      </div>
      <div className="p-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-flame">{sectionLabel}</span>
        <h3 className="mt-1.5 line-clamp-2 text-base md:text-lg font-bold leading-snug group-hover:text-primary transition-colors">
          {article.title[lang]}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{article.excerpt[lang]}</p>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <ClientDate iso={article.publishedAt} />
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {article.readTime} {t("common.minRead")}
          </span>
        </div>
      </div>
    </Link>
  );
}
