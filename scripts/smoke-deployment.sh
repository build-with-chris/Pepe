#!/bin/bash
#
# Pruefung eines Deployments von aussen. Nach jedem Deploy aufrufbar:
#
#   ./scripts/smoke-deployment.sh https://pepe-services.vercel.app
#
# Geprueft werden: oeffentliche Endpunkte, alle Auth-Schranken, dass die
# abgeschalteten Debug- und Legacy-Pfade keine Backend-Daten liefern, die
# Eingabevalidierung, der SPA-Fallback und dass der Fallback die statischen
# Assets nicht verschluckt.
#
# Bewusst nur lesende Aufrufe und Validierungsfehler: Ein *erfolgreiches*
# POST /api/requests/requests wuerde eine echte Anfrage in der Datenbank anlegen
# und Mails an Artists und Admin ausloesen.
#
# Hinweis zum Rate-Limit: Die oeffentliche Anfrage-Route erlaubt fuenf Aufrufe
# pro Stunde und IP. Mehrere Laeufe hintereinander liefern deshalb 429 statt 400,
# das ist kein Fehler des Deployments.
BASE="${1:-https://pepe-services.vercel.app}"

pass=0; fail=0

check() {
  local name="$1" expected="$2" actual="$3" extra="$4"
  if [ "$actual" = "$expected" ]; then
    printf '  OK    %-46s %s\n' "$name" "$actual"
    pass=$((pass+1))
  else
    printf '  FEHL  %-46s erwartet %s, war %s %s\n' "$name" "$expected" "$actual" "$extra"
    fail=$((fail+1))
  fi
}

code() { curl -s -m 40 -o /tmp/body.txt -w "%{http_code}" "$@"; }

echo "=== $BASE ==="
echo
echo "-- Backend, oeffentlich --"
c=$(code "$BASE/healthz");                          check "GET /healthz" 200 "$c"
hz=$(cat /tmp/body.txt)
c=$(code "$BASE/api/artists");                      check "GET /api/artists" 200 "$c"
artists=$(cat /tmp/body.txt)

echo
echo "-- Auth-Schranken (muessen abweisen) --"
c=$(code "$BASE/api/requests/requests");            check "GET /api/requests/requests ohne Token" 401 "$c"
c=$(code "$BASE/api/admin/artists");                check "GET /api/admin/artists ohne Token" 401 "$c"
c=$(code "$BASE/api/requests/debug/matching");      check "GET debug/matching ohne Token" 401 "$c"
c=$(code "$BASE/api/artists/me");                   check "GET /api/artists/me ohne Token" 401 "$c"
c=$(code -X POST "$BASE/api/upload/image");         check "POST /api/upload/image ohne Token" 401 "$c"
c=$(code -X POST "$BASE/api/admin/migrate-database-temp"); check "POST migrate ohne Token" 401 "$c"
c=$(code -H "Authorization: Bearer nonsense" "$BASE/api/admin/artists"); check "Adminroute mit Muelltoken" 401 "$c"

echo
echo "-- Abgeschaltetes: darf keine Backend-Daten liefern --"
# Diese Pfade fallen in den SPA-Fallback und liefern deshalb 200 mit HTML.
# Entscheidend ist nicht der Status, sondern dass keine Backend-Antwort kommt.
for p in /__debug/whoami /__debug/cors /__debug/db /auth/login /auth/debug-secret; do
  curl -s -m 40 -o /tmp/dbg.txt "$BASE$p"
  if grep -q 'id="root"' /tmp/dbg.txt && ! grep -qiE 'sqlalchemy_database_uri|clerk_claims|secret_prefix|postgres://' /tmp/dbg.txt; then
    printf '  OK    %-46s nur SPA-HTML, keine Backend-Daten\n' "$p"; pass=$((pass+1))
  else
    printf '  FEHL  %-46s Backend antwortet oder leakt\n' "$p"; fail=$((fail+1))
  fi
done

echo
echo "-- Validierung (schreibt nichts) --"
c=$(code -X POST "$BASE/api/requests/requests" -H "Content-Type: application/json" -d '{}')
case "$c" in 400|429) printf '  OK    %-46s %s (400=Validierung, 429=Limit)\n' "POST leerer Body" "$c"; pass=$((pass+1));; *) printf '  FEHL  %-46s %s\n' "POST leerer Body" "$c"; fail=$((fail+1));; esac
verr=$(cat /tmp/body.txt)
c=$(code -X POST "$BASE/api/requests/requests" -H "Content-Type: application/json" \
  -d '{"client_name":"T","client_email":"t@e.de","event_date":"2026-09-19","event_time":"19:00","duration_minutes":"abc","event_type":"Firmenfeier","number_of_guests":10,"event_address":"X"}')
check "POST Anfrage mit kaputter Dauer" 400 "$c"
c=$(code "$BASE/api/artists/999999");               check "GET unbekannter Artist" 404 "$c"

echo
echo "-- Frontend --"
c=$(code "$BASE/");                                 check "GET /" 200 "$c"
html=$(cat /tmp/body.txt)
c=$(code "$BASE/kuenstler");                        check "GET /kuenstler (SPA-Fallback)" 200 "$c"

echo
echo "-- Swagger darf nicht oeffentlich sein --"
curl -s -m 40 -o /tmp/sw.txt "$BASE/api-docs/"
if grep -q 'id="root"' /tmp/sw.txt && ! grep -qi 'swagger' /tmp/sw.txt; then
  printf '  OK    %-46s SPA statt Swagger-UI\n' "GET /api-docs/"; pass=$((pass+1))
else
  printf '  FEHL  %-46s Swagger-UI ist erreichbar\n' "GET /api-docs/"; fail=$((fail+1))
fi
curl -s -m 40 -o /tmp/sp.txt "$BASE/apispec_1.json"
if ! grep -qi '"openapi"\|"paths"' /tmp/sp.txt; then
  printf '  OK    %-46s keine OpenAPI-Spec ausgeliefert\n' "GET /apispec_1.json"; pass=$((pass+1))
else
  printf '  FEHL  %-46s OpenAPI-Spec ist oeffentlich\n' "GET /apispec_1.json"; fail=$((fail+1))
fi

echo
echo "-- Statische Assets (SPA-Fallback darf sie nicht schlucken) --"
for a in $(grep -oE '/assets/[^"]+' /tmp/body.txt 2>/dev/null | head -3); do
  ct=$(curl -s -m 40 -o /dev/null -w "%{content_type}" "$BASE$a")
  case "$ct" in
    *javascript*|*css*) printf '  OK    %-46s %s\n' "$(basename "$a")" "$ct"; pass=$((pass+1)) ;;
    *) printf '  FEHL  %-46s %s (HTML = vom Fallback geschluckt)\n' "$(basename "$a")" "$ct"; fail=$((fail+1)) ;;
  esac
done

echo
echo "=================================================="
echo "  $pass bestanden, $fail abweichend"
echo "=================================================="
echo
echo "healthz:  $hz"
echo "artists:  $(echo "$artists" | head -c 300)"
echo "400-Body: $(echo "$verr" | head -c 200)"
echo "index.html enthaelt root-div: $(echo "$html" | grep -c 'id="root"')"
