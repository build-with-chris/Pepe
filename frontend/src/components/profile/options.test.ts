import { describe, expect, it } from 'vitest';

import { missingRequiredFields, profileCompleteness } from './options';

const vollstaendig = {
  name: 'Alex Beispiel',
  phoneNumber: '+49 89 123456',
  street: 'Teststrasse 1',
  postalCode: '80331',
  city: 'München',
  country: 'Deutschland',
  disciplines: ['Jonglage'],
};

const leer = {
  name: '',
  phoneNumber: '',
  street: '',
  postalCode: '',
  city: '',
  country: '',
  disciplines: [] as string[],
};

const keineExtras = {
  bio: '',
  profileImageUrl: null,
  galleryUrls: [] as string[],
  stageExperience: '',
  employmentType: '',
};

describe('missingRequiredFields', () => {
  it('meldet nichts, wenn alles da ist', () => {
    expect(missingRequiredFields(vollstaendig)).toEqual([]);
  });

  it('meldet alle sieben Pflichtangaben, wenn nichts da ist', () => {
    expect(missingRequiredFields(leer)).toHaveLength(7);
  });

  it('zaehlt Leerzeichen nicht als Angabe', () => {
    expect(missingRequiredFields({ ...vollstaendig, name: '   ' })).toEqual(['name']);
  });

  it('braucht mindestens eine Disziplin', () => {
    expect(missingRequiredFields({ ...vollstaendig, disciplines: [] })).toEqual(['disciplines']);
  });
});

describe('profileCompleteness', () => {
  it('ist 0 bei einem leeren Profil', () => {
    expect(profileCompleteness(leer, keineExtras).percent).toBe(0);
  });

  it('erreicht genau 50 Prozent, wenn nur die Pflicht erfuellt ist', () => {
    // Absicht: Nach dem Einreichen steht der Balken auf der Haelfte, damit
    // sichtbar bleibt, dass Foto und Bio noch fehlen.
    expect(profileCompleteness(vollstaendig, keineExtras).percent).toBe(50);
  });

  it('erreicht 100 Prozent, wenn auch die vier Extras da sind', () => {
    const result = profileCompleteness(vollstaendig, {
      bio: 'Eine Vorstellung, die lang genug ist, um etwas zu sagen. Wirklich.',
      profileImageUrl: 'https://blob.example/bild.webp',
      galleryUrls: ['https://blob.example/g1.webp'],
      stageExperience: '3-7',
      employmentType: 'teilzeit',
    });
    expect(result.percent).toBe(100);
    expect(result.todo).toEqual([]);
  });

  it('zaehlt eine sehr kurze Bio nicht als erledigt', () => {
    const result = profileCompleteness(vollstaendig, { ...keineExtras, bio: 'Hi' });
    expect(result.todo.map((t) => t.key)).toContain('bio');
  });

  it('nennt konkret, was noch fehlt', () => {
    const result = profileCompleteness({ ...vollstaendig, name: '' }, keineExtras);
    const labels = result.todo.map((t) => t.label);
    expect(labels).toContain('Name ergänzen');
    expect(labels).toContain('Profilbild hinzufügen');
  });

  it('bleibt zwischen 0 und 100', () => {
    for (const p of [leer, vollstaendig]) {
      const { percent } = profileCompleteness(p, keineExtras);
      expect(percent).toBeGreaterThanOrEqual(0);
      expect(percent).toBeLessThanOrEqual(100);
    }
  });
});
