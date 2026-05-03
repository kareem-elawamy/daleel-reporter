import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { AuthLayout, AuthInput, AuthButton, FieldError } from "@/components/site/AuthLayout";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — Daleel Reporter" }] }),
  component: SignupPage,
});

function SignupPage() {
  const { t } = useI18n();
  const { user, loading: authLoading, register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate({ to: "/" });
  }, [user, authLoading, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setInfo(null);
    if (password.length < 8) return setError(t("auth.passwordTooShort"));
    if (password !== confirm) return setError(t("auth.passwordsMismatch"));
    setLoading(true);
    const res = await register(email, password, name);
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    setInfo(t("auth.signupSuccess"));
  }

  return (
    <AuthLayout
      title={t("auth.createAccount")}
      subtitle={t("auth.signUp")}
      footer={<>{t("auth.hasAccount")} <Link to="/login" className="text-primary font-semibold hover:underline">{t("auth.signIn")}</Link></>}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("auth.displayName")}</label>
          <AuthInput required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("auth.email")}</label>
          <AuthInput type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("auth.password")}</label>
          <AuthInput type="password" required autoComplete="new-password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("auth.confirmPassword")}</label>
          <AuthInput type="password" required autoComplete="new-password" minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        <FieldError>{error}</FieldError>
        {info && <p className="text-xs text-emerald-500">{info}</p>}
        <AuthButton type="submit" loading={loading}>{t("auth.signUp")}</AuthButton>
      </form>
    </AuthLayout>
  );
}
