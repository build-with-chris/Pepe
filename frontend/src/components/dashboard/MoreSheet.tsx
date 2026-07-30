/**
 * Die „Mehr"-Schublade auf dem Handy.
 *
 * Enthält, was nicht in die Tab-Leiste passt: den Bereichsumschalter für
 * Admins, die übrigen Ziele und den Weg zurück zur Website. Fährt von unten
 * ein, weil sie vom unteren Rand aus geöffnet wird.
 */

import { Home, X } from 'lucide-react';
import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';
import { AreaSwitcher } from './AreaSwitcher';
import { NavLink } from './NavLink';
import { useDialog } from './useDialog';
import type { NavArea, NavItem } from './nav';

interface MoreSheetProps {
  isOpen: boolean;
  onClose: () => void;
  items: NavItem[];
  activeHref: string | null;
  area: NavArea;
  isAdmin: boolean;
  pendingCount: number | null;
}

export function MoreSheet({
  isOpen,
  onClose,
  items,
  activeHref,
  area,
  isAdmin,
  pendingCount,
}: MoreSheetProps) {
  const sheetRef = useDialog<HTMLDivElement>(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Klick daneben schliesst. Bewusst kein <button>: Sonst gaebe es zwei
          Elemente mit dem Namen „Menü schliessen", und Screenreader-Nutzer
          bekaemen einen Knopf angeboten, der nur eine Flaeche ist. Fuer die
          Tastatur gibt es Escape und das X. */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="more-sheet-title"
        className={cn(
          'absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto',
          'rounded-t-2xl border-t border-white/10 bg-pepe-dark',
          'pb-[calc(1rem+env(safe-area-inset-bottom))]',
          // Eigene Keyframes in index.css. `tailwindcss-animate` ist in diesem
          // Projekt nicht eingebunden, `animate-in` waere wirkungslos.
          'sheet-slide-up'
        )}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-pepe-dark px-5 py-4">
          <h2 id="more-sheet-title" className="text-base font-semibold text-white">
            Menü
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Menü schliessen"
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pepe-gold"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-5 px-4 py-5">
          {isAdmin && (
            <AreaSwitcher current={area} pendingCount={pendingCount} onNavigate={onClose} />
          )}

          {items.length > 0 && (
            <nav aria-label="Weitere Ziele">
              <ul className="list-none space-y-1">
                {items.map((item) => (
                  <li key={item.href}>
                    <NavLink
                      item={item}
                      isActive={activeHref === item.href}
                      badgeCount={item.badge === 'pendingArtists' ? pendingCount : null}
                      onNavigate={onClose}
                    />
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <div className="border-t border-white/10 pt-4">
            <Link
              to="/"
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pepe-gold"
            >
              <Home className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              Zur Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MoreSheet;
