/**
 * Lade-, Fehler- und Leerzustände für die Dashboard-Seiten.
 *
 * Vorher machte jede Seite ihr eigenes Ding: „⏳ Lädt…" auf einer, ein
 * unformatierter Satz auf der nächsten, und ein leeres Ergebnis sah oft aus wie
 * ein Fehler. Ein Leerzustand soll sagen, warum nichts da ist und was als
 * nächstes zu tun wäre.
 */

import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react';
import type { ElementType, ReactNode } from 'react';

import { cn } from '@/lib/utils';

/** Platzhalterkarten während des Ladens — kein Springen, wenn die Daten kommen. */
export function LoadingSkeleton({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn('space-y-3', className)} aria-busy="true" aria-live="polite">
      <span className="sr-only">Inhalt wird geladen</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="skeleton-pulse rounded-2xl border border-white/10 bg-white/5 p-5"
          aria-hidden="true"
        >
          <div className="h-4 w-2/5 rounded bg-white/10" />
          <div className="mt-3 h-3 w-1/4 rounded bg-white/10" />
          <div className="mt-2 h-3 w-3/5 rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-red-200">Das hat nicht geklappt</p>
          {/* break-words, weil hier auch Servermeldungen mit langen URLs
              landen — die schoben die Karte sonst seitlich aus dem Bild. */}
          <p className="mt-1 break-words text-sm text-red-200/80">{message}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-400/40 px-3 py-2 text-sm font-medium text-red-100 transition-colors hover:bg-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Erneut versuchen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  hint,
  action,
}: {
  icon?: ElementType;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
        <Icon className="h-6 w-6 text-gray-500" aria-hidden="true" />
      </div>
      <p className="mt-4 font-medium text-gray-200">{title}</p>
      {hint && <p className="mx-auto mt-1.5 max-w-md text-sm text-gray-500">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
