import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { apiClient } from "@/lib/api-client";

interface Props {
  articleId: string;
  variant?: "icon" | "pill";
  className?: string;
}

export function BookmarkButton({ articleId, variant = "icon", className = "" }: Props) {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancel = false;
    if (!user) { setSaved(false); return; }
    // Fetch user bookmarks to see if this article is saved
    apiClient<{ articleId: string }[]>("/bookmarks")
      .then((data) => { 
        if (!cancel) setSaved((data ?? []).some(b => b.articleId === articleId)); 
      })
      .catch(() => {});
    return () => { cancel = true; };
  }, [user, articleId]);

  const toggle = async () => {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    setLoading(true);
    try {
      if (saved) {
        await apiClient(`/bookmarks/${articleId}`, { method: "DELETE" });
        setSaved(false);
      } else {
        await apiClient("/bookmarks", {
          method: "POST",
          body: JSON.stringify({ articleId }),
        });
        setSaved(true);
      }
    } catch (e) {
      console.error("Failed to toggle bookmark", e);
    }
    setLoading(false);
  };

  const Icon = saved ? BookmarkCheck : Bookmark;

  if (variant === "pill") {
    return (
      <button
        onClick={toggle}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:border-primary/50 transition-colors disabled:opacity-50 ${className}`}
      >
        <Icon className={`h-4 w-4 ${saved ? "text-primary fill-primary" : ""}`} />
        {saved ? t("bookmarks.saved") : t("bookmarks.save")}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={saved ? t("bookmarks.saved") : t("bookmarks.save")}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-primary transition-colors disabled:opacity-50 ${className}`}
    >
      <Icon className={`h-4 w-4 ${saved ? "text-primary fill-primary" : ""}`} />
    </button>
  );
}
