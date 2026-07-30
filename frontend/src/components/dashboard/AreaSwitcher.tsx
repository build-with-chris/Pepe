/**
 * Umschalter zwischen Künstler-Portal und Admin-Bereich.
 *
 * Nur für Admins sichtbar. Vorher wurden beide Bereiche zu einer Liste mit neun
 * Einträgen zusammengelegt, getrennt nur durch zwei kleine Zwischentitel — man
 * sah nicht, in welchem Bereich man gerade war.
 */

import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';
import { AREA_HOME, AREA_LABEL, type NavArea } from './nav';

interface AreaSwitcherProps {
  current: NavArea;
  /** Offene Freigaben. Wird am Admin-Feld als Punkt angezeigt. */
  pendingCount?: number | null;
  onNavigate?: () => void;
}

const AREAS: NavArea[] = ['artist', 'admin'];

export function AreaSwitcher({ current, pendingCount, onNavigate }: AreaSwitcherProps) {
  return (
    <div
      // role=tablist waere falsch: Das sind echte Links auf eigene Seiten,
      // keine Reiter, die Inhalt im selben Dokument tauschen.
      aria-label="Bereich wechseln"
      className="flex gap-1 rounded-xl bg-white/5 p-1"
    >
      {AREAS.map((area) => {
        const isCurrent = area === current;
        const showDot = area === 'admin' && !isCurrent && !!pendingCount;

        return (
          <Link
            key={area}
            to={AREA_HOME[area]}
            onClick={onNavigate}
            aria-current={isCurrent ? 'page' : undefined}
            className={cn(
              'relative flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pepe-gold',
              isCurrent
                ? 'bg-pepe-gold/15 text-pepe-gold'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            )}
          >
            {AREA_LABEL[area]}
            {showDot && (
              <span
                className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-pepe-gold"
                aria-hidden="true"
              />
            )}
            {showDot && (
              <span className="sr-only">
                {`, ${pendingCount} Künstler warten auf Freigabe`}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

export default AreaSwitcher;
