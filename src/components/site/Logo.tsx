import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import logo from "@/assets/logo.png";

type LogoProps = {
  /** Visual size variant. Footer uses "lg". */
  size?: "md" | "lg";
  /** Wrap the lockup in a Link to home. Defaults to true. */
  asLink?: boolean;
  className?: string;
};

export function Logo({ size = "md", asLink = true, className = "" }: LogoProps) {
  const { lang, t } = useI18n();
  const subtext = t("brand.subtitle");
  const fullName = t("brand.name");
  const isAr = lang === "ar";

  const imgClass = size === "lg" ? "h-10 w-auto" : "h-9 w-auto";
  const textSize = size === "lg" ? "text-base" : "text-sm";
  const textArSize = size === "lg" ? "text-lg" : "text-base";

  const content = (
    <>
      <img src={logo} alt="" className={imgClass} />
      <span className="sr-only">{fullName}</span>
      <span
        aria-hidden="true"
        className={
          isAr
            ? `font-arabic ${textArSize} font-bold tracking-wide text-slate-500 dark:text-slate-300 uppercase leading-none transition-colors group-hover:text-primary translate-y-[1px]`
            : `${textSize} font-semibold tracking-widest text-slate-500 dark:text-slate-300 uppercase leading-none transition-colors group-hover:text-primary translate-y-[1px]`
        }
      >
        {subtext}
      </span>
    </>
  );

  const baseClass = `flex items-center gap-2 shrink-0 group ${className}`.trim();

  if (!asLink) {
    return <div className={baseClass}>{content}</div>;
  }

  return (
    <Link to="/" className={baseClass} aria-label={`${fullName} home`}>
      {content}
    </Link>
  );
}
