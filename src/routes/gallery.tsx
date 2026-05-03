import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Images, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useI18n } from "@/lib/i18n";
import { sections, articles as mockArticles, type Article } from "@/lib/mock-data";
import { fetchPublishedArticles } from "@/lib/articles";
import { UpdatingStatus } from "@/components/site/UpdatingStatus";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Photo Galleries — Daleel Reporter" },
      { name: "description", content: "Curated photo galleries and visual reportage from the Daleel newsroom." },
      { property: "og:title", content: "Photo Galleries — Daleel Reporter" },
      { property: "og:description", content: "Visual reportage from around the world." },
    ],
  }),
  component: GalleryPage,
});

interface Album {
  id: string;
  cover: string;
  title: string;
  section: string;
  count: number;
  photos: { src: string; caption: string }[];
}

function GalleryPage() {
  const { t, lang } = useI18n();
  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const [updating, setUpdating] = useState(true);
  useEffect(() => {
    let cancelled = false;
    fetchPublishedArticles()
      .then((a) => { if (!cancelled && a.length > 0) setArticles(a); })
      .finally(() => { if (!cancelled) setUpdating(false); });
    return () => { cancelled = true; };
  }, []);

  const albums: Album[] = articles.map((a, idx) => ({
    id: a.id,
    cover: a.image,
    title: a.title[lang],
    section: sections[a.section][lang],
    count: 6 + (idx % 4),
    photos: Array.from({ length: 6 + (idx % 4) }).map((_, i) => ({
      src: a.image.replace(/w=\d+/, `w=1400`) + `&v=${i}`,
      caption: `${a.title[lang]} — frame ${i + 1}`,
    })),
  }));

  const [activeAlbum, setActiveAlbum] = useState<Album | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const open = (album: Album) => { setActiveAlbum(album); setActiveIdx(0); };
  const close = () => setActiveAlbum(null);
  const prev = () => activeAlbum && setActiveIdx((i) => (i - 1 + activeAlbum.photos.length) % activeAlbum.photos.length);
  const next = () => activeAlbum && setActiveIdx((i) => (i + 1) % activeAlbum.photos.length);

  // keyboard nav
  useEffect(() => {
    if (!activeAlbum) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [activeAlbum]);

  // touch swipe
  const touchX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) (dx > 0 ? prev : next)();
    touchX.current = null;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10 md:px-6 animate-fade-up">
        <div className="mb-8 flex items-center gap-3">
          <Images className="h-7 w-7 text-flame" />
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t("section.gallery")}</h1>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <button
              key={album.id}
              onClick={() => open(album)}
              className="card-lift group block overflow-hidden rounded-lg border border-border bg-card text-start shadow-card"
            >
              <div className="img-zoom relative aspect-[4/3] overflow-hidden bg-muted">
                <img src={album.cover} alt="" className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />
                <span className="absolute top-3 end-3 inline-flex items-center gap-1 rounded-full bg-foreground/70 px-3 py-1 text-xs font-bold text-background backdrop-blur">
                  <Images className="h-3.5 w-3.5" /> {album.count}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-4 text-background">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-flame">{album.section}</span>
                  <h3 className="mt-1 line-clamp-2 text-base font-extrabold leading-snug">{album.title}</h3>
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* Lightbox */}
      {activeAlbum && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-foreground/95 backdrop-blur-sm animate-fade-up"
          role="dialog"
          aria-modal="true"
          aria-label={activeAlbum.title}
        >
          <div className="flex items-center justify-between p-4 text-background">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-flame font-bold">{activeAlbum.section}</p>
              <h2 className="truncate text-sm md:text-base font-bold">{activeAlbum.title}</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs">{activeIdx + 1} / {activeAlbum.photos.length}</span>
              <button onClick={close} aria-label="Close" className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-background/15">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="relative flex-1 flex items-center justify-center px-2" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <button
              onClick={prev}
              aria-label="Previous"
              className="absolute start-2 md:start-6 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-background/15 text-background hover:bg-background/25 transition-colors"
            >
              <ChevronLeft className="h-6 w-6 rtl-flip" />
            </button>
            <img
              src={activeAlbum.photos[activeIdx].src}
              alt={activeAlbum.photos[activeIdx].caption}
              className="max-h-[75vh] max-w-full rounded object-contain shadow-elegant"
            />
            <button
              onClick={next}
              aria-label="Next"
              className="absolute end-2 md:end-6 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-background/15 text-background hover:bg-background/25 transition-colors"
            >
              <ChevronRight className="h-6 w-6 rtl-flip" />
            </button>
          </div>

          <p className="mx-auto max-w-3xl px-4 pb-3 text-center text-sm text-background/80 italic">
            {activeAlbum.photos[activeIdx].caption}
          </p>

          {/* Thumbnails */}
          <div className="border-t border-background/10 bg-foreground/60 p-3">
            <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto">
              {activeAlbum.photos.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  aria-label={`Photo ${i + 1}`}
                  className={`shrink-0 overflow-hidden rounded transition-all ${
                    i === activeIdx ? "ring-2 ring-flame opacity-100" : "opacity-50 hover:opacity-90"
                  }`}
                >
                  <img src={p.src} alt="" className="h-14 w-20 object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
      <UpdatingStatus show={updating} />
    </div>
  );
}
