import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Menu, X, Globe, Radio } from "lucide-react";
import { useI18n, type Lang } from "@/lib/i18n";
import { Logo } from "@/components/site/Logo";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { AuthMenu } from "@/components/site/AuthMenu";

import { useSectionsQuery } from "@/hooks/api/useSectionHooks";

type NavItem =
  | { to: "/"; label: string; section?: undefined; search?: any }
  | { to: "/video"; label: string; section?: undefined; search?: any }
  | { to: "/gallery"; label: string; section?: undefined; search?: any }
  | { to: "/section/$section"; label: string; section: string; search?: any };

export function Header() {
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  
  const { data: apiSections } = useSectionsQuery();

  // Only show 4 core categories in the navbar (+ Home = 5 total)
  const fallbackSections = [
    { slug: "politics", name: { en: "Politics", ar: "سياسة", fr: "Politique" } },
    { slug: "economy", name: { en: "Economy", ar: "اقتصاد", fr: "Économie" } },
    { slug: "sports", name: { en: "Sports", ar: "رياضة", fr: "Sports" } },
    { slug: "tech", name: { en: "Tech", ar: "تكنولوجيا", fr: "Technologie" } },
  ];

  const navSections = apiSections && apiSections.length > 0 
    ? apiSections.filter(s => s.isActive).sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 4) 
    : fallbackSections;

  const navItems: NavItem[] = [
    { to: "/", label: t("nav.home") },
    ...(navSections.map((s: any) => ({
      to: "/" as const,
      search: { section: s.slug },
      label: s.name[lang] || s.name["en"],
    }))),
  ];

  const langs: { code: Lang; label: string }[] = [
    { code: "en", label: "English" },
    { code: "ar", label: "العربية" },
    { code: "fr", label: "Français" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-lg">
      <div className="mx-auto flex h-12 max-w-7xl items-center gap-3 px-4 md:px-6">
        <Logo size="md" />

        <nav className="hidden lg:flex items-center gap-2 ms-6" aria-label="Primary">
          {navItems.map((item, idx) => (
            <Link
              key={idx}
              to={item.to}
              search={item.search}
              params={item.section ? { section: item.section } : undefined}
              activeOptions={{ exact: item.to === "/" && !item.search }}
              activeProps={{ className: "text-primary bg-accent" }}
              inactiveProps={{ className: "text-foreground/75 hover:text-primary hover:bg-accent/60" }}
              className="rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        <Link
          to="/live"
          className="hidden lg:inline-flex items-center gap-2 rounded-full bg-live/10 px-3 py-1.5 text-xs font-bold uppercase text-live hover:bg-live/15 transition-colors"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-live live-pulse" />
            <span className="relative h-2 w-2 rounded-full bg-live" />
          </span>
          <Radio className="h-3.5 w-3.5" />
          {t("nav.live")}
        </Link>

        <Link
          to="/search"
          aria-label={t("nav.search")}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 hover:bg-accent hover:text-foreground transition-colors"
        >
          <Search className="h-4 w-4" />
        </Link>

        <ThemeToggle />
        <AuthMenu />

        <div className="relative">
          <button
            onClick={() => setLangOpen((s) => !s)}
            aria-label="Language"
            aria-expanded={langOpen}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-semibold uppercase hover:border-primary/50 transition-colors"
          >
            <Globe className="h-3.5 w-3.5" />
            {lang}
          </button>
          {langOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
              <div className="absolute end-0 top-full z-50 mt-2 w-40 rounded-lg border border-border bg-popover p-1 shadow-elegant animate-fade-up">
                {langs.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setLangOpen(false); }}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                      lang === l.code ? "bg-accent text-primary font-semibold" : "hover:bg-accent"
                    }`}
                  >
                    <span>{l.label}</span>
                    <span className="text-xs uppercase opacity-60">{l.code}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen((s) => !s)}
          aria-label="Menu"
          aria-expanded={open}
          className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent transition-colors"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-border bg-background animate-fade-up" aria-label="Mobile">
          <div className="mx-auto flex max-w-7xl flex-col p-4">
            {navItems.map((item, idx) => (
              <Link
                key={idx}
                to={item.to}
                search={item.search}
                params={item.section ? { section: item.section } : undefined}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: item.to === "/" && !item.search }}
                activeProps={{ className: "text-primary" }}
                className="rounded-md px-3 py-3 text-base font-medium hover:bg-accent transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/live"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center gap-2 rounded-md bg-live/10 px-3 py-3 text-sm font-bold uppercase text-live hover:bg-live/15 transition-colors"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-live live-pulse" />
                <span className="relative h-2 w-2 rounded-full bg-live" />
              </span>
              <Radio className="h-3.5 w-3.5" />
              {t("nav.live")}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
