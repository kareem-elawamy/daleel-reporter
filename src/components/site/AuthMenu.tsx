import { Link } from "@tanstack/react-router";
import { LogOut, LogIn, Bookmark, Shield, User } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useMeQuery } from "@/hooks/api/useUserHooks";
import { useLogoutMutation } from "@/hooks/api/useAuthHooks";
import { useRBAC } from "@/lib/rbac";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function AuthMenu() {
  const { data: user, isLoading } = useMeQuery();
  const { canAccessDashboard } = useRBAC();
  const logoutMutation = useLogoutMutation();
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="h-9 w-9 rounded-full bg-accent animate-pulse" />
    );
  }

  if (!user) {
    return (
      <Link
        to="/login"
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-semibold hover:border-primary/50 transition-colors"
      >
        <LogIn className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{t("auth.signIn")}</span>
      </Link>
    );
  }

  const initial = (user.displayName || user.email || "?").slice(0, 1).toUpperCase();

  const go = (path: string) => {
    window.location.href = path;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={t("auth.account")}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full gradient-brand text-xs font-bold text-primary-foreground shadow-card hover:scale-105 transition-transform"
        >
          {initial}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="text-xs text-muted-foreground">{t("auth.account")}</div>
          <div className="truncate text-sm font-semibold">{user.displayName || user.email}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => go("/bookmarks")}>
          <Bookmark className="h-4 w-4" />
          {t("bookmarks.title")}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => go("/admin/profile")}>
          <User className="h-4 w-4" />
          Profile Settings
        </DropdownMenuItem>
        {canAccessDashboard() && (
          <DropdownMenuItem onSelect={() => go("/admin")}>
            <Shield className="h-4 w-4" />
            Admin Dashboard
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => { logoutMutation.mutate(); go("/"); }}>
          <LogOut className="h-4 w-4" />
          {t("auth.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
