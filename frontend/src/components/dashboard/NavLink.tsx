/**
 * Ein Eintrag der Seitenleiste. Eigene Komponente, damit Seitenleiste und
 * „Mehr"-Schublade auf dem Handy garantiert gleich aussehen.
 */

import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';
import type { NavItem } from './nav';

interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
  badgeCount?: number | null;
  onNavigate?: () => void;
}

export function NavLink({ item, isActive, badgeCount, onNavigate }: NavLinkProps) {
  const Icon = item.icon;
  const showBadge = !!item.badge && !!badgeCount;

  return (
    <Link
      to={item.href}
      onClick={onNavigate}
      // aria-current sagt Screenreadern, welche Seite offen ist. Die Farbe
      // allein tut das nicht.
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'group flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pepe-gold',
        isActive
          ? 'bg-pepe-gold/10 text-pepe-gold'
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
      )}
    >
      <Icon
        className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-pepe-gold')}
        aria-hidden="true"
      />
      <span className="flex-1 truncate">{item.label}</span>
      {showBadge && (
        <>
          <span
            className="min-w-[1.5rem] rounded-full bg-pepe-gold px-1.5 py-0.5 text-center text-xs font-semibold text-pepe-black"
            aria-hidden="true"
          >
            {badgeCount}
          </span>
          <span className="sr-only">{`${badgeCount} warten auf Freigabe`}</span>
        </>
      )}
    </Link>
  );
}

export default NavLink;
