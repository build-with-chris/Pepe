/**
 * Rahmen für Künstler-Portal und Admin-Bereich.
 *
 * Aufbau: feste Seitenleiste ab 1024px, darunter eine Tab-Leiste am unteren
 * Rand mit den vier wichtigsten Zielen und einer „Mehr"-Schublade für den Rest.
 *
 * Was sich gegenüber vorher geändert hat und warum:
 *
 * - **Ein Bereich zur Zeit.** Für Admins wurden Admin- und Künstler-Ziele zu
 *   einer Liste mit neun Einträgen zusammengelegt. Jetzt zeigt die Leiste den
 *   Bereich, in dem man ist, und oben steht ein Umschalter.
 * - **Ein Antippen auf dem Handy.** Vorher lief jeder Seitenwechsel über das
 *   Hamburger-Menü, also drei Schritte.
 * - **Markierung auf Unterseiten.** Die Prüfung war `pathname === href`, auf
 *   `/admin/requests/12/offers/3/edit` war deshalb nichts markiert.
 * - **Inhalt zentriert.** `max-w-5xl` ohne `mx-auto` klebte auf breiten
 *   Bildschirmen am linken Rand.
 * - **Seitenleiste scrollt.** Der untere Bereich lag `absolute` über der
 *   Navigation und verdeckte auf niedrigen Fenstern die letzten Einträge.
 * - **Farben über Tokens** (`pepe-gold`, `pepe-coal`, …) statt Hex-Werte.
 */

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { Home } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { AreaSwitcher } from './dashboard/AreaSwitcher';
import { MobileTabBar } from './dashboard/MobileTabBar';
import { MoreSheet } from './dashboard/MoreSheet';
import { NavLink } from './dashboard/NavLink';
import { usePendingArtistCount } from './dashboard/usePendingArtistCount';
import {
  activeHref as findActiveHref,
  areaForPath,
  navFor,
  primaryItems,
  secondaryItems,
} from './dashboard/nav';

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
  /** Wird als `<h1>` der Seite ausgegeben. */
  title?: string;
  /** Kurze Erklärung unter dem Titel. */
  description?: string;
  /** Knöpfe rechts neben dem Titel, etwa „Neu anlegen". */
  actions?: React.ReactNode;
}

export function DashboardLayout({
  children,
  className = '',
  title,
  description,
  actions,
}: DashboardLayoutProps) {
  const location = useLocation();
  const { user, token } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  // Adminrechte kommen aus der DB (artists.is_admin), geliefert von
  // /api/artists/me — nicht aus den Clerk-Metadaten.
  const isAdmin = user?.is_admin === true;

  const area = areaForPath(location.pathname);
  const items = navFor(area);
  const activeHref = findActiveHref(location.pathname, items);
  const pendingCount = usePendingArtistCount(token, isAdmin);

  const primary = primaryItems(items);
  const secondary = secondaryItems(items);

  // Ein Seitenwechsel schliesst die Schublade. Ohne das bleibt sie beim
  // Zurück-Knopf des Browsers offen stehen.
  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

  return (
    <div className={cn('min-h-screen bg-pepe-coal', className)}>
      {/* Tastaturnutzer springen an den Inhalt, ohne durch die ganze
          Navigation zu tabben. */}
      <a
        href="#dashboard-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-pepe-gold focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-pepe-black"
      >
        Zum Inhalt springen
      </a>

      {/* Seitenleiste, ab lg dauerhaft sichtbar. Darunter ersetzt die
          Tab-Leiste unten sie vollständig. */}
      <aside
        aria-label="Seitennavigation"
        className="fixed left-0 top-0 z-40 hidden h-full flex-col border-r border-white/10 bg-pepe-dark lg:flex"
        style={{ width: 'var(--sidebar-width)' }}
      >
        <div className="flex h-20 flex-shrink-0 items-center border-b border-white/10 px-6">
          <Link
            to="/"
            className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pepe-gold"
          >
            <img
              src="/logos/SVG/PEPE_logos_shows.svg"
              alt="Pepe Shows, zur Startseite"
              className="h-10 w-auto"
              width={120}
              height={40}
            />
          </Link>
        </div>

        {isAdmin && (
          <div className="flex-shrink-0 px-4 pt-5">
            <AreaSwitcher current={area} pendingCount={pendingCount} />
          </div>
        )}

        {/* min-h-0 ist Pflicht, damit overflow-y in einem Flex-Kind greift. */}
        <nav aria-label="Hauptnavigation" className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
          <ul className="list-none space-y-1">
            {items.map((item) => (
              <li key={item.href}>
                <NavLink
                  item={item}
                  isActive={activeHref === item.href}
                  badgeCount={item.badge === 'pendingArtists' ? pendingCount : null}
                />
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex-shrink-0 border-t border-white/10 px-4 py-4">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-gray-500 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pepe-gold"
          >
            <Home className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            Zur Website
          </Link>
        </div>
      </aside>

      <div className="main-content-area">
        <header className="sticky top-0 z-30 border-b border-white/5 bg-pepe-coal/95 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            {/* Auf dem Handy steht hier das Logo, denn die Seitenleiste mit
                dem Logo gibt es dort nicht mehr. */}
            <Link
              to="/"
              className="flex-shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pepe-gold lg:hidden"
            >
              <img
                src="/logos/SVG/PEPE_logos_shows.svg"
                alt="Pepe Shows, zur Startseite"
                className="h-8 w-auto"
                width={96}
                height={32}
              />
            </Link>

            <span className="hidden truncate text-sm text-gray-500 lg:block">
              {area === 'admin' ? 'Admin-Bereich' : 'Künstler-Portal'}
            </span>

            <div className="flex flex-shrink-0 items-center gap-2">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-9 h-9',
                    userButtonPopoverCard: 'bg-pepe-surface border border-white/10 shadow-xl',
                    userButtonPopoverActions: '!bg-transparent',
                    userButtonPopoverActionButton: '!text-white hover:!bg-white/10',
                    userButtonPopoverActionButtonText: '!text-white',
                    userButtonPopoverActionButtonIcon: '!text-white',
                    userButtonPopoverMain: '!bg-transparent',
                    userPreviewMainIdentifier: '!text-white',
                    userPreviewSecondaryIdentifier: '!text-gray-400',
                    userButtonPopoverFooter: 'hidden',
                  },
                }}
              />
            </div>
          </div>
        </header>

        <main
          id="dashboard-content"
          // Nur pt-, kein py-: Den unteren Abstand setzt `.dashboard-main` in
          // index.css, weil dort die Hoehe der Tab-Leiste und die
          // Safe-Area-Einfassung des iPhones mit hineinrechnen. Beides in einer
          // Eigenschaft waere ein Wettlauf in der Kaskade.
          className="dashboard-main min-h-[calc(100vh-4rem)] px-4 pt-6 sm:px-6 lg:px-8 lg:pt-10"
        >
          <div className="mx-auto w-full max-w-6xl space-y-6">
            {(title || actions) && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  {title && (
                    <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">
                      {title}
                    </h1>
                  )}
                  {description && (
                    <p className="mt-1.5 max-w-2xl text-sm text-gray-400">{description}</p>
                  )}
                </div>
                {actions && <div className="flex flex-shrink-0 gap-2">{actions}</div>}
              </div>
            )}
            {children}
          </div>
        </main>
      </div>

      <MobileTabBar
        items={primary}
        activeHref={activeHref}
        badgeCounts={{ pendingArtists: pendingCount }}
        onOpenMore={() => setMoreOpen(true)}
        // „Mehr" wird mitmarkiert, wenn die offene Seite dort drin liegt —
        // sonst wirkt die Leiste auf Buchhaltung oder Richtlinien wie
        // „nirgends".
        moreIsHighlighted={moreOpen || secondary.some((item) => item.href === activeHref)}
      />

      <MoreSheet
        isOpen={moreOpen}
        onClose={() => setMoreOpen(false)}
        items={secondary}
        activeHref={activeHref}
        area={area}
        isAdmin={isAdmin}
        pendingCount={pendingCount}
      />
    </div>
  );
}

export default DashboardLayout;
