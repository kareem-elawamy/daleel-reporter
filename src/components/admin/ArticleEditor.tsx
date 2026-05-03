import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { Save, Send, ArrowLeft, CheckCircle2, XCircle, Archive, Undo2, Loader2 } from "lucide-react";
import { axiosClient } from "@/lib/api/axiosClient";

import { useRBAC, ROLES } from "@/lib/rbac";
import { useCreateArticleMutation, useUpdateArticleMutation } from "@/hooks/api/useArticleHooks";
import { useSectionsQuery } from "@/hooks/api/useSectionHooks";
import type { CreateArticleRequest } from "@/types/api";

export type ArticleStatus =
  | "Draft"
  | "Submitted"
  | "DeskReview"
  | "ManagingEditorReview"
  | "LanguageReview"
  | "ReadyToPublish"
  | "Published"
  | "Returned"
  | "Archived";

// Normalized lowercase alias used in UI comparisons
type StatusKey =
  | "draft"
  | "submitted"
  | "deskreview"
  | "managingeditorreview"
  | "languagereview"
  | "readytopublish"
  | "published"
  | "returned"
  | "archived";

function normalizeStatus(s: string): StatusKey {
  return s.toLowerCase().replace(/_/g, "") as StatusKey;
}

export interface ArticleDraft {
  id?: string;
  slug: string;
  sectionId: string;
  status: string;
  titleEn: string;
  titleAr: string;
  titleFr: string;
  summaryEn: string;
  summaryAr: string;
  summaryFr: string;
  bodyEn: string;
  bodyAr: string;
  bodyFr: string;
  coverImageUrl: string;
  tags: string[];
  reviewNotes?: string | null;
}

const blank: ArticleDraft = {
  slug: "",
  sectionId: "",
  status: "Draft",
  titleEn: "", titleAr: "", titleFr: "",
  summaryEn: "", summaryAr: "", summaryFr: "",
  bodyEn: "", bodyAr: "", bodyFr: "",
  coverImageUrl: "",
  tags: [],
  reviewNotes: "",
};


const TAB_LANGS: Array<{ key: "En" | "Ar" | "Fr"; label: string; dir: "ltr" | "rtl" }> = [
  { key: "En", label: "English", dir: "ltr" },
  { key: "Ar", label: "العربية", dir: "rtl" },
  { key: "Fr", label: "Français", dir: "ltr" },
];

const STATUS_STYLES: Record<string, string> = {
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

// Maps a target status to the correct dedicated backend endpoint action
const STATUS_TO_ENDPOINT: Record<string, string> = {
  submitted: "submit",
  deskreview: "desk-review",
  managingeditorreview: "me-review",
  languagereview: "language-review",
  readytopublish: "ready",
  published: "publish",
  returned: "return",
  draft: "unpublish",   // for unpublish action
  archived: "archive",
};

interface Props {
  initial?: Partial<ArticleDraft>;
  isNew?: boolean;
}

export function ArticleEditor({ initial, isNew }: Props) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<ArticleDraft>({ ...blank, ...initial });
  const [tagInput, setTagInput] = useState((initial?.tags ?? []).join(", "));
  const [activeLang, setActiveLang] = useState<"En" | "Ar" | "Fr">("En");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);


  const { hasRole, hasAnyRole } = useRBAC();

  const { data: sectionsData } = useSectionsQuery();

  const fallbackSections = [
    { id: "11111111-1111-1111-1111-111111111111", name: { en: "Politics", ar: "سياسة", fr: "Politique" }, isActive: true, sortOrder: 1 },
    { id: "22222222-2222-2222-2222-222222222222", name: { en: "Business", ar: "أعمال", fr: "Affaires" }, isActive: true, sortOrder: 2 },
    { id: "33333333-3333-3333-3333-333333333333", name: { en: "Sports", ar: "رياضة", fr: "Sports" }, isActive: true, sortOrder: 3 },
    { id: "44444444-4444-4444-4444-444444444444", name: { en: "Tech", ar: "تكنولوجيا", fr: "Technologie" }, isActive: true, sortOrder: 4 },
    { id: "55555555-5555-5555-5555-555555555555", name: { en: "Culture", ar: "ثقافة", fr: "Culture" }, isActive: true, sortOrder: 5 },
    { id: "66666666-6666-6666-6666-666666666666", name: { en: "World", ar: "عالم", fr: "Monde" }, isActive: true, sortOrder: 6 },
  ];

  const activeSections = (sectionsData && sectionsData.length > 0)
    ? sectionsData.filter(s => s.isActive).sort((a, b) => a.sortOrder - b.sortOrder)
    : fallbackSections;

  const createMutation = useCreateArticleMutation();
  const updateMutation = useUpdateArticleMutation();
  
  const isPending = saving || createMutation.isPending || updateMutation.isPending;

  const set = <K extends keyof ArticleDraft>(k: K, v: ArticleDraft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const slugify = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

  const buildContentPayload = (): CreateArticleRequest => {
    const slug = (draft.slug || slugify(draft.titleEn || draft.titleAr || draft.titleFr));
    const tags = tagInput.split(",").map((t) => t.trim()).filter(Boolean);
    return {
      slug,
      sectionId: draft.sectionId,
      title: {
        en: draft.titleEn || "",
        ar: draft.titleAr || "",
        fr: draft.titleFr || ""
      },
      subHeadline: { en: "", ar: "", fr: "" },
      summary: {
        en: draft.summaryEn || "",
        ar: draft.summaryAr || "",
        fr: draft.summaryFr || ""
      },
      body: {
        en: draft.bodyEn || "",
        ar: draft.bodyAr || "",
        fr: draft.bodyFr || ""
      },
      seoTitle: { en: "", ar: "", fr: "" },
      seoDescription: { en: "", ar: "", fr: "" },
      coverImageUrl: draft.coverImageUrl || "",
      tags,
      isBreakingNews: false,
    };
  };

  /** Save content fields only (no status change). */
  const saveArticle = (e?: FormEvent) => {
    e?.preventDefault();
    setError(null);
    setInfo(null);

    const payload = buildContentPayload();
    if (!payload.title.en && !payload.title.ar) { setError("Title is required"); return; }

    if (isNew || !draft.id) {
      createMutation.mutate(payload, {
        onSuccess: (data) => {
          navigate({ to: "/admin/articles/$id", params: { id: data.id } });
        },
        onError: (err: any) => {
          setError(err.response?.data?.error || err.message || "Failed to create article.");
        }
      });
    } else {
      updateMutation.mutate({ id: draft.id, data: payload }, {
        onSuccess: () => {
          setInfo("Draft saved successfully.");
        },
        onError: (err: any) => {
          setError(err.response?.data?.error || err.message || "Failed to update article.");
        }
      });
    }
  };

  /** Perform a workflow status transition via the dedicated endpoint. */
  const doWorkflowTransition = async (toStatus: string, note?: string) => {
    if (!draft.id) {
      setError("Save the article first before changing its status.");
      return;
    }
    setError(null);
    setInfo(null);
    setSaving(true);

    const key = normalizeStatus(toStatus);
    const action = STATUS_TO_ENDPOINT[key];
    if (!action) { setSaving(false); setError(`Unknown transition target: ${toStatus}`); return; }

    try {
      await axiosClient.post(`/articles/${draft.id}/${action}`, { note: note ?? null });
      setSaving(false);
      setDraft((d) => ({ ...d, status: toStatus }));
      setInfo(workflowMessage(key));
    } catch (err: any) {
      setSaving(false);
      setError(err?.response?.data?.error || err.message || "Workflow transition failed");
    }
  };

  const workflowMessage = (key: string) => {
    const map: Record<string, string> = {
      submitted: "Submitted to section head for review.",
      deskreview: "Approved to desk review.",
      managingeditorreview: "Approved to managing editor.",
      languagereview: "Approved for language translation/review.",
      readytopublish: "Approved and marked ready for publishing.",
      published: "Article published live.",
      archived: "Article archived.",
      returned: "Article returned for rework.",
      draft: "Article unpublished.",
    };
    return map[key] || "Status updated.";
  };

  const returnToReporter = () => {
    const note = window.prompt("Reason for return (will be saved as review notes):", draft.reviewNotes ?? "");
    if (note === null) return;
    setDraft((d) => ({ ...d, reviewNotes: note }));
    doWorkflowTransition("Returned", note);
  };

  const archive = () => {
    if (!confirm("Archive this article? It will no longer be public.")) return;
    doWorkflowTransition("Archived");
  };

  const unpublish = () => {
    if (!confirm("Unpublish and move back to draft?")) return;
    doWorkflowTransition("Draft");
  };

  const status = normalizeStatus(draft.status || "Draft");

  const canSave = hasAnyRole([ROLES.SystemAdmin, ROLES.ManagingEditor]) ||
    status === "draft" || status === "returned" ||
    (status === "languagereview" && hasRole(ROLES.LanguageReviewer)) ||
    (status === "deskreview" && hasRole(ROLES.DeskEditor));

  const isGlobalAdmin = hasAnyRole([ROLES.SystemAdmin, ROLES.ManagingEditor]);

  return (
    <form onSubmit={saveArticle} className="animate-fade-up">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/articles" className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent" aria-label="back">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {isNew ? "New article" : "Edit article"}
            </h1>
            <p className="text-xs text-muted-foreground inline-flex items-center gap-2">
              Status:
              <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${STATUS_STYLES[status] ?? "bg-muted"}`}>
                {status.replace(/([A-Z])/g, " $1").trim()}
              </span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">

          {canSave && (
            <button type="submit" disabled={isPending} className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-accent disabled:opacity-50 min-w-[90px] justify-center">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
            </button>
          )}

          {/* Reporter: Submit */}
          {(hasRole(ROLES.Reporter) || isGlobalAdmin) && (status === "draft" || status === "returned") && (
            <button type="button" onClick={() => doWorkflowTransition("Submitted")} disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-500 px-4 py-2 text-sm font-bold text-white hover:bg-blue-600 disabled:opacity-50">
              <Send className="h-4 w-4" /> Submit to Section
            </button>
          )}

          {/* Section Head: Approve or Return */}
          {(hasRole(ROLES.SectionHead) || isGlobalAdmin) && status === "submitted" && (
            <>
              <button type="button" onClick={returnToReporter} disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-md border border-destructive/40 px-4 py-2 text-sm font-bold text-destructive hover:bg-destructive/10 disabled:opacity-50">
                <XCircle className="h-4 w-4" /> Return to Reporter
              </button>
              <button type="button" onClick={() => doWorkflowTransition("DeskReview")} disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-50">
                <CheckCircle2 className="h-4 w-4" /> Approve to Desk
              </button>
            </>
          )}

          {/* Desk Editor: Approve or Return */}
          {(hasRole(ROLES.DeskEditor) || isGlobalAdmin) && status === "deskreview" && (
            <>
              <button type="button" onClick={returnToReporter} disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-md border border-destructive/40 px-4 py-2 text-sm font-bold text-destructive hover:bg-destructive/10 disabled:opacity-50">
                <XCircle className="h-4 w-4" /> Return
              </button>
              <button type="button" onClick={() => doWorkflowTransition("ManagingEditorReview")} disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-50">
                <CheckCircle2 className="h-4 w-4" /> Approve to Managing
              </button>
            </>
          )}

          {/* Managing Editor: Approve or Return */}
          {(hasRole(ROLES.ManagingEditor) || hasRole(ROLES.SystemAdmin)) && status === "managingeditorreview" && (
            <>
              <button type="button" onClick={returnToReporter} disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-md border border-destructive/40 px-4 py-2 text-sm font-bold text-destructive hover:bg-destructive/10 disabled:opacity-50">
                <XCircle className="h-4 w-4" /> Return
              </button>
              <button type="button" onClick={() => doWorkflowTransition("LanguageReview")} disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-50">
                <CheckCircle2 className="h-4 w-4" /> Approve to Language
              </button>
            </>
          )}

          {/* Language Reviewer: Approve or Return */}
          {(hasRole(ROLES.LanguageReviewer) || isGlobalAdmin) && status === "languagereview" && (
            <>
              <button type="button" onClick={returnToReporter} disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-md border border-destructive/40 px-4 py-2 text-sm font-bold text-destructive hover:bg-destructive/10 disabled:opacity-50">
                <XCircle className="h-4 w-4" /> Return
              </button>
              <button type="button" onClick={() => doWorkflowTransition("ReadyToPublish")} disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-50">
                <CheckCircle2 className="h-4 w-4" /> Ready to Publish
              </button>
            </>
          )}

          {/* Publisher: Publish */}
          {(hasRole(ROLES.Publisher) || isGlobalAdmin) && status === "readytopublish" && (
            <button type="button" onClick={() => doWorkflowTransition("Published")} disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50">
              <Send className="h-4 w-4" /> Publish Now
            </button>
          )}

          {/* Fast-Lane Publish for Global Admins */}
          {isGlobalAdmin && ["draft", "submitted", "deskreview", "managingeditorreview", "languagereview", "returned"].includes(status) && (
            <button type="button" onClick={() => doWorkflowTransition("Published")} disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary/20 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/30 disabled:opacity-50 ml-4 border border-primary/30">
              <Send className="h-4 w-4" /> Force Publish
            </button>
          )}

          {/* Published Controls */}
          {isGlobalAdmin && status === "published" && (
            <>
              <button type="button" onClick={unpublish} disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-accent disabled:opacity-50">
                <Undo2 className="h-4 w-4" /> Unpublish
              </button>
              <button type="button" onClick={archive} disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent disabled:opacity-50">
                <Archive className="h-4 w-4" /> Archive
              </button>
            </>
          )}

          {/* Restore archived */}
          {isGlobalAdmin && status === "archived" && (
            <button type="button" onClick={() => doWorkflowTransition("Draft")} disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-accent disabled:opacity-50">
              <Undo2 className="h-4 w-4" /> Restore to draft
            </button>
          )}
        </div>
      </header>

      {error && <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
      {info && <div className="mb-4 rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-600">{info}</div>}

      {draft.reviewNotes && (status === "draft" || status === "returned" || status === "submitted") && (
        <div className="mb-4 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">Review notes</div>
          <p className="text-foreground/90 whitespace-pre-wrap">{draft.reviewNotes}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[1fr_280px]">
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-1">
            <div className="flex border-b border-border">
              {TAB_LANGS.map((l) => (
                <button
                  key={l.key}
                  type="button"
                  onClick={() => setActiveLang(l.key)}
                  className={`flex-1 px-4 py-2 text-sm font-bold transition-colors ${
                    activeLang === l.key ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            {TAB_LANGS.map((l) => (
              <div key={l.key} dir={l.dir} className={`p-5 space-y-4 ${activeLang === l.key ? "" : "hidden"}`}>
                <Field label="Title">
                  <input
                    value={draft[`title${l.key}` as keyof ArticleDraft] as string}
                    onChange={(e) => set(`title${l.key}` as any, e.target.value as any)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-lg font-bold outline-none focus:border-primary"
                    placeholder={`Headline (${l.label})`}
                    disabled={!canSave}
                  />
                </Field>
                <Field label="Summary">
                  <textarea
                    rows={2}
                    value={draft[`summary${l.key}` as keyof ArticleDraft] as string}
                    onChange={(e) => set(`summary${l.key}` as any, e.target.value as any)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-primary"
                    disabled={!canSave}
                  />
                </Field>
                <Field label="Body">
                  <textarea
                    rows={14}
                    value={draft[`body${l.key}` as keyof ArticleDraft] as string}
                    onChange={(e) => set(`body${l.key}` as any, e.target.value as any)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-primary"
                    placeholder="Full article body…"
                    disabled={!canSave}
                  />
                </Field>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <Field label="Slug">
              <input
                value={draft.slug}
                onChange={(e) => set("slug", slugify(e.target.value))}
                placeholder="auto-from-title"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                disabled={!canSave}
              />
            </Field>
            <Field label="Section">
              <select
                value={draft.sectionId}
                onChange={(e) => set("sectionId", e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                disabled={!canSave}
              >
                <option value="" disabled>Select section...</option>
                {activeSections.map((s: any) => <option key={s.id} value={s.id}>{s.name["en"]}</option>)}
              </select>
            </Field>
            <Field label="Cover image URL">
              <input
                value={draft.coverImageUrl}
                onChange={(e) => set("coverImageUrl", e.target.value)}
                placeholder="https://…"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                disabled={!canSave}
              />
            </Field>
            {draft.coverImageUrl && (
              <img src={draft.coverImageUrl} alt="" className="w-full rounded-md object-cover aspect-video" />
            )}
            <Field label="Tags (comma separated)">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                disabled={!canSave}
              />
            </Field>
          </div>

          {(hasAnyRole([ROLES.SystemAdmin, ROLES.SectionHead, ROLES.DeskEditor, ROLES.ManagingEditor, ROLES.LanguageReviewer])) && (
            <div className="rounded-xl border border-border bg-card p-4">
              <Field label="Internal review notes (admin)">
                <textarea
                  rows={4}
                  value={draft.reviewNotes ?? ""}
                  onChange={(e) => set("reviewNotes", e.target.value)}
                  placeholder="Feedback for the editor…"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </Field>
            </div>
          )}
        </aside>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
