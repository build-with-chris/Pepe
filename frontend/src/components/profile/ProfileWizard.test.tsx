/**
 * Rendertests für den Anmelde-Assistenten.
 *
 * Geprüft wird das, was den Unterschied zum alten Formular ausmacht: dass man
 * dort einsteigt, wo etwas fehlt, dass ein Schritt ohne Pflichtangabe nicht
 * weitergeht und sagt warum, dass jeder Wechsel den Stand sichert, und dass
 * ein fehlendes Foto das Einreichen nicht blockiert.
 */

import { render, screen, waitFor, within } from '@testing-library/react';
import { act, useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProfileWizard, firstIncompleteStep, type WizardProfile } from './ProfileWizard';

const emptyProfile: WizardProfile = {
  name: '',
  street: '',
  postalCode: '',
  city: '',
  country: '',
  phoneNumber: '',
  disciplines: [],
  bio: '',
  instagram: '',
  profileImageUrl: null,
  galleryUrls: [],
  galleryFiles: [],
  stageExperience: '',
  employmentType: '',
  circusEducation: false,
  awardsLevel: 'keine',
  pepeYears: 0,
  pepeExclusivity: false,
  priceMin: null,
  priceMax: null,
};

/** Alle Pflichtangaben da, kein Foto und keine Bio — der Fall aus Kriterium 3. */
const completeProfile: WizardProfile = {
  ...emptyProfile,
  name: 'Alex Beispiel',
  street: 'Hauptstrasse 1',
  postalCode: '80331',
  city: 'München',
  country: 'Deutschland',
  phoneNumber: '+49 89 123456',
  disciplines: ['Jonglage'],
};

/**
 * Der Assistent ist gesteuert: `setProfile` geht an die Seite, die den Zustand
 * hält. Ohne diesen Rahmen käme im Test nie ein Wert zurück, und jede Eingabe
 * ginge ins Leere.
 */
function Harness({
  initial = emptyProfile,
  onSaveDraft = async () => true,
  onSubmit = () => {},
}: {
  initial?: WizardProfile;
  onSaveDraft?: () => Promise<boolean>;
  onSubmit?: () => void;
}) {
  const [profile, setProfile] = useState<WizardProfile>(initial);
  return (
    <ProfileWizard
      profile={profile}
      setProfile={(updates) => setProfile((prev) => ({ ...prev, ...updates }) as WizardProfile)}
      email="alex@example.com"
      onSaveDraft={onSaveDraft}
      onSubmit={onSubmit}
    />
  );
}

/** Die Schaltfläche zum Schritt-Wechsel in der Leiste oben. */
const stepChip = (label: string) => screen.getByRole('button', { name: label });

const currentStep = () => screen.getByRole('heading', { level: 2 }).textContent;

async function click(el: HTMLElement) {
  await act(async () => {
    el.click();
  });
}

/**
 * Tippen ohne user-event: React hört auf den nativen Setter, ein direktes
 * `input.value = …` bliebe unbemerkt.
 */
async function type(el: HTMLElement, value: string) {
  const input = el as HTMLInputElement;
  const proto =
    input.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  await act(async () => {
    setter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

beforeEach(() => {
  // jsdom kennt kein Scrollen, der Assistent springt bei jedem Wechsel nach oben.
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

describe('firstIncompleteStep', () => {
  it('führt zum Schritt, in dem der erste Pflichtwert fehlt', () => {
    expect(firstIncompleteStep(emptyProfile)).toBe(0);
    expect(firstIncompleteStep({ ...completeProfile, disciplines: [] })).toBe(1);
  });

  it('führt zum letzten Schritt, wenn alles Pflichtige da ist', () => {
    expect(firstIncompleteStep(completeProfile)).toBe(3);
  });
});

describe('ProfileWizard', () => {
  it('startet im ersten Schritt, wenn Pflichtangaben fehlen', () => {
    render(<Harness />);
    expect(currentStep()).toBe('Wer bist du?');
    expect(screen.getByRole('progressbar', { name: 'Fortschritt der Anmeldung' })).toHaveAttribute(
      'aria-valuenow',
      '25'
    );
  });

  it('nennt den Titel des Schritts genau einmal', () => {
    render(<Harness />);
    // Stand vorher zweimal: rechts in der Fortschrittszeile und als Überschrift.
    expect(screen.getAllByText('Wer bist du?')).toHaveLength(1);
  });

  it('markiert in Schritt 3 nicht jedes Feld einzeln als optional', async () => {
    render(<Harness initial={{ ...completeProfile, disciplines: [] }} />);
    await click(screen.getByRole('button', { name: 'Jonglage' }));
    await click(screen.getByRole('button', { name: /Weiter/ }));
    await waitFor(() => expect(currentStep()).toBe('Deine Erfahrung'));

    // Der ganze Schritt ist freiwillig, das steht einmal im Einleitungssatz.
    expect(screen.queryAllByText('optional')).toHaveLength(0);
    expect(screen.getByText(/Dieser Schritt ist ganz freiwillig/)).toBeInTheDocument();
  });

  it('geht ohne Pflichtangabe nicht weiter und nennt die fehlenden Felder', async () => {
    const onSaveDraft = vi.fn(async () => true);
    render(<Harness onSaveDraft={onSaveDraft} />);

    await click(screen.getByRole('button', { name: /Weiter/ }));

    expect(currentStep()).toBe('Wer bist du?');
    expect(onSaveDraft).not.toHaveBeenCalled();
    expect(screen.getByText('Telefonnummer fehlt noch.')).toBeInTheDocument();
    expect(screen.getByText('PLZ fehlt noch.')).toBeInTheDocument();
  });

  it('wechselt den Schritt erst, wenn der Entwurf gespeichert ist', async () => {
    let attempt = 0;
    const onSaveDraft = vi.fn(async () => {
      attempt += 1;
      return attempt > 1; // Der erste Versuch scheitert.
    });

    // Alles da bis auf die Disziplin: Einstieg ist Schritt 2.
    render(<Harness initial={{ ...completeProfile, disciplines: [] }} onSaveDraft={onSaveDraft} />);
    expect(currentStep()).toBe('Was machst du?');

    await click(screen.getByRole('button', { name: 'Jonglage' }));

    await click(screen.getByRole('button', { name: /Weiter/ }));
    expect(onSaveDraft).toHaveBeenCalledTimes(1);
    expect(currentStep()).toBe('Was machst du?');

    await click(screen.getByRole('button', { name: /Weiter/ }));
    await waitFor(() => expect(currentStep()).toBe('Deine Erfahrung'));
    expect(onSaveDraft).toHaveBeenCalledTimes(2);
  });

  it('lässt zurückspringen, aber nicht über den erreichten Schritt hinaus', async () => {
    render(<Harness />);

    expect(stepChip('Person')).toBeEnabled();
    expect(stepChip('Disziplinen')).toBeDisabled();
    expect(stepChip('Vorschau')).toBeDisabled();

    await type(screen.getByLabelText(/Künstlername/), 'Alex Beispiel');
    await type(screen.getByLabelText(/Telefonnummer/), '+49 89 123456');
    await type(screen.getByLabelText(/Straße/), 'Hauptstrasse 1');
    await type(screen.getByLabelText(/^PLZ/), '80331');
    await type(screen.getByLabelText(/^Stadt/), 'München');
    await type(screen.getByLabelText(/^Land/), 'Deutschland');
    await click(screen.getByRole('button', { name: /Weiter/ }));

    await waitFor(() => expect(currentStep()).toBe('Was machst du?'));

    expect(stepChip('Person')).toBeEnabled();
    expect(stepChip('Erfahrung')).toBeDisabled();

    await click(stepChip('Person'));
    expect(currentStep()).toBe('Wer bist du?');
  });

  it('zeigt im letzten Schritt beide Vorschauen und reicht ohne Foto ein', async () => {
    const onSubmit = vi.fn();
    render(<Harness initial={completeProfile} onSubmit={onSubmit} />);

    expect(currentStep()).toBe('Bild, Text und Vorschau');

    const kunde = screen.getByRole('region', { name: 'So sehen dich Kunden' });
    const agentur = screen.getByRole('region', { name: 'So sieht dich die Agentur' });

    // Gegenprobe zu Kriterium 5: Die Telefonnummer steht nur bei der Agentur.
    expect(within(kunde).queryByText(/\+49 89 123456/)).toBeNull();
    expect(within(agentur).getByText('+49 89 123456')).toBeInTheDocument();

    const submit = screen.getByRole('button', { name: /Zur Prüfung einreichen/ });
    expect(submit).toBeEnabled();
    await click(submit);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('sperrt das Einreichen, solange eine Pflichtangabe fehlt', async () => {
    render(<Harness initial={completeProfile} />);
    expect(currentStep()).toBe('Bild, Text und Vorschau');

    // Über die Schrittleiste zurück, Namen leeren, wieder nach vorn.
    await click(stepChip('Person'));
    await type(screen.getByLabelText(/Künstlername/), '');
    await click(stepChip('Vorschau'));

    expect(currentStep()).toBe('Bild, Text und Vorschau');
    const hinweis = screen.getByText('Vor dem Einreichen fehlt noch:').closest('div') as HTMLElement;
    expect(within(hinweis).getByRole('listitem')).toHaveTextContent('Name');
    expect(screen.getByRole('button', { name: /Zur Prüfung einreichen/ })).toBeDisabled();
  });

  it('nimmt Instagram entgegen und zeigt es in der Kundenvorschau', async () => {
    render(<Harness initial={completeProfile} />);

    await type(screen.getByLabelText(/Instagram/), '@alexbeispiel');

    const kunde = screen.getByRole('region', { name: 'So sehen dich Kunden' });
    expect(within(kunde).getByText('@alexbeispiel')).toBeInTheDocument();
  });
});

describe('Profilbild: Ausschnitt vor dem Upload', () => {
  /** Datei auswählen, so wie es der Browser meldet. */
  async function pickFile(input: HTMLElement, file: File) {
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    await act(async () => {
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  it('oeffnet den Zuschnitt statt die Datei direkt zu uebernehmen', async () => {
    // Der Kern der Aenderung: Vorher landete die Datei unmittelbar im Profil
    // und damit im Upload. Der Browser entschied dann beim Anzeigen, was von
    // einem Hochformat uebrig bleibt — meist auf Kosten von Kopf oder Fuessen.
    render(<Harness initial={completeProfile} />);
    expect(currentStep()).toBe('Bild, Text und Vorschau');

    const file = new File([new Uint8Array([1, 2, 3])], 'portrait.jpg', { type: 'image/jpeg' });
    await pickFile(document.getElementById('w-photo') as HTMLElement, file);

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Ausschnitt wählen')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: /Ausschnitt übernehmen/ })).toBeInTheDocument();
  });

  it('verwirft die Auswahl beim Abbrechen und uebernimmt nichts', async () => {
    render(<Harness initial={completeProfile} />);

    const file = new File([new Uint8Array([1, 2, 3])], 'portrait.jpg', { type: 'image/jpeg' });
    await pickFile(document.getElementById('w-photo') as HTMLElement, file);
    await click(within(screen.getByRole('dialog')).getByRole('button', { name: /Abbrechen/ }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    // Die Beschriftung wechselt erst, wenn ein Bild wirklich uebernommen wurde.
    expect(screen.getByText('Bild wählen')).toBeInTheDocument();
  });
});
