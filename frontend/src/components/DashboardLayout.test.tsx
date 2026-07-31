/**
 * Rendertests für den Dashboard-Rahmen.
 *
 * Die Zusicherungen hier sind genau die Punkte, die vorher fehlten: ein `<h1>`
 * je Seite, alle Ziele erreichbar und nach Bereich gruppiert, eine Markierung
 * auch auf Unterseiten, die Tab-Leiste auf dem Handy und eine Schublade, die
 * sich mit der Tastatur wieder schliessen lässt.
 */

import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DashboardLayout } from './DashboardLayout';
import { invalidatePendingArtistCount } from './dashboard/usePendingArtistCount';

const authState = { user: null as any, token: 'test-token' as string | null };

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => authState,
}));

// Clerk braucht einen Provider und Netz — für den Rahmen genügt ein Platzhalter.
vi.mock('@clerk/clerk-react', () => ({
  UserButton: () => <button type="button">Konto</button>,
}));

function renderLayout(path: string, props: Record<string, unknown> = {}) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <DashboardLayout title="Meine Anfragen" {...props}>
        <p>Inhalt</p>
      </DashboardLayout>
    </MemoryRouter>
  );
}

/** Die Seitenleiste, unabhaengig von der Tab-Leiste unten. */
const sidebar = () => screen.getByRole('complementary', { name: 'Seitennavigation' });

/**
 * Die Tab-Leiste am unteren Rand.
 *
 * Beide Navigationen tragen denselben Namen — sie sind dieselbe Navigation in
 * zwei Darstellungen, und per CSS ist immer nur eine sichtbar. Die Tab-Leiste
 * steht im Markup als letzte.
 */
const tabbar = () => {
  const bars = screen.getAllByRole('navigation', { name: 'Hauptnavigation' });
  return bars[bars.length - 1];
};

beforeEach(() => {
  authState.user = { is_admin: false };
  authState.token = 'test-token';
  invalidatePendingArtistCount();
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response('[]', { status: 200 }))
  );
});

describe('Seitentitel', () => {
  it('gibt den Titel als h1 aus', () => {
    renderLayout('/meine-anfragen');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Meine Anfragen');
  });

  it('zeigt eine Beschreibung, wenn eine da ist', () => {
    renderLayout('/meine-anfragen', { description: 'Alle offenen Anfragen.' });
    expect(screen.getByText('Alle offenen Anfragen.')).toBeInTheDocument();
  });

  it('hat einen Sprunglink zum Inhalt', () => {
    renderLayout('/meine-anfragen');
    const link = screen.getByRole('link', { name: 'Zum Inhalt springen' });
    expect(link).toHaveAttribute('href', '#dashboard-content');
    expect(document.getElementById('dashboard-content')).toBeInTheDocument();
  });
});

describe('Künstler-Portal', () => {
  it('zeigt die Künstler-Ziele, darunter Buchhaltung', () => {
    renderLayout('/meine-anfragen');
    const nav = within(sidebar());
    for (const label of ['Profil', 'Meine Anfragen', 'Meine Gigs', 'Kalender', 'Buchhaltung', 'Richtlinien']) {
      expect(nav.getByRole('link', { name: label })).toBeInTheDocument();
    }
  });

  it('führt aus der Seitenleiste zurück auf die öffentliche Seite', () => {
    renderLayout('/meine-anfragen');
    const nav = within(sidebar());
    // Die eigene Karte so sehen, wie ein Kunde sie sieht — von der Startseite
    // aus wären das zwei weitere Klicks.
    expect(nav.getByRole('link', { name: 'Meine Karte ansehen' })).toHaveAttribute(
      'href',
      '/kuenstler'
    );
    expect(nav.getByRole('link', { name: 'Zur Website' })).toHaveAttribute('href', '/');
  });

  it('blendet die Seitenleiste nicht dauerhaft aus', () => {
    // `hidden lg:flex`: Die Klasse `hidden` gab es zusätzlich ungeschichtet in
    // components.css und schlug damit `lg:flex`, weil ungeschichtetes CSS in
    // Tailwind v4 jede Schicht sticht. Die Seitenleiste war auf jeder
    // Fensterbreite weg. Der Test haelt die beiden Klassen zusammen fest.
    renderLayout('/meine-anfragen');
    const cls = sidebar().className;
    expect(cls).toContain('hidden');
    expect(cls).toContain('lg:flex');
  });

  it('zeigt einem Nicht-Admin nur die eigenen Ziele, ohne Gruppentitel', () => {
    renderLayout('/meine-anfragen');
    const nav = within(sidebar()).getByRole('navigation', { name: 'Hauptnavigation' });
    expect(within(nav).getAllByRole('link')).toHaveLength(6);
    expect(within(nav).queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument();
    expect(within(nav).queryByText('Verwaltung')).not.toBeInTheDocument();
  });

  it('fragt für einen Nicht-Admin keine Freigabezahl ab', () => {
    renderLayout('/meine-anfragen');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('markiert die offene Seite', () => {
    renderLayout('/meine-anfragen');
    const active = within(sidebar()).getByRole('link', { name: 'Meine Anfragen' });
    expect(active).toHaveAttribute('aria-current', 'page');
  });

  it('markiert auch bei einer Alias-Route', () => {
    // /profile ist in App.tsx ein Alias auf /profil.
    renderLayout('/profile');
    expect(within(sidebar()).getByRole('link', { name: 'Profil' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });
});

describe('Admin-Bereich', () => {
  beforeEach(() => {
    authState.user = { is_admin: true };
  });

  it('zeigt alle zehn Ziele, in zwei Gruppen', () => {
    // Ein Zwischenstand zeigte nur die vier Admin-Ziele und schob den Rest
    // hinter einen Umschalter. Das war in der Praxis ein Verlust.
    renderLayout('/admin/kuenstler');
    const nav = within(sidebar()).getByRole('navigation', { name: 'Hauptnavigation' });
    expect(within(nav).getAllByRole('link')).toHaveLength(10);
    expect(within(nav).getByRole('link', { name: 'Richtlinien' })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Buchhaltung' })).toBeInTheDocument();
  });

  it('stellt den aktuellen Bereich nach oben', () => {
    renderLayout('/admin/kuenstler');
    const nav = within(sidebar()).getByRole('navigation', { name: 'Hauptnavigation' });
    const labels = within(nav).getAllByRole('link').map((el) => el.textContent);
    expect(labels[0]).toBe('Dashboard');

    cleanup();
    renderLayout('/profil');
    const nav2 = within(sidebar()).getByRole('navigation', { name: 'Hauptnavigation' });
    expect(within(nav2).getAllByRole('link').map((el) => el.textContent)[0]).toBe('Profil');
  });

  it('benennt die Gruppen', () => {
    renderLayout('/admin');
    const nav = within(sidebar()).getByRole('navigation', { name: 'Hauptnavigation' });
    expect(within(nav).getByText('Verwaltung')).toBeInTheDocument();
    expect(within(nav).getByText('Mein Künstlerprofil')).toBeInTheDocument();
  });

  it('markiert eine Künstlerseite auch bei einem Admin', () => {
    renderLayout('/buchhaltung');
    const nav = within(sidebar()).getByRole('navigation', { name: 'Hauptnavigation' });
    expect(within(nav).getByRole('link', { name: 'Buchhaltung' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('markiert auf einer tief verschachtelten Unterseite das Dashboard', () => {
    // Vorher war hier gar nichts markiert (Vergleich war `pathname === href`).
    renderLayout('/admin/requests/12/offers/3/edit');
    expect(within(sidebar()).getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('zeigt die Zahl der offenen Freigaben als Abzeichen', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify([{ id: 1 }, { id: 2 }, { id: 3 }]), { status: 200 }))
    );

    renderLayout('/admin');

    // Auf die Navigation eingegrenzt, damit die Abfrage eindeutig bleibt.
    const nav = within(sidebar()).getByRole('navigation', { name: 'Hauptnavigation' });
    const link = await waitFor(() => within(nav).getByRole('link', { name: /Künstler/ }));
    expect(within(link).getByText('3')).toBeInTheDocument();
  });

  it('bleibt benutzbar, wenn die Freigabezahl nicht geladen werden kann', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 500 })));

    renderLayout('/admin');

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    const nav = within(sidebar()).getByRole('navigation', { name: 'Hauptnavigation' });
    const link = within(nav).getByRole('link', { name: 'Künstler' });
    // Kein Abzeichen, aber der Eintrag ist da und beschriftet.
    expect(link).toHaveAttribute('href', '/admin/kuenstler');
  });
});

describe('Tab-Leiste auf dem Handy', () => {
  it('zeigt vier Ziele und einen Mehr-Knopf', () => {
    renderLayout('/meine-anfragen');
    expect(within(tabbar()).getAllByRole('link')).toHaveLength(4);
    expect(within(tabbar()).getByRole('button', { name: 'Mehr' })).toBeInTheDocument();
  });

  it('markiert Mehr, wenn die offene Seite dort drin liegt', () => {
    // Buchhaltung ist kein Hauptziel. Ohne diese Markierung wirkte die Leiste
    // auf dieser Seite wie „nirgends".
    renderLayout('/buchhaltung');
    expect(within(tabbar()).getByRole('button', { name: 'Mehr' }).className).toContain(
      'text-pepe-gold'
    );
  });

  it('zeigt im Admin-Bereich die Admin-Ziele', () => {
    authState.user = { is_admin: true };
    renderLayout('/admin');
    const labels = within(tabbar())
      .getAllByRole('link')
      .map((el) => el.textContent);
    expect(labels).toEqual(['Dashboard', 'Künstler', 'Anstehende Gigs', 'Rechnungen']);
  });
});

describe('Mehr-Schublade', () => {
  it('öffnet als Dialog und enthält die übrigen Ziele', async () => {
    renderLayout('/meine-anfragen');
    const more = within(tabbar()).getByRole('button', { name: 'Mehr' });

    await act(async () => {
      more.click();
    });

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(within(dialog).getByRole('link', { name: 'Buchhaltung' })).toBeInTheDocument();
    expect(within(dialog).getByRole('link', { name: 'Richtlinien' })).toBeInTheDocument();
    expect(within(dialog).getByRole('link', { name: 'Zur Website' })).toBeInTheDocument();
  });

  it('sperrt das Scrollen dahinter und gibt es danach wieder frei', async () => {
    renderLayout('/meine-anfragen');
    const more = within(tabbar()).getByRole('button', { name: 'Mehr' });

    expect(document.body.style.overflow).toBe('');

    await act(async () => {
      more.click();
    });
    expect(document.body.style.overflow).toBe('hidden');

    await act(async () => {
      screen.getByRole('button', { name: 'Menü schliessen' }).click();
    });
    expect(document.body.style.overflow).toBe('');
  });

  it('schliesst mit Escape und gibt den Fokus zurück', async () => {
    renderLayout('/meine-anfragen');
    const more = within(tabbar()).getByRole('button', { name: 'Mehr' });

    await act(async () => {
      more.focus();
      more.click();
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(more);
  });

  it('setzt den Fokus beim Öffnen in die Schublade', async () => {
    renderLayout('/meine-anfragen');
    const more = within(tabbar()).getByRole('button', { name: 'Mehr' });

    await act(async () => {
      more.click();
    });

    const dialog = screen.getByRole('dialog');
    // Ohne das wandert der Fokus unsichtbar durch die Seite dahinter.
    expect(dialog.contains(document.activeElement)).toBe(true);
  });
});
