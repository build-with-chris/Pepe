/**
 * Das Verhalten, das ein überlagerndes Fenster braucht — und das die alte
 * Schublade nicht hatte: Escape schliesst, der Hintergrund scrollt nicht mit,
 * die Tab-Taste bleibt im Fenster, und danach steht der Fokus wieder auf dem
 * Knopf, der es geöffnet hat.
 *
 * Ohne das kann man die Schublade mit der Tastatur öffnen und dann nicht mehr
 * verlassen: Der Fokus wandert unsichtbar durch die Seite dahinter.
 */

import { useEffect, useRef } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function useDialog<T extends HTMLElement>(isOpen: boolean, onClose: () => void) {
  const ref = useRef<T | null>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  // Auf einem Ref, nicht in der Abhängigkeitsliste: Sonst würde ein neu
  // erzeugtes onClose den Effekt bei jedem Render neu aufsetzen und den Fokus
  // wieder umsetzen.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    lastFocused.current = document.activeElement as HTMLElement | null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const node = ref.current;
    // Kein Filter über `offsetParent`: Der ist bei `position: fixed` und ohne
    // Layout-Engine null, wodurch die Liste leer bliebe und der Fokus gar nicht
    // erst ins Fenster wanderte. Der Inhalt wird ohnehin nur gerendert, wenn er
    // sichtbar ist; `hidden` deckt den Rest ab.
    const focusables = () =>
      Array.from(node?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
        (el) => !el.closest('[hidden]')
      );

    focusables()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab') return;

      const items = focusables();
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      // Am Rand umlaufen, statt hinter das Fenster zu wandern.
      if (event.shiftKey && (active === first || !node?.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      lastFocused.current?.focus();
    };
  }, [isOpen]);

  return ref;
}
