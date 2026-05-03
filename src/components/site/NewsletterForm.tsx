import { useState, type FormEvent } from "react";
import { Mail, Check } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n";

export function NewsletterForm() {
  const { t, lang } = useI18n();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setStatus("error");
      setMessage(t("auth.invalidEmail"));
      return;
    }
    setStatus("loading");
    try {
      await apiClient("/newsletter/subscribe", {
        method: "POST",
        body: JSON.stringify({ email, preferredLang: lang })
      });
      setStatus("success");
      setMessage(t("newsletter.success"));
      setEmail("");
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message?.includes("already") || error.message?.includes("409") ? t("newsletter.already") : t("newsletter.failed"));
    }
  };

  return (
    <form onSubmit={onSubmit} className="w-full">
      <h4 className="mb-2 text-sm font-bold uppercase tracking-wide">{t("newsletter.title")}</h4>
      <p className="mb-3 text-xs text-muted-foreground">{t("newsletter.intro")}</p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("auth.email")}
            className="h-10 w-full rounded-md border border-border bg-background ps-9 pe-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex h-10 items-center gap-1 rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {status === "success" ? <Check className="h-4 w-4" /> : t("newsletter.subscribe")}
        </button>
      </div>
      {message && (
        <p className={`mt-2 text-xs ${status === "error" ? "text-destructive" : "text-primary"}`}>
          {message}
        </p>
      )}
    </form>
  );
}
