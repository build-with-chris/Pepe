/**
 * Rechnungsübersicht mit Antworten, wie `/api/admin/invoices` sie liefert.
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Die Seite liest die Backend-Adresse beim Import. Ohne sie bricht sie mit
// „VITE_API_URL ist nicht gesetzt" ab, also vor dem Import setzen.
vi.hoisted(() => {
  vi.stubEnv('VITE_API_URL', 'http://api.test');
});

import { callsTo, stubFetch } from '@/test/pageMocks';
import Invoices from './Invoices';

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

/** Wie die Liste in backend/routes/admin_routes.py. */
const invoices = [
  {
    id: 21,
    artist_id: 3,
    artist_name: 'Mira Beispiel',
    artist_email: 'mira@example.com',
    storage_path: 'invoices/3/rechnung-november.pdf',
    status: 'uploaded',
    amount_cents: 120000,
    currency: 'EUR',
    invoice_date: '2026-11-15',
    created_at: '2026-11-16T09:00:00',
    updated_at: '2026-11-16T09:00:00',
  },
  {
    id: 22,
    artist_id: 4,
    artist_name: null,
    artist_email: null,
    storage_path: 'invoices/4/rechnung.pdf',
    status: 'paid',
    amount_cents: null,
    currency: 'EUR',
    invoice_date: null,
    created_at: '2026-11-10T09:00:00',
    updated_at: '2026-11-12T09:00:00',
  },
];

function renderInvoices() {
  return render(
    <MemoryRouter>
      <Invoices />
    </MemoryRouter>,
  );
}

/** Gibt den Effekten Zeit, sich zu beruhigen, bevor gezählt wird. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 150));

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe('Rechnungen', () => {
  it('zeigt die Rechnungen und lädt die Liste genau einmal', async () => {
    const calls = stubFetch([{ match: '/api/admin/invoices', body: invoices }]);
    renderInvoices();

    // Tabelle und Kartenansicht stehen beide im Markup, per CSS ist eine sichtbar.
    expect((await screen.findAllByText('Mira Beispiel')).length).toBeGreaterThan(0);
    // Ohne Namen der Ersatztext, ohne Betrag ein Strich statt „NaN".
    expect(screen.getAllByText('Artist #4').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/1\.200,00/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/NaN/)).toBeNull();

    await settle();
    expect(callsTo(calls, 'GET', '/api/admin/invoices')).toHaveLength(1);
  });

  it('markiert eine Rechnung als bezahlt und lädt danach neu', async () => {
    const calls = stubFetch([
      { match: '/api/admin/invoices', body: invoices },
      { method: 'PATCH', match: '/api/admin/invoices/21', body: { id: 21, status: 'paid' } },
    ]);
    renderInvoices();
    await screen.findAllByText('Mira Beispiel');

    // Die bezahlte Rechnung bietet die Aktion nicht mehr an.
    const payButtons = screen.getAllByRole('button', { name: 'Als bezahlt markieren' });
    expect(payButtons).toHaveLength(1);
    fireEvent.click(payButtons[0]);

    await waitFor(() => expect(callsTo(calls, 'PATCH', '/api/admin/invoices/21')).toHaveLength(1));
    expect(callsTo(calls, 'PATCH', '/api/admin/invoices/21')[0].body).toEqual({ status: 'paid' });
    await waitFor(() => expect(callsTo(calls, 'GET', '/api/admin/invoices')).toHaveLength(2));
  });

  it('zeigt den Grund, wenn die Liste nicht lädt', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    stubFetch([{ match: '/api/admin/invoices', status: 403, body: { error: 'forbidden' } }]);
    renderInvoices();

    expect(await screen.findByText(/HTTP 403/)).toBeInTheDocument();
  });
});
