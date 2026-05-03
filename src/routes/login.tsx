import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useLoginMutation } from "@/hooks/api/useAuthHooks";
import { useMeQuery } from "@/hooks/api/useUserHooks";
import { AuthLayout, AuthInput, AuthButton, FieldError } from "@/components/site/AuthLayout";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Daleel Reporter" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { data: user, isLoading: authLoading } = useMeQuery();
  const loginMutation = useLoginMutation();

  useEffect(() => {
    if (!authLoading && user) navigate({ to: "/" });
  }, [user, authLoading, navigate]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          if (typeof window !== "undefined") {
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
          }
          navigate({ to: "/" });
        }
      }
    );
  }

  return (
    <AuthLayout
      title={t("auth.welcomeBack")}
      subtitle={t("auth.signIn")}
      footer={<>{t("auth.noAccount")} <Link to="/signup" className="text-primary font-semibold hover:underline">{t("auth.signUp")}</Link></>}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("auth.email")}</label>
          <AuthInput type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("auth.password")}</label>
            <Link to="/reset-password" className="text-xs text-primary hover:underline">{t("auth.forgot")}</Link>
          </div>
          <AuthInput type="password" required autoComplete="current-password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <FieldError>
          {loginMutation.isError ? (loginMutation.error as any)?.response?.data?.error || loginMutation.error.message : null}
        </FieldError>
        <AuthButton type="submit" loading={loginMutation.isPending}>{t("auth.signIn")}</AuthButton>
      </form>
    </AuthLayout>
  );
}
