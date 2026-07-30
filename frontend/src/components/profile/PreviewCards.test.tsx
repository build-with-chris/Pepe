/**
 * Die Vorschaukarten müssen die Wahrheit zeigen, sonst sind sie schlimmer als
 * keine Vorschau. Die Tests halten fest, welche Felder öffentlich sind und
 * welche nicht — abgelesen an `GET /api/artists` und `GET /api/admin/artists`.
 */

import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AdminPreviewCard, CustomerPreviewCard, type PreviewProfile } from './PreviewCards';

const voll: PreviewProfile = {
  name: 'Alex Beispiel',
  bio: 'Cyr Wheel seit zwölf Jahren, Bühne und Strasse.',
  disciplines: ['Cyr Wheel', 'Akrobatik', 'Tanz'],
  profileImageUrl: 'https://blob.example/portrait.webp',
  galleryUrls: ['https://blob.example/g1.webp', 'https://blob.example/g2.webp'],
  instagram: '@alexbeispiel',
  email: 'alex@example.com',
  phoneNumber: '+49 89 123456',
  street: 'Teststrasse 1',
  postalCode: '80331',
  city: 'München',
  country: 'Deutschland',
  priceMin: 800,
  priceMax: 1200,
};

const leer: PreviewProfile = {
  name: '',
  bio: '',
  disciplines: [],
  profileImageUrl: null,
  galleryUrls: [],
};

describe('Kundensicht', () => {
  it('zeigt Name, Disziplinen und Bio', () => {
    render(<CustomerPreviewCard profile={voll} />);
    expect(screen.getByText('Alex Beispiel')).toBeInTheDocument();
    expect(screen.getByText('Cyr Wheel')).toBeInTheDocument();
    expect(screen.getByText(/Cyr Wheel seit zwölf Jahren/)).toBeInTheDocument();
  });

  it('zeigt nur zwei Disziplinen und den Rest als Zahl', () => {
    // ArtistCardFinal schneidet nach zwei ab. Die Vorschau muss das mitmachen,
    // sonst verspricht sie mehr als die echte Karte zeigt.
    render(<CustomerPreviewCard profile={voll} />);
    expect(screen.getByText('Cyr Wheel')).toBeInTheDocument();
    expect(screen.getByText('Akrobatik')).toBeInTheDocument();
    expect(screen.queryByText('Tanz')).not.toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('verrät keine Adresse, kein Telefon und keine Gage', () => {
    // Der Kern der Trennung: `GET /api/artists` gibt diese Felder nicht heraus.
    const card = render(<CustomerPreviewCard profile={voll} />).container;
    expect(card.textContent).not.toContain('Teststrasse 1');
    expect(card.textContent).not.toContain('+49 89 123456');
    expect(card.textContent).not.toContain('alex@example.com');
    expect(card.textContent).not.toContain('800');
  });

  it('sagt ausdruecklich, dass diese Angaben nicht oeffentlich sind', () => {
    render(<CustomerPreviewCard profile={voll} />);
    expect(screen.getByText(/Adresse, Telefonnummer und Gage/)).toBeInTheDocument();
  });

  it('erklaert beim fehlenden Bild, was daraus folgt', () => {
    render(<CustomerPreviewCard profile={leer} />);
    expect(screen.getByText(/Ohne Profilbild bleibt hier eine graue Fläche/)).toBeInTheDocument();
    expect(screen.getByText('Dein Name')).toBeInTheDocument();
    expect(screen.getByText('Noch keine Disziplin gewählt')).toBeInTheDocument();
    expect(screen.getByText(/Kunden lesen hier zuerst/)).toBeInTheDocument();
  });

  it('zaehlt die Galeriebilder', () => {
    render(<CustomerPreviewCard profile={voll} />);
    expect(screen.getByText('Dazu 2 Bilder in der Galerie')).toBeInTheDocument();
  });

  it('sagt im Singular, wenn es ein Bild ist', () => {
    render(<CustomerPreviewCard profile={{ ...voll, galleryUrls: ['x'] }} />);
    expect(screen.getByText('Dazu 1 Bild in der Galerie')).toBeInTheDocument();
  });

  it('zeigt Instagram nur, wenn eins da ist', () => {
    const { container, unmount } = render(<CustomerPreviewCard profile={voll} />);
    expect(container.textContent).toContain('@alexbeispiel');
    unmount();
    expect(render(<CustomerPreviewCard profile={leer} />).container.textContent).not.toContain('@');
  });
});

describe('Agentursicht', () => {
  it('zeigt Kontakt, Adresse und Gagenspanne', () => {
    render(<AdminPreviewCard profile={voll} />);
    expect(screen.getByText('alex@example.com')).toBeInTheDocument();
    expect(screen.getByText('+49 89 123456')).toBeInTheDocument();
    expect(screen.getByText('Teststrasse 1, 80331 München, Deutschland')).toBeInTheDocument();
    expect(screen.getByText(/800 € – 1\.200 €/)).toBeInTheDocument();
  });

  it('zeigt alle Disziplinen, nicht nur zwei', () => {
    render(<AdminPreviewCard profile={voll} />);
    expect(screen.getByText('Cyr Wheel, Akrobatik, Tanz')).toBeInTheDocument();
  });

  it('setzt Striche, wo nichts steht, statt Felder zu verstecken', () => {
    render(<AdminPreviewCard profile={leer} />);
    // Drei Zeilen: E-Mail, Telefon, Adresse.
    expect(screen.getAllByText('—')).toHaveLength(3);
  });

  it('erklaert die fehlende Gagenspanne statt sie leer zu lassen', () => {
    render(<AdminPreviewCard profile={leer} />);
    expect(screen.getByText(/Wird aus deinen Angaben berechnet/)).toBeInTheDocument();
  });

  it('setzt die Adresse aus Teilen zusammen und laesst Luecken weg', () => {
    render(
      <AdminPreviewCard profile={{ ...leer, street: 'Weg 2', city: 'Wien' }} />
    );
    expect(screen.getByText('Weg 2, Wien')).toBeInTheDocument();
  });
});

describe('Zugaenglichkeit', () => {
  it('beide Karten sind als Bereich benannt', () => {
    render(
      <>
        <CustomerPreviewCard profile={voll} />
        <AdminPreviewCard profile={voll} />
      </>
    );
    expect(screen.getByRole('region', { name: 'So sehen dich Kunden' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'So sieht dich die Agentur' })).toBeInTheDocument();
  });

  it('das Profilbild der Kundensicht hat einen sprechenden Alt-Text', () => {
    render(<CustomerPreviewCard profile={voll} />);
    expect(screen.getByAltText('Profilbild von Alex Beispiel')).toBeInTheDocument();
  });

  it('das kleine Bild der Agentursicht ist dekorativ und bleibt ohne Alt-Text', () => {
    // Der Name steht direkt daneben; ein zweites Vorlesen hilft niemandem.
    const card = render(<AdminPreviewCard profile={voll} />).container;
    const img = within(card).getByRole('presentation', { hidden: true });
    expect(img).toHaveAttribute('alt', '');
  });
});
