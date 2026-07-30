import { describe, expect, it } from 'vitest';

import {
  eventCity,
  formatEventDate,
  formatEventDateTime,
  formatMoney,
  parseEventDate,
} from './dates';

describe('formatEventDateTime', () => {
  it('nennt den Wochentag, das Datum und die Uhrzeit', () => {
    // Bei Auftritten entscheidet der Wochentag über Gage und Verfügbarkeit.
    expect(formatEventDateTime('2026-09-19', '19:00:00')).toBe('Sa., 19.09.2026, 19:00 Uhr');
  });

  it('laesst die Uhrzeit weg, wenn keine da ist', () => {
    expect(formatEventDateTime('2026-09-19', null)).toBe('Sa., 19.09.2026');
    expect(formatEventDateTime('2026-09-19')).toBe('Sa., 19.09.2026');
  });

  it('behandelt die Zeichenketten "null" und "undefined" wie fehlend', () => {
    // Beides kommt so aus dem Backend.
    expect(formatEventDateTime('2026-09-19', 'null')).toBe('Sa., 19.09.2026');
    expect(formatEventDateTime('2026-09-19', 'undefined')).toBe('Sa., 19.09.2026');
  });

  it('kommt auch mit HH:MM ohne Sekunden klar', () => {
    expect(formatEventDateTime('2026-09-19', '19:00')).toBe('Sa., 19.09.2026, 19:00 Uhr');
  });

  it('gibt bei fehlendem oder kaputtem Datum einen Strich', () => {
    expect(formatEventDateTime(null)).toBe('—');
    expect(formatEventDateTime('')).toBe('—');
    expect(formatEventDateTime('kein-datum')).toBe('—');
  });

  it('formatiert immer deutsch, unabhaengig vom Browser', () => {
    // Vorher stand in RequestCard ein `toLocaleString()` ohne Gebietsschema.
    // Auf einem englischen Browser stand dort "9/19/2026, 7:00:00 PM".
    const out = formatEventDateTime('2026-09-19', '19:00:00');
    expect(out).not.toMatch(/PM|AM/);
    expect(out).toContain('19.09.2026');
  });
});

describe('formatEventDate', () => {
  it('gibt nur das Datum', () => {
    expect(formatEventDate('2026-09-19')).toBe('19.09.2026');
  });

  it('gibt bei fehlendem Datum einen Strich', () => {
    expect(formatEventDate(null)).toBe('—');
  });
});

describe('parseEventDate', () => {
  it('nimmt Mitternacht, wenn keine Uhrzeit da ist', () => {
    const d = parseEventDate('2026-09-19');
    expect(d?.getHours()).toBe(0);
    expect(d?.getMinutes()).toBe(0);
  });

  it('uebernimmt die Uhrzeit', () => {
    expect(parseEventDate('2026-09-19', '19:30:00')?.getHours()).toBe(19);
  });

  it('gibt null bei Unsinn', () => {
    expect(parseEventDate('kein-datum')).toBeNull();
    expect(parseEventDate(null)).toBeNull();
  });
});

describe('formatMoney', () => {
  it('formatiert deutsch mit Euro und ohne Nachkommastellen', () => {
    //   ist das geschuetzte Leerzeichen, das Intl vor das € setzt.
    expect(formatMoney(1200)).toBe('1.200 €');
    expect(formatMoney(0)).toBe('0 €');
  });

  it('rundet auf ganze Euro', () => {
    expect(formatMoney(1199.6)).toBe('1.200 €');
  });

  it('gibt bei fehlendem Wert einen Strich', () => {
    expect(formatMoney(null)).toBe('—');
    expect(formatMoney(undefined)).toBe('—');
    expect(formatMoney(Number.NaN)).toBe('—');
  });
});

describe('eventCity', () => {
  it('nimmt das letzte Segment', () => {
    expect(eventCity('Teststrasse 1, München')).toBe('München');
  });

  it('ueberspringt das Land', () => {
    // Genau daran scheiterte die alte Variante: Sie zeigte „Deutschland" als Ort.
    expect(eventCity('Teststrasse 1, 80331 München, Deutschland')).toBe('München');
    expect(eventCity('Weg 2, 1010 Wien, Österreich')).toBe('Wien');
  });

  it('schneidet die Postleitzahl ab', () => {
    expect(eventCity('Teststrasse 1, 80331 München')).toBe('München');
  });

  it('gibt undefined ohne Adresse', () => {
    expect(eventCity(null)).toBeUndefined();
    expect(eventCity('')).toBeUndefined();
  });

  it('gibt die Adresse zurueck, wenn kein Komma drin ist', () => {
    expect(eventCity('München')).toBe('München');
  });
});
