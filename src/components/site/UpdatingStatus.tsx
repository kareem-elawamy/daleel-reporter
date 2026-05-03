import { Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

/**
 * Tiny non-blocking status pill shown in a corner while data refreshes
 * in the background. Render conditionally on a `loading` flag.
 */
export function UpdatingStatus({ show, label }: { show: boolean; label?: string }) {
  const { lang } = useI18n();
  if (!show) return null;
  const text =
    label ??
    (lang === "ar" ? "جارٍ تحديث الأخبار…" : lang === "fr" ? "Mise à jour des actualités…" : "Updating news…");
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 start-4 z-40 inline-flex items-center gap-2 rounded-full border border-border bg-card/95 px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-card backdrop-blur animate-fade-up"
    >
      <Loader2 className="h-3.5 w-3.5 animate-spin text-flame" />
      <span>{text}</span>
    </div>
  );
}
