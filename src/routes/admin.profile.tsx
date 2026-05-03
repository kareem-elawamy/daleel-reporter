import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { Save, Loader2, CheckCircle } from "lucide-react";
import { useMeQuery, useUpdateProfileMutation } from "@/hooks/api/useUserHooks";

// @ts-ignore - Route tree may not be generated yet
export const Route = createFileRoute("/admin/profile")({
  component: ProfileSettings,
});

const LANG_OPTIONS = [
  { value: "en", label: "English" },
  { value: "ar", label: "العربية" },
  { value: "fr", label: "Français" },
];

function ProfileSettings() {
  const { data: user, isLoading } = useMeQuery();
  const updateMutation = useUpdateProfileMutation();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [preferredLang, setPreferredLang] = useState("en");
  const [success, setSuccess] = useState(false);

  // Prepopulate form when user data loads
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setBio(user.bio || "");
      setAvatarUrl(user.avatarUrl || "");
      setPreferredLang(user.preferredLang || "en");
    }
  }, [user]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    updateMutation.mutate(
      { displayName, bio, avatarUrl, preferredLang },
      {
        onSuccess: () => {
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="animate-fade-up">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">Profile Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account details.</p>
        </header>
        <div className="rounded-xl border border-border bg-card p-8 animate-pulse space-y-6">
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="h-10 w-full bg-muted rounded-md" />
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-10 w-full bg-muted rounded-md" />
          <div className="h-4 w-20 bg-muted rounded" />
          <div className="h-24 w-full bg-muted rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Profile Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account details.</p>
      </header>

      {success && (
        <div className="mb-4 rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-600 inline-flex items-center gap-2">
          <CheckCircle className="h-4 w-4" /> Profile updated successfully!
        </div>
      )}

      {updateMutation.isError && (
        <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {(updateMutation.error as any)?.response?.data?.error || updateMutation.error.message || "Failed to update profile."}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          {/* Email (read-only) */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
            />
          </div>

          {/* Display Name */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your public name"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          {/* Avatar URL */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Avatar URL</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            {avatarUrl && (
              <img src={avatarUrl} alt="Avatar preview" className="mt-2 h-16 w-16 rounded-full object-cover border border-border" />
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Bio</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell readers about yourself..."
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          {/* Preferred Language */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Preferred Language</label>
            <select
              value={preferredLang}
              onChange={(e) => setPreferredLang(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {LANG_OPTIONS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          {/* Roles (read-only) */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Roles</label>
            <div className="flex flex-wrap gap-1.5">
              {user?.roles.map((role) => (
                <span key={role} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50 min-w-[140px] justify-center"
        >
          {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </button>
      </form>
    </div>
  );
}
