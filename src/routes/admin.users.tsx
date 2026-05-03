import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shield, ShieldCheck, UserCog, Loader2 } from "lucide-react";
import { axiosClient } from "@/lib/api/axiosClient";
import { useMeQuery } from "@/hooks/api/useUserHooks";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

type AppRole = "SystemAdmin" | "ManagingEditor" | "DeskEditor" | "Reporter" | "Reader" | "SectionHead" | "LanguageReviewer" | "Publisher" | "AdsAnalytics";
const ALL_ROLES: AppRole[] = ["SystemAdmin", "Publisher", "ManagingEditor", "SectionHead", "DeskEditor", "LanguageReviewer", "Reporter", "AdsAnalytics", "Reader"];

interface UserRow {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: string;
  roles: string[];
}

function AdminUsers() {
  const { data: meData } = useMeQuery();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const me = meData?.userId ?? null;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosClient.get<any[]>("/users");
      const data = res.data;
      // Backend returns { userId, email, displayName, createdAt, roles }
      // Map userId → id for consistent usage in the component
      const mapped = (data ?? []).map((r: any) => ({
        id: r.userId ?? r.id,
        email: r.email,
        displayName: r.displayName ?? null,
        createdAt: r.createdAt,
        roles: r.roles ?? [],
      }));
      setRows(mapped);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load users");
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggle = async (userId: string, role: string, has: boolean) => {
    setBusy(`${userId}:${role}`);
    setError(null);
    try {
      if (has) {
        await axiosClient.delete(`/users/${userId}/roles/${role}`);
      } else {
        await axiosClient.post(`/users/${userId}/roles`, { role });
      }
      setRows((prev) => prev.map((r) => r.id === userId
        ? { ...r, roles: has ? r.roles.filter((x) => x !== role) : [...r.roles, role].sort() }
        : r));
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to update role");
    }
    setBusy(null);
  };

  const filtered = rows.filter((r) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return r.email.toLowerCase().includes(q) || (r.displayName ?? "").toLowerCase().includes(q);
  });

  return (
    <div className="animate-fade-up">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Users & Roles</h1>
          <p className="text-sm text-muted-foreground">Grant or revoke admin, editor and reader roles.</p>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by email or name…"
          className="w-full max-w-xs rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </header>

      {error && <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground inline-flex w-full items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading users…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No users found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-start p-3">User</th>
                <th className="text-start p-3 hidden md:table-cell">Joined</th>
                <th className="text-start p-3">Roles</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-border align-top">
                  <td className="p-3">
                    <div className="font-semibold">{r.displayName || r.email.split("@")[0]}</div>
                    <div className="text-xs text-muted-foreground">{r.email}</div>
                    {r.id === me && <span className="mt-1 inline-block rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">You</span>}
                  </td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_ROLES.map((role) => {
                        const has = r.roles.includes(role);
                        const isSelfAdmin = r.id === me && role === "SystemAdmin";
                        const Icon = role === "SystemAdmin" ? ShieldCheck : 
                                     role === "AdsAnalytics" ? Shield :
                                     role === "Reader" ? Shield : UserCog;
                        const id = `${r.id}:${role}`;
                        return (
                          <button
                            key={role}
                            type="button"
                            disabled={busy === id || (has && isSelfAdmin)}
                            title={has && isSelfAdmin ? "You cannot remove your own admin role" : undefined}
                            onClick={() => toggle(r.id, role, has)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                              has
                                ? role === "SystemAdmin"
                                  ? "bg-flame text-white hover:bg-flame/90"
                                  : (role !== "Reader" && role !== "AdsAnalytics")
                                    ? "bg-primary text-primary-foreground hover:opacity-90"
                                    : "bg-muted text-foreground hover:bg-muted/80"
                                : "border border-dashed border-border text-muted-foreground hover:border-primary hover:text-foreground"
                            }`}
                          >
                            {busy === id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Icon className="h-3 w-3" />}
                            {role}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Click a role to toggle it. Admins can manage everything; editors can write and submit articles for review; readers can browse and bookmark.
      </p>
    </div>
  );
}
