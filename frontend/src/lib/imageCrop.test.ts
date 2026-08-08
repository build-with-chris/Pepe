/**
 * Zuschnitt-Mathematik.
 *
 * Der Anlass: Ein Hochformat landete in einem quadratischen Rahmen, und der
 * Browser schnitt beim Anzeigen mittig zu. Kopf oder Fuesse fielen weg, ohne
 * dass jemand Einfluss darauf hatte. Der Ausschnitt wird jetzt vorher
 * festgelegt, und diese Funktionen muessen dabei zwei Dinge garantieren: Das
 * Seitenverhaeltnis stimmt, und der Rahmen bleibt im Bild.
 */
import { describe, expect, it } from 'vitest';

import {
  PROFILE_ASPECT,
  centeredCrop,
  clamp,
  clampCrop,
} from './imageCrop';

describe('PROFILE_ASPECT', () => {
  it('ist das Hochformat 3 zu 4', () => {
    // Festgenagelt, weil das Verhaeltnis zu den Bildrahmen in PreviewCards und
    // auf der Kuenstlerkarte passen muss. Wer es aendert, muss auch dort
    // nachziehen, sonst schneidet die Anzeige den gewaehlten Ausschnitt wieder
    // an — genau der Fehler, den der Zuschnitt beheben soll.
    expect(PROFILE_ASPECT).toBeCloseTo(0.75);
  });

  it('erzeugt aus einem Querformat einen hochkant stehenden Ausschnitt', () => {
    const crop = centeredCrop(2000, 1000, PROFILE_ASPECT);
    expect(crop.height).toBe(1000);
    expect(crop.width).toBe(750);
    expect(crop.width).toBeLessThan(crop.height);
  });
});

describe('centeredCrop', () => {
  it('nimmt bei einem Hochformat die volle Breite und sitzt mittig', () => {
    // 1000 breit, 2000 hoch, quadratisch gewuenscht.
    const crop = centeredCrop(1000, 2000, 1);
    expect(crop).toEqual({ x: 0, y: 500, width: 1000, height: 1000 });
  });

  it('nimmt bei einem Querformat die volle Hoehe und sitzt mittig', () => {
    const crop = centeredCrop(2000, 1000, 1);
    expect(crop).toEqual({ x: 500, y: 0, width: 1000, height: 1000 });
  });

  it('nimmt ein quadratisches Bild vollstaendig', () => {
    expect(centeredCrop(800, 800, 1)).toEqual({ x: 0, y: 0, width: 800, height: 800 });
  });

  it('haelt auch ein Hochformat-Verhaeltnis ein', () => {
    // 3 zu 4 aus einem quadratischen Bild: die Hoehe begrenzt.
    const crop = centeredCrop(1000, 1000, 0.75);
    expect(crop.width / crop.height).toBeCloseTo(0.75);
    expect(crop.height).toBe(1000);
    expect(crop.width).toBe(750);
    expect(crop.x).toBe(125);
  });
});

describe('clampCrop', () => {
  it('schiebt einen Rahmen zurueck ins Bild', () => {
    // Weit ueber den rechten und unteren Rand hinausgezogen.
    const crop = clampCrop({ x: 9999, y: 9999, width: 400, height: 400 }, 1000, 800, 1);
    expect(crop.x).toBe(600);
    expect(crop.y).toBe(400);
  });

  it('laesst keine negativen Koordinaten zu', () => {
    const crop = clampCrop({ x: -50, y: -50, width: 400, height: 400 }, 1000, 800, 1);
    expect(crop.x).toBe(0);
    expect(crop.y).toBe(0);
  });

  it('begrenzt den Rahmen auf das, was das Bild hergibt', () => {
    // Groesser als das Bild angefordert: die kuerzere Seite ist die Grenze.
    const crop = clampCrop({ x: 0, y: 0, width: 5000, height: 5000 }, 1000, 600, 1);
    expect(crop.width).toBe(600);
    expect(crop.height).toBe(600);
  });

  it('haelt das Seitenverhaeltnis, egal was hereinkommt', () => {
    const crop = clampCrop({ x: 0, y: 0, width: 400, height: 999 }, 1000, 1000, 0.75);
    expect(crop.width / crop.height).toBeCloseTo(0.75);
  });

  it('bleibt bei einem sehr kleinen Bild im Bild', () => {
    // Untergrenze darf nicht groesser werden als das Bild selbst.
    const crop = clampCrop({ x: 0, y: 0, width: 10, height: 10 }, 20, 20, 1);
    expect(crop.width).toBeLessThanOrEqual(20);
    expect(crop.x + crop.width).toBeLessThanOrEqual(20);
    expect(crop.y + crop.height).toBeLessThanOrEqual(20);
  });

  it('laesst den vollen Ausschnitt eines Hochformats unveraendert', () => {
    const full = centeredCrop(1000, 2000, PROFILE_ASPECT);
    expect(clampCrop(full, 1000, 2000, PROFILE_ASPECT)).toEqual(full);
  });
});

describe('clamp', () => {
  it('begrenzt nach unten und oben', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(5, 0, 10)).toBe(5);
  });
});
