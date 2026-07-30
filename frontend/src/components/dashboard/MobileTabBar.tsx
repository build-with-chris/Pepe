/**
 * Tab-Leiste am unteren Bildschirmrand, nur auf dem Handy.
 *
 * Vorher ging jeder Seitenwechsel über das Hamburger-Menü: antippen, Menü
 * lesen, Ziel antippen. Jetzt ein Antippen für die vier wichtigsten Ziele.
 * Unten, weil dort der Daumen hinreicht.
 */

import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';
import type { NavItem } from './nav';

interface MobileTabBarProps {
  items: NavItem[];
  activeHref: string | null;
  badgeCounts: { pendingArtists?: number | null };
  onOpenMore: () => void;
  moreIsHighlighted: boolean;
}

export function MobileTabBar({
  items,
  activeHref,
  badgeCounts,
  onOpenMore,
  moreIsHighlighted,
}: MobileTabBarProps) {
  return (
    <nav
      aria-label="Hauptnavigation"
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 lg:hidden',
        'border-t border-white/10 bg-pepe-dark/95 backdrop-blur-xl',
        // Der Balken auf iPhones ohne Home-Button darf die Felder nicht
        // ueberdecken.
        'pb-[env(safe-area-inset-bottom)]'
      )}
    >
      <ul className="flex list-none items-stretch">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeHref === item.href;
          const badge = item.badge ? badgeCounts[item.badge] : null;

          return (
            <li key={item.href} className="flex-1">
              <Link
                to={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  // min-h-14: Fingerspitzen brauchen rund 44px, hier mit Luft.
                  'relative flex min-h-14 flex-col items-center justify-center gap-1 px-1 py-2',
                  'text-[11px] font-medium leading-none transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-pepe-gold',
                  isActive ? 'text-pepe-gold' : 'text-gray-400 active:text-white'
                )}
              >
                <span className="relative">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {!!badge && (
                    <span
                      className="absolute -right-2 -top-1.5 min-w-[1.1rem] rounded-full bg-pepe-gold px-1 text-[10px] font-bold leading-4 text-pepe-black"
                      aria-hidden="true"
                    >
                      {badge}
                    </span>
                  )}
                </span>
                <span className="w-full truncate text-center">{item.label}</span>
                {!!badge && <span className="sr-only">{`, ${badge} offen`}</span>}
              </Link>
            </li>
          );
        })}

        <li className="flex-1">
          <button
            type="button"
            onClick={onOpenMore}
            aria-haspopup="dialog"
            className={cn(
              'flex min-h-14 w-full flex-col items-center justify-center gap-1 px-1 py-2',
              'text-[11px] font-medium leading-none transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-pepe-gold',
              moreIsHighlighted ? 'text-pepe-gold' : 'text-gray-400 active:text-white'
            )}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
            <span>Mehr</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default MobileTabBar;
