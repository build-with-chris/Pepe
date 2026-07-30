/**
 * Die Anfragen-Karte ist der wichtigste Handgriff im Künstler-Portal: Anfrage
 * lesen, Gage nennen, senden. Die Tests halten die Punkte fest, an denen das
 * vorher hakte.
 */

import { render, screen, within } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';

import RequestCard, { type Anfrage } from './RequestCard';

// i18n braucht sonst einen Provider. Die Karte gibt überall einen deutschen
// defaultValue mit, also genau den durchreichen.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, opts?: { defaultValue?: string }) => opts?.defaultValue ?? _key,
  }),
}));

const basis: Anfrage = {
  id: 42,
  event_type: 'Firmenfeier',
  show_type: 'Bühnenshow',
  show_discipline: 'Cyr Wheel',
  event_date: '2026-09-19',
  event_time: '19:00:00',
  event_address: 'Teststrasse 1, 80331 München, Deutschland',
  duration_minutes: 30,
  number_of_guests: 300,
  is_indoor: true,
  recommended_price_min: 800,
  recommended_price_max: 1200,
  status: 'angefragt',
  created_at: '2026-07-01T10:00:00Z',
} as Anfrage;

function renderCard(overrides: Partial<Parameters<typeof RequestCard>[0]> = {}, req = basis) {
  const onOfferChange = vi.fn();
  const onSendOffer = vi.fn().mockResolvedValue(undefined);
  render(
    <RequestCard
      request={req}
      offerInput=""
      onOfferChange={onOfferChange}
      onSendOffer={onSendOffer}
      {...overrides}
    />
  );
  return { onOfferChange, onSendOffer };
}

describe('Kopf der Karte', () => {
  it('zeigt Datum mit Wochentag und die Stadt weit oben', () => {
    renderCard();
    // Vorher stand das Datum in einer Tabelle mit sechs gleich gewichteten
    // Zeilen, und zwar unformatiert im Gebietsschema des Browsers.
    expect(screen.getByText(/Sa\., 19\.09\.2026, 19:00 Uhr · München/)).toBeInTheDocument();
  });

  it('nennt nicht Deutschland als Ort', () => {
    renderCard();
    expect(screen.queryByText(/· Deutschland/)).not.toBeInTheDocument();
  });

  it('zeigt die Empfehlung als Spanne in Euro', () => {
    renderCard();
    // Auf die Empfehlungszeile eingegrenzt: „1.200 €" steht auch im
    // Maximum-Chip der Schnellwahl.
    const label = screen.getByText(/^Empfohlene Gage/);
    expect(label.textContent?.replace(/\s+/g, ' ')).toMatch(/800 € – 1\.200 €/);
  });
});

describe('Angebotsfeld', () => {
  it('ist leer und nicht mit dem Minimum vorbelegt', () => {
    renderCard();
    // Vorher stand hier `recommended_price_min`. Ein schneller Klick auf
    // „Senden" bot damit den niedrigsten Betrag der Empfehlung.
    expect(screen.getByLabelText('Deine Gage für diesen Auftritt')).toHaveValue(null);
  });

  it('der Senden-Knopf ist ohne Betrag gesperrt', () => {
    renderCard();
    expect(screen.getByRole('button', { name: 'Angebot senden' })).toBeDisabled();
  });

  it('bietet Minimum, Mitte und Maximum zum Antippen', async () => {
    const { onOfferChange } = renderCard();

    await act(async () => {
      screen.getByRole('button', { name: /Mitte/ }).click();
    });
    // (800 + 1200) / 2
    expect(onOfferChange).toHaveBeenCalledWith(42, '1000');

    await act(async () => {
      screen.getByRole('button', { name: /Maximum/ }).click();
    });
    expect(onOfferChange).toHaveBeenCalledWith(42, '1200');
  });

  it('sendet den eingetragenen Betrag', async () => {
    const { onSendOffer } = renderCard({ offerInput: '1150' });

    const send = screen.getByRole('button', { name: 'Angebot senden' });
    expect(send).toBeEnabled();
    await act(async () => {
      send.click();
    });

    expect(onSendOffer).toHaveBeenCalledWith(42, 1150);
  });

  it('sendet keinen ungueltigen Betrag', () => {
    const { onSendOffer } = renderCard({ offerInput: '0' });
    expect(screen.getByRole('button', { name: 'Angebot senden' })).toBeDisabled();
    expect(onSendOffer).not.toHaveBeenCalled();
  });

  it('sagt, was nach dem Senden passiert', () => {
    renderCard();
    expect(screen.getByText(/Die Agentur prüft dein Angebot/)).toBeInTheDocument();
  });

  it('erscheint nur im Zustand angefragt', () => {
    renderCard({}, { ...basis, status: 'akzeptiert' });
    // Vorher stand in der Bedingung zusaetzlich `|| activeTab === 'aktion'`,
    // wodurch das Feld auch bei einer zugesagten Anfrage auftauchen konnte.
    expect(screen.queryByLabelText('Deine Gage für diesen Auftritt')).not.toBeInTheDocument();
  });
});

describe('Status', () => {
  it('hebt „angefragt" hervor, weil es etwas verlangt', () => {
    renderCard();
    expect(screen.getByText('Angebot offen').className).toContain('text-pepe-gold');
  });

  it('zeigt die gesendete Gage', () => {
    renderCard({}, { ...basis, status: 'angeboten', artist_gage: 1100 });
    expect(screen.getByText('1.100 €')).toBeInTheDocument();
  });
});

describe('Rueckmeldung', () => {
  it('erscheint an der Karte, nicht als alert()', () => {
    renderCard({ notice: { kind: 'success', text: 'Angebot gesendet.' } });
    const notice = screen.getByText('Angebot gesendet.');
    expect(notice).toBeInTheDocument();
    // aria-live, sonst bekommt ein Screenreader die Meldung nicht mit.
    expect(notice).toHaveAttribute('aria-live', 'polite');
  });

  it('faerbt Fehler rot', () => {
    renderCard({ notice: { kind: 'error', text: 'Hat nicht geklappt.' } });
    expect(screen.getByText('Hat nicht geklappt.').className).toContain('text-red-200');
  });
});

describe('Fehlende Angaben', () => {
  it('bricht nicht ab, wenn fast alles fehlt', () => {
    renderCard({}, { id: 7, status: 'angefragt' } as Anfrage);
    // Statt eines Absturzes: ein Ersatztitel und Striche, wo Werte fehlen.
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Anfrage');
    expect(screen.getByText(/^Empfohlene Gage/).textContent).toMatch(/— – —/);
    // Ohne Empfehlung gibt es auch keine Schnellwahl.
    expect(screen.queryByRole('button', { name: /Mitte/ })).not.toBeInTheDocument();
    // Das Feld bleibt trotzdem bedienbar.
    expect(screen.getByLabelText('Deine Gage für diesen Auftritt')).toBeInTheDocument();
  });

  it('zeigt die Anmerkung der Agentur, wenn eine da ist', () => {
    renderCard({}, { ...basis, admin_comment: 'Bitte 30 Minuten früher da sein.' });
    const box = screen.getByText(/30 Minuten früher/);
    expect(within(box).getByText('Anmerkung der Agentur:')).toBeInTheDocument();
  });
});
