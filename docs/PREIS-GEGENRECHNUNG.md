# Gegenrechnung: alte vs. neue Preisformel

Vorarbeit zu `SPEC-3-preis.md`, Kriterium 2 („Ohne diesen Schritt nicht mit Kriterium 2
beginnen"). Hier steht, welche Wirkungsbreite gewählt wurde, warum, und was sie mit den
Preisen macht.

## Die alte Formel

```
min_floor  = base_min * 0,6  (nur bei Private Feier), sonst base_min
base_price = min_floor + score * (base_max - min_floor)
total      = base_price * (1 + Gebühr) + Technik + Distanzzuschlag + Anfahrt
Anzeige    = total ± 20 %
```

Die Artist-Spanne war die *Achse*: Die Faktoren entschieden nur, **wo innerhalb** der
Spanne der Preis liegt. Bei vollem Score landete der Preis auf `base_max` — und die
anschließenden ±20 % schoben die Obergrenze noch einmal 20 % darüber hinaus. Ein Artist
mit 1.200–1.800 € Gage konnte so mit 2.592 € ausgepreist werden, obwohl er selbst
höchstens 1.800 € bekommt (1.800 € + 20 % Agenturgebühr = 2.160 €).

## Die neue Formel

```
min_floor = base_min * 0,6  (nur bei Private Feier), sonst base_min
basis     = (min_floor + base_max) / 2                 <- Punktwert
gage      = basis * (0,8 + 0,4 * score)                <- Faktoren als Multiplikator
gage      = clamp(gage, min_floor, base_max)           <- bleibt in der Artist-Spanne
gage_min  = clamp(gage * 0,8, min_floor, base_max)     <- ein einziger ±20 %-Spread
gage_max  = clamp(gage * 1,2, min_floor, base_max)
Anzeige   = gage_* * (1 + Gebühr) + Technik + Distanzzuschlag + Anfahrt
```

**Die Wirkungsbreite ist `0,8 … 1,2`** — der Vorschlag aus der Spec, per `PRICE_FACTOR_SPAN`
umstellbar, ohne Code anzufassen (ebenso `PRICE_SPREAD_PCT` für den Spread).

Entscheidend ist die **Kappung auf `[min_floor, base_max]`**. Sie ist der Grund, warum die
Kernaussage der Spec technisch garantiert ist statt nur rechnerisch wahrscheinlich: *Die
Obergrenze übersteigt nie das, was der Artist tatsächlich bekommen würde, zuzüglich
Agenturgebühr.* Ohne Kappung müsste man die Wirkungsbreite so eng wählen (max. ±11 %), dass
Wochenend- und Outdoor-Zuschläge kaum noch wirken.

Technik, Distanzzuschlag und Anfahrt bleiben Durchlaufposten **ohne** Agenturgebühr — wie
bisher.

## Fünf reale Anfragen, alt gegen neu

Artist-Gage jeweils in der Zeile; Agenturgebühr 20 %.

| Szenario | alt | neu | Δ Obergrenze |
|---|---:|---:|---:|
| Firmenfeier München, 300 Gäste, 30 Min, outdoor, Sa, Solo (1.200–1.800 €) | 1.550–2.325 € | **1.531–2.064 €** | −11 % |
| Dieselbe Anfrage, aber Hamburg (610 km) | 2.111–3.166 € | **2.232–2.765 €** | −13 % |
| Private Feier, 80 Gäste, 15 Min, indoor, Sa, Solo (1.200–1.800 €) | 966–1.449 € | **1.109–1.653 €** | +14 % |
| Firmenfeier, 800 Gäste, 45 Min, outdoor, Sa, Licht+Ton, Duo (2.400–3.600 €) | 4.272–6.408 € | **4.476–5.340 €** | −17 % |
| Incentive, 150 Gäste, 10 Min, indoor, Mi, Solo (900–1.400 €) | 873–1.309 € | **992–1.347 €** | +3 % |

Ablesbar:

- **Die Obergrenzen sinken um 11–17 %.** Genau das war der Fehler — sie lagen über dem,
  was die Agentur überhaupt weiterreichen kann.
- **Die Untergrenzen steigen.** Die Spanne wird schmaler (35 % statt 50 % Breite) und damit
  als Auskunft brauchbarer.
- **Private Feiern werden teurer** (+14 %), weil sie vorher am absoluten Boden der Spanne
  klebten. Der 40-%-Rabatt auf die Mindestgage bleibt erhalten, wirkt aber nicht mehr
  zusätzlich über die Interpolation.
- **Die Entfernung schlägt unverändert durch:** München → Hamburg kostet 701 € mehr
  (610 km × 0,50 €/km + 300 € Zuschlag ab 600 km + 100 € entfallender München-Rabatt).

## Kontrollrechnung zu Kriterium 2

Gage 1.200–1.800 €, alle Faktoren am Maximum (Firmenfeier, >500 Gäste, 45 Min, outdoor,
Samstag), keine Zuschläge:

| | alt | neu | Grenze |
|---|---:|---:|---:|
| Spanne | 1.728–2.592 € | **1.728–2.160 €** | 1.800 € + 20 % = 2.160 € |

Die neue Obergrenze erreicht die Grenze exakt und überschreitet sie nicht. Abgesichert
durch `test_upper_bound_never_exceeds_artist_max_plus_fee` und
`test_upper_bound_holds_for_every_factor_combination` in
`backend/tests/unit/test_calculate_price.py`.

## Was bewusst nicht geändert wurde

Die Nicht-Ziele der Spec gelten unverändert: Das Gage-Datenmodell bleibt unentwirrt, der
München-Rabatt erkennt die Stadt weiter über String-Split, `newsletter`, `show_discipline`
und `tight_spread_pct` bleiben als tote Parameter in der Signatur stehen, und `budget` und
`planningStatus` fließen nicht in den Preis ein.
