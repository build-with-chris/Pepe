/**
 * Angebotsseite mit Antworten, wie die Admin-Routen sie liefern.
 *
 * Der heikle Teil ist das Speichern: Gibt es zur Anfrage noch kein Angebot,
 * wird eins angelegt (POST). Gibt es eins, wird genau dieses geändert (PUT),
 * und zwar unter seiner eigenen ID, nicht unter der ID aus der Adresse.
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route as RouterRoute, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { callsTo, stubFetch, type Route } from '@/test/pageMocks';
import OfferEditPage from './OfferEditPage';

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

vi.mock('@/components/DashboardLayout', () => ({
  DashboardLayout: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

/** Wie `list_all_requests()` in backend/routes/admin_routes.py. */
const request12 = {
  id: 12,
  client_name: 'Muster GmbH',
  client_email: 'events@muster.example',
  event_date: '2026-12-12',
  event_time: '19:00:00',
  duration_minutes: 30,
  event_type: 'Firmenfeier',
  show_discipline: 'Zauberer',
  team_size: 1,
  number_of_guests: 120,
  event_address: 'Leopoldstr. 1, 80802 München',
  is_indoor: true,
  special_requests: null,
  needs_light: false,
  needs_sound: true,
  status: 'offen',
  price_min: 1200,
  price_max: 1800,
  recommended_price_min: 1200,
  recommended_price_max: 1800,
  price_offered: null,
  artist_ids: [3],
};

const base: Route[] = [
  { match: '/api/admin/requests/all', body: [request12, { ...request12, id: 13, client_name: 'Andere AG' }] },
  { match: '/api/admin/requests/12/artist_status', body: [{ artist_id: 3, status: 'angefragt', requested_gage: 900 }] },
  { match: '/api/artists', body: [{ id: 3, name: 'Mira Beispiel' }, { id: 4, name: 'Jonas Muster' }] },
];

function renderPage(path = '/admin/requests/12/offers/12/edit') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <RouterRoute path="/admin/requests/:reqId/offers/:offerId/edit" element={<OfferEditPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

const priceField = () => screen.getByLabelText('Kundenpreis') as HTMLInputElement;
// Der Knopf heisst „Angebot anlegen", solange es keins gibt, danach „Angebot speichern".
const saveButton = () => screen.getByRole('button', { name: /^Angebot (anlegen|speichern)$/ });

beforeEach(() => {
  vi.unstubAllGlobals();
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

describe('Angebot bearbeiten', () => {
  it('zeigt die Anfrage und den angefragten Artist mit Namen', async () => {
    stubFetch([...base, { match: '/api/admin/requests/12/admin_offers', body: [] }]);
    renderPage();

    expect(await screen.findByText('Muster GmbH')).toBeInTheDocument();
    expect(screen.getByText('Leopoldstr. 1, 80802 München')).toBeInTheDocument();
    expect(screen.getByText('30 Minuten')).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByText('Mira Beispiel').length).toBeGreaterThan(0));
    // Die andere Anfrage aus derselben Liste gehört nicht hierher.
    expect(screen.queryByText('Andere AG')).toBeNull();
  });

  it('schlägt ohne Angebot die Empfehlung vor und legt beim Speichern eins an', async () => {
    const calls = stubFetch([
      ...base,
      { match: '/api/admin/requests/12/admin_offers', body: [] },
      { method: 'POST', match: '/api/admin/requests/12/admin_offers', status: 201, body: { id: 44 } },
      { method: 'PUT', match: '/api/admin/admin_offers/44', body: { id: 44, override_price: 1500, notes: '' } },
    ]);
    renderPage();
    await screen.findByText('Muster GmbH');

    expect(priceField().value).toBe('1200');
    fireEvent.change(priceField(), { target: { value: '1500' } });
    fireEvent.click(saveButton());

    expect(await screen.findByText('Angebot gespeichert.')).toBeInTheDocument();
    const created = callsTo(calls, 'POST', '/api/admin/requests/12/admin_offers');
    expect(created).toHaveLength(1);
    expect(created[0].body).toEqual({ override_price: 1500, notes: '' });

    // Zweites Speichern ändert das eben angelegte Angebot, statt ein weiteres
    // anzulegen.
    fireEvent.click(saveButton());
    await waitFor(() => expect(callsTo(calls, 'PUT', '/api/admin/admin_offers/44')).toHaveLength(1));
    expect(callsTo(calls, 'POST', '/admin_offers')).toHaveLength(1);
  });

  it('ändert ein vorhandenes Angebot unter dessen eigener ID', async () => {
    const calls = stubFetch([
      ...base,
      {
        match: '/api/admin/requests/12/admin_offers',
        body: [{ id: 5, request_id: 12, admin_id: 1, override_price: 2100, notes: 'mit Anfahrt', created_at: '2026-11-21T08:00:00' }],
      },
      { method: 'PUT', match: '/api/admin/admin_offers/5', body: { id: 5, override_price: 2100, notes: 'mit Anfahrt' } },
    ]);
    renderPage();
    await screen.findByText('Muster GmbH');

    expect(priceField().value).toBe('2100');
    expect(screen.getByLabelText(/Anmerkung/)).toHaveValue('mit Anfahrt');

    fireEvent.click(saveButton());

    expect(await screen.findByText('Angebot gespeichert.')).toBeInTheDocument();
    // Die ID in der Adresse (12) ist die der Anfrage, nicht die des Angebots.
    expect(callsTo(calls, 'PUT', '/api/admin/admin_offers/5')).toHaveLength(1);
    expect(callsTo(calls, 'PUT', '/api/admin/admin_offers/12')).toHaveLength(0);
    expect(callsTo(calls, 'POST', '/admin_offers')).toHaveLength(0);
  });

  it('speichert keinen Preis von 0', async () => {
    const calls = stubFetch([...base, { match: '/api/admin/requests/12/admin_offers', body: [] }]);
    renderPage();
    await screen.findByText('Muster GmbH');

    fireEvent.change(priceField(), { target: { value: '0' } });
    fireEvent.click(saveButton());

    expect(await screen.findByText(/groesser als 0/)).toBeInTheDocument();
    expect(callsTo(calls, 'POST', '/admin_offers')).toHaveLength(0);
  });

  it('meldet eine Anfrage, die es nicht gibt', async () => {
    stubFetch([
      { match: '/api/admin/requests/all', body: [request12] },
      { match: '/api/admin/requests/99/admin_offers', body: [] },
      { match: '/api/admin/requests/99/artist_status', body: [] },
    ]);
    renderPage('/admin/requests/99/offers/99/edit');

    expect(await screen.findByText('Anfrage 99 nicht gefunden.')).toBeInTheDocument();
  });

  it('meldet den Grund, wenn das Speichern scheitert', async () => {
    stubFetch([
      ...base,
      { match: '/api/admin/requests/12/admin_offers', body: [] },
      { method: 'POST', match: '/api/admin/requests/12/admin_offers', status: 403, body: { error: 'forbidden', message: 'Current user not linked to an artist' } },
    ]);
    renderPage();
    await screen.findByText('Muster GmbH');

    fireEvent.click(saveButton());

    expect(await screen.findByText(/Speichern fehlgeschlagen: .*not linked to an artist/)).toBeInTheDocument();
  });
});
