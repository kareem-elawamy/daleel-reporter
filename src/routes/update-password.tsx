import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { AuthLayout, AuthInput, AuthButton, FieldError } from "@/components/site/AuthLayout";

export const Route = createFileRoute("/update-password")({
  head: () => ({ meta: [{ title: "Update password — Daleel Reporter" }] }),
  component: UpdatePasswordPage,
});

function UpdatePasswordPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [ready, setReady] = useState(true); // always ready, we parse token on submit
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError(t("auth.passwordTooShort"));
    if (password !== confirm) return setError(t("auth.passwordsMismatch"));
    setLoading(true);

    // Extract token from URL search params or hash (often sent by auth providers)
    const params = new URLSearchParams(window.location.search || window.location.hash.substring(1));
    const token = params.get("token") || params.get("access_token") || "";

    const res = await updatePassword(password, token);
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    setDone(true);
    setTimeout(() => navigate({ to: "/login" }), 1500);
  }

  return (
    <AuthLayout
      title={t("auth.updatePassword")}
      footer={<Link to="/login" className="text-primary font-semibold hover:underline">{t("auth.signIn")}</Link>}
    >
      {done ? (
        <p className="text-sm text-emerald-500">{t("auth.passwordUpdated")}</p>
      ) : !ready ? (
        <p className="text-sm text-muted-foreground">…</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("auth.newPassword")}</label>
            <AuthInput type="password" required autoComplete="new-password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("auth.confirmPassword")}</label>
            <AuthInput type="password" required autoComplete="new-password" minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          <FieldError>{error}</FieldError>
          <AuthButton type="submit" loading={loading}>{t("auth.updatePassword")}</AuthButton>
        </form>
      )}
    </AuthLayout>
  );
}
