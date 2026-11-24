/**
 * Künstlerverwaltung mit Antworten, wie `/api/admin/artists` sie liefert.
 *
 * Geprüft wird der Weg, den ein Admin bei einer neuen Anmeldung geht: Liste
 * sehen, Profil öffnen, freigeben oder mit Begründung ablehnen.
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { callsTo, stubFetch, type Route } from '@/test/pageMocks';
import Artists from './Artists';

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

/** Wie die Liste in backend/routes/admin_routes.py, ohne `approval_status` im Fall „approved". */
const mira = {
  id: 3,
  name: 'Mira Beispiel',
  email: 'mira@example.com',
  phone_number: '+49 89 123456',
  address: 'Hauptstrasse 1, 80331 München, Deutschland',
  instagram: null,
  bio: 'Luftakrobatin aus München.',
  profile_image_url: null,
  gallery_urls: [],
  disciplines: ['Luftakrobatik'],
  price_min: 900,
  price_max: 1400,
  approval_status: 'pending',
  rejection_reason: null,
  approved_at: null,
  approved_by: null,
};

const jonas = { ...mira, id: 4, name: 'Jonas Muster', email: 'jonas@example.com', approval_status: 'approved' };

const lists: Route[] = [
  { match: '/api/admin/artists?status=pending', body: [mira] },
  { match: '/api/admin/artists?status=approved', body: [jonas] },
  { match: '/api/admin/artists?status=rejected', body: [] },
  { match: '/api/admin/artists?status=unsubmitted', body: [] },
];

function renderArtists() {
  return render(
    <MemoryRouter>
      <Artists />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe('Künstlerverwaltung', () => {
  it('lädt alle vier Statuslisten und zeigt die Artists', async () => {
    const calls = stubFetch(lists);
    renderArtists();

    expect(await screen.findByText('Mira Beispiel')).toBeInTheDocument();
    expect(screen.getByText('Jonas Muster')).toBeInTheDocument();
    expect(callsTo(calls, 'GET', '/api/admin/artists?status=')).toHaveLength(4);
    // Das Dashboard wurde hier früher mitgeladen, ohne dass jemand das
    // Ergebnis las.
    expect(callsTo(calls, 'GET', '/api/admin/dashboard')).toHaveLength(0);
  });

  it('gibt einen Artist frei und meldet den Mailversand', async () => {
    const calls = stubFetch([
      ...lists,
      {
        method: 'POST',
        match: '/api/admin/artists/3/approve',
        body: { email_sent: true, id: 3, status: 'approved', approved_at: '2026-11-24T15:00:00', approved_by: 1 },
      },
    ]);
    renderArtists();

    fireEvent.click(await screen.findByText('Mira Beispiel'));
    fireEvent.click(await screen.findByRole('button', { name: 'Freigeben' }));

    expect(await screen.findByText('E-Mail an den Artist wurde versendet.')).toBeInTheDocument();
    expect(callsTo(calls, 'POST', '/api/admin/artists/3/approve')).toHaveLength(1);
    // Freigegeben heisst: Der Knopf dafür ist weg.
    expect(screen.queryByRole('button', { name: 'Freigeben' })).toBeNull();
  });

  it('warnt, wenn die Mail zur Freigabe nicht rausging', async () => {
    stubFetch([
      ...lists,
      {
        method: 'POST',
        match: '/api/admin/artists/3/approve',
        body: { email_sent: false, id: 3, status: 'approved', approved_at: '2026-11-24T15:00:00', approved_by: 1 },
      },
    ]);
    renderArtists();

    fireEvent.click(await screen.findByText('Mira Beispiel'));
    fireEvent.click(await screen.findByRole('button', { name: 'Freigeben' }));

    expect(await screen.findByText(/keine E-Mail versendet/)).toBeInTheDocument();
  });

  it('lehnt nur mit Begründung ab und schickt sie mit', async () => {
    const calls = stubFetch([
      ...lists,
      {
        method: 'POST',
        match: '/api/admin/artists/3/reject',
        body: {
          email_sent: true,
          id: 3,
          status: 'rejected',
          rejection_reason: 'Bitte bessere Fotos hochladen',
          approved_at: null,
          approved_by: 1,
        },
      },
    ]);
    renderArtists();

    fireEvent.click(await screen.findByText('Mira Beispiel'));
    // Genau ein Weg zur Ablehnung. Ein zweiter Knopf „Reject" schickte früher
    // ohne Begründung los und endete in einer Fehlermeldung.
    expect(screen.queryByRole('button', { name: 'Reject' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Ablehnen' }));

    const send = screen.getByRole('button', { name: 'Ablehnung senden' });
    expect(send).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Grund der Ablehnung'), {
      target: { value: 'Bitte bessere Fotos hochladen' },
    });
    fireEvent.click(send);

    await waitFor(() => expect(callsTo(calls, 'POST', '/api/admin/artists/3/reject')).toHaveLength(1));
    expect(callsTo(calls, 'POST', '/reject')[0].body).toEqual({ reason: 'Bitte bessere Fotos hochladen' });
    expect((await screen.findAllByText('Bitte bessere Fotos hochladen')).length).toBeGreaterThan(0);
  });

  it('zeigt den Grund, wenn die Liste nicht lädt', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    stubFetch([{ match: '/api/admin/artists', status: 403, body: { error: 'forbidden' } }]);
    renderArtists();

    expect(await screen.findByText(/HTTP 403/)).toBeInTheDocument();
  });
});
