/**
 * Gemeinsame Werte des Booking-Assistenten.
 *
 * Formular, Zusammenfassung und das Payload ans Backend lasen dieselben Werte
 * vorher an drei Stellen getrennt ab. Dabei ist zweimal dasselbe passiert: Die
 * Zusammenfassung prüfte `'group'`, während das Formular `'gruppe'` schrieb, und
 * die Show-Dauer erschien dem Kunden als "custom". Beides fällt weg, sobald es
 * nur noch diese eine Quelle gibt.
 */

// --- Teamgröße -------------------------------------------------------------

export const TEAM_SIZES = ['solo', 'duo', 'gruppe'] as const
export type TeamSize = (typeof TEAM_SIZES)[number]

/** Anzeigename der Teamgröße, z. B. für die Zusammenfassung. */
export const TEAM_SIZE_LABELS: Record<TeamSize, string> = {
  solo: 'Solo-Künstler',
  duo: 'Duo',
  gruppe: 'Gruppe (3+)',
}

/** Personenzahl fürs Backend. */
export const TEAM_SIZE_PEOPLE: Record<TeamSize, number> = {
  solo: 1,
  duo: 2,
  gruppe: 5,
}

export function teamSizeLabel(value: string): string {
  return TEAM_SIZE_LABELS[value as TeamSize] ?? ''
}

// --- Show-Dauer ------------------------------------------------------------

/** Der Wert für "Andere Dauer", der eine freie Minutenangabe verlangt. */
export const DURATION_CUSTOM = 'custom'

/** Schnellwahl im Formular: Wert, Beschriftung und Minuten in einem. */
export const DURATION_OPTIONS = [
  { value: '5min', label: '5 Min', minutes: 5 },
  { value: '10min', label: '10 Min', minutes: 10 },
  { value: '15min', label: '15 Min', minutes: 15 },
] as const

/**
 * Minuten für die gewählte Dauer, oder null, wenn die Angabe unvollständig ist.
 *
 * Bewusst kein stiller Rückfall auf einen Standardwert: Vorher wurde aus einer
 * leeren Angabe "30 Minuten", und der Kunde bekam einen Richtpreis für eine
 * Dauer genannt, die er nie gewählt hatte.
 */
export function durationMinutes(duration: string, customDuration: string): number | null {
  const option = DURATION_OPTIONS.find(o => o.value === duration)
  if (option) return option.minutes

  if (duration === DURATION_CUSTOM) {
    const minutes = parseInt(customDuration, 10)
    return Number.isFinite(minutes) && minutes > 0 ? minutes : null
  }
  return null
}

/** Lesbare Dauer für die Zusammenfassung, z. B. "15 Minuten". */
export function durationLabel(duration: string, customDuration: string): string {
  const minutes = durationMinutes(duration, customDuration)
  return minutes === null ? '' : `${minutes} Minuten`
}

// --- Vorschauvideos je Disziplin ------------------------------------------

/**
 * Video, das dem Kunden zeigt, wofür er zahlt.
 *
 * Die Dateien liegen unter `public/videos/disciplines/`. Es gibt noch nicht zu
 * jeder Disziplin eine eigene Aufnahme; alles ohne Eintrag bekommt den Trailer.
 * Neue Aufnahme einhängen heißt: Datei ablegen, eine Zeile hier ergänzen.
 */
export const DISCIPLINE_VIDEO_FALLBACK = '/videos/disciplines/trailer.mp4'

export const DISCIPLINE_VIDEOS: Record<string, string> = {
  'chinese-pole': '/videos/disciplines/chinese-pole.mp4',
  'cyr-wheel': '/videos/disciplines/cyr-wheel.mp4',
  'hula-hoop': '/videos/disciplines/dani.mp4',
  handstand: '/videos/disciplines/dani.mp4',
  pantomime: '/videos/disciplines/pantomime.mp4',
}

/**
 * Video zur Auswahl des Kunden. Die erste Disziplin mit eigener Aufnahme
 * gewinnt, sonst läuft der Trailer.
 */
export function disciplineVideo(disciplines: string[]): string {
  for (const value of disciplines) {
    const src = DISCIPLINE_VIDEOS[value]
    if (src) return src
  }
  return DISCIPLINE_VIDEO_FALLBACK
}
