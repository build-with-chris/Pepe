import { describe, expect, it } from 'vitest';

import {
  activeHref,
  adminNav,
  areaForPath,
  artistNav,
  navFor,
  primaryItems,
  secondaryItems,
} from './nav';

describe('areaForPath', () => {
  it('erkennt den Admin-Bereich', () => {
    expect(areaForPath('/admin')).toBe('admin');
    expect(areaForPath('/admin/kuenstler')).toBe('admin');
    expect(areaForPath('/admin/requests/12/offers/3/edit')).toBe('admin');
  });

  it('alles andere ist das Künstler-Portal', () => {
    expect(areaForPath('/profil')).toBe('artist');
    expect(areaForPath('/buchhaltung')).toBe('artist');
    expect(areaForPath('/')).toBe('artist');
  });

  it('springt nicht auf einen Pfad an, der nur so anfängt', () => {
    expect(areaForPath('/administration')).toBe('artist');
  });
});

describe('activeHref', () => {
  it('markiert den direkt aufgerufenen Eintrag', () => {
    expect(activeHref('/profil', artistNav)).toBe('/profil');
    expect(activeHref('/buchhaltung', artistNav)).toBe('/buchhaltung');
  });

  it('markiert auch auf Unterseiten', () => {
    // Vorher war hier gar nichts markiert.
    expect(activeHref('/admin/requests/12/offers/3/edit', adminNav)).toBe('/admin');
  });

  it('der längste passende Pfad gewinnt', () => {
    // `/admin/kuenstler` faengt mit `/admin` an — trotzdem muss Künstler
    // gewinnen, nicht Dashboard.
    expect(activeHref('/admin/kuenstler', adminNav)).toBe('/admin/kuenstler');
  });

  it('kennt die Alias-Routen aus App.tsx', () => {
    expect(activeHref('/profile', artistNav)).toBe('/profil');
    expect(activeHref('/profile-setup', artistNav)).toBe('/profil');
    expect(activeHref('/calendar', artistNav)).toBe('/kalender');
    expect(activeHref('/gigs', artistNav)).toBe('/meine-gigs');
    expect(activeHref('/admin/artists', adminNav)).toBe('/admin/kuenstler');
    expect(activeHref('/admin/dashboard', adminNav)).toBe('/admin');
  });

  it('verwechselt aehnlich beginnende Pfade nicht', () => {
    // `/profil` darf nicht auf `/profilxyz` passen.
    expect(activeHref('/profilxyz', artistNav)).toBeNull();
  });

  it('gibt null zurueck, wenn nichts passt', () => {
    expect(activeHref('/impressum', artistNav)).toBeNull();
    expect(activeHref('/profil', adminNav)).toBeNull();
  });
});

describe('Aufteilung fuer die Tab-Leiste', () => {
  it('vier Haupteintraege je Bereich, damit die Leiste plus Mehr fuenf Felder hat', () => {
    expect(primaryItems(artistNav)).toHaveLength(4);
    expect(primaryItems(adminNav)).toHaveLength(4);
  });

  it('primaer und sekundaer ergeben zusammen die ganze Liste', () => {
    for (const items of [artistNav, adminNav]) {
      expect(primaryItems(items).length + secondaryItems(items).length).toBe(items.length);
    }
  });

  it('Buchhaltung steht in der Navigation', () => {
    // Die Seite war vorher nur über die eingetippte URL erreichbar.
    expect(artistNav.map((i) => i.href)).toContain('/buchhaltung');
  });
});

describe('navFor', () => {
  it('liefert die Liste zum Bereich', () => {
    expect(navFor('admin')).toBe(adminNav);
    expect(navFor('artist')).toBe(artistNav);
  });

  it('jeder Pfad ist eindeutig', () => {
    const all = [...artistNav, ...adminNav].flatMap((i) => [i.href, ...(i.aliases ?? [])]);
    expect(new Set(all).size).toBe(all.length);
  });
});
