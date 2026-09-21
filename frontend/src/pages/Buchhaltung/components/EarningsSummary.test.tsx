/**
 * Ein Artist, dessen Profil noch in Prüfung ist, bekommt vom Backend auf
 * `/api/requests/requests` ein 403 ("Artist not approved yet"). Das ist der
 * normale Zustand während der Prüfung — vorher stand darum "HTTP 403" rot
 * unter der Verdienstübersicht, als hätte er etwas kaputt gemacht.
 *
 * Die Tests ziehen die Texte aus de.json statt sie zu erfinden. So fällt hier
 * auch auf, wenn ein Schlüssel fehlt.
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import de from '@/locales/de.json';
import EarningsSummary from './EarningsSummary';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      const value = key.split('.').reduce<unknown>(
        (acc, part) => (acc as Record<string, unknown> | undefined)?.[part],
        de as unknown,
      );
      if (typeof value !== 'string') return key;
      return value.replace(/\{\{(\w+)\}\}/g, (_m, name) => String(opts?.[name] ?? ''));
    },
  }),
}));

const summen = {
  month: { total: 0, count: 0 },
  year: { total: 0, count: 0 },
};

const texte = de.accounting.earnings.awaitingApproval;

describe('Verdienstübersicht', () => {
  it('erklärt die leere Übersicht, solange das Profil in Prüfung ist', () => {
    render(<EarningsSummary {...summen} approvalStatus="pending" />);

    expect(screen.getByText(texte.pending)).toBeInTheDocument();
  });

  it('nennt den eigenen Grund, wenn das Profil noch gar nicht abgeschickt ist', () => {
    render(<EarningsSummary {...summen} approvalStatus="unsubmitted" />);

    expect(screen.getByText(texte.unsubmitted)).toBeInTheDocument();
  });

  it('zeigt keinen Hinweis, wenn das Profil freigegeben ist', () => {
    render(<EarningsSummary {...summen} approvalStatus="approved" />);

    expect(screen.queryByText(texte.pending)).not.toBeInTheDocument();
  });

  it('zeigt echte Fehler weiterhin an', () => {
    render(<EarningsSummary {...summen} error="Anfragen konnten nicht geladen werden" />);

    expect(screen.getByText('Anfragen konnten nicht geladen werden')).toBeInTheDocument();
    expect(screen.queryByText(texte.pending)).not.toBeInTheDocument();
  });
});
