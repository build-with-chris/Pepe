import React, { useEffect, useMemo, useState } from 'react';
import ArtistCard from "@/components/ArtistCard/ArtistCard";
import { Hero228 } from '@/components/hero228';
import { Hero87 } from '@/components/hero87';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

import type { Artist } from "@/types/artist";

type LocalArtist = Artist & { id: number };

function resolveImageUrl(a: any): string {
  const candidate = (
    a?.profile_image_url ||
    a?.profile_image ||
    a?.image_url ||
    a?.image ||
    a?.avatar ||
    a?.picture ||
    (a?.media && (a.media.profile || a.media.cover || a.media.url)) ||
    ""
  );
  const s = String(candidate || "").trim();
  if (!s) return "";
  // Already absolute (http, https, or protocol-relative)
  if (/^(https?:)?\/\//i.test(s)) return s;
  // Leading slash → prefix API URL if available, else window origin
  if (s.startsWith("/")) {
    const api = import.meta.env.VITE_API_URL || "";
    if (api) return `${api}${s}`;
    try { return `${window.location.origin}${s}`; } catch { return s; }
  }
  // Otherwise return as-is (relative path handled by app)
  return s;
}

type DisciplineKey =
  | "zauberer"
  | "cyrWheel"
  | "bodenakrobatik"
  | "luftakrobatik"
  | "partnerakrobatik"
  | "chinesePole"
  | "hulaHoop"
  | "handstand"
  | "contemporaryDance"
  | "breakdance"
  | "teeterboard"
  | "jonglage"
  | "moderation"
  | "pantomime";

const DISCIPLINE_ITEMS: { key: DisciplineKey; match: string }[] = [
  { key: "zauberer", match: "zauberer" },
  { key: "cyrWheel", match: "cyr-wheel" },
  { key: "bodenakrobatik", match: "bodenakrobatik" },
  { key: "luftakrobatik", match: "luftakrobatik" },
  { key: "partnerakrobatik", match: "partnerakrobatik" },
  { key: "chinesePole", match: "chinese pole" },
  { key: "hulaHoop", match: "hula" },
  { key: "handstand", match: "handstand" },
  { key: "contemporaryDance", match: "contemporary" },
  { key: "breakdance", match: "breakdance" },
  { key: "teeterboard", match: "teeterboard" },
  { key: "jonglage", match: "jonglage" },
  { key: "moderation", match: "moderation" },
  { key: "pantomime", match: "pantomime" },
];

export default function Kuenstler(){
  const [artists, setArtists] = useState<LocalArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<DisciplineKey[]>([]);

  const { t } = useTranslation();

  const toggleFilter = (d: DisciplineKey) => {
    setActiveFilters(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
    );
  };
  const clearFilters = () => setActiveFilters([]);

  const matchMap = useMemo(() => Object.fromEntries(DISCIPLINE_ITEMS.map(i => [i.key, i.match])), [] as any) as Record<DisciplineKey, string>;

  const filteredArtists = useMemo(() => {
    if (!activeFilters.length) return artists;
    const wanted = new Set(activeFilters);
    return artists.filter(a => {
      const discs = (a.disciplines || []).map(x => (x || "").toLowerCase());
      return discs.some(d => Array.from(wanted).some(k => d.includes(matchMap[k])));
    });
  }, [artists, activeFilters, matchMap]);



  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL;
    const url = `${baseUrl}/api/artists`;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const rawList: any[] = Array.isArray(data) ? data : (data?.artists ?? []);
        const mapped: LocalArtist[] = rawList.map((a) => ({
          id: a.id,
          name: a.name,
          image: resolveImageUrl(a),
          bio: a.bio ?? "",
          disciplines: Array.isArray(a.disciplines) ? a.disciplines : [],
          gallery: Array.isArray(a.gallery) ? a.gallery : [],
          gallery_urls: Array.isArray(a.gallery_urls) ? a.gallery_urls : [],
          instagram: a.instagram ?? undefined,
        }));
        setArtists(mapped);
      } catch (e: any) {
        console.error('Künstler-Laden fehlgeschlagen:', e);
        setError(e?.message || 'Fehler beim Laden');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const target = document.getElementById("kuenstler-quote");
    if (!target) return;

    const handler = (e: Event) => {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    // try to find a button or link that says "Künstler kennenlernen"
    const candidates = Array.from(document.querySelectorAll<HTMLButtonElement | HTMLAnchorElement>('button, a'));
    const trigger = candidates.find(el => el.textContent?.trim().toLowerCase() === "künstler kennenlernen");

    if (trigger) {
      trigger.addEventListener("click", handler);
    }

    return () => {
      if (trigger) trigger.removeEventListener("click", handler);
    };
  }, []);

    return (
      <div className="pt-20 md:pt-24 lg:pt-28">
        <Helmet>
          <title>Künstler:innen – PepeShows</title>
          <meta
            name="description"
            content="Außergewöhnliche Künstler:innen, perfekt inszeniert für Ihr Publikum. Unser internationales Team aus Weltmeistern und preisgekrönten Artisten bringt Visionen mit Leidenschaft auf die Bühne – professionell und unvergesslich."
          />
        </Helmet>

        <div className="relative h-[560px] md:h-[640px] lg:h-[800px] overflow-hidden flex items-center justify-center mb-8">
          <Hero228 />
          
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-white relative z-10">
        <Hero87 />
        <div id="kuenstler-quote" className="relative flex flex-col items-center text-center text-white my-8">
          <div className="flex flex-row pointer-events-none absolute -top-10">
            <DotLottieReact
              src="https://lottie.host/e86a7557-375e-4cf6-abc0-c8f0d034b637/mQay5cJDVU.lottie"
              loop
              autoplay
              style={{ width: 96, height: 96, filter: "brightness(2)" }}
            />
            <DotLottieReact
              src="https://lottie.host/e86a7557-375e-4cf6-abc0-c8f0d034b637/mQay5cJDVU.lottie"
              loop
              autoplay
              style={{ width: 96, height: 96, filter: "brightness(2)" }}
            />
            <DotLottieReact
              src="https://lottie.host/e86a7557-375e-4cf6-abc0-c8f0d034b637/mQay5cJDVU.lottie"
              loop
              autoplay
              style={{ width: 96, height: 96, filter: "brightness(2)" }}
            />
          </div>
          <div className="text-xl md:text-3xl italic">
            {t("artists.quote")}
          </div>
        </div>

          {/* Filterleiste nach Disziplin */}
          <div className="mb-8">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-sm px-4 py-3 sm:px-6 sm:py-4">
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {DISCIPLINE_ITEMS.map((item) => {
                    const active = activeFilters.includes(item.key);
                    const full = t(`artists.disciplines.${item.key}`);
                    const short = t(`artists.disciplinesShort.${item.key}`, full);
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => toggleFilter(item.key)}
                        className={`px-3 py-1.5 rounded-full border text-sm whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-0 ${
                          active
                            ? "bg-white text-black border-white shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
                            : "bg-transparent text-white border-white/20 hover:bg-white/10 hover:border-white/40"
                        }`}
                        aria-pressed={active}
                      >
                        <span className="block sm:hidden">{short}</span>
                        <span className="hidden sm:block">{full}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 w-full flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className={`px-3 py-1.5 rounded-full border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-0 ${
                      activeFilters.length === 0
                        ? "bg-white text-black border-white shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
                        : "bg-transparent text-white border-white/20 hover:bg-white/10 hover:border-white/40"
                    }`}
                    aria-pressed={activeFilters.length === 0}
                  >
                    {t("artists.filters.all")}
                  </button>
                  <span className="text-sm text-white/70">
                    {t("artists.results", { count: filteredArtists.length })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <section className="artist-cards grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && (
              <div className="col-span-full text-gray-300">{t("artists.loading")}</div>
            )}
            {error && (
              <div className="col-span-full text-red-400">{error}</div>
            )}
            {!loading && !error && filteredArtists.length === 0 && (
              <div className="col-span-full text-gray-300">{t("artists.empty")}</div>
            )}
            {!loading && !error && filteredArtists.map(artist => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </section>
          </div>
          </div>
    );
  }