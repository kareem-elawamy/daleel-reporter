import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface SectionHeaderProps {
  title: string;
  href?: string;
  accent?: "primary" | "flame";
  children?: ReactNode;
}

export function SectionHeader({ title, href, accent = "primary", children }: SectionHeaderProps) {
  const { t } = useI18n();
  const bar = accent === "flame" ? "bg-flame" : "bg-primary";
  return (
    <div className="mb-5 flex items-end justify-between gap-4 border-b border-border pb-3">
      <div className="flex items-center gap-3">
        <span className={`block h-6 w-1.5 rounded-full ${bar}`} />
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">{title}</h2>
      </div>
      {children}
      {href && (
        <Link to={href} className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
          {t("common.viewAll")} <ArrowRight className="h-4 w-4 rtl-flip" />
        </Link>
      )}
    </div>
  );
}
