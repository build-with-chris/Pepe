import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Link } from "react-router-dom";

import {InstagramIcon} from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

import { useTranslation } from "react-i18next";

const Footer04Page = () => {
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [tsToken, setTsToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    // If Cloudflare Turnstile script is present, render widgets automatically
    // The widget will call the callback and set the token when ready
  }, []);

  const handleNewsletterSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg(null);
    if (!/.+@.+\..+/.test(email)) {
      setMsg(t("footer.newsletter.invalidEmail") as string);
      return;
    }
    if (!tsToken) {
      setMsg(t("footer.newsletter.noBotToken") as string);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, turnstileToken: tsToken }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      setMsg(t("footer.newsletter.success") as string);
      setEmail("");
      setTsToken("");
      // Reset the widget if available
      // @ts-ignore
      if (window.turnstile?.reset) { /* @ts-ignore */ window.turnstile.reset(); }
    } catch (err: any) {
      setMsg(`${t("footer.newsletter.fail")}: ${err?.message || ""}`);
    } finally {
      setLoading(false);
    }
  };

  const mainLinks = [
    { title: t("footer.mainLinks.mediamaterial"), href: "/mediamaterial" },
    { title: t("footer.mainLinks.showsAndFormate"), href: "/shows" },
    { title: t("footer.mainLinks.referenzen"), href: "/referenzen" },
    { title: t("footer.mainLinks.faq"), href: "/faq" },
    { title: t("footer.mainLinks.agenturUndTeam"), href: "/agentur" },
    { title: t("footer.mainLinks.kontakt"), href: "/kontakt" },
    { title: t("footer.mainLinks.artistLogin"), href: "/login" },
  ];

  const filteredMainLinks = mainLinks.filter((l) => l.href !== "/faq");
  const order = [
    "/shows&formate",
    "/mediamaterial",
    "/referenzen",
    "/agentur",
    "/kontakt",
    "/login",
  ];
  const sortedMainLinks = [...filteredMainLinks].sort((a, b) => {
    const ia = order.indexOf(a.href);
    const ib = order.indexOf(b.href);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });
  const pairedMainLinks = [] as { title: string; href: string }[][];
  for (let i = 0; i < sortedMainLinks.length; i += 2) {
    pairedMainLinks.push(sortedMainLinks.slice(i, i + 2));
  }

  const legalLinks = [
    { title: t("footer.legalLinks.impressum"), href: "/impressum" },
    { title: t("footer.legalLinks.datenschutz"), href: "/datenschutz" },
    { title: t("footer.legalLinks.agb"), href: "/agb" },
  ];

  const linkBase =
    "inline-flex items-center transition-colors underline-offset-4";
  const linkMain =
    "text-sm sm:text-base text-white/90 hover:text-white";
  const linkLegal =
    "text-xs text-white/60 hover:text-white/80";

  return (
    <footer className="bg-black text-white/80">
      {/* Top */}
      <div className="w-full mx-auto px-6 md:px-12 lg:px-20 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-6 lg:gap-8">
          {/* Navigation */}
          <nav aria-label="Footer" className="md:col-span-7 lg:col-span-8 grid grid-cols-1 gap-8 lg:gap-8">
            <div>
              <h6 className="mb-3 text-xs uppercase tracking-wider text-white/60">{t("footer.navigation")}</h6>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {pairedMainLinks.map((group, idx) => (
                  <ul key={idx} className="space-y-2">
                    {group.map(({ title, href }) => (
                      <li key={title}>
                        <Link
                          to={href}
                          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                          className={`${linkBase} ${linkMain} py-1`}
                        >
                          {title}
                        </Link>
                      </li>
                      
                    ))}
                    
                  </ul>
                ))}
                
              </div>
              {/* Legal (accordion) under navigation */}
              <details className="mt-6 w-full">
                <summary className="text-xs uppercase tracking-wider text-white/50 hover:text-white/70 cursor-pointer list-none inline-flex items-center gap-1">
                  {t("footer.legal")} <span className="text-white/40">▾</span>
                </summary>
                <ul className="mt-2 space-y-1 pl-2">
                  {legalLinks.map(({ title, href }) => (
                    <li key={title}>
                      <Link
                        to={href}
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className={`${linkBase} ${linkLegal} py-0.5`}
                      >
                        {title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          </nav>

          {/* Center column: logo/newsletter */}
          <div className="md:col-span-5 lg:col-span-4 flex items-start gap-6 justify-start">
            {/* animation, hidden on mobile, slight top offset to align visually */}
            

            {/* rest fills remaining width */}
            <div className="flex-1 w-full min-w-0">
              <div className="flex items-center gap-6">
                <Link
                  to="/"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="text-white text-xl font-semibold"
                >
                  PepeShows
                </Link>
                <Link
                  to="https://www.instagram.com/pepe_arts/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-white/80 hover:text-white"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="h-5 w-5" />
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-400/70 to-purple-500/70 text-white">
                    45,4k
                  </span>
                  <span className="sr-only">PepeShows auf Instagram – 45,4k Follower</span>
                </Link>
              </div>
             
              <div className="mt-8 w-full max-w-xl">
                <h6 className="font-semibold text-white/90">{t("footer.newsletter.title")}</h6>
                <form className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 max-w-full" onSubmit={handleNewsletterSubmit}>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("footer.newsletter.placeholder")}
                    className="flex-1 min-w-0 bg-white text-black placeholder:text-black/60"
                    required
                    aria-label={t("footer.newsletter.placeholder")}
                  />
                  <div
                    className="cf-turnstile"
                    data-sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                    data-callback={(token: string) => { setTsToken(token); }}
                  ></div>
                  <div className="relative shrink-0">
                    <Button type="submit" className="relative z-[1]" disabled={loading || !tsToken || !/.+@.+\..+/.test(email)}>
                      {loading ? t("footer.newsletter.loading") : t("footer.newsletter.button")}
                    </Button>
                    <div className="hidden md:block pointer-events-none absolute -top-14 left-1/2 -translate-x-1/2 md:w-16 md:h-16 lg:w-20 lg:h-20" aria-hidden="true">
                      <DotLottieReact
                        src="https://lottie.host/624aabe7-916a-416f-b6c2-be3a17f113f9/DyPtBBmqU4.lottie"
                        loop
                        autoplay
                        style={{ width: "100%", height: "100%", filter: "invert(1) brightness(2)" }}
                      />
                    </div>
                  </div>
                </form>
                {msg && (
                  <p className="mt-2 text-sm text-white/80" role="status">{msg}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <span className="text-white/60">&copy; {new Date().getFullYear()} {t("footer.copyright")}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer04Page;