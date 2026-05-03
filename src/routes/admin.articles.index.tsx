import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Edit3, Trash2, PenTool } from "lucide-react";
import { useAdminArticlesQuery, useDeleteArticleMutation } from "@/hooks/api/useArticleHooks";
import { useI18n, type Lang } from "@/lib/i18n";
import { useRBAC, ROLES } from "@/lib/rbac";

export const Route = createFileRoute("/admin/articles/")({
  component: AdminArticles,
});

import type { ArticleAdminDto } from "@/types/api";

const ALL_STATUSES = ["all", "my_queue", "draft", "submitted", "deskreview", "managingeditorreview", "languagereview", "readytopublish", "published", "returned", "archived"] as const;
type StatusFilter = typeof ALL_STATUSES[number];

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-blue-500/15 text-blue-600",
  deskreview: "bg-amber-500/15 text-amber-600",
  managingeditorreview: "bg-orange-500/15 text-orange-600",
  languagereview: "bg-indigo-500/15 text-indigo-600",
  readytopublish: "bg-fuchsia-500/15 text-fuchsia-600",
  published: "bg-emerald-500/15 text-emerald-600",
  returned: "bg-destructive/15 text-destructive",
  archived: "bg-zinc-500/15 text-zinc-500",
};

function friendlyStatus(s: string): string {
  const map: Record<string, string> = {
    draft: "Draft",
    submitted: "Submitted",
    deskreview: "Desk Review",
    managingeditorreview: "ME Review",
    languagereview: "Language Review",
    readytopublish: "Ready to Publish",
    published: "Published",
    returned: "Returned",
    archived: "Archived",
    my_queue: "My Queue",
    all: "All",
  };
  return map[s] ?? s;
}

function AdminArticles() {
  const { hasRole, hasAnyRole } = useRBAC();
  const { lang } = useI18n();
  
  // Set default tab based on role
  const defaultTab = hasRole(ROLES.SystemAdmin) ? "all" : "my_queue";
  const [filter, setFilter] = useState<StatusFilter>(defaultTab);

  const { data, isLoading: loading, isError } = useAdminArticlesQuery(1, 100);
  const deleteMutation = useDeleteArticleMutation();

  const rows: ArticleAdminDto[] = data?.items || [];

  const remove = (id: string) => {
    if (!confirm("Delete this article?")) return;
    deleteMutation.mutate(id);
  };

  const myQueueStatuses = useMemo(() => {
    const s: string[] = [];
    if (hasRole(ROLES.Reporter)) s.push("draft", "returned");
    if (hasRole(ROLES.SectionHead)) s.push("submitted");
    if (hasRole(ROLES.DeskEditor)) s.push("deskreview");
    if (hasRole(ROLES.LanguageReviewer)) s.push("languagereview");
    if (hasRole(ROLES.ManagingEditor)) s.push("managingeditorreview", "submitted", "deskreview", "languagereview");
    if (hasRole(ROLES.Publisher)) s.push("readytopublish");
    return s;
  }, [hasRole]);

  const filtered = useMemo(() => {
    if (filter === "all") return rows;
    if (filter === "my_queue") return rows.filter(r => myQueueStatuses.includes(r.status.toLowerCase()));
    return rows.filter((r) => r.status.toLowerCase() === filter);
  }, [rows, filter, myQueueStatuses]);

  // Determine which tabs to show to avoid clutter
  const visibleTabs = useMemo(() => {
    let tabs: string[] = ["my_queue"];
    if (hasAnyRole([ROLES.SystemAdmin, ROLES.ManagingEditor])) {
      tabs = ["all", "my_queue", "draft", "submitted", "deskreview", "managingeditorreview", "languagereview", "readytopublish", "published", "returned", "archived"];
    } else {
      tabs.push("published");
      if (hasRole(ROLES.Reporter)) tabs.push("draft", "returned");
      if (hasRole(ROLES.SectionHead)) tabs.push("submitted");
      if (hasRole(ROLES.DeskEditor)) tabs.push("deskreview");
      if (hasRole(ROLES.LanguageReviewer)) tabs.push("languagereview");
      if (hasRole(ROLES.Publisher)) tabs.push("readytopublish");
    }
    return tabs as StatusFilter[];
  }, [hasAnyRole, hasRole]);

  return (
    <div className="animate-fade-up">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Articles</h1>
          <p className="text-sm text-muted-foreground">Manage your editorial queue.</p>
        </div>
        {hasAnyRole([ROLES.Reporter, ROLES.SystemAdmin, ROLES.ManagingEditor]) && (
          <a href="/admin/articles/new" className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
            <PenTool className="h-4 w-4" /> Write Article
          </a>
        )}
      </header>

      <div className="mb-4 flex flex-wrap gap-2">
        {visibleTabs.map((s) => {
          const active = filter === s;
          const count = s === "all" ? rows.length : (s === "my_queue" ? rows.filter(r => myQueueStatuses.includes(r.status.toLowerCase())).length : rows.filter((r) => r.status.toLowerCase() === s).length);
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors ${
                active ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:bg-accent"
              }`}
            >
              {friendlyStatus(s)} <span className="opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">Loading articles...</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500 font-medium">Failed to load articles.</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No articles in this view.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-start p-3">Title</th>
                <th className="text-start p-3 hidden md:table-cell">Author</th>
                <th className="text-start p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-accent/30">
                  <td className="p-3 font-semibold">{r.title[lang as Lang] || r.title["en"] || <span className="italic text-muted-foreground">Untitled</span>}</td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground">{r.authorName || <span className="italic">Unknown</span>}</td>
                  <td className="p-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${STATUS_BADGE[r.status.toLowerCase()] ?? "bg-muted text-muted-foreground"}`}>
                      {friendlyStatus(r.status.toLowerCase())}
                    </span>
                  </td>
                  <td className="p-3 text-end">
                    <div className="inline-flex gap-1">
                      <Link to="/admin/articles/$id" params={{ id: r.id }} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent" aria-label="edit/review">
                        <Edit3 className="h-4 w-4" />
                      </Link>
                      {hasRole(ROLES.SystemAdmin) && (
                        <button 
                          onClick={() => remove(r.id)} 
                          disabled={deleteMutation.isPending}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50" 
                          aria-label="delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

