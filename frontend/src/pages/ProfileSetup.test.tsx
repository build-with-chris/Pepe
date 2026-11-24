/**
 * Welche Oberfläche ein Künstler sieht — Assistent oder Formular.
 *
 * Die Weiche hängt allein am `approval_status`. Wer noch nie eingereicht hat,
 * bekommt die vier Schritte. Wer schon in der Prüfung ist oder freigegeben
 * wurde, bekommt das Formular und darüber den Fortschritt, damit ein fehlendes
 * Foto sichtbar bleibt.
 */

import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ValidationError } from '@/lib/http';
import ProfileSetup from './ProfileSetup';

const authState = {
  user: { email: 'alex@example.com' } as { email: string } | null,
  token: 'test-token' as string | null,
  getFreshToken: async () => authState.token,
};

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => authState,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: unknown) => (typeof fallback === 'string' ? fallback : key),
  }),
}));

// Der Rahmen zieht Clerk und die Navigation nach. Für die Weiche genügt eine Hülle.
vi.mock('@/components/DashboardLayout', () => ({
  DashboardLayout: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

const fetchMock = vi.fn();

vi.mock('@/lib/http', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@/lib/http');
  return { ...actual, fetchWithRetry: (...args: unknown[]) => fetchMock(...args) };
});

/** Ein vollständiges Pflichtprofil, ohne Foto, Bio, Galerie und Erfahrung. */
function meResponse(approvalStatus: string) {
  return {
    id: 7,
    name: 'Alex Beispiel',
    email: 'alex@example.com',
    address: 'Hauptstrasse 1, 80331 München, Deutschland',
    phone_number: '+49 89 123456',
    disciplines: ['Jonglage'],
    bio: '',
    instagram: null,
    profile_image_url: null,
    gallery_urls: [],
    approval_status: approvalStatus,
    rejection_reason: null,
  };
}

function renderWithStatus(approvalStatus: string, overrides: Record<string, unknown> = {}) {
  fetchMock.mockImplementation(
    async () => new Response(JSON.stringify({ ...meResponse(approvalStatus), ...overrides }))
  );
  return render(
    <MemoryRouter>
      <ProfileSetup />
    </MemoryRouter>
  );
}

/** Alle PATCH-Rümpfe, die an `/api/artists/me/profile` gingen. */
function patchBodies() {
  return (fetchMock.mock.calls as [url: unknown, init?: RequestInit][])
    .filter(([url, init]) => String(url).includes('/profile') && init?.method === 'PATCH')
    .map(([, init]) => JSON.parse(String(init?.body)));
}

const wizardBar = () => screen.queryByRole('progressbar', { name: 'Fortschritt der Anmeldung' });
const completenessBar = () =>
  screen.queryByRole('progressbar', { name: 'Vollständigkeit deines Profils' });

beforeEach(() => {
  fetchMock.mockReset();
  authState.user = { email: 'alex@example.com' };
  authState.token = 'test-token';
  authState.getFreshToken = async () => authState.token;
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

describe('ProfileSetup', () => {
  it('zeigt den Assistenten, solange nichts eingereicht wurde', async () => {
    renderWithStatus('unsubmitted');

    await waitFor(() => expect(wizardBar()).toBeInTheDocument());
    expect(completenessBar()).toBeNull();
  });

  it('lässt im Assistenten Statusbanner, Untertitel und Gefahrenzone weg', async () => {
    renderWithStatus('unsubmitted');
    await waitFor(() => expect(wizardBar()).toBeInTheDocument());

    // Der Banner sagte dasselbe wie der Fortschritt zwei Zeilen tiefer.
    expect(screen.queryByText('Profil vervollständigen')).toBeNull();
    // Und ein Knopf zum Löschen gehört nicht unter „Weiter".
    expect(screen.queryByText('Gefahrenzone')).toBeNull();
    expect(screen.queryByText(/Verwalte dein Künstlerprofil/)).toBeNull();
  });

  it('zeigt Banner und Gefahrenzone beim Formular weiterhin', async () => {
    renderWithStatus('pending');
    await waitFor(() => expect(completenessBar()).toBeInTheDocument());

    expect(screen.getByText('Profil in Prüfung')).toBeInTheDocument();
    expect(screen.getByText('Gefahrenzone')).toBeInTheDocument();
  });

  it('zeigt das Formular, sobald die Prüfung läuft', async () => {
    renderWithStatus('pending');

    await waitFor(() => expect(completenessBar()).toBeInTheDocument());
    expect(wizardBar()).toBeNull();
  });

  it('zeigt das Formular auch nach der Freigabe', async () => {
    renderWithStatus('approved');

    await waitFor(() => expect(completenessBar()).toBeInTheDocument());
    expect(wizardBar()).toBeNull();
  });

  it('steht bei erfüllter Pflicht ohne Extras auf 50 Prozent und nennt die offenen Punkte', async () => {
    renderWithStatus('pending');

    await waitFor(() => expect(completenessBar()).toBeInTheDocument());
    expect(completenessBar()).toHaveAttribute('aria-valuenow', '50');
    expect(screen.getByText('Profilbild hinzufügen')).toBeInTheDocument();
    expect(screen.getByText('Kurzvorstellung schreiben')).toBeInTheDocument();
  });

  it('sichert beim Weitergehen ohne einzureichen', async () => {
    // Ohne Disziplin: Der Assistent steigt in Schritt 2 ein.
    renderWithStatus('unsubmitted', { disciplines: [] });
    await waitFor(() => expect(wizardBar()).toBeInTheDocument());

    await act(async () => {
      screen.getByRole('button', { name: 'Jonglage' }).click();
    });
    await act(async () => {
      screen.getByRole('button', { name: /Weiter/ }).click();
    });

    await waitFor(() => expect(patchBodies()).toHaveLength(1));
    const body = patchBodies()[0];
    // Das eine Feld, das den Entwurf vom Einreichen trennt.
    expect(body).not.toHaveProperty('approval_status');
    expect(body.disciplines).toEqual(['Jonglage']);
    expect(body.address).toBe('Hauptstrasse 1, 80331 München, Deutschland');
    // Und der Schritt wechselt erst nach dem Speichern.
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Deine Erfahrung')
    );
  });

  it('schickt beim Einreichen approval_status und Instagram mit', async () => {
    renderWithStatus('unsubmitted', { instagram: '@alexbeispiel' });
    await waitFor(() => expect(wizardBar()).toBeInTheDocument());

    // Pflicht ist erfüllt, also steht der Assistent direkt im letzten Schritt.
    await act(async () => {
      screen.getByRole('button', { name: /Zur Prüfung einreichen/ }).click();
    });

    await waitFor(() => expect(patchBodies()).toHaveLength(1));
    const body = patchBodies()[0];
    expect(body.approval_status).toBe('pending');
    expect(body.instagram).toBe('@alexbeispiel');
  });

  it('speichert mit einem frischen Token statt mit dem aus dem letzten Render', async () => {
    // Ein Clerk-Token gilt rund eine Minute. Wer den Assistenten in Ruhe
    // ausfüllt, hat im Kontext längst ein abgelaufenes.
    authState.getFreshToken = async () => 'fresh-token';
    renderWithStatus('unsubmitted');
    await waitFor(() => expect(wizardBar()).toBeInTheDocument());

    await act(async () => {
      screen.getByRole('button', { name: /Zur Prüfung einreichen/ }).click();
    });

    await waitFor(() => expect(patchBodies()).toHaveLength(1));
    const patch = (fetchMock.mock.calls as [url: unknown, init?: RequestInit][]).find(
      ([, init]) => init?.method === 'PATCH',
    );
    expect((patch?.[1]?.headers as Record<string, string>).Authorization).toBe('Bearer fresh-token');
  });

  it('zeigt die Meldung des Servers, wenn das Einreichen scheitert', async () => {
    fetchMock.mockImplementation(async (_url: unknown, init?: RequestInit) => {
      if (init?.method === 'PATCH') throw new Error('Speichern gerade nicht möglich');
      return new Response(JSON.stringify(meResponse('unsubmitted')));
    });
    render(
      <MemoryRouter>
        <ProfileSetup />
      </MemoryRouter>
    );
    await waitFor(() => expect(wizardBar()).toBeInTheDocument());

    await act(async () => {
      screen.getByRole('button', { name: /Zur Prüfung einreichen/ }).click();
    });

    expect((await screen.findAllByText('Speichern gerade nicht möglich')).length).toBeGreaterThan(0);
    // Nichts eingereicht, also bleibt der Assistent stehen.
    expect(wizardBar()).toBeInTheDocument();
  });

  it('bittet um die Pflichtangaben, wenn der Server Felder beanstandet', async () => {
    fetchMock.mockImplementation(async (_url: unknown, init?: RequestInit) => {
      if (init?.method === 'PATCH') {
        throw new ValidationError('Ungültige Angaben', { phone_number: ['Pflichtfeld'] }, 422);
      }
      return new Response(JSON.stringify(meResponse('unsubmitted')));
    });
    render(
      <MemoryRouter>
        <ProfileSetup />
      </MemoryRouter>
    );
    await waitFor(() => expect(wizardBar()).toBeInTheDocument());

    await act(async () => {
      screen.getByRole('button', { name: /Zur Prüfung einreichen/ }).click();
    });

    expect((await screen.findAllByText('profileSetup.errors.fillRequired')).length).toBeGreaterThan(0);
  });
});
