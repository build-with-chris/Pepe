# SPEC: Preisberechner — Ergebnis sichtbar machen und Rechenfehler beheben

Ersetzt F4 + F5 (F6 fällt unter die Schnittlinie) aus `docs/BACKLOG-ANALYSE.md`.
**Setzt SPEC-1 und SPEC-2 voraus.**

## Kern

Der Kunde sieht am Ende des BookingWizards eine konkrete Preisspanne statt eines `alert()` — und
diese Spanne ist rechnerisch korrekt. Woran man es merkt: Zwei Anfragen, die sich nur in der
Entfernung unterscheiden, ergeben unterschiedliche Preise, und die Obergrenze übersteigt nie das,
was der Artist tatsächlich bekommen würde, zuzüglich Agenturgebühr.

## Nicht-Ziele

- **Keine Entwirrung des Gage-Datenmodells** (`calculated_gage` / `admin_gage_override` /
  `price_min` / `price_max`). Das war F6. Es bleibt möglich, dass ein Artist über den Profil-PATCH
  seine Preise überschreibt — unschön, aber bei einem gepflegten Artist-Stamm kein akutes Problem.
- **Keine Gage-Aufschlüsselung im Artist-Profil.** `get_gage_breakdown()` bleibt ungenutzt.
- **Kein München-Rabatt-Refactoring.** Die kaputte String-Erkennung bleibt vorerst; der Rabatt greift
  dadurch selten — das ist ein Preisfehler nach unten, kein Vertrauensschaden.
- **Kein Entfernen der toten Parameter** (`newsletter`, `show_discipline`, `tight_spread_pct`).
  Refactoring-Risiko ohne Gegenwert.
- **`budget` und `planningStatus` fließen nicht in den Preis.** Sie bleiben als reine
  Vertriebsinformation im Formular.
- **Keine Zusammenführung der beiden Offer-Endpoints.** Nur der tatsächlich genutzte
  (`api_routes.py:837`, Clerk-basiert) wird korrigiert; der andere wird als deprecated markiert.

## Betroffene Dateien und Schnittstellen

| Pfad | Änderung |
|---|---|
| `frontend/src/components/BookingWizard.tsx` | Server-Antwort auswerten statt verwerfen (Z. 364–366); Ergebnisschritt statt `alert()`; Endpoint-Kaskade auf **eine** URL reduzieren (Z. 344–348); `distance_km: 0` entfernen — kommt jetzt vom Server; `event_type`-Mapping angleichen (`Incentive` → `Teamevent`) |
| `frontend/src/components/BookingWizardSteps.tsx` | Neuer Ergebnisschritt: Preisspanne, Sonderfälle, Fehlerzustand |
| `backend/services/calculate_price.py` | Faktorlogik von Interpolation auf Multiplikator umstellen (siehe „Riskanteste Annahme"); ein einziger ±20 %-Spread am Ende; über 45 Min kein automatischer Preis |
| `backend/routes/request_routes.py` | `set_offer`: nur die gebuchte Teamgröße summieren (Z. 456–463); berechneten Preis **persistieren** (`price_offered`) |
| `backend/managers/booking_requests_manager.py` | `fee_pct` konsistent machen; in der Antwort `artist_gage` (netto) und `client_price` (inkl. Gebühr) getrennt ausweisen |
| **Neu:** `backend/tests/unit/test_calculate_price.py` | Szenario-Tests |

## Akzeptanzkriterien

| # | Kriterium (prüfbar formuliert) | Aufwand |
|---|---|---|
| 1 | Nach dem Absenden zeigt der Wizard eine Preisspanne aus der Server-Antwort. Kein `alert()` mehr im Submit-Pfad. | 3–4 h |
| 2 | Faktorlogik umgestellt: Basis ist ein Punktwert, die Faktoren wirken als Multiplikator, ±20 % genau einmal am Schluss. Bei 1200–1800 € Gage und maximalen Faktoren übersteigt die Obergrenze nicht mehr Artist-Max + Agenturgebühr. | 3–4 h |
| 3 | Anfragen über 45 Min liefern keinen automatischen Preis, sondern den Hinweis „individuelles Angebot" — analog zu Gruppen ab 3 Personen. | 1–2 h |
| 4 | `set_offer` summiert bei Solo genau eine, bei Duo genau zwei Gagen — unabhängig davon, wie viele Artists gematcht wurden. | 2 h |
| 5 | `set_offer` speichert den berechneten Preis; die Antwort enthält `price_offered` als Zahl, nicht `null`. | 1 h |
| 6 | Gruppen (3+) und Überlängen zeigen im UI eine verständliche Meldung statt einer leeren Preisanzeige. | 1 h |
| 7 | Ein fehlgeschlagener Submit zeigt dem Kunden einen sichtbaren Fehler (aktuell nur `console.warn`). | 1–2 h |
| 8 | `test_calculate_price.py` deckt jeden Faktor einzeln ab (Event-Typ, Gästezahl, Dauer, Indoor/Outdoor, Wochenende, Technik, Distanz) plus die drei Sonderfälle. | 2–3 h |

**Summe: 14–19 h** — Referenzklasse: SPEC-1 (12–17 h, geschätzt 2–3 Tage). Diese Spec ist
vergleichbar groß, obwohl sie „nur Anzeige plus ein paar Rechenfehler" heißt — Kriterium 2 ist der
Grund. Wer nur den Wizard fixt (Kriterien 1, 6, 7 ≈ 6 h) hat schon den Großteil des sichtbaren
Werts; der Rest ist Korrektheit.

**Drumherum:** Fachliche Abstimmung der neuen Faktorformel 1–2 h · manuelle Gegenrechnung von
5 realistischen Anfragen gegen die alten Preise 1–2 h · Rollout 0,5 h.
**Gesamt realistisch: 2,5–3 Arbeitstage.**

## Unterhalb der Schnittlinie (v2, bewusst verschoben)

- Gage-Datenmodell entwirren (F6 komplett)
- Gage-Aufschlüsselung für Artists sichtbar machen
- München-Rabatt über PLZ statt String-Split
- Tote Parameter aus `calculate_price` entfernen
- Die beiden Offer-Endpoints zusammenführen
- `budget`/`planningStatus` in die Preislogik einbeziehen
- Staffelpreise für Shows über 45 Min (aktuell: individuelles Angebot)

## Riskanteste Annahme

**Dass die Umstellung von Interpolation auf Multiplikator die Preise nicht unbeabsichtigt verschiebt.**

Die aktuelle Formel nutzt die Artist-Spanne als Achse: `min_floor + score × (base_max − min_floor)`.
Die Faktoren bestimmen also, *wo innerhalb der Spanne* der Preis liegt. Wird die Basis ein Punktwert,
brauchen die Faktoren eine neue Wirkungsbreite (z. B. `basis × (0,8 + 0,4 × score)`) — und diese
Breite ist eine **fachliche Setzung**, keine technische. Wird sie zu eng gewählt, verlieren
Wochenend- und Outdoor-Zuschläge ihre Wirkung; zu weit, und Privatfeiern werden unbezahlbar.

*Billig vorab prüfbar:* Vor jeder Codeänderung eine Tabelle mit 5 realen Anfragen bauen — alte Formel
vs. neue Formel, Preis nebeneinander. Eine Stunde Tabellenkalkulation. Wenn die neuen Preise nicht
plausibel sind, wird die Wirkungsbreite justiert, bevor Code entsteht. **Ohne diesen Schritt nicht mit
Kriterium 2 beginnen.**

## End-to-End-Prüfschritt

1. Mindestens zwei freigegebene Artists mit gepflegten Adressen und Gagen in der DB (aus SPEC-2).
2. Im BookingWizard eine Solo-Anfrage anlegen: Firmenfeier, 300 Gäste, 30 Min, Outdoor, Samstag,
   Event-Adresse **in München**.
3. → Ergebnisschritt zeigt eine konkrete Preisspanne. Notieren.
4. Dieselbe Anfrage erneut, nur mit Event-Adresse **in Hamburg**.
5. → Der Preis ist **höher** (Anfahrt + Distanzzuschlag). Differenz notieren und gegen
   `RATE_PER_KM × Entfernung` gegenrechnen.
6. Dritte Anfrage mit **120 Min** Dauer → kein Preis, sondern „individuelles Angebot".
7. Vierte Anfrage mit **Gruppe (3+)** → ebenfalls „individuelles Angebot".
8. Als Artist zu einer der Anfragen ein Angebot abgeben →
   `SELECT price_offered FROM booking_requests WHERE id = <id>;` → Zahl, nicht `NULL`.
9. Bei einer Duo-Anfrage prüfen, dass die Basis genau zwei Gagen enthält — nicht drei oder fünf.

## Offene Punkte

- Die konkrete Wirkungsbreite der Faktoren (siehe „Riskanteste Annahme") ist noch nicht festgelegt.
  Muss vor Kriterium 2 entschieden werden — mein Vorschlag zum Einstieg: `basis × (0,8 + 0,4 × score)`,
  also ±20 % um die Gage herum.
- Ob die Agenturgebühr von 20 % dem Kunden gegenüber ausgewiesen oder eingepreist wird. Betrifft nur
  die Darstellung im Ergebnisschritt, nicht die Rechnung.
- Ob bei „individuelles Angebot" (Überlänge/Gruppe) trotzdem eine unverbindliche Hausnummer angezeigt
  werden soll, oder bewusst gar keine Zahl.
