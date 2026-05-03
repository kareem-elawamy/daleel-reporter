import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bookmark, Trash2 } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { apiClient, getAuthToken } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/bookmarks")({
  head: () => ({
    meta: [
      { title: "My Bookmarks — Daleel Reporter" },
      { name: "description", content: "Articles you've saved on Daleel Reporter." },
      { name: "robots", content: "noindex" },
    ],
  }),
  beforeLoad: async () => {
    const token = getAuthToken();
    if (!token) throw redirect({ to: "/login" });
  },
  component: BookmarksPage,
});

interface Row {
  id: string;
  articleId: string;
  createdAt: string;
  titleEn?: string;
  titleAr?: string;
  coverImageUrl?: string;
}

function BookmarksPage() {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    apiClient<Row[]>("/bookmarks")
      .then((data) => {
        setRows(data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  const remove = async (articleId: string) => {
    await apiClient(`/bookmarks/${articleId}`, { method: "DELETE" });
    setRows((r) => r.filter((x) => x.articleId !== articleId));
  };

  const getTitle = (row: Row) => {
    if (lang === "ar" && row.titleAr) return row.titleAr;
    return row.titleEn || row.titleAr || `Article #${row.articleId.slice(0, 8)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-12 md:px-6 animate-fade-up">
        <div className="mb-8 flex items-center gap-3">
          <Bookmark className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-extrabold tracking-tight">{t("bookmarks.title")}</h1>
        </div>

        {loading ? (
          <p className="text-muted-foreground">…</p>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">{t("bookmarks.empty")}</p>
            <Link to="/" className="mt-3 inline-block text-primary font-semibold hover:underline">← {t("nav.home")}</Link>
          </div>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border bg-card">
            {rows.map((row) => (
              <li key={row.id} className="flex items-center gap-4 p-4">
                {row.coverImageUrl && (
                  <img src={row.coverImageUrl} alt="" className="h-16 w-24 rounded object-cover flex-shrink-0" />
                )}
                <span className="flex-1 font-semibold">{getTitle(row)}</span>
                <button onClick={() => remove(row.articleId)} aria-label="remove" className="text-muted-foreground hover:text-destructive flex-shrink-0">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
}
