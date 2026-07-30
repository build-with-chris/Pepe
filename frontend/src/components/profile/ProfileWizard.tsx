/**
 * Anmeldung in vier Schritten.
 *
 * Vorher stand alles auf einer Seite: sieben Karten, rund vierzehn Felder, und
 * nirgends ein Hinweis, was davon Pflicht ist. Wer kein Foto zur Hand hatte,
 * stand vor einem Formular, das fertig aussehen wollte, und brach ab.
 *
 * Der Zuschnitt folgt dem, was der Code ohnehin verlangt:
 *
 * 1. **Wer bist du** — Name, Telefon, Adresse. Pflicht.
 * 2. **Was machst du** — mindestens eine Disziplin. Pflicht.
 * 3. **Erfahrung** — die sechs Kriterien der Gagenberechnung. Freiwillig, aber
 *    hier steht, was sie bewirken.
 * 4. **Bild, Text, Vorschau** — Bio, Instagram, Bilder, daneben live die zwei
 *    Vorschaukarten. Einreichen passiert hier.
 *
 * Bilder liegen bewusst im letzten Schritt: Neben der Vorschau sieht man
 * unmittelbar, was ein Foto ausmacht — und dass es auch ohne geht.
 *
 * Jeder „Weiter"-Klick speichert als Entwurf, ohne einzureichen. Das Backend
 * setzt `approval_status` nur, wenn das Feld mitgeschickt wird; der Entwurf
 * lässt es weg. Wer abbricht, findet seinen Stand auch auf einem anderen Gerät.
 */

import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  ImagePlus,
  Loader2,
  Send,
  Sparkles,
  Trash2,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ProfilePreview } from './PreviewCards';
import {
  availableDisciplines,
  awardsOptions,
  employmentTypeOptions,
  FIELD_LABELS,
  missingRequiredFields,
  pepeYearsOptions,
  stageExperienceOptions,
} from './options';

export interface WizardProfile {
  name: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  phoneNumber: string;
  disciplines: string[];
  bio: string;
  instagram?: string;
  profileImageUrl: string | null;
  galleryUrls: string[];
  galleryFiles: File[];
  stageExperience: string;
  employmentType: string;
  circusEducation: boolean;
  awardsLevel: string;
  pepeYears: number;
  pepeExclusivity: boolean;
  priceMin?: number | null;
  priceMax?: number | null;
}

export interface ProfileWizardProps {
  profile: WizardProfile;
  setProfile: (updates: Record<string, unknown>) => void;
  email?: string | null;
  saving?: boolean;
  error?: string | null;
  /** Speichert den Stand, ohne einzureichen. `false` heisst: nicht gespeichert. */
  onSaveDraft: () => Promise<boolean>;
  /** Reicht zur Prüfung ein. */
  onSubmit: () => void | Promise<void>;
}

const STEPS = [
  { title: 'Wer bist du?', short: 'Person' },
  { title: 'Was machst du?', short: 'Disziplinen' },
  { title: 'Deine Erfahrung', short: 'Erfahrung' },
  { title: 'Bild, Text und Vorschau', short: 'Vorschau' },
] as const;

/** Welche Pflichtfelder in welchem Schritt stehen. */
const REQUIRED_BY_STEP: Record<number, string[]> = {
  0: ['name', 'phoneNumber', 'street', 'postalCode', 'city', 'country'],
  1: ['disciplines'],
  2: [],
  3: [],
};

/**
 * Der Schritt, in dem der erste noch fehlende Pflichtwert steht.
 *
 * Damit landet man beim Zurückkommen dort, wo es weitergeht — ohne dass der
 * Fortschritt irgendwo zusätzlich gespeichert werden muss. Ist alles Pflichtige
 * da, geht es zum letzten Schritt, denn dort wird eingereicht.
 */
export function firstIncompleteStep(profile: WizardProfile): number {
  const missing = missingRequiredFields(profile);
  if (missing.length === 0) return STEPS.length - 1;
  for (let step = 0; step < STEPS.length; step += 1) {
    if (REQUIRED_BY_STEP[step]?.some((field) => missing.includes(field))) return step;
  }
  return 0;
}

function StepProgress({
  current,
  onJump,
  maxReached,
}: {
  current: number;
  onJump: (step: number) => void;
  maxReached: number;
}) {
  const percent = Math.round(((current + 1) / STEPS.length) * 100);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm text-gray-400">
          Schritt <span className="font-semibold text-white">{current + 1}</span> von {STEPS.length}
        </p>
        <p className="text-sm text-gray-500">{STEPS[current].title}</p>
      </div>

      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Fortschritt der Anmeldung"
      >
        <div
          className="h-full rounded-full bg-pepe-gold transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Zurückspringen ist erlaubt, vorspringen nicht — sonst landet man in
          einem Schritt, dessen Voraussetzungen fehlen. */}
      <ol className="mt-3 flex list-none flex-wrap gap-x-4 gap-y-1">
        {STEPS.map((step, index) => {
          const done = index < current;
          const reachable = index <= maxReached;
          return (
            <li key={step.short}>
              <button
                type="button"
                onClick={() => reachable && onJump(index)}
                disabled={!reachable}
                aria-current={index === current ? 'step' : undefined}
                className={cn(
                  'flex items-center gap-1.5 rounded text-xs transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pepe-gold',
                  index === current
                    ? 'font-semibold text-pepe-gold'
                    : reachable
                      ? 'text-gray-400 hover:text-white'
                      : 'cursor-default text-gray-600'
                )}
              >
                {done && <Check className="h-3 w-3" aria-hidden="true" />}
                {step.short}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Field({
  id,
  label,
  required,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div>
      <Label htmlFor={id} className="text-sm text-gray-200">
        {label}
        {required ? (
          <span className="ml-1 text-pepe-gold" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="ml-1.5 text-xs font-normal text-gray-500">optional</span>
        )}
      </Label>
      <div className="mt-1.5">{children}</div>
      {hint && (
        <p id={hintId} className="mt-1 text-xs text-gray-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-white/15 bg-pepe-surface px-3 py-2.5 text-white placeholder:text-gray-600 focus:border-pepe-gold focus:outline-none focus:ring-1 focus:ring-pepe-gold';

export function ProfileWizard({
  profile,
  setProfile,
  email,
  saving = false,
  error,
  onSaveDraft,
  onSubmit,
}: ProfileWizardProps) {
  const [step, setStep] = useState(() => firstIncompleteStep(profile));
  const [maxReached, setMaxReached] = useState(() => firstIncompleteStep(profile));
  const [touched, setTouched] = useState(false);

  const missing = useMemo(() => missingRequiredFields(profile), [profile]);
  const stepMissing = (REQUIRED_BY_STEP[step] ?? []).filter((f) => missing.includes(f));
  const canContinue = stepMissing.length === 0;

  const goTo = (next: number) => {
    setStep(next);
    setMaxReached((prev) => Math.max(prev, next));
    setTouched(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = async () => {
    if (!canContinue) {
      setTouched(true);
      return;
    }
    // Still sichern. Schlägt es fehl, bleibt man stehen und sieht den Grund —
    // der Aufrufer setzt `error`.
    const ok = await onSaveDraft();
    if (ok) goTo(step + 1);
  };

  const errorFor = (field: string) =>
    touched && missing.includes(field) ? `${FIELD_LABELS[field]} fehlt noch.` : undefined;

  return (
    <div className="space-y-6">
      <StepProgress current={step} onJump={goTo} maxReached={maxReached} />

      {error && (
        <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
        <h2 className="font-display text-xl font-semibold text-white">{STEPS[step].title}</h2>

        {/* ---------------- Schritt 1: Person ---------------- */}
        {step === 0 && (
          <>
            <p className="mt-1.5 text-sm text-gray-400">
              Nur das Nötigste. Die Adresse braucht die Agentur, um die Anfahrt zu berechnen — sie
              wird nicht öffentlich gezeigt.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field id="w-name" label="Künstlername oder Name" required error={errorFor('name')}>
                <Input
                  id="w-name"
                  className={inputClass}
                  value={profile.name}
                  onChange={(e) => setProfile({ name: e.target.value })}
                  placeholder="Alex Beispiel"
                  autoComplete="name"
                />
              </Field>
              <Field id="w-phone" label="Telefonnummer" required error={errorFor('phoneNumber')}
                     hint="Für kurzfristige Rückfragen zu einem Gig.">
                <Input
                  id="w-phone"
                  className={inputClass}
                  value={profile.phoneNumber}
                  onChange={(e) => setProfile({ phoneNumber: e.target.value })}
                  placeholder="+49 89 123456"
                  autoComplete="tel"
                  inputMode="tel"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field id="w-street" label="Straße und Hausnummer" required error={errorFor('street')}>
                  <Input
                    id="w-street"
                    className={inputClass}
                    value={profile.street}
                    onChange={(e) => setProfile({ street: e.target.value })}
                    autoComplete="street-address"
                  />
                </Field>
              </div>
              <Field id="w-zip" label="PLZ" required error={errorFor('postalCode')}>
                <Input
                  id="w-zip"
                  className={inputClass}
                  value={profile.postalCode}
                  onChange={(e) => setProfile({ postalCode: e.target.value })}
                  autoComplete="postal-code"
                  inputMode="numeric"
                />
              </Field>
              <Field id="w-city" label="Stadt" required error={errorFor('city')}>
                <Input
                  id="w-city"
                  className={inputClass}
                  value={profile.city}
                  onChange={(e) => setProfile({ city: e.target.value })}
                  autoComplete="address-level2"
                />
              </Field>
              <Field id="w-country" label="Land" required error={errorFor('country')}>
                <Input
                  id="w-country"
                  className={inputClass}
                  value={profile.country}
                  onChange={(e) => setProfile({ country: e.target.value })}
                  autoComplete="country-name"
                  placeholder="Deutschland"
                />
              </Field>
            </div>
          </>
        )}

        {/* ---------------- Schritt 2: Disziplinen ---------------- */}
        {step === 1 && (
          <>
            <p className="mt-1.5 text-sm text-gray-400">
              Wähle alles, was du auftrittsreif kannst. Danach richtet sich, welche Anfragen bei dir
              landen. Eine genügt.
            </p>
            <fieldset className="mt-5">
              <legend className="sr-only">Disziplinen</legend>
              <div className="flex flex-wrap gap-2">
                {availableDisciplines.map((d) => {
                  const active = profile.disciplines.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={active}
                      onClick={() =>
                        setProfile({
                          disciplines: active
                            ? profile.disciplines.filter((x) => x !== d)
                            : [...profile.disciplines, d],
                        })
                      }
                      className={cn(
                        'rounded-full border px-4 py-2 text-sm transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pepe-gold',
                        active
                          ? 'border-pepe-gold/50 bg-pepe-gold/15 text-pepe-gold'
                          : 'border-white/15 text-gray-300 hover:bg-white/5 hover:text-white'
                      )}
                    >
                      {active && <Check className="mr-1.5 inline h-3.5 w-3.5" aria-hidden="true" />}
                      {d}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            {touched && stepMissing.includes('disciplines') && (
              <p className="mt-3 text-sm text-red-400">Bitte wähle mindestens eine Disziplin.</p>
            )}
            <p className="mt-4 text-sm text-gray-500">
              {profile.disciplines.length} ausgewählt
            </p>
          </>
        )}

        {/* ---------------- Schritt 3: Erfahrung ---------------- */}
        {step === 2 && (
          <>
            <p className="mt-1.5 text-sm text-gray-400">
              Freiwillig — aber diese Angaben bestimmen deine Gage. Ohne sie rechnet die Agentur mit
              dem Grundwert. Du kannst sie jederzeit nachtragen.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field id="w-exp" label="Bühnenerfahrung">
                <select
                  id="w-exp"
                  className={inputClass}
                  value={profile.stageExperience}
                  onChange={(e) => setProfile({ stageExperience: e.target.value })}
                >
                  {stageExperienceOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="w-empl" label="Wie oft trittst du auf?">
                <select
                  id="w-empl"
                  className={inputClass}
                  value={profile.employmentType}
                  onChange={(e) => setProfile({ employmentType: e.target.value })}
                >
                  {employmentTypeOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="w-awards" label="Auszeichnungen">
                <select
                  id="w-awards"
                  className={inputClass}
                  value={profile.awardsLevel}
                  onChange={(e) => setProfile({ awardsLevel: e.target.value })}
                >
                  {awardsOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="w-years" label="Schon bei Pepe Shows?">
                <select
                  id="w-years"
                  className={inputClass}
                  value={String(profile.pepeYears)}
                  onChange={(e) => setProfile({ pepeYears: Number(e.target.value) })}
                >
                  {pepeYearsOptions.map((o) => (
                    <option key={o.value} value={String(o.value)}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="mt-5 space-y-3">
              {[
                {
                  key: 'circusEducation' as const,
                  label: 'Ich habe eine Zirkus- oder Artistikausbildung',
                  value: profile.circusEducation,
                },
                {
                  key: 'pepeExclusivity' as const,
                  label: 'Ich trete ausschliesslich über Pepe Shows auf',
                  value: profile.pepeExclusivity,
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 p-3 transition-colors hover:bg-white/5"
                >
                  <input
                    type="checkbox"
                    checked={item.value}
                    onChange={(e) => setProfile({ [item.key]: e.target.checked })}
                    className="mt-0.5 h-4 w-4 flex-shrink-0 accent-[var(--pepe-gold)]"
                  />
                  <span className="text-sm text-gray-200">{item.label}</span>
                </label>
              ))}
            </div>
          </>
        )}

        {/* ---------------- Schritt 4: Bild, Text, Vorschau ---------------- */}
        {step === 3 && (
          <>
            <p className="mt-1.5 text-sm text-gray-400">
              Rechts siehst du live, was daraus wird. Beides ist freiwillig — du kannst auch ohne
              Bild einreichen und es später nachlegen.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-5">
                <Field
                  id="w-bio"
                  label="Kurzvorstellung"
                  hint="Zwei bis drei Sätze. Was machst du, was macht es besonders?"
                >
                  <Textarea
                    id="w-bio"
                    className={cn(inputClass, 'min-h-[120px] resize-y')}
                    value={profile.bio}
                    onChange={(e) => setProfile({ bio: e.target.value })}
                    maxLength={1000}
                    placeholder="Cyr Wheel seit zwölf Jahren, auf Bühnen und auf der Strasse…"
                  />
                </Field>

                <Field id="w-insta" label="Instagram" hint="Erscheint als Link auf deiner Künstlerseite.">
                  <Input
                    id="w-insta"
                    className={inputClass}
                    value={profile.instagram ?? ''}
                    onChange={(e) => setProfile({ instagram: e.target.value })}
                    placeholder="@deinname"
                  />
                </Field>

                <div>
                  <Label htmlFor="w-photo" className="text-sm text-gray-200">
                    Profilbild
                    <span className="ml-1.5 text-xs font-normal text-gray-500">optional</span>
                  </Label>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3">
                    <label
                      htmlFor="w-photo"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/15 px-3 py-2.5 text-sm text-gray-200 transition-colors hover:bg-white/5"
                    >
                      <ImagePlus className="h-4 w-4" aria-hidden="true" />
                      {profile.profileImageUrl ? 'Anderes Bild wählen' : 'Bild wählen'}
                    </label>
                    <input
                      id="w-photo"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setProfile({ profileImageFile: file });
                      }}
                    />
                    {profile.profileImageUrl && (
                      <button
                        type="button"
                        onClick={() => setProfile({ profileImageUrl: null, profileImageFile: null })}
                        className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        Entfernen
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Ein Hochformat wirkt am besten. Maximal 4 MB.
                  </p>
                </div>

                <div>
                  <Label htmlFor="w-gallery" className="text-sm text-gray-200">
                    Galerie
                    <span className="ml-1.5 text-xs font-normal text-gray-500">optional</span>
                  </Label>
                  <div className="mt-1.5">
                    <label
                      htmlFor="w-gallery"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/15 px-3 py-2.5 text-sm text-gray-200 transition-colors hover:bg-white/5"
                    >
                      <ImagePlus className="h-4 w-4" aria-hidden="true" />
                      Bilder hinzufügen
                    </label>
                    <input
                      id="w-gallery"
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={(e) => {
                        const files = Array.from(e.target.files ?? []);
                        if (files.length) {
                          setProfile({ galleryFiles: [...profile.galleryFiles, ...files] });
                        }
                      }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {profile.galleryUrls.length + profile.galleryFiles.length} ausgewählt
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  Vorschau
                </p>
                <ProfilePreview
                  profile={{
                    name: profile.name,
                    bio: profile.bio,
                    disciplines: profile.disciplines,
                    profileImageUrl: profile.profileImageUrl,
                    galleryUrls: [
                      ...profile.galleryUrls,
                      // Noch nicht hochgeladene Dateien zaehlen fuer die
                      // Vorschau mit, sonst wirkt die Galerie leer, obwohl
                      // gerade etwas ausgewaehlt wurde.
                      ...profile.galleryFiles.map((_, i) => `pending-${i}`),
                    ],
                    instagram: profile.instagram,
                    email,
                    phoneNumber: profile.phoneNumber,
                    street: profile.street,
                    postalCode: profile.postalCode,
                    city: profile.city,
                    country: profile.country,
                    priceMin: profile.priceMin,
                    priceMax: profile.priceMax,
                  }}
                />
              </div>
            </div>

            {missing.length > 0 && (
              <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                <p className="text-sm font-medium text-amber-200">
                  Vor dem Einreichen fehlt noch:
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-100/90">
                  {missing.map((field) => (
                    <li key={field}>{FIELD_LABELS[field] ?? field}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => goTo(firstIncompleteStep(profile))}
                  className="mt-3 text-sm font-medium text-amber-200 underline-offset-4 hover:underline"
                >
                  Dorthin springen
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Steuerung. Auf dem Handy untereinander, damit die Flächen gross bleiben. */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => goTo(Math.max(0, step - 1))}
          disabled={step === 0 || saving}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pepe-gold disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Zurück
        </button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {step === STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => void onSubmit()}
              disabled={saving || missing.length > 0}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-pepe-gold px-5 py-2.5 text-sm font-semibold text-pepe-black transition-colors hover:bg-pepe-gold-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pepe-gold focus-visible:ring-offset-2 focus-visible:ring-offset-pepe-coal disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="h-4 w-4" aria-hidden="true" />
              )}
              {saving ? 'Wird gesendet…' : 'Zur Prüfung einreichen'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void handleNext()}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-pepe-gold px-5 py-2.5 text-sm font-semibold text-pepe-black transition-colors hover:bg-pepe-gold-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pepe-gold focus-visible:ring-offset-2 focus-visible:ring-offset-pepe-coal disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              )}
              {saving ? 'Speichert…' : 'Weiter'}
            </button>
          )}

          {/* Der Ausweg für Schritt 3 und 4: weiter, ohne etwas auszufüllen. */}
          {step === 2 && (
            <button
              type="button"
              onClick={() => void handleNext()}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm text-gray-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pepe-gold"
            >
              Später ausfüllen
            </button>
          )}
        </div>
      </div>

      <p className="flex items-start gap-2 text-xs text-gray-500">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
        Dein Stand wird bei jedem Schritt gespeichert. Du kannst jederzeit aufhören und später
        weitermachen, auch auf einem anderen Gerät.
      </p>
    </div>
  );
}

export default ProfileWizard;
