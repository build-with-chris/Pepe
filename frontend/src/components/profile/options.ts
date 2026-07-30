/**
 * Auswahllisten des Künstlerprofils.
 *
 * Lagen in ProfileForm.tsx. Der Anmelde-Assistent braucht dieselben Listen —
 * zwei Kopien wären zwei Wahrheiten.
 */

export const availableDisciplines = [
  'Akrobatik',
  'Jonglage',
  'Zaubershow',
  'Tanz',
  'Feuershow',
  'Musik',
  'Comedy',
  'Pantomime',
  'Breakdance',
  'Cyr Wheel',
  'Luftakrobatik',
] as const;

export const stageExperienceOptions = [
  { value: '', label: 'Bitte wählen…' },
  { value: '0-3', label: '0–3 Jahre' },
  { value: '3-7', label: '3–7 Jahre' },
  { value: '7-10', label: '7–10 Jahre' },
  { value: '10+', label: '10+ Jahre' },
];

export const employmentTypeOptions = [
  { value: '', label: 'Bitte wählen…' },
  { value: 'vollzeit', label: 'Vollzeit-Artist' },
  { value: 'teilzeit', label: 'Teilzeit (mind. 1 Gig/Monat)' },
  { value: 'hobby', label: 'Hobby-Artist' },
];

export const awardsOptions = [
  { value: 'keine', label: 'Keine' },
  { value: 'regional', label: 'Regional' },
  { value: 'national', label: 'National' },
  { value: 'international', label: 'International' },
];

export const pepeYearsOptions = [
  { value: 0, label: 'Noch nicht' },
  { value: 1, label: '1–2 Jahre' },
  { value: 3, label: '3–4 Jahre' },
  { value: 5, label: '5+ Jahre' },
];

/** Die Felder, die das Profil zum Einreichen braucht. */
export interface RequiredCheckInput {
  name: string;
  phoneNumber: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  disciplines: string[];
}

/**
 * Was noch fehlt, um einreichen zu können — als Feldnamen.
 *
 * Eine Quelle für den Assistenten, den Fortschrittsbalken und die Prüfung beim
 * Absenden. Vorher stand die Liste nur inline in `handleSubmit`, und das
 * Formular verriet nirgends, welche Angaben überhaupt Pflicht sind.
 */
export function missingRequiredFields(p: RequiredCheckInput): string[] {
  const missing: string[] = [];
  if (!p.name?.trim()) missing.push('name');
  if (!p.phoneNumber?.trim()) missing.push('phoneNumber');
  if (!p.street?.trim()) missing.push('street');
  if (!p.postalCode?.trim()) missing.push('postalCode');
  if (!p.city?.trim()) missing.push('city');
  if (!p.country?.trim()) missing.push('country');
  if (!p.disciplines?.length) missing.push('disciplines');
  return missing;
}

export const FIELD_LABELS: Record<string, string> = {
  name: 'Name',
  phoneNumber: 'Telefonnummer',
  street: 'Straße und Hausnummer',
  postalCode: 'PLZ',
  city: 'Stadt',
  country: 'Land',
  disciplines: 'mindestens eine Disziplin',
};

/** Optionale Angaben, die ein Profil für Kunden und Agentur stärker machen. */
export interface OptionalCheckInput {
  bio: string;
  profileImageUrl: string | null;
  galleryUrls: string[];
  stageExperience: string;
  employmentType: string;
}

export interface ProfileCompleteness {
  /** 0 bis 100. */
  percent: number;
  /** Was noch fehlt, als kurze Aufforderungen. */
  todo: { key: string; label: string }[];
}

/**
 * Vollständigkeit des Profils.
 *
 * Die Pflichtangaben zählen zusammen die Hälfte — ohne sie geht gar nichts. Die
 * vier optionalen Bausteine teilen sich die andere Hälfte. Absicht: Nach dem
 * Einreichen steht der Balken bei 50 %, nicht bei 100 %, damit sichtbar bleibt,
 * dass Foto und Bio noch fehlen.
 */
export function profileCompleteness(
  required: RequiredCheckInput,
  optional: OptionalCheckInput
): ProfileCompleteness {
  const requiredMissing = missingRequiredFields(required);
  const requiredShare = requiredMissing.length === 0 ? 50 : Math.round(
    (50 * (7 - requiredMissing.length)) / 7
  );

  const extras = [
    { key: 'profileImage', label: 'Profilbild hinzufügen', done: !!optional.profileImageUrl },
    { key: 'bio', label: 'Kurzvorstellung schreiben', done: (optional.bio ?? '').trim().length >= 40 },
    { key: 'gallery', label: 'Bilder in die Galerie legen', done: (optional.galleryUrls ?? []).length > 0 },
    {
      key: 'experience',
      label: 'Erfahrung angeben (beeinflusst deine Gage)',
      done: !!optional.stageExperience && !!optional.employmentType,
    },
  ];

  const doneExtras = extras.filter((e) => e.done).length;
  const percent = requiredShare + Math.round((50 * doneExtras) / extras.length);

  const todo = [
    ...requiredMissing.map((key) => ({ key, label: `${FIELD_LABELS[key] ?? key} ergänzen` })),
    ...extras.filter((e) => !e.done).map(({ key, label }) => ({ key, label })),
  ];

  return { percent, todo };
}
