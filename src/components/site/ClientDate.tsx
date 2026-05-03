import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

const localeMap: Record<string, string> = { en: "en-US", ar: "ar", fr: "fr-FR" };

interface Props {
  iso: string;
  variant?: "short" | "long" | "time";
  className?: string;
}

/**
 * Locale-aware date that only renders on the client to avoid SSR/CSR
 * timezone & locale hydration mismatches.
 */
export function ClientDate({ iso, variant = "short", className }: Props) {
  const { lang } = useI18n();
  const [text, setText] = useState<string>("");

  useEffect(() => {
    const d = new Date(iso);
    const locale = localeMap[lang] ?? "en-US";
    const opts: Intl.DateTimeFormatOptions =
      variant === "long"
        ? { day: "numeric", month: "long", year: "numeric" }
        : variant === "time"
        ? { hour: "2-digit", minute: "2-digit" }
        : { month: "short", day: "numeric", year: "numeric" };
    setText(d.toLocaleDateString(locale, opts));
  }, [iso, lang, variant]);

  return (
    <span className={className} suppressHydrationWarning>
      {text || "\u00A0"}
    </span>
  );
}
