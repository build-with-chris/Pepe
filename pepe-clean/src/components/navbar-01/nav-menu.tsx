import { Link, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";

interface NavMenuProps {
  className?: string;
}

export const NavMenu = ({ className }: NavMenuProps) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const loggedIn = Boolean(user);
  const isAdmin = user?.role === 'admin';

  const menuItems = useMemo(() => {
    if (isAdmin) {
      return [
        { label: t("nav.admin.dashboard"), to: '/admin' },
        { label: t("nav.admin.invoices"), to: '/admin/rechnungen' },
        { label: t("nav.admin.upcomingGigs"), to: '/admin/anstehende-gigs' },
        { label: t("nav.admin.artists"), to: '/admin/kuenstler' },
      ];
    }
    return loggedIn
      ? [
          { label: t("nav.user.profile"), to: '/profile' },
          { label: t("nav.user.calendar"), to: '/kalender' },
          { label: t("nav.user.requests"), to: '/meine-anfragen' },
          { label: t("nav.user.myGigs"), to: '/meine-gigs' },
          { label: t("nav.user.accounting"), to: '/buchhaltung' },
        ]
      : [
          { label: t("nav.public.artists"), to: '/kuenstler' },
          { label: t("nav.public.shows"), to: '/shows' },
          { label: t("nav.public.gallery"), to: '/galerie' },
          { label: t("nav.public.contact"), to: '/kontakt' },
        ];
  }, [loggedIn, isAdmin, t]);

  return (
    <nav className={`nav ${className || ''}`}>
      {menuItems.map(item => (
        <Link 
          key={item.to}
          to={item.to} 
          className={`nav-link ${location.pathname === item.to ? 'active' : ''}`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
};
