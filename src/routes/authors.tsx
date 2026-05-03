import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { apiClient } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n";
import { articles as mock } from "@/lib/mock-data";

export const Route = createFileRoute("/authors")({
  head: () => ({
    meta: [
      { title: "Our Journalists — Daleel Reporter" },
      { name: "description", content: "Meet the editors and correspondents behind Daleel Reporter." },
      { property: "og:title", content: "Our Journalists — Daleel Reporter" },
      { property: "og:description", content: "Meet the editors and correspondents behind Daleel Reporter." },
    ],
  }),
  component: AuthorsPage,
});

interface Profile {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
}

function AuthorsPage() {
  const { t } = useI18n();
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    apiClient<Profile[]>("/profiles")
      .then((data) => setProfiles(data ?? []))
      .catch(() => setProfiles([]));
  }, []);

  // Combine DB profiles with mock authors as fallback gallery
  const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, "-");
  const mockAuthors = Array.from(new Map(mock.map((a) => [a.author.name.en, a.author])).values());

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-12 md:px-6 animate-fade-up">
        <header className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-flame">{t("authors.kicker")}</p>
          <h1 className="mt-2 text-4xl md:text-5xl font-extrabold tracking-tight">{t("authors.title")}</h1>
          <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">{t("authors.intro")}</p>
        </header>

        {profiles.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">{t("authors.contributors")}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {profiles.map((p) => (
                <article key={p.id} className="rounded-xl border border-border bg-card p-5 hover:shadow-elegant transition-shadow">
                  <div className="flex items-center gap-4">
                    {p.avatarUrl ? (
                      <img src={p.avatarUrl} alt="" className="h-14 w-14 rounded-full object-cover" />
                    ) : (
                      <div className="h-14 w-14 rounded-full gradient-brand text-primary-foreground inline-flex items-center justify-center font-bold">
                        {(p.displayName ?? "?").slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold">{p.displayName ?? "Anonymous"}</h3>
                      {p.bio && <p className="text-xs text-muted-foreground line-clamp-2">{p.bio}</p>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">{t("authors.editorial")}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {mockAuthors.map((a) => (
              <Link
                key={a.name.en}
                to="/author/$slug"
                params={{ slug: slugify(a.name.en) }}
                className="group rounded-xl border border-border bg-card p-5 text-center hover:shadow-elegant transition-shadow"
              >
                <img src={a.avatar} alt="" className="mx-auto mb-3 h-20 w-20 rounded-full object-cover" />
                <h3 className="font-bold group-hover:text-primary transition-colors">{a.name.en}</h3>
                <p className="mt-1 text-xs text-muted-foreground">Senior correspondent</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
