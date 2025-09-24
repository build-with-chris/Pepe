import { Button } from "../ui/button";
import { Logo } from "./logo";
import { NavMenu } from "./nav-menu";
import { NavLinks } from "./NavLinks";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getSupabase } from "@/lib/supabase";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const getInitials = (full?: string, email?: string) => {
  const t = (full || "").trim();
  if (t) {
    const parts = t.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || "";
    const last = parts[parts.length - 1]?.[0] || "";
    return (first + last).toUpperCase();
  }
  const em = (email || "").trim();
  if (em) return em.slice(0, 2).toUpperCase();
  return "?";
};

const Navbar01Page = () => {
  const { t, i18n } = useTranslation();
  const { user, setUser, setToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [show, setShow] = useState(true);
  const [lastY, setLastY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [atTop, setAtTop] = useState(true);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      setAtTop(y === 0);
      // Immer sichtbar nahe am Seitenanfang
      if (y < 8) {
        setShow(true);
      } else {
        // Kleines Hochscrollen → sofort zeigen
        if (y < lastY - 2) setShow(true);
        // Spürbares Runterscrollen → ausblenden
        if (y > lastY + 6) setShow(false);
      }
      setLastY(y);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastY]);

  const isHomeOrArtists = location.pathname === '/home' || location.pathname === '/kuenstler';

  const handleLogout = async () => {
    try {
      const sb = await getSupabase();
      await sb.auth.signOut();
    } catch (e) {
      console.warn("Logout error:", e);
    }
    setUser(null);
    setToken(null);
    navigate("/");
  };

  return (
    <div className="z-50">
      <nav
        className={`fixed top-0 left-0 right-0 w-full h-26 z-50 transition-transform duration-300 ${
          show ? 'translate-y-0' : '-translate-y-full'
        } ${location.pathname === '/home' && lastY <= 60 ? 'bg-black backdrop-blur' : (isHomeOrArtists ? 'bg-black/50 backdrop-blur' : 'bg-black/90 backdrop-blur')}
        `}
      >
        <div className="h-full flex items-center justify-between max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <Logo />

          {/* Desktop Menu */}
          <NavMenu className="hidden lg:block" />

          <div className="flex items-center gap-3">
            {user ? (
              <div className="hidden lg:block w-auto max-w-xs">
                <Button
                  variant="secondary"
                  className="text-sm px-3 py-1.5 md:text-base md:px-5 md:py-2.5"
                  onClick={handleLogout}
                >
                  {t("nav.logout")}
                </Button>
              </div>
            ) : (
              <div className="hidden lg:block w-auto max-w-xs">
                <Link to="/anfragen">
                  <Button
                    variant="secondary"
                    className="text-sm px-3 py-1.5 md:text-base md:px-5 md:py-2.5"
                  >
                    {t("nav.booking")}
                  </Button>
                </Link>
              </div>
            )}
            {/* Language Switcher (desktop) */}
            <div className="hidden lg:flex items-center gap-2 text-white">
              <button
                onClick={() => changeLanguage("de")}
                className={`text-xs md:text-sm px-2 py-1 rounded ${i18n.language?.startsWith("de") ? "underline" : "opacity-80 hover:opacity-100"}`}
                aria-label={t("nav.lang.de")}
              >
                DE
              </button>
              <span className="text-white/40">|</span>
              <button
                onClick={() => changeLanguage("en")}
                className={`text-xs md:text-sm px-2 py-1 rounded ${i18n.language?.startsWith("en") ? "underline" : "opacity-80 hover:opacity-100"}`}
                aria-label={t("nav.lang.en")}
              >
                EN
              </button>
            </div>
            {/* User Avatar (links to profile) */}
            {user && (
              <Link
                to="/profile"
                aria-label={t("nav.profile", { defaultValue: "Profil" })}
                className="hidden sm:inline-flex rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <Avatar
                  className={`h-8 w-8 border transition ${
                    location.pathname.startsWith("/profile")
                      ? "ring-2 ring-white/90 border-transparent"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <AvatarImage alt="Avatar" />
                  <AvatarFallback className="bg-white text-black text-xs font-semibold">
                    {getInitials((user as any)?.user_metadata?.full_name as string, (user as any)?.email as string)}
                  </AvatarFallback>
                </Avatar>
              </Link>
            )}
            {/* Hamburger (mobile & tablet) */}
            <button
              className="lg:hidden inline-flex items-center justify-center rounded-md p-2 sm:p-3 md:p-4 text-white/90 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label={t("nav.openMenu")}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <svg
                className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </nav>
      {!isHomeOrArtists && <div className="h-26" />}

      {/* Mobile/Tablet Fullscreen Menu */}
      <div
        className={`lg:hidden fixed inset-0 z-[60] transition-transform duration-300 ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
        aria-hidden={!menuOpen}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />

        {/* Panel */}
        <div className="absolute right-0 top-0 h-full w-[88%] sm:w-[70%] max-w-[420px] bg-neutral-900 border-l border-white/10 shadow-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div className="h-10 w-28 sm:h-12 sm:w-32 shrink-0 pointer-events-none">
              <DotLottieReact
                src="https://lottie.host/624aabe7-916a-416f-b6c2-be3a17f113f9/DyPtBBmqU4.lottie"
                loop
                autoplay
                style={{ width: "100%", height: "100%", filter: "invert(1) brightness(2)" }}
              />
            </div>
            <button
              className="inline-flex items-center justify-center rounded-md p-2 text-white/90 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label={t("nav.closeMenu")}
              onClick={() => setMenuOpen(false)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          <div className="px-6 py-6 space-y-2">
            {/* Nav items - large touch targets */}
            <NavLinks
              layout="mobile"
              className="space-y-2"
              onNavigate={() => setMenuOpen(false)}
            />

            {/* Divider */}
            <div className="my-4 border-t border-white/10" />

            {/* Language Switcher (inside menu) */}
            <div className="flex items-center gap-3 px-4">
              <span className="text-white/60 text-sm">{t("nav.language")}</span>
              <button
                onClick={() => changeLanguage("de")}
                className={`text-sm px-3 py-1.5 rounded-full border ${i18n.language?.startsWith("de") ? "border-white/40 bg-white/10" : "border-white/10 hover:border-white/30"}`}
                aria-label={t("nav.lang.de")}
              >
                DE
              </button>
              <button
                onClick={() => changeLanguage("en")}
                className={`text-sm px-3 py-1.5 rounded-full border ${i18n.language?.startsWith("en") ? "border-white/40 bg-white/10" : "border-white/10 hover:border-white/30"}`}
                aria-label={t("nav.lang.en")}
              >
                EN
              </button>
            </div>
            
            {/* Auth / CTA */}
            <div className="px-4 pt-4">
              {user ? (
                <Button
                  variant="secondary"
                  className="w-full text-base py-3"
                  onClick={() => { setMenuOpen(false); handleLogout(); }}
                >
                  {t("nav.logout")}
                </Button>
              ) : (
                <Link to="/anfragen" onClick={() => setMenuOpen(false)}>
                  <Button variant="secondary" className="w-full text-base py-3">
                    {t("nav.booking")}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar01Page;
