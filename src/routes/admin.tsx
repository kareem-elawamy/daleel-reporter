import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, FileText, LogOut, Users, BarChart, User } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { apiClient, getAuthToken } from "@/lib/api-client";
import { ROLES, useRBAC } from "@/lib/rbac";
import { useLogoutMutation } from "@/hooks/api/useAuthHooks";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Daleel Reporter" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const token = getAuthToken();
    if (!token) throw redirect({ to: "/login" });
    try {
      const user = await apiClient<{ roles: string[] }>("/auth/me");
      const ok = user.roles && user.roles.some((r) =>
        ["SystemAdmin", "ManagingEditor", "DeskEditor", "Reporter", "Publisher", "SectionHead", "LanguageReviewer", "AdsAnalytics"].includes(r)
      );
      if (!ok) throw redirect({ to: "/" });
    } catch {
      throw redirect({ to: "/login" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { isAdmin, hasAnyRole, hasRole } = useRBAC();
  const logoutMutation = useLogoutMutation();

  const item = (to: string, label: string, Icon: typeof FileText) => (
    <a
      href={to}
      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${path === to || (to !== "/admin" && path.startsWith(to))
          ? "bg-primary text-primary-foreground"
          : "text-foreground hover:bg-accent"
        }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </a>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 grid gap-6 md:grid-cols-[220px_1fr]">
        <aside className="rounded-xl border border-border bg-card p-3 h-fit md:sticky md:top-24 flex flex-col gap-1">
          <div className="px-3 py-2 mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Admin Menu</div>

          {item("/admin", "Dashboard", LayoutDashboard)}

          {hasAnyRole(Object.values(ROLES).filter(r => r !== ROLES.AdsAnalytics && r !== ROLES.Reader)) && (
            item("/admin/articles", "Articles", FileText)
          )}

          {(isAdmin() || hasRole(ROLES.AdsAnalytics)) && (
            item("/admin/ads", "Ads & Analytics", BarChart)
          )}

          {isAdmin() && (
            item("/admin/users", "Users & Roles", Users)
          )}

          <div className="my-2 border-t border-border" />

          {item("/admin/profile", "My Profile", User)}

          <button
            onClick={() => { logoutMutation.mutate(); window.location.href = "/"; }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </aside>
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}

