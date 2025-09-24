import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../ui/navigation-menu";
import type { NavigationMenuProps } from "@radix-ui/react-navigation-menu";
import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { NavLinks } from "./NavLinks";

interface NavMenuExtProps extends NavigationMenuProps {
  user?: any | null; // optional override, falls gewünscht
}

export const NavMenu = ({ user: passedUser, ...props }: NavMenuExtProps) => {
  const { user: contextUser } = useAuth();
  const { token } = useAuth();
  const user = passedUser !== undefined ? passedUser : contextUser;
  const loading = token === null && user === null;
  const loggedIn = Boolean(user);
  const isAdmin = Boolean(user?.is_admin) || user?.role === 'admin';

  const { t } = useTranslation();


  const menuItems = useMemo(() => {
    if (loading) {
      // show public links while auth context warms up
      return [
        { label: t("nav.public.artists"), to: '/kuenstler' },
        { label: t("nav.public.shows"), to: '/shows' },
        { label: t("nav.public.gallery"), to: '/galerie' },
        { label: t("nav.public.contact"), to: '/kontakt' },
      ];
    }
    if (isAdmin) {
      return [
        { label: t("nav.admin.dashboard"), to: '/admin/dashboard' },
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
  }, [loading, loggedIn, isAdmin, t]);

  return (
    <NavigationMenu {...props}>
      <NavigationMenuList className="gap-6 space-x-0 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start">
        {menuItems.map(item => (
          <NavigationMenuItem key={item.label}>
            <NavigationMenuLink asChild>
              <Link to={item.to}>{item.label}</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
