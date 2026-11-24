/**
 * Kalender mit Antworten, wie `/api/availability` sie liefert.
 *
 * Die Seite lädt in mehreren Effekten, die voneinander abhängen. Der Test
 * achtet deshalb besonders darauf, dass nichts in eine Schleife läuft: ein
 * Abruf der Artist-ID, ein Abruf der Verfügbarkeiten, ein Eintrag für den Tag
 * in einem Jahr.
 */

import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { callsTo, stubFetch } from '@/test/pageMocks';
import { formatISODate } from '@/utils/calendar';
import Kalender from './Kalender';

const authState = {
  token: 'test-token' as string | null,
  user: { email: 'mira@example.com', approval_status: 'approved' } as {
    email: string;
    approval_status: string;
  } | null,
};

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => authState,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: ({ i18nKey }: { i18nKey: string }) => <>{i18nKey}</>,
}));

vi.mock('@/components/DashboardLayout', () => ({
  DashboardLayout: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

const inDays = (days: number) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return formatISODate(d);
};

/** Gibt den Effekten Zeit, sich zu beruhigen, bevor gezählt wird. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 150));

beforeEach(() => {
  vi.unstubAllGlobals();
  vi.spyOn(console, 'log').mockImplementation(() => {});
  authState.token = 'test-token';
  authState.user = { email: 'mira@example.com', approval_status: 'approved' };
});

describe('Kalender', () => {
  it('zeigt den Kalender und lädt jede Quelle genau einmal', async () => {
    const calls = stubFetch([
      { match: '/api/artists/me', body: { id: 7, approval_status: 'approved' } },
      // Der Tag in einem Jahr ist schon eingetragen, also kein automatischer Eintrag.
      {
        match: '/api/availability',
        body: [
          { id: 1, artist_id: 7, date: inDays(1) },
          { id: 2, artist_id: 7, date: inDays(365) },
        ],
      },
    ]);
    render(
      <MemoryRouter>
        <Kalender />
      </MemoryRouter>,
    );

    await waitFor(() => expect(callsTo(calls, 'GET', '/api/availability')).toHaveLength(1));
    await settle();

    // Erst nach dem Laden prüfen: Der Kalender baut sein Raster dabei neu auf.
    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(callsTo(calls, 'GET', '/api/artists/me')).toHaveLength(1);
    expect(callsTo(calls, 'GET', '/api/availability')).toHaveLength(1);
    expect(callsTo(calls, 'POST', '/api/availability')).toHaveLength(0);
    expect(screen.queryByText(/konnte nicht/)).toBeNull();
  });

  it('trägt den Tag in einem Jahr genau einmal nach, wenn er fehlt', async () => {
    const calls = stubFetch([
      { match: '/api/artists/me', body: { id: 7, approval_status: 'approved' } },
      { match: '/api/availability', body: [{ id: 1, artist_id: 7, date: inDays(1) }] },
      { method: 'POST', match: '/api/availability', status: 201, body: { id: 9 } },
    ]);
    render(
      <MemoryRouter>
        <Kalender />
      </MemoryRouter>,
    );

    await waitFor(() => expect(callsTo(calls, 'POST', '/api/availability')).toHaveLength(1));
    await settle();

    const posts = callsTo(calls, 'POST', '/api/availability');
    expect(posts).toHaveLength(1);
    expect(posts[0].body).toEqual({ date: inDays(365) });
  });

  it('zeigt den Grund, wenn die Verfügbarkeiten nicht laden', async () => {
    stubFetch([
      { match: '/api/artists/me', body: { id: 7, approval_status: 'approved' } },
      { match: '/api/availability', status: 500, body: { error: 'internal_error', message: 'Datenbank nicht erreichbar' } },
      { method: 'POST', match: '/api/availability', status: 201, body: { id: 9 } },
    ]);
    render(
      <MemoryRouter>
        <Kalender />
      </MemoryRouter>,
    );

    expect(await screen.findByText(/Datenbank nicht erreichbar/)).toBeInTheDocument();
  });

  it('zeigt ohne Freigabe einen Hinweis statt des Kalenders', async () => {
    authState.user = { email: 'neu@example.com', approval_status: 'pending' };
    const calls = stubFetch([{ match: '/api/artists/me', body: { id: 8, approval_status: 'pending' } }]);
    render(
      <MemoryRouter>
        <Kalender />
      </MemoryRouter>,
    );

    expect(await screen.findByText(/Sobald dein Profil freigeschaltet wurde/)).toBeInTheDocument();
    expect(screen.queryByRole('grid')).toBeNull();
    await settle();
    expect(callsTo(calls, 'GET', '/api/availability')).toHaveLength(0);
  });
});
