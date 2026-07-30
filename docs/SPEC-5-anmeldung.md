# SPEC-5: Anmeldung in Schritten, mit Vorschau auf das eigene Profil

Setzt SPEC-1 bis SPEC-4 voraus. Stand 30.07.2026, Commit `1033d27`.

## Kontext

Ein Künstler kommt über ein einziges Formular ins System: `pages/ProfileSetup.tsx`
rendert `components/ProfileForm.tsx` mit sieben Karten und rund vierzehn Feldern
auf einmal. Nirgends steht, was davon Pflicht ist. Wer kein Foto zur Hand hat,
sieht ein Formular, das fertig aussehen will, und bricht ab.

Die Bausteine für den Umbau sind gebaut, getestet und gepusht. **Eingebunden ist
nichts** — `ProfileSetup.tsx` ist unverändert, die Anmeldung läuft weiter wie
bisher. Diese Spec beschreibt das Einbinden und das, was danach noch offen ist.

Fertig und unter Test (26 Tests):

| Datei | Inhalt |
|---|---|
| `components/profile/options.ts` | Auswahllisten, `missingRequiredFields`, `profileCompleteness` |
| `components/profile/PreviewCards.tsx` | `CustomerPreviewCard`, `AdminPreviewCard`, `ProfilePreview` |
| `components/profile/ProfileWizard.tsx` | Die vier Schritte, Fortschritt, Steuerung |

---

## Befunde

### P1 — Pflicht und optional stehen im Code, aber nicht im Formular

Pflicht sind sieben Angaben, nachzulesen in `handleSubmit`:
`name`, `street`, `postalCode`, `city`, `country`, `phoneNumber` und mindestens
eine Disziplin. Optional sind Bio, Profilbild, Galerie und alle sechs
Gage-Kriterien. Das Formular markiert keines davon.

`missingRequiredFields()` in `options.ts` ist jetzt die eine Quelle dafür.

### P2 — Speichern ist gleich Einreichen

`ProfileSetup.tsx` legt in jeden PATCH `approval_status: nextStatus`. Es gibt
keinen Weg, den Stand zu sichern, ohne die Prüfung anzustossen.

Das Backend (`update_my_profile` in `backend/routes/api_routes.py`) setzt den
Status nur, **wenn das Feld mitkommt**. Ein Entwurf braucht also keine
Backend-Änderung: PATCH ohne `approval_status`.

### P3 — Instagram ist an drei Stellen unterbrochen

- Es gibt kein Eingabefeld. `ProfileFormProps` kennt das Feld nicht, und
  `payload` in `handleSubmit` schickt es nicht mit.
- `components/ArtistCardFinal.tsx` liest `artist.social_links?.instagram`.
- `GET /api/artists` liefert flach `instagram`, und `pages/Kuenstler.tsx` baut
  daraus kein `social_links`.

Das Backend speichert das Feld (`api_routes.py:464`) und gibt es öffentlich aus.
Angezeigt wird es nie.

### P4 — Der Kunde sieht sechs Felder, die Agentur alles

`GET /api/artists` (nur freigegebene, `api_routes.py:258`) gibt heraus:
`name`, `disciplines`, `profile_image_url`, `bio`, `instagram`, `gallery_urls`.

`GET /api/admin/artists` (`admin_routes.py:469`) gibt zusätzlich `email`,
`phone_number`, `address`, `price_min`, `price_max`, `approval_status`.

Deshalb zwei getrennte Vorschauen. Ohne die Trennung weiss ein Künstler nicht,
dass Adresse und Telefonnummer **nicht** öffentlich sind — das ist keine
Kleinigkeit.

### P5 — Der Assistent passt nicht für alle

`ProfileSetup.tsx` dient zwei Zwecken: der ersten Anmeldung und dem späteren
Bearbeiten. Ein freigegebener Künstler, der eine Telefonnummer ändern will, darf
nicht durch vier Schritte laufen.

---

## Ziel

Ein neuer Künstler kommt in vier Schritten durch, kann jederzeit aufhören und
später weitermachen, und reicht auch ohne Foto ein. Vor dem Einreichen sieht er
zwei Karten: was der Kunde sehen wird und was die Agentur sieht.

## Nicht-Ziele

- **Keine Änderung an der Gagenberechnung.** Die sechs Kriterien werden nur
  anders präsentiert.
- **Kein neues Backend-Feld für den Fortschritt.** Der Einstiegsschritt wird aus
  den fehlenden Pflichtangaben abgeleitet (`firstIncompleteStep`).
- **Kein Umbau von `ProfileForm.tsx`.** Es bleibt das Formular zum Bearbeiten für
  bereits eingereichte Profile.
- **Keine Änderung an `submit_review`.** Das Einreichen läuft weiter über den
  vorhandenen Weg.

---

## Kriterien

1. **Vier Schritte statt einer Wand.** Ein Künstler mit
   `approval_status === 'unsubmitted'` sieht den Assistenten. Schritt 1 fragt
   Name, Telefon und Adresse, Schritt 2 die Disziplinen, Schritt 3 die
   Erfahrung, Schritt 4 Bio, Instagram und Bilder neben der Vorschau.

2. **Wer schon eingereicht hat, sieht das Formular.** Bei `pending`, `approved`
   oder `rejected` erscheint `ProfileForm` wie bisher, nicht der Assistent.

3. **Einreichen geht ohne Foto.** Fehlen nur optionale Angaben, ist der
   Einreichen-Knopf aktiv. Fehlt eine Pflichtangabe, ist er gesperrt und darüber
   steht, welche.

4. **Jeder Schritt sichert den Stand.** Ein „Weiter"-Klick schickt PATCH
   **ohne** `approval_status`. Nach einem Neuladen steht man im ersten Schritt
   mit fehlender Pflichtangabe, und die vorher eingegebenen Werte sind da — auch
   auf einem anderen Gerät.

5. **Die Vorschau sagt die Wahrheit.** Die Kundenkarte zeigt nur die sechs
   öffentlichen Felder, schneidet die Disziplinen nach zwei ab und benennt
   ausdrücklich, dass Adresse, Telefon und Gage nicht öffentlich sind. Die
   Agenturkarte zeigt Kontakt, Adresse und Gagenspanne.

6. **Instagram kommt an.** Es gibt ein Eingabefeld, der PATCH schickt es, und
   auf der öffentlichen Künstlerseite erscheint der Link.

7. **Der Fortschritt bleibt nach dem Einreichen sichtbar.** Auf dem Profil steht
   ein Balken mit `profileCompleteness`; bei erfüllter Pflicht und ohne Extras
   steht er bei 50 Prozent, mit den konkreten offenen Punkten darunter.

---

## Umsetzung

### Schritt 1 — Instagram in den Zustand

**`pages/ProfileSetup.tsx`**

- `const [instagram, setInstagram] = useState('')` ergänzen.
- Beim Laden aus `/api/artists/me` setzen (dort, wo `bio` gesetzt wird).
- In das `profile`-Objekt (ab Zeile 481) und in `setProfileAdapter` (ab 507)
  aufnehmen, analog zu `bio`.
- In den PATCH-`payload` aufnehmen: `instagram: instagram.trim() || undefined`.

Das Backend nimmt es schon an, siehe P3.

### Schritt 2 — Entwurf speichern trennen

**`pages/ProfileSetup.tsx`**

`handleSubmit` macht heute beides in einem. Auftrennen in:

- `persist({ submit }: { submit: boolean })` — enthält den vorhandenen Ablauf
  (`ensureArtistId` → Bilder hochladen → PATCH). `approval_status` kommt **nur**
  in den Payload, wenn `submit` true ist.
- `saveDraft()` → `persist({ submit: false })`, gibt `boolean` zurück, wie
  `ProfileWizardProps.onSaveDraft` es erwartet.
- `handleSubmit()` → `persist({ submit: true })`.

Die Pflichtprüfung am Anfang von `handleSubmit` durch `missingRequiredFields`
aus `options.ts` ersetzen, damit es eine Quelle bleibt (P1). Beim Entwurf
**nicht** prüfen — ein halb gefüllter Entwurf ist der Normalfall.

Achtung: Bilder werden im Entwurf mit hochgeladen. Das ist gewollt, sonst wäre
die Vorschau nach einem Neuladen leer.

### Schritt 3 — Assistent oder Formular

**`pages/ProfileSetup.tsx`**

```
const useWizard = approvalStatus === 'unsubmitted' && !locked;
```

`useWizard` → `<ProfileWizard profile={profile} setProfile={setProfileAdapter}
email={user?.email} saving={loading} error={error} onSaveDraft={saveDraft}
onSubmit={handleSubmit} />`, sonst `<ProfileForm …>` wie bisher.

Der `ProfileStatusBanner` bleibt in beiden Fällen darüber.

### Schritt 4 — Fortschritt im Profil

**`pages/ProfileSetup.tsx`**, nur wenn *nicht* der Assistent läuft: über dem
Formular einen Balken aus `profileCompleteness(profile, profile)` mit der
`todo`-Liste. Das ist der Ort, an dem ein nachgereichtes Foto angestossen wird
(Kriterium 7).

### Schritt 5 — Instagram auf der öffentlichen Karte

**`components/ArtistCardFinal.tsx`** — `normalizeInstagram` mit
`artist.social_links?.instagram ?? artist.instagram` füttern. Beide Formen
zulassen, weil `/api/artists` flach liefert und andere Aufrufer möglicherweise
`social_links` benutzen.

### Schritt 6 — Tests

**`components/profile/ProfileWizard.test.tsx`** (neu), mit jsdom wie in
`components/DashboardLayout.test.tsx`:

- Startet im ersten Schritt mit fehlender Pflichtangabe (`firstIncompleteStep`).
- „Weiter" ohne Pflichtangabe wechselt nicht den Schritt und nennt das fehlende
  Feld.
- „Weiter" mit vollständigem Schritt ruft `onSaveDraft` und wechselt erst bei
  `true`.
- Im letzten Schritt ist „Zur Prüfung einreichen" bei fehlender Pflichtangabe
  gesperrt, ohne Foto aber aktiv.
- Zurückspringen ist möglich, Vorspringen über `maxReached` hinaus nicht.
- Beide Vorschaukarten sind im letzten Schritt vorhanden.

**`pages/ProfileSetup.test.tsx`** (neu): Assistent bei `unsubmitted`, Formular
bei `pending` und `approved`.

---

## Verifikation

1. `cd frontend && npx vitest run` — alle Tests.
2. `npx tsc -b --pretty false | grep -c "error TS"` — muss **54** bleiben oder
   sinken. Diese 54 sind vorbestehend; ein Anstieg ist eine Regression. Die
   Zählung immer gegen `git stash` vergleichen, nicht aus dem Kopf.
3. `npm run build` — muss durchlaufen. `npm run build` ruft **nicht** `tsc`.
4. Im laufenden Dev-Server als neuer Künstler durchgehen: Schritt 1 ausfüllen,
   Fenster schliessen, neu laden → Stand ist da. Ohne Foto einreichen →
   `approval_status` ist `pending`, in der Datenbank steht die echte Adresse.
5. Gegenprobe zur Vorschau: In der Kundenkarte darf die Telefonnummer nirgends
   auftauchen. Der Test dazu steht in `PreviewCards.test.tsx`.

---

## Unterhalb der Schnittlinie (bewusst verschoben)

Diese Künstlerseiten sind unangetastet und im Altzustand. Reihenfolge nach
vermutetem Nutzen:

1. **`pages/Kalender.tsx`** (344 Zeilen) — Verfügbarkeit pflegen. Bestimmt
   direkt, welche Anfragen ein Künstler bekommt, und ist damit nach dem Profil
   das Wichtigste.
2. **`pages/MyGigs.tsx`** (208) — bestätigte Auftritte. Nutzt noch nicht
   `formatEventDateTime` aus `utils/dates`, also kein Wochentag.
3. **`pages/Buchhaltung/Buchhaltung.tsx`** (284) — Rechnungen. Der Upload läuft
   seit SPEC-4 über das Backend, die Oberfläche ist unverändert.
4. **`components/ProfileForm.tsx`** (641) — das Bearbeiten-Formular. Markiert
   weiterhin keine Pflichtfelder; `options.ts` liegt dafür bereit.
5. **`pages/Artists.tsx`** (699) — Künstlerverwaltung im Admin.
6. **`pages/Invoices.tsx`** (412) — Rechnungen im Admin.

Ausserdem offen: die acht `ArtistCard*`-Varianten in `components/`
zusammenführen (F10 aus `BACKLOG-ANALYSE.md`).

---

## Umgebungshinweise

Vier Dinge, die in dieser Codebasis Zeit gekostet haben:

- **Tailwind ist v4.** Die `tailwind.config.js` im Wurzelverzeichnis wird
  **nicht** gelesen. Farben stehen als `@theme`-Block in `src/index.css` und
  verweisen auf `src/styling/tokens.css`. Wer eine neue Farbe braucht, trägt sie
  dort ein — sonst erzeugt Tailwind keine Utility, und die Klasse wirkt
  stillschweigend nicht. Gegenprobe: nach `npm run build` im gebauten CSS unter
  `dist/assets/` nach der Klasse suchen.
- **`tailwindcss-animate` ist nicht eingebunden.** `animate-in` und
  `slide-in-from-*` in den shadcn-Komponenten sind wirkungslos. Eigene Keyframes
  gehören nach `src/index.css`.
- **Der Hintergrund ist `pepe-coal` (`#0A0A0A`), nicht `pepe-black`.** Letzteres
  ist reines Schwarz.
- **Kein Browser-Treiber installiert.** Layout lässt sich hier nicht ansehen.
  Ersatz: Komponenten in einem vitest-Lauf rendern und den DOM ausgeben. Das hat
  in dieser Arbeit zwei echte Fehler gefunden, die der Typecheck nicht sah.

Und eine Warnung zu Git: `git stash` ohne Änderungen im Baum legt **nichts** an,
ein folgendes `git stash pop` greift dann auf einen fremden Stash zu. Im Repo
liegt ein Stash des Nutzers (`Stashing local changes before pull`), der
unberührt bleiben muss. Vor jedem `stash`/`pop`-Paar `git status --porcelain`
prüfen.

---

## Offene Punkte

- Ob das Hochladen im Entwurf gewollt ist oder ob Bilder erst beim Einreichen
  wandern sollen. Für die Live-Vorschau nach einem Neuladen ist das Hochladen
  nötig; der Preis sind Dateien im Blob-Speicher zu Profilen, die nie eingereicht
  werden.
- Ob der Fortschrittsbalken auch nach der Freigabe stehen bleiben soll oder ob er
  dann verschwindet.
- Ob `ProfileForm.tsx` langfristig die Schritte des Assistenten wiederverwenden
  soll, statt ein zweites Formular zu bleiben. Zwei Darstellungen derselben
  Felder sind zwei Orte für dieselbe Änderung.
- Aus ROLLOUT-3 und SPEC-4 weiterhin offen und nur im Dashboard erledigbar:
  **Upstash Redis** und das **Clerk-JWT-Template `pepe-backend`**. Ohne das
  Template scheitert jede Neuanmeldung mit `invalid_token` — das betrifft genau
  den Ablauf, den diese Spec verbessert.
