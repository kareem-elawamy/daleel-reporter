import { createFileRoute } from "@tanstack/react-router";
import { FileText, Mail, Bookmark, Clock, Users, AlertCircle, CheckCircle, PenTool } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/axiosClient";
import { useRBAC, ROLES } from "@/lib/rbac";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

interface Stats {
  total: number;
  published: number;
  in_review: number;
  drafts: number;
  subscribers: number;
  
  // Role specific stats
  my_drafts: number;
  returned_to_me: number;
  awaiting_section: number;
  awaiting_desk: number;
  awaiting_language: number;
  ready_to_publish: number;
}

function StatCard({ label, value, icon: Icon, accent }: { label: string, value: number, icon: any, accent: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${accent}`} />
      </div>
      <div className="mt-2 text-3xl font-extrabold">{value}</div>
    </div>
  );
}

const fetchCount = async (url: string): Promise<number> => {
  try {
    const res = await axiosClient.get<{ total: number }>(url);
    return res.data.total ?? 0;
  } catch {
    return 0;
  }
};

function AdminDashboard() {
  const { hasRole, hasAnyRole } = useRBAC();

  const { data: stats } = useQuery({
    queryKey: ["admin", "dashboard-stats"],
    queryFn: async (): Promise<Stats> => {
      const [total, published, inReview, drafts, subs, myDr, myRet, secQ, deskQ, langQ, pubQ] = await Promise.all([
        fetchCount("/articles/admin?pageSize=1"),
        fetchCount("/articles/admin?status=Published&pageSize=1"),
        fetchCount("/articles/admin?status=Submitted&pageSize=1"),
        fetchCount("/articles/admin?status=Draft&pageSize=1"),
        fetchCount("/newsletter/subscribers?pageSize=1"),
        fetchCount("/articles/admin?status=Draft&pageSize=1"),
        fetchCount("/articles/admin?status=Returned&pageSize=1"),
        fetchCount("/articles/admin?status=Submitted&pageSize=1"),
        fetchCount("/articles/admin?status=DeskReview&pageSize=1"),
        fetchCount("/articles/admin?status=LanguageReview&pageSize=1"),
        fetchCount("/articles/admin?status=ReadyToPublish&pageSize=1"),
      ]);
      return {
        total,
        published,
        in_review: inReview,
        drafts,
        subscribers: subs,
        my_drafts: myDr,
        returned_to_me: myRet,
        awaiting_section: secQ,
        awaiting_desk: deskQ,
        awaiting_language: langQ,
        ready_to_publish: pubQ,
      };
    },
    staleTime: 60_000, // Cache for 1 minute, no infinite loops
  });

  const s: Stats = stats ?? {
    total: 0, published: 0, in_review: 0, drafts: 0, subscribers: 0,
    my_drafts: 0, returned_to_me: 0, awaiting_section: 0, awaiting_desk: 0, awaiting_language: 0, ready_to_publish: 0
  };

  return (
    <div className="animate-fade-up">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your newsroom tasks and performance.</p>
      </header>

      {/* Global Stats - Visible to Admins & Managing Editors */}
      {hasAnyRole([ROLES.SystemAdmin, ROLES.ManagingEditor]) && (
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Global Overview</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Total articles" value={s.total} icon={FileText} accent="text-primary" />
            <StatCard label="Published" value={s.published} icon={CheckCircle} accent="text-emerald-500" />
            <StatCard label="In review" value={s.in_review} icon={Clock} accent="text-amber-500" />
            <StatCard label="Drafts" value={s.drafts} icon={Bookmark} accent="text-flame" />
            <StatCard label="Subscribers" value={s.subscribers} icon={Mail} accent="text-blue-500" />
          </div>
        </div>
      )}

      {/* Role Specific Task Queues */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        
        {hasRole(ROLES.Reporter) && (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Reporter Dashboard</h2>
            <StatCard label="My Drafts" value={s.my_drafts} icon={FileText} accent="text-muted-foreground" />
            <StatCard label="Returned to me" value={s.returned_to_me} icon={AlertCircle} accent="text-destructive" />
          </div>
        )}

        {hasRole(ROLES.SectionHead) && (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Section Head</h2>
            <StatCard label="Awaiting Section Approval" value={s.awaiting_section} icon={Clock} accent="text-amber-500" />
          </div>
        )}

        {hasRole(ROLES.DeskEditor) && (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Desk Editor</h2>
            <StatCard label="Awaiting Desk Review" value={s.awaiting_desk} icon={Clock} accent="text-amber-500" />
          </div>
        )}

        {hasRole(ROLES.LanguageReviewer) && (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Language Reviewer</h2>
            <StatCard label="Awaiting Translation/Review" value={s.awaiting_language} icon={Clock} accent="text-amber-500" />
          </div>
        )}

        {hasRole(ROLES.Publisher) && (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Publisher</h2>
            <StatCard label="Ready to Publish" value={s.ready_to_publish} icon={CheckCircle} accent="text-emerald-500" />
          </div>
        )}

      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold mb-3">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          {hasRole(ROLES.Reporter) && (
            <a href="/admin/articles/new" className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
              <PenTool className="h-4 w-4" /> Write New Article
            </a>
          )}
          
          <a href="/admin/articles" className="inline-flex items-center rounded-md border border-border px-5 py-2.5 text-sm font-semibold hover:bg-accent transition-colors">
            Go to Articles
          </a>
          
          {hasRole(ROLES.SystemAdmin) && (
            <a href="/admin/users" className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-accent">
              <Users className="h-4 w-4" /> Manage Users
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
