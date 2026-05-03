import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { AuthLayout, AuthInput, AuthButton, FieldError } from "@/components/site/AuthLayout";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — Daleel Reporter" }] }),
  component: ResetPage,
});

function ResetPage() {
  const { t } = useI18n();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await resetPassword(email);
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    setSent(true);
  }

  return (
    <AuthLayout
      title={t("auth.resetTitle")}
      subtitle={t("auth.resetIntro")}
      footer={<Link to="/login" className="text-primary font-semibold hover:underline">{t("auth.signIn")}</Link>}
    >
      {sent ? (
        <p className="text-sm text-emerald-500">{t("auth.resetSent")}</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("auth.email")}</label>
            <AuthInput type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <FieldError>{error}</FieldError>
          <AuthButton type="submit" loading={loading}>{t("auth.resetSend")}</AuthButton>
        </form>
      )}
    </AuthLayout>
  );
}
