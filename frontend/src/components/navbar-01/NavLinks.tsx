import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocation } from "react-router-dom";

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

type NavLinksProps = {
  layout?: "desktop" | "mobile";
  onNavigate?: () => void;
  className?: string;
};

export const NavLinks: React.FC<NavLinksProps> = ({
  layout = "desktop",
  onNavigate,
  className = "",
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  let links: { to: string; label: string }[] = [];

  if (!user) {
    // Public links (only when logged out)
    links = [
      { to: "/home", label: t("nav.home", "Home") },
      { to: "/kuenstler", label: t("nav.artists", "Künstler") },
      { to: "/shows", label: t("nav.shows", "Shows") },
      { to: "/galerie", label: t("nav.gallery", "Galerie") },
      { to: "/kontakt", label: t("nav.contact", "Kontakt") },
    ];
  } else {
    if (Boolean((user as any).is_admin) || (user as any).role === "admin") {
      // Admin links only (backend flag preferred)
      links = [
        { to: "/admin/dashboard", label: t("nav.admin.dashboard", "Dashboard") },
        { to: "/admin/rechnungen", label: t("nav.admin.invoices", "Rechnungen") },
        { to: "/admin/anstehende-gigs", label: t("nav.admin.upcomingGigs", "Anstehende Gigs") },
        { to: "/admin/kuenstler", label: t("nav.admin.artists", "Künstler") },
      ];
    } else {
      // Authenticated artist/user links
      links = [
        { to: "/buchhaltung", label: t("nav.user.accounting", "Buchhaltung") },
        { to: "/kalender", label: t("nav.user.calendar", "Kalender") },
        { to: "/meine-gigs", label: t("nav.user.myGigs", "Meine Gigs") },
        { to: "/meine-anfragen", label: t("nav.user.requests", "Anfragen") },
      ];
    }
  }

  const linkClass =
    layout === "desktop"
      ? "px-3 py-2 text-sm text-gray-100 hover:text-white"
      : "block rounded-xl px-4 py-4 text-xl text-gray-100 hover:bg-white/10";

  return (
    <nav className={className}>
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className={linkClass}
          onClick={onNavigate}
        >
          {link.label}
        </Link>
      ))}
      {user && (
        <Link
          to="/profile"
          onClick={onNavigate}
          aria-label={t("nav.profile", { defaultValue: "Profil" })}
          className="inline-flex items-center px-3"
        >
          <Avatar
            className={`h-8 w-8 border ${
              location.pathname.startsWith("/profile")
                ? "ring-2 ring-white/90 border-transparent"
                : "border-white/10"
            }`}
          >
            <AvatarImage alt="Avatar" />
            <AvatarFallback className="bg-white text-black text-xs font-semibold">
              {getInitials((user as any)?.user_metadata?.full_name as string, (user as any)?.email as string)}
            </AvatarFallback>
          </Avatar>
        </Link>
      )}
    </nav>
  );
};