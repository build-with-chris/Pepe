/**
 * Navigationsmodell für Künstler-Portal und Admin-Bereich.
 *
 * Bewusst als eigenes Modul ohne JSX: Die Seitenleiste, die Tab-Leiste auf dem
 * Handy und der Bereichsumschalter lesen alle dieselbe Liste. Vorher standen
 * die Einträge nur in `DashboardLayout` und wurden für Admins zu einer Liste
 * mit neun Einträgen zusammengeschüttet.
 */

import {
  BookOpen,
  Calendar,
  CalendarCheck,
  Inbox,
  LayoutDashboard,
  Receipt,
  User,
  Users,
} from 'lucide-react';
import type { ElementType } from 'react';

export type NavArea = 'artist' | 'admin';

export interface NavItem {
  label: string;
  href: string;
  icon: ElementType;
  /** Weitere Pfade, die auf denselben Eintrag zeigen (Alias-Routen aus App.tsx). */
  aliases?: string[];
  /** Auf dem Handy in der Tab-Leiste sichtbar. Alles andere liegt unter „Mehr". */
  primary?: boolean;
  /** Name des Zählers, der als Abzeichen daneben steht. */
  badge?: 'pendingArtists';
}

/**
 * Künstler-Portal.
 *
 * `Buchhaltung` stand bisher in keiner Navigation — die Seite war nur über die
 * eingetippte URL erreichbar.
 */
export const artistNav: NavItem[] = [
  { label: 'Profil', href: '/profil', icon: User, primary: true,
    aliases: ['/profile', '/profile-setup'] },
  { label: 'Meine Anfragen', href: '/meine-anfragen', icon: Inbox, primary: true },
  { label: 'Meine Gigs', href: '/meine-gigs', icon: CalendarCheck, primary: true,
    aliases: ['/gigs'] },
  { label: 'Kalender', href: '/kalender', icon: Calendar, primary: true,
    aliases: ['/calendar'] },
  { label: 'Buchhaltung', href: '/buchhaltung', icon: Receipt },
  { label: 'Richtlinien', href: '/richtlinien', icon: BookOpen },
];

export const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, primary: true,
    aliases: ['/admin/dashboard'] },
  { label: 'Künstler', href: '/admin/kuenstler', icon: Users, primary: true,
    aliases: ['/admin/artists'], badge: 'pendingArtists' },
  { label: 'Anstehende Gigs', href: '/admin/anstehende-gigs', icon: CalendarCheck, primary: true },
  { label: 'Rechnungen', href: '/admin/rechnungen', icon: Receipt, primary: true },
];

export const AREA_LABEL: Record<NavArea, string> = {
  artist: 'Künstler',
  admin: 'Admin',
};

/** Startseite eines Bereichs — Ziel des Umschalters. */
export const AREA_HOME: Record<NavArea, string> = {
  artist: '/profil',
  admin: '/admin',
};

export function areaForPath(pathname: string): NavArea {
  return pathname === '/admin' || pathname.startsWith('/admin/') ? 'admin' : 'artist';
}

export function navFor(area: NavArea): NavItem[] {
  return area === 'admin' ? adminNav : artistNav;
}

/** Alle Pfade, unter denen ein Eintrag erreichbar ist. */
function pathsOf(item: NavItem): string[] {
  return [item.href, ...(item.aliases ?? [])];
}

/**
 * Der Eintrag, der zum aktuellen Pfad gehört — als `href` zurückgegeben.
 *
 * Der längste passende Pfad gewinnt. Vorher wurde auf Gleichheit geprüft,
 * dadurch war auf Unterseiten wie
 * `/admin/requests/12/offers/3/edit` *kein* Eintrag markiert und man wusste
 * nicht mehr, wo man ist. Der Präfixvergleich braucht die Grenze `/`, sonst
 * würde `/admin` auch bei `/administration` anspringen.
 */
export function activeHref(pathname: string, items: NavItem[]): string | null {
  let best: string | null = null;
  let bestLength = -1;

  for (const item of items) {
    for (const path of pathsOf(item)) {
      if (path === '/') continue; // würde auf alles passen
      const matches = pathname === path || pathname.startsWith(`${path}/`);
      if (matches && path.length > bestLength) {
        best = item.href;
        bestLength = path.length;
      }
    }
  }

  return best;
}

/** Die Einträge für die Tab-Leiste auf dem Handy. */
export function primaryItems(items: NavItem[]): NavItem[] {
  return items.filter((item) => item.primary);
}

/** Die Einträge, die auf dem Handy nur über „Mehr" erreichbar sind. */
export function secondaryItems(items: NavItem[]): NavItem[] {
  return items.filter((item) => !item.primary);
}
