/**
 * Admin-Dashboard mit einer Antwort, wie `/api/admin/dashboard` sie liefert.
 *
 * Die Seite ist nur mit Admin-Login erreichbar. Der Test stellt sicher, dass
 * sie mit den echten Feldnamen des Backends umgehen kann: Liste, Suche,
 * Annehmen und der Fehlerfall.
 */

import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { callsTo, stubFetch } from '@/test/pageMocks';
import Admin from './Admin';

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ token: 'test-token', getFreshToken: async () => 'fresh-token' }),
}));

vi.mock('@/components/DashboardLayout', () => ({
  DashboardLayout: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

// SEO braucht einen HelmetProvider und trägt zur Seite nichts Sichtbares bei.
vi.mock('@/components/SEO', () => ({ default: () => null }));

/** Wie `dashboard()` in backend/routes/admin_routes.py. */
const dashboard = {
  slots: [{ id: 1, artist_id: 3, date: '2026-12-01' }],
  offers: [
    {
      id: 11,
      client_name: 'Muster GmbH',
      client_email: 'events@muster.example',
      event_date: '2026-12-12',
      event_time: '19:00:00',
      event_type: 'Firmenfeier',
      event_address: 'Leopoldstr. 1, 80802 München',
      show_discipline: 'Zauberer',
      duration_minutes: 30,
      team_size: 1,
      number_of_guests: 120,
      is_indoor: true,
      special_requests: null,
      needs_light: false,
      needs_sound: false,
      status: 'offen',
      created_at: '2026-11-20T10:00:00',
      price_min: 1200,
      price_max: 1800,
      price_offered: null,
    },
    {
      id: 12,
      client_name: 'Hochzeit Berger',
      client_email: 'berger@example.com',
      event_date: '2027-06-05',
      event_time: null,
      event_type: 'Private Feier',
      event_address: 'Reeperbahn 1, 20359 Hamburg',
      show_discipline: 'Luftakrobatik',
      duration_minutes: 20,
      team_size: 2,
      number_of_guests: 80,
      is_indoor: false,
      special_requests: 'Bitte ohne Feuer',
      needs_light: true,
      needs_sound: true,
      status: 'akzeptiert',
      created_at: '2026-11-22T09:30:00',
      price_min: 2400,
      price_max: 3600,
      price_offered: 3000,
    },
  ],
};

function renderAdmin() {
  return render(
    <MemoryRouter>
      <Admin />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe('Admin-Dashboard', () => {
  it('zeigt die Anfragen mit Kunde, Ort und Preis', async () => {
    const calls = stubFetch([{ match: '/api/admin/dashboard', body: dashboard }]);
    renderAdmin();

    expect(await screen.findByText('Muster GmbH')).toBeInTheDocument();
    expect(screen.getByText('Hochzeit Berger')).toBeInTheDocument();
    expect(screen.getByText('München')).toBeInTheDocument();
    // Ohne Angebot die Empfehlung, mit Angebot der angebotene Preis.
    expect(screen.getByText(/1\.200.*1\.800/)).toBeInTheDocument();
    expect(screen.getByText(/3\.000/)).toBeInTheDocument();

    // Der Abruf läuft mit einem frischen Token, und genau einmal.
    expect(callsTo(calls, 'GET', '/api/admin/dashboard')).toHaveLength(1);
  });

  it('filtert über die Suche nach dem Kundennamen', async () => {
    stubFetch([{ match: '/api/admin/dashboard', body: dashboard }]);
    renderAdmin();
    await screen.findByText('Muster GmbH');

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'berger' } });

    expect(screen.queryByText('Muster GmbH')).toBeNull();
    expect(screen.getByText('Hochzeit Berger')).toBeInTheDocument();
  });

  it('nimmt eine Anfrage an und meldet das', async () => {
    const calls = stubFetch([
      { match: '/api/admin/dashboard', body: dashboard },
      { method: 'PUT', match: '/api/requests/requests/11/accept', body: { id: 11, status: 'akzeptiert' } },
    ]);
    renderAdmin();

    const row = (await screen.findByText('Muster GmbH')).closest('li') as HTMLElement;
    fireEvent.click(within(row).getByRole('button', { name: 'Annehmen' }));

    expect(await screen.findByText('Anfrage #11 ist angenommen.')).toBeInTheDocument();
    expect(callsTo(calls, 'PUT', '/api/requests/requests/11/accept')).toHaveLength(1);
  });

  it('meldet einen Fehler beim Annehmen mit dem Grund', async () => {
    stubFetch([
      { match: '/api/admin/dashboard', body: dashboard },
      { method: 'PUT', match: '/accept', status: 500, body: { error: 'internal_error' } },
    ]);
    renderAdmin();

    const row = (await screen.findByText('Muster GmbH')).closest('li') as HTMLElement;
    fireEvent.click(within(row).getByRole('button', { name: 'Annehmen' }));

    expect(
      await screen.findByText('Anfrage #11 konnte nicht angenommen werden: HTTP 500'),
    ).toBeInTheDocument();
  });

  it('zeigt eine Fehlermeldung, wenn das Dashboard nicht lädt', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    stubFetch([{ match: '/api/admin/dashboard', status: 403, body: { error: 'forbidden' } }]);
    renderAdmin();

    await waitFor(() => expect(screen.getByText(/HTTP 403/)).toBeInTheDocument());
    expect(screen.queryByText('Muster GmbH')).toBeNull();
  });

  it('kommt mit einer Antwort ohne Anfragen zurecht', async () => {
    stubFetch([{ match: '/api/admin/dashboard', body: { slots: [], offers: [] } }]);
    renderAdmin();

    // Kein Absturz, keine Zeilen, dafür ein Leerzustand.
    await waitFor(() => expect(screen.queryAllByRole('listitem')).toHaveLength(0));
    expect(screen.queryByText(/HTTP/)).toBeNull();
  });
});
